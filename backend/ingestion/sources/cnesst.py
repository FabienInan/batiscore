"""
Scraping de la liste CNESST des employeurs en défaut.

Source: https://www.cnesst.gouv.qc.ca/fr/salle-presse/employeurs-contrevenants

Note: Cette URL est fonctionnelle (hébergée par la CNESST).
"""
import asyncio
import re
from datetime import datetime
from typing import List

import httpx
from bs4 import BeautifulSoup
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from models import Contractor, RBQEvent


async def scrape_cnesst_default_list(db: AsyncSession) -> List[dict]:
    """
    Scrape la liste des employeurs en défaut CNESST.

    Returns:
        Liste des employeurs en défaut.
    """
    print("CNESST: Récupération de la liste des contrevenants...")

    try:
        async with httpx.AsyncClient(timeout=60, follow_redirects=True) as client:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept-Language": "fr-CA",
                "Accept": "text/html,application/xhtml+xml",
            }
            resp = await client.get(settings.cnesst_url, headers=headers)

        if resp.status_code != 200:
            print(f"CNESST: Erreur HTTP {resp.status_code}")
            return []

        soup = BeautifulSoup(resp.text, "html.parser")

        # Parser la liste
        defaults = parse_cnesst_list(soup)

        # Marquer les entrepreneurs concernés
        await update_contractors_cnesst_status(defaults, db)

        return defaults

    except Exception as e:
        print(f"CNESST: Erreur scraping: {e}")
        return []


def parse_cnesst_list(soup: BeautifulSoup) -> List[dict]:
    """
    Parse la page CNESST pour extraire la liste des défauts.
    """
    defaults = []

    # Chercher le tableau des employeurs
    table = soup.find("table")
    if table:
        for row in table.find_all("tr")[1:]:  # Skip header
            cells = row.find_all("td")
            if len(cells) >= 2:
                default = {
                    "nom": cells[0].get_text(strip=True),
                    "neq": extract_neq(cells[1].get_text(strip=True)) if len(cells) > 1 else None,
                    "infraction": cells[2].get_text(strip=True) if len(cells) > 2 else None,
                    "date": datetime.utcnow().isoformat(),
                }
                defaults.append(default)

    # Alternative: chercher des listes ou divs
    if not defaults:
        for item in soup.find_all(["div", "li"], class_=["employeur", "contrevenant", "item"]):
            text = item.get_text(strip=True)
            if text and len(text) > 10:
                default = {
                    "nom": text[:200],
                    "neq": extract_neq(text),
                    "date": datetime.utcnow().isoformat(),
                }
                defaults.append(default)

    print(f"CNESST: {len(defaults)} contrevenants trouvés")
    return defaults


def extract_neq(text: str) -> str:
    """Extrait un NEQ d'un texte."""
    match = re.search(r"(\d{10})", text.replace(" ", ""))
    return match.group(1) if match else None


async def update_contractors_cnesst_status(defaults: List[dict], db: AsyncSession):
    """Met à jour le statut des entrepreneurs en défaut CNESST."""
    updated = 0

    for default in defaults:
        neq = default.get("neq")
        if not neq:
            continue

        # Chercher par NEQ
        result = await db.execute(
            select(Contractor).where(Contractor.neq == neq)
        )
        contractor = result.scalar_one_or_none()

        if contractor:
            # Vérifier si l'événement existe déjà
            existing = await db.execute(
                select(RBQEvent).where(
                    RBQEvent.contractor_id == contractor.id,
                    RBQEvent.source == "cnesst",
                    RBQEvent.event_type == "defaut_cotisation"
                )
            )
            if existing.scalar_one_or_none():
                continue

            # Ajouter l'événement
            event = RBQEvent(
                contractor_id=contractor.id,
                event_type="defaut_cotisation",
                source="cnesst",
                description=f"Défaut CNESST - {default.get('nom', '')}",
                event_date=datetime.utcnow().date(),
            )
            db.add(event)
            updated += 1

    await db.commit()
    print(f"CNESST: {updated} entrepreneurs marqués en défaut")
    return updated