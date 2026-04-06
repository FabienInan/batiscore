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

    Structure réelle:
    {
      "Liste Licence": [
        {"Licence": {"Numéro de licence": "...", "NEQ": "...", ...}},
        ...
      ]
    }
    """
    url = settings.rbq_json_url
    print(f"RBQ: Téléchargement JSON depuis {url}")

    async with httpx.AsyncClient(timeout=180) as client:
        resp = await client.get(url)

    if resp.status_code != 200:
        raise Exception(f"HTTP {resp.status_code}")

    data = resp.json()

    # Extraire la liste des licences
    if isinstance(data, dict):
        data = data.get("Liste Licence", data.get("licences", []))

    print(f"RBQ: {len(data)} enregistrements trouvés")

    # Les données sont dans une clé "Licence" pour chaque élément
    records = []
    for item in data:
        if "Licence" in item:
            records.append(item["Licence"])
        else:
            records.append(item)

    return await process_rbq_records(records, db)


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
            # Noms de champs exacts du fichier JSON RBQ
            licence = normalize_licence_rbq(str(record.get("Numéro de licence", "")))

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

            # Mettre à jour les champs avec les noms réels
            nom = record.get("Nom de l'intervenant", "")
            contractor.nom_legal = str(nom)[:255] if nom else None
            contractor.nom_normalized = normalize_name(str(nom)) if nom else None

            neq = record.get("NEQ")
            contractor.neq = normalize_neq(str(neq)) if neq else None

            # Statut (Active, Suspendue, Annulée, etc.)
            statut = str(record.get("Statut de la licence", "")).lower()
            statut_map = {
                "active": "valide",
                "suspendue": "suspendu",
                "annulée": "annulé",
                "révoquée": "révoqué",
                "expirée": "expiré",
            }
            contractor.statut_rbq = statut_map.get(statut, statut)

            # Ville/Municipalité
            ville = record.get("Municipalité")
            contractor.ville = str(ville) if ville else None

            # Adresse
            adresse = record.get("Adresse")
            contractor.adresse = str(adresse)[:255] if adresse else None

            # Téléphone
            tel = record.get("Numéro de téléphone")
            contractor.telephone = str(tel) if tel else None

            # Type de licence / Forme juridique
            type_licence = record.get("Type de licence")
            contractor.forme_juridique = str(type_licence) if type_licence else None

            # Catégories
            categories_data = record.get("Catégories et sous-catégories", [])
            categories_list = []
            if isinstance(categories_data, list):
                for cat in categories_data:
                    if isinstance(cat, dict):
                        if "Categorie" in cat:
                            categories_list.append(cat["Categorie"])
                        if "Sous-catégories" in cat:
                            categories_list.append(str(cat["Sous-catégories"]))
            contractor.categories_rbq = categories_list if categories_list else None

            # Autre nom (nom commercial)
            autre_nom = record.get("Autre nom")
            # On pourrait ajouter un champ pour ça

            ingested += 1

            if ingested % 1000 == 0:
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