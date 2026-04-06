#!/usr/bin/env python3
"""
Test script pour vérifier l'ingestion RBQ sans base de données.
Télécharge le fichier JSON et affiche la structure des données.
"""
import asyncio
import json
import httpx

RBQ_JSON_URL = "https://www.donneesquebec.ca/recherche/dataset/755b45d6-7aee-46df-a216-748a0191c79f/resource/5183fdd4-55b1-418c-8a7d-0a70058ed68d/download/rdl01_extractiondonneesouvertes.json"


async def test_rbq_download():
    print(f"Téléchargement depuis:\n{RBQ_JSON_URL}\n")

    async with httpx.AsyncClient(timeout=300) as client:
        print("Téléchargement en cours (~69 Mo)...")
        resp = await client.get(RBQ_JSON_URL)

        if resp.status_code != 200:
            print(f"Erreur HTTP: {resp.status_code}")
            return

        print(f"Taille téléchargée: {len(resp.content) / 1024 / 1024:.1f} Mo\n")

        print("Parsing JSON...")
        data = resp.json()

        # Analyser la structure - la clé est 'Liste Licence'
        print(f"Type racine: {type(data).__name__}")
        print(f"Clés: {list(data.keys())}")

        # Extraire les licences
        licences_key = "Liste Licence"
        if licences_key in data:
            licences = data[licences_key]
            print(f"\n✓ Trouvé '{licences_key}' avec {len(licences)} licences")
        else:
            print(f"✗ Clé '{licences_key}' non trouvée")
            return

        if not licences:
            print("Aucune licence trouvée")
            return

        # Analyser le premier enregistrement
        print(f"\n=== Premier enregistrement ===")
        first = licences[0]
        print(json.dumps(first, indent=2, ensure_ascii=False)[:3000])

        print(f"\n=== Colonnes disponibles ({len(first.keys())} champs) ===")
        for key in first.keys():
            value = first[key]
            value_type = type(value).__name__
            value_preview = str(value)[:80] if value else "null"
            print(f"  {key}: {value_type} = {value_preview}")

        # Statistiques sur un échantillon
        print(f"\n=== Statistiques ===")
        print(f"  Total licences: {len(licences):,}")

        # Compter les statuts
        statuts = {}
        categories = set()
        villes = set()

        for item in licences[:5000]:  # Échantillon plus grand
            statut = str(item.get("StatutLicence", "") or item.get("statutLicence", "inconnu"))
            statuts[statut] = statuts.get(statut, 0) + 1

            cat = item.get("Categorie") or item.get("categorie")
            if cat:
                categories.add(str(cat))

            ville = item.get("Ville") or item.get("ville")
            if ville:
                villes.add(str(ville)[:50])

        print(f"\n  Statuts (échantillon 5000):")
        for statut, count in sorted(statuts.items(), key=lambda x: -x[1]):
            pct = count / 5000 * 100
            print(f"    {statut}: {count} ({pct:.1f}%)")

        print(f"\n  Catégories uniques: {len(categories)}")
        for cat in sorted(categories)[:10]:
            print(f"    - {cat}")

        print(f"\n  Villes uniques: {len(villes)}")
        for ville in sorted(villes)[:10]:
            print(f"    - {ville}")

        print(f"\n✓ Test réussi - {len(licences):,} licences prêtes à être ingérées")


if __name__ == "__main__":
    asyncio.run(test_rbq_download())