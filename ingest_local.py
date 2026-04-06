#!/usr/bin/env python3
"""
Ingestion RBQ depuis un fichier local.
"""
import json
import re
import unicodedata
import sys
sys.path.insert(0, '/Users/fabien/Documents/projets/entrepreneur-checker/backend')

from sqlalchemy import create_engine, text

# === Normalisation ===

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
    print("=== Ingestion RBQ (fichier local) ===\n")

    # Fichier local
    filepath = "/Users/fabien/Documents/projets/entrepreneur-checker/data/rbq_licences.json"
    print(f"Fichier: {filepath}")

    # Connexion DB
    db_url = "postgresql://dev:dev@localhost:5433/rbq_app"
    engine = create_engine(db_url)

    # Test connexion
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
        print("✓ Connexion DB OK\n")

    # Charger le JSON
    print("Chargement du JSON...")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    licences = data.get("Liste Licence", [])
    print(f"✓ {len(licences):,} licences\n")

    # Ingestion
    print("Ingestion...")
    ingested = 0
    skipped = 0

    # Utiliser une connexion autocommit pour éviter les rollback
    conn = engine.raw_connection()
    cursor = conn.cursor()

    for i, item in enumerate(licences):
        try:
            record = item.get("Licence", item)

            licence = normalize_licence(str(record.get("Numéro de licence", "")))
            if not licence:
                skipped += 1
                continue

            nom = record.get("Nom de l'intervenant", "") or "Inconnu"
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

            cursor.execute("""
                INSERT INTO contractors (licence_rbq, nom_legal, nom_normalized, neq, statut_rbq, ville)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (licence_rbq) DO UPDATE SET
                    nom_legal = EXCLUDED.nom_legal,
                    nom_normalized = EXCLUDED.nom_normalized,
                    neq = EXCLUDED.neq,
                    statut_rbq = EXCLUDED.statut_rbq,
                    ville = EXCLUDED.ville,
                    updated_at = NOW()
            """, (
                licence,
                nom[:255] if nom else None,
                normalize_name(nom) if nom else None,
                neq,
                statut_db,
                str(ville)[:100] if ville else None,
            ))

            ingested += 1

            if ingested % 5000 == 0:
                conn.commit()
                print(f"  {ingested:,} enregistrements...")

        except Exception as e:
            skipped += 1
            if skipped < 10:
                print(f"  Erreur: {e}")
            continue

    conn.commit()
    cursor.close()
    conn.close()

    print(f"\n✓ {ingested:,} entrepreneurs ingérés")
    print(f"  {skipped} ignorés")

    # Vérification
    with engine.connect() as conn:
        result = conn.execute(text("SELECT count(*) FROM contractors"))
        count = result.scalar()
        print(f"✓ Total en base: {count:,}")

        # Stats
        result = conn.execute(text("SELECT statut_rbq, count(*) FROM contractors GROUP BY statut_rbq"))
        print("\n=== Statuts ===")
        for row in result:
            print(f"  {row[0]}: {row[1]:,}")

if __name__ == "__main__":
    main()