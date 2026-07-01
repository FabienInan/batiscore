"""
Utilitaires pour découvrir dynamiquement les URLs de téléchargement des
sources publiques via les API CKAN de donneesquebec.ca et ouvert.canada.ca.

Cela évite de hardcoder les UUIDs de ressources, qui changent lorsque les
fichiers sont mis à jour.
"""
import re
from datetime import datetime
from typing import Optional

import httpx


def _http_client(timeout: float = 60) -> httpx.AsyncClient:
    """Client httpx configuré pour les API CKAN."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "application/json",
    }
    return httpx.AsyncClient(timeout=timeout, follow_redirects=True, headers=headers)


async def _fetch_package(api_base: str, dataset_id: str) -> dict:
    """Interroge package_show pour un dataset CKAN."""
    url = f"{api_base}/api/3/action/package_show?id={dataset_id}"
    async with _http_client() as client:
        resp = await client.get(url)
    if resp.status_code != 200:
        raise Exception(f"CKAN HTTP {resp.status_code} pour {dataset_id}")

    data = resp.json()
    if not data.get("success"):
        err = data.get("error", {})
        raise Exception(f"CKAN error: {err}")

    return data["result"]


def _pick_resource(resources: list, name_pattern: Optional[str], format_filter: Optional[str]) -> Optional[dict]:
    """Sélectionne une ressource par pattern de nom et/ou format."""
    candidates = []
    for r in resources:
        name = r.get("name", "")
        fmt = r.get("format", "")
        resource_url = r.get("url", "")
        if not resource_url:
            continue
        if format_filter and fmt.upper() != format_filter.upper():
            continue
        if name_pattern and not re.search(name_pattern, name, re.IGNORECASE):
            continue
        candidates.append(r)
    return candidates[0] if candidates else None


def _extract_date_from_resource_name(name: str) -> Optional[datetime]:
    """Extrait une date de fin à partir de noms type mensuel_YYYYMMDD_YYYYMMDD ou hebdo_..."""
    m = re.search(r"_(\d{8})\.json$", name)
    if m:
        try:
            return datetime.strptime(m.group(1), "%Y%m%d")
        except ValueError:
            return None
    return None


async def find_rbq_json_url() -> str:
    """
    Découvre l'URL JSON actuel des licences RBQ.
    Essaie d'abord l'API Données Québec, puis le Portail ouvert Canada.
    """
    dq_id = "755b45d6-7aee-46df-a216-748a0191c79f"
    oc_id = "755b45d6-7aee-46df-a216-748a0191c79f"

    for api_base, dataset_id in [
        ("https://www.donneesquebec.ca/recherche", dq_id),
        ("https://ouvert.canada.ca/data", oc_id),
    ]:
        try:
            result = await _fetch_package(api_base, dataset_id)
            resource = _pick_resource(result.get("resources", []), r"licence", "JSON")
            if resource and resource.get("url"):
                url = resource["url"]
                print(f"CKAN: URL RBQ trouvée via {api_base}: {url}")
                return url
        except Exception as e:
            print(f"CKAN: Échec {api_base} pour RBQ: {e}")
            continue

    raise Exception("Impossible de découvrir l'URL RBQ via CKAN")


async def find_req_zip_url() -> str:
    """
    Découvre l'URL ZIP actuel du Registre des entreprises du Québec.
    """
    dataset_id = "registre-des-entreprises"
    api_bases = [
        "https://www.donneesquebec.ca/recherche",
        "https://ouvert.canada.ca/data",
    ]

    for api_base in api_bases:
        try:
            result = await _fetch_package(api_base, dataset_id)
            resources = result.get("resources", [])
            resource = _pick_resource(resources, r"registre", "ZIP")
            if resource and resource.get("url"):
                url = resource["url"]
                print(f"CKAN: URL REQ trouvée via {api_base}: {url}")
                return url
        except Exception as e:
            print(f"CKAN: Échec {api_base} pour REQ: {e}")
            continue

    raise Exception("Impossible de découvrir l'URL REQ via CKAN")


async def find_seao_json_url(prefer_monthly: bool = True) -> str:
    """
    Découvre l'URL JSON actuel de SEAO.
    Par défaut, prend le fichier mensuel le plus récent ; sinon le hebdomadaire le plus récent.
    """
    dataset_id = "d23b2e02-085d-43e5-9e6e-e1d558ebfdd5"
    api_bases = [
        "https://ouvert.canada.ca/data",
        "https://www.donneesquebec.ca/recherche",
    ]

    for api_base in api_bases:
        try:
            result = await _fetch_package(api_base, dataset_id)
            resources = result.get("resources", [])

            candidates = []
            for r in resources:
                name = r.get("name", "")
                url = r.get("url", "")
                fmt = r.get("format", "")
                if fmt.upper() != "JSON" or not url.endswith(".json"):
                    continue
                m_monthly = re.search(r"monthly_(\d{8})_(\d{8})", name, re.IGNORECASE)
                m_weekly = re.search(r"week_(\d{8})_(\d{8})", name, re.IGNORECASE)
                if m_monthly:
                    candidates.append((int(m_monthly.group(2)), "monthly", name, url))
                elif m_weekly:
                    candidates.append((int(m_weekly.group(2)), "weekly", name, url))

            if not candidates:
                continue

            candidates.sort(reverse=True)

            # Si on préfère mensuel, prendre le plus récent mensuel ; sinon le plus récent global
            if prefer_monthly:
                monthly = [c for c in candidates if c[1] == "monthly"]
                if monthly:
                    chosen = monthly[0]
                else:
                    chosen = candidates[0]
            else:
                chosen = candidates[0]

            _, kind, name, url = chosen
            print(f"CKAN: URL SEAO trouvée via {api_base}: {name} -> {url}")
            return url

        except Exception as e:
            print(f"CKAN: Échec {api_base} pour SEAO: {e}")
            continue

    raise Exception("Impossible de découvrir l'URL SEAO via CKAN")


async def test_discovery():
    """Quick test pour valider la découverte d'URLs."""
    print("=== Test découverte URLs CKAN ===")
    try:
        print("RBQ:", await find_rbq_json_url())
    except Exception as e:
        print("RBQ ERROR:", e)
    try:
        print("REQ:", await find_req_zip_url())
    except Exception as e:
        print("REQ ERROR:", e)
    try:
        print("SEAO:", await find_seao_json_url())
    except Exception as e:
        print("SEAO ERROR:", e)


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_discovery())
