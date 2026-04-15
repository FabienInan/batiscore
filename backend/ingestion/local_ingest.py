#!/usr/bin/env python3
"""
Ingestion depuis les fichiers locaux.
"""
import asyncio
import json
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import async_session
from models import Contractor, RBQEvent
from ingestion.transforms.normalize import normalize_name, normalize_neq, normalize_licence_rbq


async def ingest_local_rbq(db: AsyncSession, filepath: str = "data/rbq_licences.json") -> int:
    """
    Ingère le fichier JSON RBQ local.
    """
    print(f"RBQ: Lecture du fichier local {filepath}...")

    file_path = Path(filepath)
    if not file_path.exists():
        print(f"RBQ: Fichier non trouvé: {filepath}")
        return 0

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Extraire la liste des licences
    if isinstance(data, dict):
        licences = data.get("Liste Licence", data.get("licences", data.get("data", [])))
    else:
        licences = data

    if not licences:
        print("RBQ: Aucune licence trouvée dans le fichier")
        return 0

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
    seen_licences = set()  # Pour éviter les doublons dans le même batch
    seen_neqs = set()  # Pour éviter les NEQ dupliqués

    for record in records:
        try:
            # Noms de champs exacts du fichier JSON RBQ
            licence = normalize_licence_rbq(str(record.get("Numéro de licence", "")))

            if not licence:
                continue

            # Récupérer le nom - obligatoire
            nom = record.get("Nom de l'intervenant", "")
            if not nom:
                continue  # Ignorer les enregistrements sans nom

            # Vérifier les doublons dans le batch
            if licence in seen_licences:
                continue
            seen_licences.add(licence)

            neq = record.get("NEQ")
            normalized_neq = normalize_neq(str(neq)) if neq else None

            # Vérifier si le NEQ est déjà utilisé (soit en DB, soit dans ce batch)
            if normalized_neq:
                if normalized_neq in seen_neqs:
                    continue  # Skip duplicate NEQ in batch
                seen_neqs.add(normalized_neq)

                # Vérifier en base de données
                existing = await db.execute(
                    select(Contractor).where(Contractor.neq == normalized_neq)
                )
                if existing.scalar_one_or_none():
                    continue  # NEQ déjà existant, ignorer

            # Chercher l'entrepreneur existant par licence
            result = await db.execute(
                select(Contractor).where(Contractor.licence_rbq == licence)
            )
            contractor = result.scalar_one_or_none()

            if not contractor:
                contractor = Contractor(
                    licence_rbq=licence,
                    nom_legal=str(nom)[:255],
                    neq=normalized_neq
                )
                db.add(contractor)
            else:
                contractor.nom_legal = str(nom)[:255]
                if normalized_neq:
                    contractor.neq = normalized_neq

            # Mettre à jour les champs avec les noms réels
            contractor.nom_normalized = normalize_name(str(nom)) if nom else None

            # Statut (Active, Suspendue, Annulée, etc.)
            statut = str(record.get("Statut de la licence", "")).lower()
            statut_map = {
                "active": "valide",
                "réouverte": "réouverte",
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
            await db.rollback()
            print(f"RBQ: Erreur enregistrement: {e}")
            continue

    await db.commit()
    print(f"RBQ: {ingested:,} entrepreneurs ingérés")
    return ingested


async def run_local_ingestion():
    """Exécute l'ingestion locale complète."""
    async with async_session() as db:
        # Ingestion RBQ depuis fichier local
        count = await ingest_local_rbq(db)
        print(f"Total: {count:,} entrepreneurs")

        # Calculer les scores
        from scoring.engine import recalculate_all_scores
        await recalculate_all_scores(db)


if __name__ == "__main__":
    asyncio.run(run_local_ingestion())