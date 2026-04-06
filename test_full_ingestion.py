#!/usr/bin/env python3
"""
Test complet de l'ingestion RBQ - simule le processus sans DB.
"""
import asyncio
import re
import unicodedata
import httpx


# === Normalisation (copie de normalize.py) ===

def normalize_name(name: str) -> str:
    if not name:
        return ""
    name = name.lower()
    name = unicodedata.normalize("NFD", name)
    name = "".join(c for c in name if unicodedata.category(c) != "Mn")
    name = re.sub(r"[&.,'\-]", " ", name)
    stop_words = ["inc", "ltee", "ltée", "enr", "cie", "co", "corp", "construction", "renovation", "renovations"]
    pattern = r"\b(" + "|".join(stop_words) + r")\b"
    name = re.sub(pattern, "", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name


def normalize_neq(neq: str) -> str:
    if not neq:
        return ""
    digits = re.sub(r"\D", "", neq)
    return digits if len(digits) == 10 else neq


def normalize_licence_rbq(licence: str) -> str:
    if not licence:
        return ""
    digits = re.sub(r"\D", "", licence)
    if len(digits) == 10:
        return f"{digits[:4]}-{digits[4:8]}-{digits[8:]}"
    return licence


# === Test ingestion ===

RBQ_JSON_URL = "https://www.donneesquebec.ca/recherche/dataset/755b45d6-7aee-46df-a216-748a0191c79f/resource/5183fdd4-55b1-418c-8a7d-0a70058ed68d/download/rdl01_extractiondonneesouvertes.json"


async def test_full_ingestion():
    print("=" * 60)
    print("TEST INGESTION RBQ COMPLET")
    print("=" * 60)
    print(f"\nURL: {RBQ_JSON_URL}\n")

    async with httpx.AsyncClient(timeout=300) as client:
        print("⏳ Téléchargement (~83 Mo)...")
        resp = await client.get(RBQ_JSON_URL)

        if resp.status_code != 200:
            print(f"❌ Erreur HTTP: {resp.status_code}")
            return

        print(f"✓ Téléchargé: {len(resp.content) / 1024 / 1024:.1f} Mo\n")

        print("⏳ Parsing JSON...")
        data = resp.json()

        licences = data.get("Liste Licence", [])
        print(f"✓ {len(licences):,} licences trouvées\n")

        # Simuler l'ingestion
        contractors = []
        statuts = {}
        erreurs = 0

        print("⏳ Simulation ingestion...")
        for i, item in enumerate(licences):
            try:
                record = item.get("Licence", item)

                licence = normalize_licence_rbq(str(record.get("Numéro de licence", "")))
                if not licence:
                    continue

                nom = record.get("Nom de l'intervenant", "")
                neq = normalize_neq(str(record.get("NEQ", ""))) if record.get("NEQ") else None
                statut = str(record.get("Statut de la licence", "")).lower()
                ville = record.get("Municipalité")
                telephone = record.get("Numéro de téléphone")

                # Compter les statuts
                statuts[statut] = statuts.get(statut, 0) + 1

                contractor = {
                    "licence_rbq": licence,
                    "nom_legal": nom[:255] if nom else None,
                    "nom_normalized": normalize_name(nom) if nom else None,
                    "neq": neq if neq and len(neq) == 10 else None,
                    "statut_rbq": statut,
                    "ville": str(ville)[:100] if ville else None,
                    "telephone": str(telephone)[:20] if telephone else None,
                }
                contractors.append(contractor)

            except Exception as e:
                erreurs += 1

        print(f"\n{'=' * 60}")
        print("RÉSULTATS")
        print("=" * 60)
        print(f"✓ Contractors créés: {len(contractors):,}")
        print(f"✓ Erreurs: {erreurs}")

        print(f"\n=== Répartition des statuts ===")
        for statut, count in sorted(statuts.items(), key=lambda x: -x[1]):
            pct = count / len(contractors) * 100
            print(f"  {statut}: {count:,} ({pct:.1f}%)")

        # NEQ présents
        avec_neq = sum(1 for c in contractors if c["neq"])
        print(f"\n=== NEQ ===")
        print(f"  Avec NEQ valide: {avec_neq:,} ({avec_neq/len(contractors)*100:.1f}%)")

        # Échantillon
        print(f"\n=== Échantillon (3 premiers) ===")
        for c in contractors[:3]:
            print(f"  • {c['nom_legal'][:40]} | {c['licence_rbq']} | {c['ville'] or 'N/A'}")

        print(f"\n{'=' * 60}")
        print("✓ TEST RÉUSSI - Données prêtes pour l'ingestion")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_full_ingestion())