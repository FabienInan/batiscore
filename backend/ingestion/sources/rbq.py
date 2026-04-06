import pandas as pd
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Contractor, RBQEvent
from ingestion.transforms.normalize import normalize_name, normalize_neq, normalize_licence_rbq


RBQ_ACTIVES_URL = "https://www.donneesquebec.ca/recherche/dataset/licencesactives/resource/[ID]/download"


async def ingest_rbq(db: AsyncSession):
    """
    Télécharge et ingère le fichier CSV des licences RBQ actives.

    Colonnes attendues (à ajuster selon le vrai fichier):
    - NO_LICENCE
    - NOM_ENTREPRISE
    - NEQ
    - STATUT
    - CATEGORIES
    - VILLE
    - NB_RECLAMATIONS
    """
    print("Téléchargement du fichier RBQ...")

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.get(RBQ_ACTIVES_URL)

    # Parser le CSV
    df = pd.read_csv(
        pd.io.common.BytesIO(resp.content),
        encoding="utf-8-sig",
        sep=";"
    )

    print(f"RBQ: {len(df)} lignes trouvées")

    ingested = 0
    for _, row in df.iterrows():
        try:
            licence = normalize_licence_rbq(str(row.get("NO_LICENCE", "")))

            # Chercher l'entrepreneur existant
            result = await db.execute(
                select(Contractor).where(Contractor.licence_rbq == licence)
            )
            contractor = result.scalar_one_or_none()

            if not contractor:
                contractor = Contractor(licence_rbq=licence)
                db.add(contractor)

            # Mettre à jour les champs
            contractor.nom_legal = row.get("NOM_ENTREPRISE", "")
            contractor.neq = normalize_neq(str(row.get("NEQ", ""))) or None
            contractor.statut_rbq = str(row.get("STATUT", "")).lower()
            contractor.ville = row.get("VILLE")
            contractor.nom_normalized = normalize_name(contractor.nom_legal)

            # Catégories
            categories = row.get("CATEGORIES", "")
            if pd.notna(categories):
                contractor.categories_rbq = [c.strip() for c in str(categories).split(",")]

            # Réclamations
            nb_reclamations = int(row.get("NB_RECLAMATIONS", 0) or 0)
            if nb_reclamations > 0:
                # Créer un événement si pas déjà existant
                existing = await db.execute(
                    select(RBQEvent).where(
                        RBQEvent.contractor_id == contractor.id,
                        RBQEvent.event_type == "réclamation"
                    )
                )
                if not existing.scalar_one_or_none():
                    event = RBQEvent(
                        contractor_id=contractor.id,
                        event_type="réclamation",
                        description=f"{nb_reclamations} réclamation(s) au cautionnement"
                    )
                    db.add(event)

            ingested += 1

            # Commit par batch de 100
            if ingested % 100 == 0:
                await db.commit()

        except Exception as e:
            print(f"Erreur ligne {_}: {e}")
            continue

    await db.commit()
    print(f"RBQ: {ingested} entrepreneurs ingérés")

    return ingested