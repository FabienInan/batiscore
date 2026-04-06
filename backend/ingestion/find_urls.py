#!/usr/bin/env python3
"""
Script pour trouver les vraies URLs des datasets Québec.

Les URLs changent parfois. Utiliser ce script pour les récupérer.
"""

import httpx
from bs4 import BeautifulSoup


DATASETS = {
    "rbq_actives": "https://www.donneesquebec.ca/recherche/dataset/licencesactives",
    "req": "https://www.donneesquebec.ca/recherche/dataset/registre-entreprises-ouvertes",
    "seao": "https://www.donneesquebec.ca/recherche/dataset/systeme-electronique-dappel-doffres-seao",
    "opc_plaintes": "https://www.donneesquebec.ca/recherche/dataset/liste-des-plaintes-recues",
}


async def find_download_url(dataset_page_url: str) -> dict:
    """
    Trouve les URLs de téléchargement depuis une page de dataset.
    """
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.get(dataset_page_url)

    if resp.status_code != 200:
        return {"error": f"HTTP {resp.status_code}"}

    soup = BeautifulSoup(resp.text, "html.parser")

    # Chercher les liens de téléchargement
    download_links = []

    for link in soup.find_all("a", href=True):
        href = link.get("href", "")
        text = link.get_text(strip=True).lower()

        # Identifier les fichiers de données
        if any(ext in href.lower() for ext in [".csv", ".json", ".xlsx", ".zip"]):
            if "download" in href or "resource" in href:
                download_links.append({
                    "url": href if href.startswith("http") else f"https://www.donneesquebec.ca{href}",
                    "text": text,
                })

    return {"url": dataset_page_url, "downloads": download_links}


async def main():
    print("=== Recherche des URLs de téléchargement ===\n")

    for name, url in DATASETS.items():
        print(f"Dataset: {name}")
        result = await find_download_url(url)

        if "error" in result:
            print(f"  Erreur: {result['error']}")
        else:
            for dl in result.get("downloads", []):
                print(f"  - {dl['text']}: {dl['url']}")

        print()


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())