"""
Ingestion du Registre des licences RBQ (Régie du bâtiment du Québec).

Sources (par ordre de priorité):
1. Fichier local : backend/data/rbq.json  (télécharger manuellement)
   curl -L -o backend/data/rbq.json "https://web.archive.org/web/20251207002513if_/https://www.donneesquebec.ca/recherche/dataset/755b45d6-7aee-46df-a216-748a0191c79f/resource/5183fdd4-55b1-418c-8a7d-0a70058ed68d/download/rdl01_extractiondonneesouvertes.json"
2. URL directe donneesquebec.ca (bloquée par Cloudflare)
3. Fallback Wayback Machine (snapshot 2025-12-07)

Format: JSON
Colonnes: Numéro de licence, Statut de la licence, Nom de l'intervenant, NEQ, Municipalité, Catégories et sous-catégories
"""
import io
import json
import zipfile
from datetime import date
from pathlib import Path

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from models import Contractor
from ingestion.transforms.normalize import normalize_name, normalize_neq, normalize_licence_rbq, ContractorIndex

# Chemin du fichier local (relatif à ce fichier)
LOCAL_RBQ_PATH = Path(__file__).parent.parent.parent / "data" / "rbq.json"


async def ingest_rbq(db: AsyncSession):
    """
    Ingère le fichier des licences RBQ.
    Priorité: 1) fichier local data/rbq.json, 2) URL directe, 3) Wayback Machine
    """
    # 1. Fichier local (le plus fiable)
    if LOCAL_RBQ_PATH.exists():
        print(f"RBQ: Fichier local trouvé ({LOCAL_RBQ_PATH.stat().st_size / 1024 / 1024:.1f} Mo)")
        return await ingest_rbq_from_file(LOCAL_RBQ_PATH, db)

    print("RBQ: Pas de fichier local, tentative de téléchargement...")
    print(f"RBQ: (Pour éviter ça: curl -L -o {LOCAL_RBQ_PATH} '<URL_WAYBACK>')")

    # 2. URL directe puis Wayback Machine
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

    print("RBQ: Impossible de charger le fichier. Placez rbq.json dans backend/data/")
    return 0


async def ingest_rbq_from_file(path: Path, db: AsyncSession) -> int:
    """Ingère le JSON depuis un fichier local."""
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, dict):
        licences = data.get("Liste Licence", data.get("licences", data.get("data", [])))
    else:
        licences = data

    if not licences:
        print("RBQ: Aucune licence trouvée dans le fichier local")
        return 0

    print(f"RBQ: {len(licences):,} enregistrements")
    records = [item["Licence"] if isinstance(item, dict) and "Licence" in item else item for item in licences]
    return await process_rbq_records(records, db)


async def ingest_rbq_from_url(url: str, db: AsyncSession) -> int:
    """Télécharge et ingère le JSON depuis une URL."""
    async with httpx.AsyncClient(timeout=300, follow_redirects=True) as client:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "application/json, */*",
        }
        resp = await client.get(url, headers=headers)

        if resp.status_code != 200:
            raise Exception(f"HTTP {resp.status_code}")

        print(f"RBQ: Téléchargé {len(resp.content) / 1024 / 1024:.1f} Mo")

        # Parser en JSON — ne pas se fier au Content-Type (Wayback renvoie text/html)
        body = resp.text.strip()
        if not (body.startswith("{") or body.startswith("[")):
            raise Exception(f"Contenu non-JSON (commence par: {body[:60]!r})")

        try:
            data = json.loads(body)
        except json.JSONDecodeError as e:
            raise Exception(f"JSON invalide: {e}")

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
    """Traite une liste d'enregistrements RBQ avec lookups en mémoire."""
    ingested = 0
    skipped = 0

    statut_map = {
        "active": "valide",
        "réouverte": "réouverte",
        "suspendue": "suspendu",
        "annulée": "annulé",
        "révoquée": "révoqué",
        "expirée": "expiré",
    }

    # Précharger tous les contractors en mémoire
    idx = await ContractorIndex.load(db)

    for record in records:
        try:
            licence = normalize_licence_rbq(str(record.get("Numéro de licence", "")))
            if not licence:
                skipped += 1
                continue

            nom = str(record.get("Nom de l'intervenant") or "").strip()
            if not nom:
                skipped += 1
                continue

            # Lookup O(1) au lieu d'un SELECT par record
            contractor = idx.by_licence.get(licence)

            if not contractor:
                # Vérifier si le NEQ existe déjà (compagnie avec plusieurs licences)
                neq_raw = record.get("NEQ")
                neq_check = normalize_neq(str(neq_raw)) if neq_raw else None
                if neq_check and neq_check in idx.by_neq:
                    # Même compagnie sous une autre licence — on met à jour sans créer
                    contractor = idx.by_neq[neq_check]
                    idx.by_licence[licence] = contractor
                else:
                    contractor = Contractor(licence_rbq=licence)
                    db.add(contractor)
                    idx.by_licence[licence] = contractor

            contractor.nom_legal = nom[:255]
            contractor.nom_normalized = normalize_name(nom)

            neq = record.get("NEQ")
            contractor.neq = normalize_neq(str(neq)) if neq else None
            # Mettre à jour l'index by_neq si on a un NEQ
            if contractor.neq:
                idx.by_neq[contractor.neq] = contractor

            statut = str(record.get("Statut de la licence", "")).lower()
            contractor.statut_rbq = statut_map.get(statut, statut) or None

            ville = record.get("Municipalité")
            contractor.ville = str(ville).strip() if ville else None

            adresse = record.get("Adresse")
            contractor.adresse = str(adresse)[:255] if adresse else None

            tel = record.get("Numéro de téléphone")
            contractor.telephone = str(tel) if tel else None

            type_licence = record.get("Type de licence")
            contractor.forme_juridique = str(type_licence) if type_licence else None

            # Date de délivrance → date_fondation (fallback si REQ ne l'a pas)
            if not contractor.date_fondation:
                date_str = str(record.get("Date de délivrance") or "").strip()
                if date_str and date_str != "nan":
                    try:
                        contractor.date_fondation = date.fromisoformat(date_str[:10])
                    except ValueError:
                        pass

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

            # Autre nom → noms_secondaires (si REQ ne les a pas encore renseignés)
            if not contractor.noms_secondaires:
                autres_noms_data = record.get("Autre nom", [])
                if isinstance(autres_noms_data, list) and autres_noms_data:
                    noms = [
                        str(item.get("Autre nom", "")).strip()
                        for item in autres_noms_data
                        if isinstance(item, dict) and item.get("Autre nom")
                    ]
                    contractor.noms_secondaires = noms if noms else None

            ingested += 1

            if ingested % 5000 == 0:
                try:
                    await db.commit()
                    print(f"RBQ: {ingested:,} enregistrements traités...")
                except Exception as commit_err:
                    print(f"RBQ: Erreur commit intermédiaire (rollback): {commit_err}")
                    await db.rollback()

        except Exception as e:
            print(f"RBQ: Erreur enregistrement (ignoré): {e}")
            try:
                await db.rollback()
            except Exception:
                pass
            skipped += 1
            continue

    try:
        await db.commit()
    except Exception as e:
        print(f"RBQ: Erreur commit final (rollback): {e}")
        await db.rollback()

    print(f"RBQ: {ingested:,} entrepreneurs ingérés, {skipped} ignorés")
    return ingested