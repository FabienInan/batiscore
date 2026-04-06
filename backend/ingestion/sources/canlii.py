"""
Intégration API CanLII pour les jugements publiés.

Source: https://www.canlii.org/fr/qc/
API: https://api.canlii.org/v1/ (clé gratuite sur demande)

Note: Ces URLs sont fonctionnelles (hébergées par CanLII).
"""
import asyncio
from datetime import datetime
from typing import List, Optional
from urllib.parse import quote

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from models import Contractor, Litige


async def search_canlii(company_name: str) -> List[dict]:
    """
    Recherche les jugements CanLII pour une entreprise.

    Args:
        company_name: Nom de l'entreprise à rechercher

    Returns:
        Liste des jugements trouvés
    """
    if not settings.canlii_api_key:
        print("CanLII: Clé API non configurée")
        return []

    encoded_name = quote(company_name)

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            url = f"{settings.canlii_base_url}/caseBrowse/fr/qc/"
            params = {
                "keyword": company_name,
                "api_key": settings.canlii_api_key,
            }

            resp = await client.get(url, params=params)

            if resp.status_code != 200:
                print(f"CanLII: Erreur HTTP {resp.status_code}")
                return []

            data = resp.json()
            cases = data.get("cases", [])

            results = []
            for case in cases[:20]:  # Limiter à 20 résultats
                result = parse_canlii_case(case)
                results.append(result)

            return results

    except Exception as e:
        print(f"CanLII: Erreur recherche {company_name}: {e}")
        return []


def parse_canlii_case(case: dict) -> dict:
    """
    Parse un résultat CanLII.
    """
    return {
        "canlii_id": case.get("caseId", ""),
        "citation": case.get("citation", ""),
        "title": case.get("title", ""),
        "date": case.get("date"),
        "court": case.get("court", ""),
        "url": case.get("url", f"{settings.canlii_site_url}{case.get('caseId', '')}"),
    }


async def get_litiges_for_contractor(contractor_id: int, db: AsyncSession) -> List[Litige]:
    """
    Récupère les litiges CanLII pour un entrepreneur.
    """
    result = await db.execute(
        select(Contractor).where(Contractor.id == contractor_id)
    )
    contractor = result.scalar_one_or_none()

    if not contractor:
        return []

    # Vérifier si on a déjà des litiges en base
    litiges_result = await db.execute(
        select(Litige).where(Litige.contractor_id == contractor_id)
    )
    existing = litiges_result.scalars().all()

    # Si déjà des données, les retourner
    if existing:
        return existing

    # Rechercher sur CanLII
    search_terms = [contractor.nom_legal] if contractor.nom_legal else []
    if contractor.neq:
        search_terms.append(contractor.neq)

    all_cases = []
    for term in search_terms:
        cases = await search_canlii(term)
        all_cases.extend(cases)
        await asyncio.sleep(0.5)  # Rate limiting

    # Dédoublonner
    seen_ids = set()
    for case in all_cases:
        canlii_id = case.get("canlii_id", "")
        if canlii_id in seen_ids:
            continue
        seen_ids.add(canlii_id)

        # Déterminer l'issue
        issue = determine_issue(case.get("title", ""), case.get("citation", ""))

        # Créer l'entrée Litige
        litige = Litige(
            contractor_id=contractor_id,
            source="canlii",
            tribunal=case.get("court", ""),
            date_decision=parse_date(case.get("date")),
            type_litige=determine_litige_type(case.get("title", "")),
            issue=issue,
            url_decision=case.get("url"),
        )
        db.add(litige)

    await db.commit()

    # Retourner les litiges
    litiges_result = await db.execute(
        select(Litige).where(Litige.contractor_id == contractor_id)
    )
    return litiges_result.scalars().all()


def parse_date(date_str: Optional[str]) -> Optional[datetime]:
    """Parse une date CanLII."""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except:
        return None


def determine_litige_type(title: str) -> str:
    """Détermine le type de litige."""
    title_lower = title.lower()

    if "petites créances" in title_lower:
        return "petites_créances"
    elif "construction" in title_lower or "rbq" in title_lower:
        return "construction"
    elif "salaire" in title_lower or "paie" in title_lower:
        return "travail"
    elif "bail" in title_lower:
        return "bail"
    else:
        return "civil"


def determine_issue(title: str, citation: str) -> str:
    """Détermine l'issue du litige."""
    title_lower = title.lower()

    if any(kw in title_lower for kw in ["condamné", "payer", "dommages"]):
        return "condamné"
    if any(kw in title_lower for kw in ["acquitté", "rejeté", "mal fondé"]):
        return "acquitté"
    if any(kw in title_lower for kw in ["règlement", "transaction", "entente"]):
        return "réglé"

    return "en_cours"