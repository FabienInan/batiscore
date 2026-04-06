"""
Ingestion du Registre des licences RBQ (Régie du bâtiment du Québec).

Source: https://www.donneesquebec.ca/recherche/dataset/licencesactives
Formats:
  - JSON (~69 Mo): rdl01_extractiondonneesouvertes.json
  - ZIP (CSV): rdl01_extractiondonneesouvertes.zip

Colonnes attendues (noms à vérifier selon le fichier réel):
- NoLicence (numéro de licence RBQ)
- NomEntreprise
- Neq
- StatutLicence (valide, suspendu, annulé, révoqué)
- Categorie
- SousCategorie
- Ville
- NbReclamations
- MontantReclamations
"""
import zipfile
import io
import pandas as pd
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from models import Contractor, RBQEvent
from ingestion.transforms.normalize import normalize_name, normalize_neq, normalize_licence_rbq


async def ingest_rbq(db: AsyncSession):
    """
    Télécharge et ingère le fichier des licences RBQ.
    Essaie d'abord le JSON, puis le ZIP si échec.
    """
    print("RBQ: Téléchargement du registre des licences...")

    # Essayer le JSON d'abord
    try:
        count = await ingest_rbq_json(db)
        if count > 0:
            return count
    except Exception as e:
        print(f"RBQ: Erreur JSON, tentative ZIP: {e}")

    # Fallback sur le ZIP
    try:
        count = await ingest_rbq_zip(db)
        return count
    except Exception as e:
        print(f"RBQ: Erreur ZIP: {e}")
        return 0


async def ingest_rbq_json(db: AsyncSession) -> int:
    """
    Ingestion du fichier JSON RBQ.

    Structure attendue (à vérifier):
    [
        {"NoLicence": "1234-5678-90", "NomEntreprise": "...", ...},
        ...
    ]
    """
    url = settings.rbq_json_url
    print(f"RBQ: Téléchargement JSON depuis {url}")

    async with httpx.AsyncClient(timeout=180) as client:
        resp = await client.get(url)

    if resp.status_code != 200:
        raise Exception(f"HTTP {resp.status_code}")

    data = resp.json()

    # Le JSON peut être une liste ou un dict avec une clé 'licences'
    if isinstance(data, dict):
        data = data.get("licences", data.get("data", []))

    print(f"RBQ: {len(data)} enregistrements trouvés")

    return await process_rbq_records(data, db)


async def ingest_rbq_zip(db: AsyncSession) -> int:
    """
    Ingestion du fichier ZIP RBQ (contient des CSVs).
    """
    url = settings.rbq_zip_url
    print(f"RBQ: Téléchargement ZIP depuis {url}")

    async with httpx.AsyncClient(timeout=180) as client:
        resp = await client.get(url)

    if resp.status_code != 200:
        raise Exception(f"HTTP {resp.status_code}")

    # Extraire le ZIP
    with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
        # Trouver le fichier CSV principal
        csv_files = [f for f in zf.namelist() if f.endswith('.csv')]
        if not csv_files:
            raise Exception("Aucun fichier CSV trouvé dans le ZIP")

        # Lire le premier CSV
        with zf.open(csv_files[0]) as csvfile:
            df = pd.read_csv(csvfile, encoding='utf-8-sig', sep=',', low_memory=False)

    print(f"RBQ: {len(df)} lignes dans le CSV")
    return await process_rbq_dataframe(df, db)


async def process_rbq_records(records: list, db: AsyncSession) -> int:
    """Traite une liste d'enregistrements RBQ."""
    ingested = 0

    for record in records:
        try:
            # Normaliser les noms de champs (peut varier selon le fichier)
            licence = normalize_licence_rbq(str(record.get("NoLicence") or record.get("NO_LICENCE") or record.get("no_licence", "")))

            if not licence:
                continue

            # Chercher l'entrepreneur existant
            result = await db.execute(
                select(Contractor).where(Contractor.licence_rbq == licence)
            )
            contractor = result.scalar_one_or_none()

            if not contractor:
                contractor = Contractor(licence_rbq=licence)
                db.add(contractor)

            # Mettre à jour les champs
            nom = record.get("NomEntreprise") or record.get("NOM_ENTREPRISE") or record.get("nom_entreprise", "")
            contractor.nom_legal = str(nom)[:255] if nom else None
            contractor.nom_normalized = normalize_name(str(nom)) if nom else None

            neq = record.get("Neq") or record.get("NEQ") or record.get("neq")
            contractor.neq = normalize_neq(str(neq)) if neq else None

            # Statut
            statut = str(record.get("StatutLicence") or record.get("STATUT") or record.get("statut_licence", "")).lower()
            contractor.statut_rbq = statut if statut in ["valide", "suspendu", "annulé", "révoqué"] else None

            # Ville
            ville = record.get("Ville") or record.get("VILLE") or record.get("ville")
            contractor.ville = str(ville) if ville else None

            # Catégories
            categories = record.get("Categorie") or record.get("CATEGORIES") or record.get("categorie", "")
            if categories:
                contractor.categories_rbq = [c.strip() for c in str(categories).split(",")]

            # Réclamations
            nb_recl = record.get("NbReclamations") or record.get("NB_RECLAMATIONS") or record.get("nb_reclamations", 0)
            try:
                nb_reclamations = int(nb_recl) if nb_recl else 0
            except:
                nb_reclamations = 0

            if nb_reclamations > 0 and contractor.id:
                # Vérifier si l'événement existe déjà
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

            if ingested % 500 == 0:
                await db.commit()
                print(f"RBQ: {ingested} enregistrements traités...")

        except Exception as e:
            print(f"RBQ: Erreur enregistrement: {e}")
            continue

    await db.commit()
    print(f"RBQ: {ingested} entrepreneurs ingérés")
    return ingested


async def process_rbq_dataframe(df: pd.DataFrame, db: AsyncSession) -> int:
    """Traite un DataFrame pandas de données RBQ."""
    records = df.to_dict('records')
    return await process_rbq_records(records, db)