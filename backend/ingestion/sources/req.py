"""
Ingestion du Registre des entreprises du Québec (REQ).

Source: https://www.donneesquebec.ca/recherche/dataset/registre-entreprises-ouvertes
Format: CSV
Jointure: NEQ (clé avec RBQ)
"""
import pandas as pd
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Contractor
from ingestion.transforms.normalize import normalize_name, normalize_neq


# URL à remplacer par la vraie URL du dataset
REQ_URL = "https://www.donneesquebec.ca/recherche/dataset/registre-entreprises-ouvertes/resource/[ID]/download"


async def ingest_req(db: AsyncSession):
    """
    Ingestion du fichier REQ.

    Colonnes attendues (à ajuster selon le vrai fichier):
    - NEQ
    - NOM_ENTREPRISE
    - STATUT (immatriculé, radié, en liquidation)
    - DATE_IMMATRICULATION
    - FORME_JURIDIQUE
    - ADRESSE
    - VILLE
    - CODE_POSTAL
    - INDICATEUR_FAILLITE
    - CODE_SCIAN
    """
    print("Téléchargement du fichier REQ...")

    try:
        async with httpx.AsyncClient(timeout=180) as client:
            resp = await client.get(REQ_URL)

        if resp.status_code != 200:
            print(f"Erreur téléchargement REQ: {resp.status_code}")
            return 0

        # Parser le CSV
        df = pd.read_csv(
            pd.io.common.BytesIO(resp.content),
            encoding="utf-8-sig",
            sep=";",
            low_memory=False
        )

        print(f"REQ: {len(df)} lignes trouvées")

        updated = 0
        created = 0

        for _, row in df.iterrows():
            try:
                neq = normalize_neq(str(row.get("NEQ", "")))
                if not neq or len(neq) != 10:
                    continue

                # Chercher l'entrepreneur existant par NEQ
                result = await db.execute(
                    select(Contractor).where(Contractor.neq == neq)
                )
                contractor = result.scalar_one_or_none()

                # Si pas trouvé par NEQ, essayer par nom
                if not contractor:
                    nom = str(row.get("NOM_ENTREPRISE", ""))
                    nom_norm = normalize_name(nom)
                    if nom_norm:
                        result = await db.execute(
                            select(Contractor).where(Contractor.nom_normalized == nom_norm)
                        )
                        contractor = result.scalar_one_or_none()

                if contractor:
                    # Mettre à jour les champs REQ
                    contractor.neq = neq
                    contractor.statut_req = str(row.get("STATUT", "")).lower()

                    # Date de fondation
                    date_imm = row.get("DATE_IMMATRICULATION")
                    if pd.notna(date_imm):
                        try:
                            contractor.date_fondation = pd.to_datetime(date_imm).date()
                        except:
                            pass

                    # Forme juridique
                    contractor.forme_juridique = row.get("FORME_JURIDIQUE")

                    # Adresse
                    if pd.notna(row.get("ADRESSE")):
                        contractor.adresse = str(row.get("ADRESSE"))
                    if pd.notna(row.get("VILLE")):
                        contractor.ville = str(row.get("VILLE"))
                    if pd.notna(row.get("CODE_POSTAL")):
                        contractor.code_postal = str(row.get("CODE_POSTAL"))

                    # Indicateur de faillite
                    if row.get("INDICATEUR_FAILLITE") == "O" or row.get("INDICATEUR_FAILLITE") == True:
                        contractor.statut_req = "faillite"

                    updated += 1
                else:
                    # Créer un nouveau contractor (sans licence RBQ)
                    contractor = Contractor(
                        neq=neq,
                        nom_legal=str(row.get("NOM_ENTREPRISE", "")),
                        nom_normalized=normalize_name(str(row.get("NOM_ENTREPRISE", ""))),
                        statut_req=str(row.get("STATUT", "")).lower(),
                        forme_juridique=row.get("FORME_JURIDIQUE"),
                        adresse=str(row.get("ADRESSE")) if pd.notna(row.get("ADRESSE")) else None,
                        ville=str(row.get("VILLE")) if pd.notna(row.get("VILLE")) else None,
                    )

                    date_imm = row.get("DATE_IMMATRICULATION")
                    if pd.notna(date_imm):
                        try:
                            contractor.date_fondation = pd.to_datetime(date_imm).date()
                        except:
                            pass

                    db.add(contractor)
                    created += 1

                # Commit par batch
                if (updated + created) % 500 == 0:
                    await db.commit()

            except Exception as e:
                print(f"Erreur ligne {_}: {e}")
                continue

        await db.commit()
        print(f"REQ: {updated} mis à jour, {created} créés")
        return updated + created

    except Exception as e:
        print(f"Erreur ingestion REQ: {e}")
        return 0