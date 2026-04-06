#!/usr/bin/env python3
"""
Script utilitaire pour télécharger les fichiers de données.

Usage:
    python download_data.py --source rbq
    python download_data.py --source rbq --wayback
"""
import argparse
import httpx
import os
import sys

# URLs avec fallbacks
URLS = {
    "rbq": {
        "direct": "https://www.donneesquebec.ca/recherche/dataset/755b45d6-7aee-46df-a216-748a0191c79f/resource/5183fdd4-55b1-418c-8a7d-0a70058ed68d/download/rdl01_extractiondonneesouvertes.json",
        "wayback": "https://web.archive.org/web/2026/https://www.donneesquebec.ca/recherche/dataset/755b45d6-7aee-46df-a216-748a0191c79f/resource/5183fdd4-55b1-418c-8a7d-0a70058ed68d/download/rdl01_extractiondonneesouvertes.json",
        "mirror": "https://ouvert.canada.ca/data/fr/dataset/755b45d6-7aee-46df-a216-748a0191c79f",
    },
    "rbq_zip": {
        "direct": "https://www.donneesquebec.ca/recherche/dataset/755b45d6-7aee-46df-a216-748a0191c79f/resource/32f6ec46-85fd-45e9-945b-965d9235840a/download/rdl01_extractiondonneesouvertes.zip",
        "wayback": "https://web.archive.org/web/2026/https://www.donneesquebec.ca/recherche/dataset/755b45d6-7aee-46df-a216-748a0191c79f/resource/32f6ec46-85fd-45e9-945b-965d9235840a/download/rdl01_extractiondonneesouvertes.zip",
    },
}


def download_file(url: str, output_path: str):
    """Télécharge un fichier depuis une URL."""
    print(f"Téléchargement depuis:\n{url}\n")

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "*/*",
    }

    with httpx.Client(timeout=300, follow_redirects=True) as client:
        resp = client.get(url, headers=headers)

        if resp.status_code != 200:
            print(f"Erreur HTTP: {resp.status_code}")
            return False

        # Vérifier que c'est du JSON ou du ZIP
        content_type = resp.headers.get("content-type", "")
        if "html" in content_type and len(resp.content) < 1000:
            print("⚠️  Le fichier semble être une page HTML (probablement une erreur)")
            print(f"Contenu: {resp.text[:200]}")
            return False

        # Créer le dossier de sortie
        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

        # Sauvegarder
        with open(output_path, "wb") as f:
            f.write(resp.content)

        print(f"✓ Téléchargé: {len(resp.content) / 1024 / 1024:.1f} Mo")
        print(f"✓ Sauvegardé: {output_path}")
        return True


def main():
    parser = argparse.ArgumentParser(description="Télécharge les fichiers de données")
    parser.add_argument("--source", choices=["rbq", "rbq_zip"], default="rbq")
    parser.add_argument("--wayback", action="store_true", help="Utiliser Wayback Machine")
    parser.add_argument("--output", help="Chemin de sortie")

    args = parser.parse_args()

    source = URLS[args.source]

    # Choisir l'URL
    if args.wayback:
        url = source["wayback"]
    else:
        url = source["direct"]

    # Chemin de sortie
    if args.output:
        output_path = args.output
    else:
        ext = "json" if "json" in args.source else "zip"
        output_path = f"data/{args.source}.{ext}"

    # Télécharger
    success = download_file(url, output_path)

    if not success and not args.wayback:
        print("\n⚠️  Échec du téléchargement direct")
        print("Essai avec Wayback Machine...")
        url = source["wayback"]
        success = download_file(url, output_path)

    if not success:
        print("\n❌ Échec du téléchargement")
        print("\nAlternatives:")
        print(f"1. Visiter le miroir: {source.get('mirror', 'N/A')}")
        print("2. Télécharger manuellement le fichier")
        sys.exit(1)


if __name__ == "__main__":
    main()