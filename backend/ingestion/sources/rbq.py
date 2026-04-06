"""
Ingestion du Registre des licences RBQ (Régie du bâtiment du Québec).

Sources:
- Miroir: https://ouvert.canada.ca/data/fr/dataset/755b45d6-7aee-46df-a216-748a0191c79f
- Fallback Wayback: https://web.archive.org/web/2026/...

Format: JSON (~83 Mo) ou ZIP (CSV)

Colonnes du JSON:
- Numéro de licence
- Statut de la licence
- Nom de l'intervenant
- NEQ
- Municipalité
- Catégories et sous-catégories
"""
import zipfile
import io
import json
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from models import Contractor, RBQEvent
from ingestion.transforms.normalize import normalize_name, normalize_neq, normalize_licence_rbq


async def ingest_rbq(db: AsyncSession):
    """
    Télécharge et ingère le fichier des licences RBQ.
    Essaie: 1) URL directe, 2) Wayback Machine, 3) Miroir
    """
    print("RBQ: Téléchargement du registre des licences...")

    # Essayer l'URL directe d'abord
    urls_to_try = [
        settings.rbq_json_url,
        f"{settings.rbq_wayback_prefix}{settings.rbq_json_url}",
    ]

    for url in urls_to_try:
        try:
            print(f"RBQ: Essai de {url[:80]}...")
            count = await ingest_rbq_from_url(url, db)
            if count > 0:
                return count
        except Exception as e:
            print(f"RBQ: Échec - {e}")
            continue

    print("RBQ: Impossible de télécharger le fichier")
    return 0


async def ingest_rbq_from_url(url: str, db: AsyncSession) -> int:
    """Télécharge et ingère le JSON depuis une URL."""
    async with httpx.AsyncClient(timeout=180, follow_redirects=True) as client:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "application/json, text/html, */*",
        }
        resp = await client.get(url, headers=headers)

        if resp.status_code != 200:
            raise Exception(f"HTTP {resp.status_code}")

        # Vérifier que c'est bien du JSON
        content_type = resp.headers.get("content-type", "")
        if "json" not in content_type and not resp.text.strip().startswith("{"):
            raise Exception(f"Contenu non-JSON: {content_type}")

        data = resp.json()
        print(f"RBQ: Téléchargé {len(resp.content) / 1024 / 1024:.1f} Mo")

    # Extraire la liste des licences
    if isinstance(data, dict):
        licences = data.get("Liste Licence", data.get("licences", data.get("data", [])))
    else:
        licences = data

    if not licences:
        raise Exception("Aucune licence trouvée dans le fichier")

    print(f"RBQ: {len(licences):,} enregistrements")

    # Les données sont dans une clé "Licence" pour chaque élément
    records = []
    for item in licences:
        if isinstance(item, dict) and "Licence" in item:
            records.append(item["Licence"])
        else:
            records.append(item)

    return await process_rbq_records(records, db)


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

            ingested += 1

            if ingested % 5000 == 0:
                await db.commit()
                print(f"RBQ: {ingested:,} enregistrements traités...")

        except Exception as e:
            print(f"RBQ: Erreur enregistrement: {e}")
            continue

    await db.commit()
    print(f"RBQ: {ingested:,} entrepreneurs ingérés")
    return ingested