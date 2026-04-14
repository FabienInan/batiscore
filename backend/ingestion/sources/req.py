"""
Ingestion du Registre des entreprises du Québec (REQ).

Sources (par ordre de priorité):
1. Fichier local : backend/data/req.zip  (télécharger manuellement)
   curl -L -o backend/data/req.zip "https://web.archive.org/web/20250816182804if_/https://www.registreentreprises.gouv.qc.ca/RQAnonymeGR/GR/GR03/GR03A2_22A_PIU_RecupDonnPub_PC/FichierDonneesOuvertes.aspx"
2. Wayback Machine (snapshot 2025-08-16, ~245 Mo)
3. URL directe Registraire (403 Forbidden en 2026)

Format: ZIP contenant plusieurs fichiers CSV
Jointure: NEQ (clé avec RBQ)
"""
import io
import zipfile
from pathlib import Path

import httpx
import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from ingestion.transforms.normalize import normalize_name, normalize_neq, ContractorIndex
from models import Contractor

LOCAL_REQ_PATH = Path(__file__).parent.parent.parent / "data" / "req.zip"

REQ_DOWNLOAD_URL = (
    "https://www.donneesquebec.ca/recherche/dataset/registre-des-entreprises"
    "/resource/eac1b5f1-d8c0-4690-9c51-316d44ed9d94/download"
)


async def ingest_req(db: AsyncSession) -> int:
    """
    Ingère le fichier REQ depuis un fichier local obligatoire.

    Télécharger manuellement avant de lancer l'ingestion :
        wget -O /var/www/batiscore/backend/data/req.zip \\
          "https://www.donneesquebec.ca/recherche/dataset/registre-des-entreprises/resource/eac1b5f1-d8c0-4690-9c51-316d44ed9d94/download"
    """
    if not LOCAL_REQ_PATH.exists():
        print("REQ: Fichier local introuvable.")
        print(f"REQ: Téléchargez-le manuellement avec :")
        print(f'  wget -O {LOCAL_REQ_PATH} \\')
        print(f'    "{REQ_DOWNLOAD_URL}"')
        return 0

    print(f"REQ: Fichier local trouvé ({LOCAL_REQ_PATH.stat().st_size / 1024 / 1024:.1f} Mo)")
    return await ingest_req_from_file(str(LOCAL_REQ_PATH), db)


async def _download_and_ingest(url: str, db: AsyncSession) -> int:
    """Télécharge et ingère le ZIP REQ depuis une URL."""
    print(f"REQ: Téléchargement de {url[:80]}...")
    async with httpx.AsyncClient(timeout=600, follow_redirects=True) as client:
        resp = await client.get(
            url,
            headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"},
        )
    if resp.status_code != 200:
        raise Exception(f"HTTP {resp.status_code}")

    print(f"REQ: Téléchargé {len(resp.content) / 1024 / 1024:.1f} Mo")

    # Sauvegarder localement pour les prochaines fois
    LOCAL_REQ_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOCAL_REQ_PATH.write_bytes(resp.content)
    print(f"REQ: Sauvegardé dans {LOCAL_REQ_PATH}")

    return await _parse_zip(resp.content, db)


async def ingest_req_from_file(filepath: str, db: AsyncSession) -> int:
    """Ingère le fichier REQ depuis un ZIP local."""
    with open(filepath, "rb") as f:
        content = f.read()
    return await _parse_zip(content, db)


STATUT_REQ_MAP = {
    "IM": "actif",
    "AI": "actif",
    "RO": "radié",
    "RD": "radié",
    "RX": "radié",
    "NI": "non_immatriculé",
}


