"""
Intégration CanLII pour les décisions du Bureau des régisseurs RBQ.

Source : https://api.canlii.org/v1/
API : Clé gratuite — métadonnées uniquement (pas de recherche plein-texte).

Stratégie : parcourir la base qcrbq (Bureau des régisseurs) et matcher les titres
de décisions avec les noms d'entrepreneurs en base.

Les décisions sont stockées dans la table `litiges` (décisions juridiques),
distincte de `rbq_events` (incidents opérationnels).

Rate limits : 5 000 requêtes/jour · 2 req/s · 1 requête à la fois.
"""
import asyncio
import re
from datetime import datetime
from typing import Optional

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from ingestion.transforms.normalize import normalize_name, ContractorIndex
from models import Litige, RBQEvent

CANLII_BASE = "https://api.canlii.org/v1"
QCRBQ_DB = "qcrbq"
TRIBUNAL = "Bureau des régisseurs de la RBQ"
RATE_DELAY = 0.6  # secondes entre requêtes (limit: 2 req/s, ~400 calls max/ingest)


class RateLimitExceeded(Exception):
    pass


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_company_from_title(title: str) -> Optional[str]:
    """
    Extrait le nom de l'entrepreneur d'un titre CanLII.

    Formats :
    - "Régie du bâtiment du Québec c. Construction ABC inc."  → "Construction ABC inc."
    - "9489-7485 Québec inc. c. Régie du bâtiment du Québec" → "9489-7485 Québec inc."
    - "Construction Frank Catania & Associés Inc. (Re)"       → "Construction Frank Catania & Associés Inc."
    - "Airobec (Re)"                                          → "Airobec"
    """
    cleaned = re.sub(r"\s*\(Re\)\s*$", "", title, flags=re.IGNORECASE).strip()

    if " c. " not in cleaned:
        return cleaned if cleaned else None

    parts = cleaned.split(" c. ", 1)
    first, second = parts[0].strip(), parts[1].strip()

    rbq_keywords = ("régie", "rbq", "procureur général", "ministre")
    if any(kw in first.lower() for kw in rbq_keywords):
        return second
    if any(kw in second.lower() for kw in rbq_keywords):
        return first
    return first


def _keywords_summary(keywords: str, max_items: int = 4) -> str:
    """Extrait les premiers termes courts des keywords CanLII."""
    if not keywords:
        return ""
    parts = [p.strip() for p in re.split(r"\s*[—|]\s*", keywords) if p.strip()]
    short = [p for p in parts if len(p) < 60]
    return " · ".join(short[:max_items])


def _detect_type(keywords: str, title: str) -> str:
    """Détecte le type de décision depuis les keywords CanLII."""
    combined = (keywords + " " + title).lower()
    if any(w in combined for w in ("annulation", "annulée", "annulé", "révocation")):
        return "decision_annulation"
    if any(w in combined for w in ("suspension", "suspendue", "suspendu")):
        return "decision_suspension"
    if any(w in combined for w in ("condition", "restriction", "assortit")):
        return "decision_condition"
    return "decision_regisseurs"


# ---------------------------------------------------------------------------
# API calls
# ---------------------------------------------------------------------------

async def _browse_page(client: httpx.AsyncClient, offset: int, result_count: int = 1000) -> list[dict]:
    resp = await client.get(
        f"{CANLII_BASE}/caseBrowse/fr/{QCRBQ_DB}/",
        params={"api_key": settings.canlii_api_key, "offset": offset, "resultCount": result_count},
    )
    if resp.status_code == 429:
        raise RateLimitExceeded(f"Rate limit (429) à offset={offset}")
    if resp.status_code != 200:
        print(f"CanLII: HTTP {resp.status_code} (offset={offset})")
        return []
    return resp.json().get("cases", [])


async def _get_metadata(client: httpx.AsyncClient, case_id: str) -> Optional[dict]:
    resp = await client.get(
        f"{CANLII_BASE}/caseBrowse/fr/{QCRBQ_DB}/{case_id}/",
        params={"api_key": settings.canlii_api_key},
    )
    if resp.status_code == 429:
        raise RateLimitExceeded(f"Rate limit (429) sur metadata {case_id}")
    if resp.status_code != 200:
        return None
    return resp.json()


# ---------------------------------------------------------------------------
# Ingestion
# ---------------------------------------------------------------------------

