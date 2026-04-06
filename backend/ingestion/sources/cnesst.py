"""
Scraping de la liste CNESST des employeurs en défaut de cotisation.

Source: https://www.cnesst.gouv.qc.ca/fr/entreprises/cotisations/
Note: Liste publique des défauts de paiement - signal de fragilité financière.
"""
import asyncio
import re
from datetime import datetime
from typing import List, Optional

import httpx
from bs4 import BeautifulSoup
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Contractor


CNESST_DEFAULT_URL = "https://www.cnesst.gouv.qc.ca/fr/entreprises/cotisations/liste-employeurs-defaut"


async def scrape_cnesst_default_list(db: AsyncSession) -> List[dict]:
    """
    Scrape la liste des employeurs en défaut CNESST.

    Returns:
        Liste des employeurs en défaut avec NEQ si disponible.
    """
    print("CNESST: Téléchargement de la liste des défauts...")

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.get(
                CNESST_DEFAULT_URL,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept-Language": "fr-CA",
                }
            )

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

    Note: La structure HTML dépend du site CNESST.
    À adapter selon la vraie page.
    """
    defaults = []

    # Chercher le tableau des employeurs en défaut
    table = soup.find("table", class_="tableau-defauts")
    if not table:
        table = soup.find("table", {"id": "employeurs-defaut"})

    if not table:
        # Essayer de trouver une liste ou un autre conteneur
        for item in soup.find_all("li", class_="employeur-defaut"):
            text = item.get_text(strip=True)
            default = parse_employer_text(text)
            if default:
                defaults.append(default)
        return defaults

    # Parser les lignes du tableau
    for row in table.find_all("tr")[1:]:  # Skip header
        cells = row.find_all("td")
        if len(cells) >= 2:
            default = {
                "nom": cells[0].get_text(strip=True),
                "neq": extract_neq(cells[1].get_text(strip=True)) if len(cells) > 1 else None,
                "montant": extract_montant(cells[2].get_text(strip=True)) if len(cells) > 2 else None,
                "date": datetime.utcnow().isoformat(),
            }
            defaults.append(default)

    return defaults


def parse_employer_text(text: str) -> Optional[dict]:
    """Parse un texte décrivant un employeur en défaut."""
    neq_match = re.search(r"NEQ[:\s]*(\d{10})", text)
    montant_match = re.search(r"(\d[\d\s]*,\d{2})\s*\$", text)

    return {
        "nom": text.split("-")[0].strip() if "-" in text else text[:100],
        "neq": neq_match.group(1) if neq_match else None,
        "montant": float(montant_match.group(1).replace(" ", "").replace(",", ".")) if montant_match else None,
        "date": datetime.utcnow().isoformat(),
    }


def extract_neq(text: str) -> Optional[str]:
    """Extrait un NEQ d'un texte."""
    match = re.search(r"(\d{10})", text.replace(" ", ""))
    return match.group(1) if match else None


def extract_montant(text: str) -> Optional[float]:
    """Extrait un montant d'un texte."""
    match = re.search(r"(\d[\d\s]*,\d{2})", text)
    if match:
        return float(match.group(1).replace(" ", "").replace(",", "."))
    return None


async def update_contractors_cnesst_status(defaults: List[dict], db: AsyncSession):
    """
    Met à jour le statut des entrepreneurs en défaut CNESST.

    Ajoute un événement CNESST pour chaque entrepreneur trouvé.
    """
    from models import RBQEvent

    updated = 0
    for default in defaults:
        if not default.get("neq"):
            continue

        # Chercher par NEQ
        result = await db.execute(
            select(Contractor).where(Contractor.neq == default["neq"])
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
                montant=default.get("montant"),
                description=f"Défaut de cotisation CNESST - {default.get('nom', '')}",
                event_date=datetime.utcnow().date(),
            )
            db.add(event)
            updated += 1

    await db.commit()
    print(f"CNESST: {updated} entrepreneurs marqués en défaut")
    return updated


async def check_cnesst_status(neq: str) -> bool:
    """
    Vérifie si un NEQ est dans la liste des défauts CNESST.

    Returns:
        True si en défaut, False sinon.
    """
    # Cette fonction fait une requête unitaire
    # À utiliser avec prudence (rate limiting)

    await asyncio.sleep(1)  # Rate limiting

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                CNESST_DEFAULT_URL,
                params={"neq": neq},
                headers={"User-Agent": "Mozilla/5.0"}
            )

        if resp.status_code != 200:
            return False

        # Vérifier si le NEQ apparaît dans la réponse
        return neq in resp.text

    except:
        return False