async def _parse_zip(content: bytes, db: AsyncSession) -> int:
    """Parse le ZIP REQ et ingère les enregistrements."""
    with zipfile.ZipFile(io.BytesIO(content)) as zf:
        csv_files = [f for f in zf.namelist() if f.lower().endswith(".csv")]
        print(f"REQ: {len(csv_files)} fichiers CSV dans le ZIP: {csv_files}")

        # Charger Nom.csv pour les raisons sociales secondaires
        noms_secondaires: dict[str, list[str]] = {}
        if "Nom.csv" in zf.namelist():
            print("REQ: Lecture de Nom.csv (raisons sociales secondaires)...")
            with zf.open("Nom.csv") as f:
                df_noms = pd.read_csv(f, encoding="utf-8-sig", low_memory=False)
                df_noms.columns = [c.strip().upper() for c in df_noms.columns]
                # TYP_NOM_ASSUJ='M' = nom commercial / raison sociale secondaire, STAT_NOM='A' = actif
                mask = (df_noms.get("TYP_NOM_ASSUJ", pd.Series(dtype=str)) == "M") & \
                       (df_noms.get("STAT_NOM", pd.Series(dtype=str)) == "A")
                for _, row in df_noms[mask].iterrows():
                    neq = normalize_neq(str(row.get("NEQ", "")))
                    nom = str(row.get("NOM_ASSUJ", "")).strip()
                    if neq and nom:
                        noms_secondaires.setdefault(neq, []).append(nom)
            print(f"REQ: {len(noms_secondaires):,} entreprises avec raisons sociales secondaires")

        # Fichier principal : Entreprise.csv ou premier CSV
        main_file = next(
            (f for f in csv_files if any(k in f.lower() for k in ("entreprise", "personne", "morale"))),
            csv_files[0] if csv_files else None,
        )
        if not main_file:
            print("REQ: Aucun fichier CSV trouvé dans le ZIP")
            return 0

        print(f"REQ: Lecture de {main_file}")
        with zf.open(main_file) as csvfile:
            df = pd.read_csv(csvfile, encoding="utf-8-sig", low_memory=False)

    print(f"REQ: {len(df):,} enregistrements — colonnes: {list(df.columns[:8])}")
    return await process_req_dataframe(df, noms_secondaires, db)


async def process_req_dataframe(df: pd.DataFrame, noms_secondaires: dict, db: AsyncSession) -> int:
    """Traite un DataFrame REQ et met à jour la base avec lookups en mémoire."""
    updated = 0
    created = 0

    df.columns = [c.strip().upper() for c in df.columns]

    # Précharger tous les contractors en mémoire
    idx = await ContractorIndex.load(db)

    for _, row in df.iterrows():
        try:
            neq_raw = row.get("NEQ") or row.get("NO_ENTREPRISE") or ""
            neq = normalize_neq(str(neq_raw))
            if not neq or len(neq) != 10:
                continue

            # Lookup O(1) par NEQ d'abord
            contractor = idx.by_neq.get(neq)

            # Puis par nom normalisé si pas trouvé
            if not contractor:
                nom_raw = str(row.get("NOM") or row.get("NOM_ASSUJ") or row.get("NOM_LEGAL") or "")
                nom_norm = normalize_name(nom_raw)
                if nom_norm:
                    contractor = idx.by_nom.get(nom_norm)

            # Statut : COD_STAT_IMMAT + IND_FAIL
            cod_statut = str(row.get("COD_STAT_IMMAT") or "").strip().upper()
            ind_fail = str(row.get("IND_FAIL") or "").strip().upper()
            if ind_fail == "O":
                statut_req = "faillite"
            else:
                statut_req = STATUT_REQ_MAP.get(cod_statut)

            # Date de fondation : DAT_CONSTI (constitution) ou DAT_IMMAT (immatriculation)
            date_fondation = None
            for col in ("DAT_CONSTI", "DAT_IMMAT"):
                val = str(row.get(col) or "").strip()
                if val and val != "nan":
                    try:
                        from datetime import date as _date
                        date_fondation = _date.fromisoformat(val[:10])
                        break
                    except ValueError:
                        pass

            noms_sec = noms_secondaires.get(neq)

            if contractor:
                contractor.neq = neq
                if statut_req:
                    contractor.statut_req = statut_req
                if date_fondation and not contractor.date_fondation:
                    contractor.date_fondation = date_fondation
                if noms_sec:
                    contractor.noms_secondaires = noms_sec
                updated += 1
            else:
                nom_raw = str(row.get("NOM") or row.get("NOM_ASSUJ") or row.get("NOM_LEGAL") or "")
                if not nom_raw.strip():
                    continue
                contractor = Contractor(
                    neq=neq,
                    nom_legal=nom_raw[:255],
                    nom_normalized=normalize_name(nom_raw),
                    statut_req=statut_req,
                    date_fondation=date_fondation,
                    noms_secondaires=noms_sec,
                )
                db.add(contractor)
                # Mettre à jour l'index
                if contractor.neq:
                    idx.by_neq[contractor.neq] = contractor
                if contractor.nom_normalized:
                    idx.by_nom[contractor.nom_normalized] = contractor
                created += 1

            if (updated + created) % 5000 == 0:
                await db.commit()
                print(f"REQ: {updated + created:,} traités...")

        except Exception as e:
            print(f"REQ: Erreur enregistrement - {e}")
            continue

    await db.commit()
    print(f"REQ: {updated} mis à jour, {created} créés")
    return updated + created