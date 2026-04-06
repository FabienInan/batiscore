"""
Scraping du profil commerçant de l'OPC (Office de la protection du consommateur).

Source: https://www.opc.gouv.qc.ca/consommateur/se-renseigner-sur-un-commercant/
Méthode: Scraping HTTP (requests + BeautifulSoup)
Timing: À la demande (au moment de générer un rapport)

Note: Cette URL est fonctionnelle (hébergée par l'OPC, pas sur donneesquebec.ca).
"""
import asyncio
import re
from datetime import datetime
from typing import Optional

import httpx
from bs4 import BeautifulSoup
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from models import Contractor, OPCPlainte, OPCCache


OPC_SEARCH_URL = "https://www.opc.gouv.qc.ca/consommateur/se-renseigner-sur-un-commercant/"


async def scrape_opc_profile(neq: str, db: AsyncSession) -> dict:
    """
    Scrape le profil OPC d'un commerçant par son NEQ.

    Retourne:
        {
            "trouve": bool,
            "nb_plaintes": int,
            "mises_en_garde": list[str],
            "types_infractions": list[str],
            "fetched_at": datetime
        }
    """
    # Vérifier le cache d'abord
    result = await db.execute(
        select(OPCCache).where(OPCCache.neq == neq)
    )
    cached = result.scalar_one_or_none()

    if cached and cached.fetched_at:
        # Cache valide 24h
        age = (datetime.utcnow() - cached.fetched_at).total_seconds()
        if age < 86400:  # 24h
            return dict(cached.data) if cached.data else {"trouve": False}

    # Délai pour éviter le blocage
    await asyncio.sleep(settings.opc_scraping_delay)

    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept-Language": "fr-CA",
                "Accept": "text/html,application/xhtml+xml",
            }
            resp = await client.get(
                OPC_SEARCH_URL,
                params={"neq": neq},
                headers=headers
            )

        if resp.status_code != 200:
            return {"trouve": False, "error": f"HTTP {resp.status_code}"}

        soup = BeautifulSoup(resp.text, "html.parser")

        # Parser les données
        data = parse_opc_page(soup)
        data["neq"] = neq
        data["fetched_at"] = datetime.utcnow().isoformat()

        # Mettre en cache
        if cached:
            cached.data = data
            cached.fetched_at = datetime.utcnow()
        else:
            cache_entry = OPCCache(
                neq=neq,
                data=data,
                fetched_at=datetime.utcnow()
            )
            db.add(cache_entry)

        await db.commit()
        return data

    except Exception as e:
        print(f"OPC: Erreur scraping {neq}: {e}")
        return {"trouve": False, "error": str(e)}


def parse_opc_page(soup: BeautifulSoup) -> dict:
    """
    Parse la page OPC pour extraire:
    - Nombre de plaintes
    - Mises en garde actives
    - Types d'infractions
    """
    result = {
        "trouve": False,
        "nb_plaintes": 0,
        "mises_en_garde": [],
        "types_infractions": [],
    }

    # Chercher le bloc de résultats
    # La structure HTML dépend du site OPC
    results_div = soup.find("div", class_="resultats")
    if not results_div:
        results_div = soup.find("section", {"id": "resultats"})
    if not results_div:
        results_div = soup.find("div", {"class": "commercant-info"})

    if not results_div:
        # Vérifier si la page indique "aucun résultat"
        text = soup.get_text().lower()
        if "aucun" in text and "commercant" in text:
            return result
        # Peut-être une page de résultats différente
        pass

    result["trouve"] = True

    # Nombre de plaintes
    plaintes_elem = soup.find("span", class_="nb-plaintes")
    if plaintes_elem:
        match = re.search(r"(\d+)", plaintes_elem.get_text())
        if match:
            result["nb_plaintes"] = int(match.group(1))

    # Alternative: chercher dans le texte
    if result["nb_plaintes"] == 0:
        for elem in soup.find_all(["p", "span", "div"]):
            text = elem.get_text().lower()
            if "plainte" in text:
                match = re.search(r"(\d+)\s*plainte", text)
                if match:
                    result["nb_plaintes"] = int(match.group(1))
                    break

    # Mises en garde
    for alert in soup.find_all(["div", "section"], class_=["mise-en-garde", "alerte", "warning"]):
        text = alert.get_text(strip=True)
        if text and len(text) < 500:
            result["mises_en_garde"].append(text)

    # Types d'infractions
    for infraction in soup.find_all("li", class_="infraction"):
        text = infraction.get_text(strip=True)
        if text:
            result["types_infractions"].append(text)

    return result


async def get_opc_plaintes_for_contractor(contractor_id: int, db: AsyncSession) -> Optional[OPCPlainte]:
    """
    Récupère les plaintes OPC pour un entrepreneur.
    Scrape si nécessaire.
    """
    result = await db.execute(
        select(Contractor).where(Contractor.id == contractor_id)
    )
    contractor = result.scalar_one_or_none()

    if not contractor or not contractor.neq:
        return None

    # Vérifier si on a déjà les données
    plainte_result = await db.execute(
        select(OPCPlainte).where(OPCPlainte.contractor_id == contractor_id)
    )
    existing = plainte_result.scalar_one_or_none()

    # Si données récentes (< 7 jours), les retourner
    if existing and existing.fetched_at:
        age = (datetime.utcnow() - existing.fetched_at).days
        if age < 7:
            return existing

    # Scrape les nouvelles données
    data = await scrape_opc_profile(contractor.neq, db)

    if existing:
        existing.nb_plaintes = data.get("nb_plaintes", 0)
        existing.mises_en_garde = data.get("mises_en_garde", [])
        existing.types_infractions = data.get("types_infractions", [])
        existing.fetched_at = datetime.utcnow()
    else:
        existing = OPCPlainte(
            contractor_id=contractor_id,
            nb_plaintes=data.get("nb_plaintes", 0),
            mises_en_garde=data.get("mises_en_garde", []),
            types_infractions=data.get("types_infractions", []),
        )
        db.add(existing)

    await db.commit()
    return existing