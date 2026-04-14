"""
Ingestion des décisions du Bureau des régisseurs de la RBQ.

Source: https://www.rbq.gouv.qc.ca/audience-et-decisions/decisions-des-regisseurs/consultation-des-decisions/
Méthode: Scraping HTML — 60 derniers jours seulement.
Cadence recommandée: quotidienne (cron) pour ne pas manquer de décisions.

Decisions plus anciennes : disponibles sur jugements.qc.ca (SOQUIJ) et CanLII (tribunal qcrdl).
"""
import io
import re
from datetime import date
from pathlib import PurePosixPath
from typing import Optional
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Contractor, RBQEvent
from ingestion.transforms.normalize import normalize_name, ContractorIndex

try:
    from pypdf import PdfReader
    _PDF_SUPPORTED = True
except ImportError:
    _PDF_SUPPORTED = False


RBQ_DECISIONS_URL = (
    "https://www.rbq.gouv.qc.ca/audience-et-decisions/"
    "decisions-des-regisseurs/consultation-des-decisions/"
)
RBQ_BASE_URL = "https://www.rbq.gouv.qc.ca"

MOIS_FR = {
    "janvier": 1, "février": 2, "mars": 3, "avril": 4,
    "mai": 5, "juin": 6, "juillet": 7, "août": 8,
    "septembre": 9, "octobre": 10, "novembre": 11, "décembre": 12,
}


def _parse_french_date(text: str) -> Optional[date]:
    """'Décision du 30 mars 2026 concernant...' → date(2026, 3, 30)"""
    m = re.search(r"(\d{1,2})\s+(\w+)\s+(\d{4})", text)
    if not m:
        return None
    day, month_str, year = m.groups()
    month = MOIS_FR.get(month_str.lower())
    if not month:
        return None
    try:
        return date(int(year), month, int(day))
    except ValueError:
        return None


def _extract_licence_from_filename(pdf_url: str) -> Optional[str]:
    """
    decision_5707-5384_Toiture.pdf  → '5707-5384'  (partiel, correspond à 5707-5384-XX en DB)
    decision-mirabel-urbain.pdf     → None          (pas de licence dans le nom)
    """
    stem = PurePosixPath(pdf_url).stem
    m = re.match(r"decision_(\d{4}-\d{4})_", stem)
    return m.group(1) if m else None


async def scrape_rbq_decisions_list() -> list[dict]:
    """
    Retourne la liste des décisions des 60 derniers jours.
    Chaque entrée: {date, nom, pdf_url, licence_partial}
    """
    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
        resp = await client.get(
            RBQ_DECISIONS_URL,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                "Accept-Language": "fr-CA",
            },
        )

    if resp.status_code != 200:
        raise Exception(f"HTTP {resp.status_code}")

    soup = BeautifulSoup(resp.text, "html.parser")
    decisions = []

    for li in soup.find_all("li"):
        link = li.find("a", class_="lien_fichier")
        if not link:
            continue

        pdf_url = urljoin(RBQ_BASE_URL, link.get("href", ""))

        # Nom: texte du lien sans "– PDF (xxx Ko)"
        nom = re.sub(
            r"\s*[–\-]\s*PDF\s*\(\d+\s*Ko\)\s*$", "", link.get_text(strip=True), flags=re.IGNORECASE
        ).strip()

        event_date = _parse_french_date(li.get_text())
        licence_partial = _extract_licence_from_filename(pdf_url)

        decisions.append(
            {"date": event_date, "nom": nom, "pdf_url": pdf_url, "licence_partial": licence_partial}
        )

    return decisions


def _detect_severity(pdf_text: str) -> str:
    """
    Détecte la sévérité de la décision en cherchant les verbes opératifs en MAJUSCULES.
    Dans les PDFs RBQ, le dispositif utilise les majuscules (SUSPEND, ANNULE)
    tandis que le contexte utilise les minuscules (suspendre, annuler).
    """
    # Annulation/révocation : verbes majuscules dans le dispositif
    if re.search(r"\b(ANNULE|ANNULÉE|RÉVOQUE|RÉVOQUÉE)\b", pdf_text):
        return "decision_annulation"
    # Suspension
    if re.search(r"\bSUSPEND\b", pdf_text):
        return "decision_suspension"
    # Condition / restriction
    if re.search(r"\b(ASSORTIT|RESTREINT)\b", pdf_text):
        return "decision_condition"
    return "decision_regisseurs"


