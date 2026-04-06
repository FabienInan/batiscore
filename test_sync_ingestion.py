#!/usr/bin/env python3
"""
Script d'ingestion synchrone pour tester la connexion DB.
"""
import sys
sys.path.insert(0, '/Users/fabien/Documents/projets/entrepreneur-checker/backend')

import httpx
import pandas as pd
from sqlalchemy import create_engine, text
from config import settings

# URL RBQ
RBQ_URL = "https://www.donneesquebec.ca/recherche/dataset/755b45d6-7aee-46df-a216-748a0191c79f/resource/5183fdd4-55b1-418c-8a7d-0a70058ed68d/download/rdl01_extractiondonneesouvertes.json"

# Normalisation
import re
import unicodedata

def normalize_name(name: str) -> str:
    if not name:
        return ""
    name = name.lower()
    name = unicodedata.normalize("NFD", name)
    name = "".join(c for c in name if unicodedata.category(c) != "Mn")
    name = re.sub(r"[&.,'\-]", " ", name)
    stop_words = ["inc", "ltee", "ltée", "enr", "cie", "co", "corp"]
    pattern = r"\b(" + "|".join(stop_words) + r")\b"
    name = re.sub(pattern, "", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name

def normalize_neq(neq: str) -> str:
    if not neq:
        return ""
    digits = re.sub(r"\D", "", neq)
    return digits if len(digits) == 10 else neq

def normalize_licence(licence: str) -> str:
    if not licence:
        return ""
    digits = re.sub(r"\D", "", licence)
    if len(digits) == 10:
        return f"{digits[:4]}-{digits[4:8]}-{digits[8:]}"
    return licence

def main():
    print("=== Ingestion RBQ (synchrone) ===\n")

    # Connexion DB
    db_url = "postgresql://dev:dev@localhost:5433/rbq_app"
    print(f"Connexion: {db_url}")

    engine = create_engine(db_url)

    # Test connexion
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("✓ Connexion DB OK\n")

    # Téléchargement
    print("Téléchargement du JSON...")
    with httpx.Client(timeout=300) as client:
        resp = client.get(RBQ_URL)

    if resp.status_code != 200:
        print(f"Erreur HTTP: {resp.status_code}")
        return

    data = resp.json()
    licences = data.get("Liste Licence", [])
    print(f"✓ {len(licences):,} licences\n")

    # Ingestion
    print("Ingestion...")
    ingested = 0

    with engine.begin() as conn:
        for i, item in enumerate(licences):
            try:
                record = item.get("Licence", item)

                licence = normalize_licence(str(record.get("Numéro de licence", "")))
                if not licence:
                    continue

                nom = record.get("Nom de l'intervenant", "")
                neq = normalize_neq(str(record.get("NEQ", ""))) if record.get("NEQ") else None
                statut = str(record.get("Statut de la licence", "")).lower()
                ville = record.get("Municipalité")

                statut_map = {
                    "active": "valide",
                    "suspendue": "suspendu",
                    "annulée": "annulé",
                    "révoquée": "révoqué",
                    "expirée": "expiré",
                }
                statut_db = statut_map.get(statut, statut)

                # Insert ou update
                conn.execute(text("""
                    INSERT INTO contractors (licence_rbq, nom_legal, nom_normalized, neq, statut_rbq, ville)
                    VALUES (:licence, :nom, :nom_norm, :neq, :statut, :ville)
                    ON CONFLICT (licence_rbq) DO UPDATE SET
                        nom_legal = EXCLUDED.nom_legal,
                        nom_normalized = EXCLUDED.nom_normalized,
                        neq = EXCLUDED.neq,
                        statut_rbq = EXCLUDED.statut_rbq,
                        ville = EXCLUDED.ville,
                        updated_at = NOW()
                """), {
                    "licence": licence,
                    "nom": nom[:255] if nom else None,
                    "nom_norm": normalize_name(nom) if nom else None,
                    "neq": neq,
                    "statut": statut_db,
                    "ville": str(ville)[:100] if ville else None,
                })

                ingested += 1

                if ingested % 1000 == 0:
                    print(f"  {ingested:,} enregistrements...")

            except Exception as e:
                print(f"  Erreur: {e}")
                continue

    print(f"\n✓ {ingested:,} entrepreneurs ingérés")

    # Vérification
    with engine.connect() as conn:
        result = conn.execute(text("SELECT count(*) FROM contractors"))
        count = result.scalar()
        print(f"✓ Total en base: {count:,}")

if __name__ == "__main__":
    main()