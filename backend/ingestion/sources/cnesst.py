"""
Scraping de la liste CNESST des employeurs contrevenants.

Source: https://www.cnesst.gouv.qc.ca/fr/salle-presse/employeurs-contrevenants

Structure HTML :
  <li class="views-row">
    <h3>NOM ENTREPRISE</h3>
    <div class="employeur-contrevenant__body">description infraction</div>
    <time datetime="2025-07-22T12:00:00Z">22 juillet 2025</time>
    Amende : 2 800 $
  </li>

Matching : par nom normalisé (pas de NEQ dans les données CNESST).
"""
import asyncio
import json
import re
from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional

import httpx
from bs4 import BeautifulSoup
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Contractor, RBQEvent
from ingestion.transforms.normalize import normalize_name, ContractorIndex

CNESST_URL = "https://www.cnesst.gouv.qc.ca/fr/salle-presse/employeurs-contrevenants"
CNESST_AJAX_URL = "https://www.cnesst.gouv.qc.ca/fr/views/ajax"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept-Language": "fr-CA,fr;q=0.9",
    "Accept": "text/html,application/xhtml+xml,*/*",
}


async def scrape_cnesst_default_list(db: AsyncSession) -> List[dict]:
    """Scrape la liste des employeurs contrevenants CNESST."""
    print("CNESST: Récupération de la liste des contrevenants...")

    try:
        async with httpx.AsyncClient(timeout=60, follow_redirects=True) as client:
            resp = await client.get(CNESST_URL, headers=HEADERS)
            if resp.status_code != 200:
                print(f"CNESST: Erreur HTTP {resp.status_code}")
                return []

            soup = BeautifulSoup(resp.text, "html.parser")
            view_params = _extract_view_params(resp.text)

            entries = _parse_views_rows(soup)
            print(f"CNESST: Page 1 — {len(entries)} entrées")

            if view_params:
                page = 1
                while True:
                    await asyncio.sleep(1)
                    more = await _fetch_ajax_page(client, view_params, page)
                    if not more:
                        break
                    print(f"CNESST: Page {page + 1} — {len(more)} entrées")
                    entries.extend(more)
                    page += 1
                    if page > 100:
                        break

        print(f"CNESST: {len(entries)} contrevenants trouvés au total")
        matched = await _match_and_store(entries, db)
        print(f"CNESST: {matched} entrepreneurs matchés en base")
        return entries

    except Exception as e:
        print(f"CNESST: Erreur scraping: {e}")
        return []


def _extract_view_params(html: str) -> Optional[dict]:
    """Extrait les paramètres Drupal Views depuis le JSON embarqué."""
    try:
        match = re.search(r'"ajaxViews":\{"([^"]+)":\{([^}]+)\}', html)
        if not match:
            return None
        inner = "{" + match.group(2) + "}"
        inner = inner.replace('\\"', '"')
        return json.loads(inner)
    except Exception:
        return None


async def _fetch_ajax_page(client: httpx.AsyncClient, params: dict, page: int) -> List[dict]:
    """Récupère une page AJAX de la vue Drupal."""
    try:
        data = {
            "view_name": params.get("view_name", "employeur_contrevenant"),
            "view_display_id": params.get("view_display_id", "block_1"),
            "view_args": params.get("view_args", ""),
            "view_path": params.get("view_path", "/node/1140846"),
            "view_base_path": params.get("view_base_path", ""),
            "view_dom_id": params.get("view_dom_id", ""),
            "pager_element": params.get("pager_element", 0),
            "page": page,
        }
        headers = {**HEADERS, "X-Requested-With": "XMLHttpRequest", "Accept": "application/json"}
        resp = await client.post(CNESST_AJAX_URL, data=data, headers=headers)

        if resp.status_code != 200:
            return []

        result = resp.json()
        for cmd in (result if isinstance(result, list) else []):
            if cmd.get("command") == "insert" and "data" in cmd:
                soup = BeautifulSoup(cmd["data"], "html.parser")
                return _parse_views_rows(soup)
        return []
    except Exception:
        return []


def _parse_views_rows(soup: BeautifulSoup) -> List[dict]:
    """Parse les <li class="views-row"> de la structure Drupal."""
    entries = []

    for row in soup.find_all("li", class_="views-row"):
        try:
            # Nom
            h3 = row.find("h3")
            if not h3:
                continue
            nom = h3.get_text(strip=True)
            if not nom:
                continue

            # Description infraction
            body = row.find("div", class_="employeur-contrevenant__body")
            infraction = body.get_text(" ", strip=True)[:500] if body else None

            # Date de culpabilité
            time_tag = row.find("time")
            date_culpabilite = None
            if time_tag and time_tag.get("datetime"):
                try:
                    date_culpabilite = date.fromisoformat(time_tag["datetime"][:10])
                except ValueError:
                    pass

            # Amende
            amende = None
            amende_div = row.find("div", class_="employeur-contrevenant__field-amende")
            if amende_div:
                amende_text = amende_div.get_text(" ", strip=True)
                m = re.search(r"([\d\s,]+)\s*\$", amende_text.replace("\xa0", " "))
                if m:
                    try:
                        amende = Decimal(m.group(1).replace(" ", "").replace(",", ""))
                    except Exception:
                        pass

            entries.append({
                "nom": nom,
                "nom_normalized": normalize_name(nom),
                "infraction": infraction,
                "date_culpabilite": date_culpabilite,
                "amende": amende,
            })

        except Exception:
            continue

    return entries


async def _match_and_store(entries: List[dict], db: AsyncSession) -> int:
    """Matche les contrevenants CNESST avec les entrepreneurs en base et crée les RBQEvent."""
    matched = 0

    # Précharger les contractors en mémoire
    idx = await ContractorIndex.load(db)

    # Précharger les events CNESST existants pour déduplication
    existing_result = await db.execute(
        select(RBQEvent.contractor_id, RBQEvent.source, RBQEvent.event_date)
        .where(RBQEvent.source == "cnesst")
    )
    existing_cnesst = set()
    for row in existing_result:
        existing_cnesst.add((row[0], row[2]))  # (contractor_id, event_date)

    for entry in entries:
        nom_norm = entry.get("nom_normalized")
        if not nom_norm:
            continue

        contractor = idx.by_nom.get(nom_norm)
        if not contractor:
            continue

        # Déduplication en mémoire O(1)
        dedup_key = (contractor.id, entry["date_culpabilite"])
        if dedup_key in existing_cnesst:
            continue

        db.add(RBQEvent(
            contractor_id=contractor.id,
            event_type="cnesst_infraction",
            source="cnesst",
            event_date=entry["date_culpabilite"],
            montant=entry["amende"],
            description=entry.get("infraction"),
        ))
        existing_cnesst.add(dedup_key)
        matched += 1
        print(f"  → {contractor.nom_legal} ({entry['date_culpabilite']}, {entry['amende']} $)")

    await db.commit()
    return matched