async def _fetch_pdf_text(pdf_url: str, client: httpx.AsyncClient) -> str:
    """Télécharge un PDF et retourne son texte extrait (vide si échec)."""
    if not _PDF_SUPPORTED:
        return ""
    try:
        resp = await client.get(pdf_url, timeout=30)
        if resp.status_code != 200:
            return ""
        reader = PdfReader(io.BytesIO(resp.content))
        return " ".join(page.extract_text() or "" for page in reader.pages)
    except Exception:
        return ""


async def _find_contractor(decision: dict, db: AsyncSession) -> Optional[Contractor]:
    """Matche une décision à un entrepreneur en DB (licence d'abord, puis nom normalisé)."""
    # 1. Par préfixe de licence (5707-5384 → match 5707-5384-01)
    if decision["licence_partial"]:
        result = await db.execute(
            select(Contractor).where(
                Contractor.licence_rbq.like(f"{decision['licence_partial']}%")
            )
        )
        contractor = result.scalar_one_or_none()
        if contractor:
            return contractor

    # 2. Par nom normalisé (enlève "et Entreprise B" si décision multiple)
    nom_principal = decision["nom"].split(" et ")[0].strip()
    nom_norm = normalize_name(nom_principal)
    if nom_norm:
        result = await db.execute(
            select(Contractor).where(Contractor.nom_normalized == nom_norm)
        )
        contractor = result.scalar_one_or_none()
        if contractor:
            return contractor

    return None


async def ingest_rbq_decisions(db: AsyncSession) -> int:
    """
    Ingère les décisions du Bureau des régisseurs (60 derniers jours).
    Crée des RBQEvent de type 'decision_regisseurs' pour les entrepreneurs matchés.
    """
    print("RBQ Décisions: Scraping...")
    decisions = await scrape_rbq_decisions_list()
    print(f"RBQ Décisions: {len(decisions)} décisions sur la page")

    # Précharger les contractors en mémoire
    idx = await ContractorIndex.load(db)

    # Précharger les events rbq_decisions existants pour déduplication
    existing_result = await db.execute(
        select(RBQEvent.contractor_id, RBQEvent.source, RBQEvent.event_date)
        .where(RBQEvent.source == "rbq_decisions")
    )
    existing_decisions = set()
    for row in existing_result:
        existing_decisions.add((row[0], row[2]))  # (contractor_id, event_date)

    matched = 0
    skipped = 0

    async with httpx.AsyncClient(follow_redirects=True) as client:
        for decision in decisions:
            try:
                contractor = await _find_contractor_with_index(decision, db, idx)
                if not contractor:
                    skipped += 1
                    continue

                # Déduplication en mémoire O(1)
                dedup_key = (contractor.id, decision["date"])
                if dedup_key in existing_decisions:
                    continue

                # Parser le PDF pour détecter la sévérité
                pdf_text = await _fetch_pdf_text(decision["pdf_url"], client)
                event_type = _detect_severity(pdf_text) if pdf_text else "decision_regisseurs"

                db.add(
                    RBQEvent(
                        contractor_id=contractor.id,
                        event_type=event_type,
                        source="rbq_decisions",
                        event_date=decision["date"],
                        description=f"{decision['nom']} | PDF: {decision['pdf_url']}",
                    )
                )
                existing_decisions.add(dedup_key)
                matched += 1
                print(f"  → {contractor.nom_legal} : {event_type}")

            except Exception as e:
                print(f"RBQ Décisions: Erreur ({decision.get('nom', '?')}): {e}")
                continue

    await db.commit()
    print(f"RBQ Décisions: {matched} liées, {skipped} non matchées (hors base ou nom introuvable)")
    return matched


async def _find_contractor_with_index(
    decision: dict, db: AsyncSession, idx: ContractorIndex
) -> Optional[Contractor]:
    """Matche une décision à un entrepreneur via l'index en mémoire."""
    # 1. Par préfixe de licence
    if decision["licence_partial"]:
        for licence, contractor in idx.by_licence.items():
            if licence.startswith(decision["licence_partial"]):
                return contractor

    # 2. Par nom normalisé
    nom_principal = decision["nom"].split(" et ")[0].strip()
    nom_norm = normalize_name(nom_principal)
    if nom_norm:
        return idx.by_nom.get(nom_norm)

    return None