async def ingest_canlii_rbq(db: AsyncSession, max_cases: int = 5000) -> int:
    """
    Ingère les décisions du Bureau des régisseurs (qcrbq) dans la table litiges.
    Complémente rbq_decisions.py (60 derniers jours) avec l'historique complet.
    """
    if not settings.canlii_api_key:
        print("CanLII: Clé API non configurée")
        return 0

    # Migrer les anciennes entrées CanLII dans rbq_events → les supprimer
    old_result = await db.execute(
        select(RBQEvent).where(RBQEvent.source == "canlii")
    )
    old_events = old_result.scalars().all()
    if old_events:
        print(f"CanLII: Migration — suppression de {len(old_events)} anciennes entrées dans rbq_events")
        for ev in old_events:
            await db.delete(ev)
        await db.commit()

    idx = await ContractorIndex.load(db)

    # Précharger les case_id déjà dans litiges pour déduplication
    existing_result = await db.execute(
        select(Litige.url_decision).where(Litige.source == "canlii")
    )
    # On stocke le case_id dans l'url (https://canlii.ca/t/XXXX), on utilise url comme clé
    existing_urls = {row[0] for row in existing_result if row[0]}
    print(f"CanLII: {len(existing_urls):,} décisions déjà en base")

    ingested = 0
    skipped = 0
    offset = 0
    batch_size = 1000
    stop = False

    async with httpx.AsyncClient(timeout=30) as client:
        while offset < max_cases and not stop:
            print(f"CanLII: parcours offset={offset}...")
            try:
                cases = await _browse_page(client, offset, batch_size)
            except RateLimitExceeded as e:
                print(f"⚠  CanLII: {e} — relancez plus tard")
                break

            await asyncio.sleep(RATE_DELAY)

            if not cases:
                print("CanLII: fin de la base")
                break

            # Passe 1 : identifier les matchs sans appel API
            to_fetch = []
            for case in cases:
                title = case.get("title", "")
                case_id_obj = case.get("caseId", {})
                case_id = case_id_obj.get("fr") if isinstance(case_id_obj, dict) else str(case_id_obj)
                if not case_id:
                    continue
                company_name = _extract_company_from_title(title)
                if not company_name:
                    continue
                contractor = idx.by_nom.get(normalize_name(company_name))
                if contractor:
                    to_fetch.append((case_id, title, contractor))

            print(f"CanLII: {len(to_fetch)} matchs sur {len(cases)} — fetch métadonnées...")

            # Passe 2 : fetch métadonnées uniquement pour les matchs
            for i, (case_id, title, contractor) in enumerate(to_fetch):
                await asyncio.sleep(RATE_DELAY)
                try:
                    metadata = await _get_metadata(client, case_id)
                except RateLimitExceeded as e:
                    print(f"⚠  CanLII: {e} — relancez plus tard")
                    stop = True
                    break

                if not metadata:
                    continue

                canlii_url = metadata.get("url", "")
                if canlii_url and canlii_url in existing_urls:
                    skipped += 1
                    continue

                decision_date = None
                raw_date = metadata.get("decisionDate")
                if raw_date:
                    try:
                        decision_date = datetime.strptime(raw_date, "%Y-%m-%d").date()
                    except (ValueError, TypeError):
                        pass

                kw = metadata.get("keywords", "")
                citation = metadata.get("citation", "")
                type_litige = _detect_type(kw, metadata.get("title", title))
                description = " · ".join(p for p in [citation, _keywords_summary(kw)] if p)

                db.add(Litige(
                    contractor_id=contractor.id,
                    source="canlii",
                    tribunal=TRIBUNAL,
                    date_decision=decision_date,
                    type_litige=type_litige,
                    issue="condamné",
                    url_decision=canlii_url,
                    description=description,
                ))
                if canlii_url:
                    existing_urls.add(canlii_url)
                ingested += 1
                print(f"  [{i+1}/{len(to_fetch)}] {contractor.nom_legal}: {type_litige} ({raw_date or '?'})")

            await db.commit()

            if len(cases) < batch_size:
                break

            offset += batch_size

    await db.commit()
    print(f"CanLII RBQ: {ingested} nouvelles décisions, {skipped} déjà en base")
    return ingested


# ---------------------------------------------------------------------------
# On-demand (rapport)
# ---------------------------------------------------------------------------

async def get_litiges_for_contractor(contractor_id: int, db: AsyncSession) -> list:
    """Retourne les litiges CanLII depuis la table litiges."""
    result = await db.execute(
        select(Litige).where(Litige.contractor_id == contractor_id)
    )
    return result.scalars().all()
