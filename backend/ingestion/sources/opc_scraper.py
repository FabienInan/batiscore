"""
Scraping du profil commerçant de l'OPC (Office de la protection du consommateur).

Source: https://www.opc.gouv.qc.ca/consommateur/se-renseigner-sur-un-commercant/
Méthode: Scraping HTTP (requests + BeautifulSoup)
Timing: À la demande (au moment de générer un rapport)

Note: Respecter un délai de 2-3 secondes entre requêtes.
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
        async with httpx.AsyncClient(timeout=30) as client:
            # Première requête: page de recherche
            resp = await client.get(
                OPC_SEARCH_URL,
                params={"neq": neq},
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept-Language": "fr-CA",
                }
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
        print(f"Erreur scraping OPC {neq}: {e}")
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
    # Note: La structure HTML exacte dépend du site OPC
    # À ajuster selon la vraie page

    # Exemple de parsing (à adapter)
    results_div = soup.find("div", class_="resultats-recherche")
    if not results_div:
        # Essayer d'autres sélecteurs
        results_div = soup.find("section", {"id": "resultats"})

    if not results_div:
        return result

    result["trouve"] = True

    # Nombre de plaintes
    plaintes_elem = soup.find("span", class_="nb-plaintes")
    if plaintes_elem:
        match = re.search(r"(\d+)", plaintes_elem.get_text())
        if match:
            result["nb_plaintes"] = int(match.group(1))

    # Mises en garde
    for alert in soup.find_all("div", class_="mise-en-garde"):
        text = alert.get_text(strip=True)
        if text:
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


async def batch_scrape_opc(db: AsyncSession, limit: int = 100):
    """
    Scrape les profils OPC pour les entrepreneurs sans données OPC.
    À utiliser avec prudence (rate limiting).
    """
    result = await db.execute(
        select(Contractor)
        .where(Contractor.neq != None)
        .where(Contractor.statut_rbq == "valide")
        .limit(limit)
    )
    contractors = result.scalars().all()

    scraped = 0
    for contractor in contractors:
        if contractor.neq:
            await scrape_opc_profile(contractor.neq, db)
            scraped += 1
            print(f"OPC: {scraped}/{len(contractors)} - {contractor.nom_legal}")

    return scraped