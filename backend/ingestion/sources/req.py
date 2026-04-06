"""
Ingestion du Registre des entreprises du Québec (REQ).

Source directe: https://www.registreentreprises.gouv.qc.ca/RQAnonymeGR/GR/GR03/GR03A2_22A_PIU_RecupDonnPub_PC/PageDonneesOuvertes.aspx
Format: ZIP contenant 6 fichiers CSV
Jointure: NEQ (clé avec RBQ)

Note: Le site donneesquebec.ca a expiré - utiliser l'URL directe du Registraire.
"""
import pandas as pd
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from models import Contractor
from ingestion.transforms.normalize import normalize_name, normalize_neq


async def ingest_req(db: AsyncSession):
    """
    Ingestion du fichier REQ depuis le site officiel du Registraire.

    Le fichier ZIP contient 6 CSVs:
    - Personne (informations de base)
    - Adresse
    - Nom (dénominations)
    - etc.

    NEQ est l'identifiant unique dans tous les fichiers.
    """
    print("REQ: Téléchargement depuis le Registraire des entreprises...")

    try:
        # L'URL directe du Registraire nécessite souvent un téléchargement manuel
        # car le site peut avoir des protections ou des sessions
        print(f"REQ: URL - {settings.req_url}")
        print("REQ: Note - Le téléchargement peut nécessiter une intervention manuelle")
        print("REQ: Consulter la page et télécharger le fichier ZIP")

        # Pour l'instant, on simule une ingestion vide
        # En production, le fichier ZIP sera placé manuellement ou via un autre canal
        return 0

    except Exception as e:
        print(f"REQ: Erreur - {e}")
        return 0


async def ingest_req_from_file(filepath: str, db: AsyncSession) -> int:
    """
    Ingestion du fichier REQ depuis un fichier local (ZIP).

    Usage:
        python -m ingestion.run --source req --file /path/to/req.zip
    """
    import zipfile

    print(f"REQ: Lecture du fichier {filepath}")

    with zipfile.ZipFile(filepath) as zf:
        # Lister les fichiers CSV
        csv_files = [f for f in zf.namelist() if f.endswith('.csv')]
        print(f"REQ: {len(csv_files)} fichiers CSV trouvés")

        # Le fichier principal est souvent "Personne" ou similaire
        main_file = None
        for f in csv_files:
            if "personne" in f.lower() or "morale" in f.lower():
                main_file = f
                break

        if not main_file:
            main_file = csv_files[0]

        print(f"REQ: Lecture de {main_file}")

        with zf.open(main_file) as csvfile:
            df = pd.read_csv(csvfile, encoding='utf-8-sig', low_memory=False)

    print(f"REQ: {len(df):,} enregistrements")

    return await process_req_dataframe(df, db)


async def process_req_dataframe(df: pd.DataFrame, db: AsyncSession) -> int:
    """Traite un DataFrame REQ."""
    updated = 0
    created = 0

    for _, row in df.iterrows():
        try:
            neq = normalize_neq(str(row.get("NEQ") or row.get("neq") or ""))
            if not neq or len(neq) != 10:
                continue

            # Chercher l'entrepreneur existant par NEQ
            result = await db.execute(
                select(Contractor).where(Contractor.neq == neq)
            )
            contractor = result.scalar_one_or_none()

            # Si pas trouvé par NEQ, essayer par nom
            if not contractor:
                nom = str(row.get("NOM") or row.get("nom_legal") or "")
                nom_norm = normalize_name(nom)
                if nom_norm:
                    result = await db.execute(
                        select(Contractor).where(Contractor.nom_normalized == nom_norm)
                    )
                    contractor = result.scalar_one_or_none()

            if contractor:
                # Mettre à jour les champs REQ
                contractor.neq = neq
                statut = str(row.get("STATUT") or row.get("statut") or "").lower()
                contractor.statut_req = statut if statut else None
                updated += 1
            else:
                # Créer un nouveau contractor
                nom = str(row.get("NOM") or row.get("nom_legal") or "")
                contractor = Contractor(
                    neq=neq,
                    nom_legal=nom[:255] if nom else None,
                    nom_normalized=normalize_name(nom) if nom else None,
                    statut_req=str(row.get("STATUT") or "").lower() if row.get("STATUT") else None,
                )
                db.add(contractor)
                created += 1

            if (updated + created) % 500 == 0:
                await db.commit()

        except Exception as e:
            print(f"REQ: Erreur - {e}")
            continue

    await db.commit()
    print(f"REQ: {updated} mis à jour, {created} créés")
    return updated + created