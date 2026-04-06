"""
Intégration API CanLII pour les jugements publiés.

Source: https://api.canlii.org/v1/
Documentation: https://www.canlii.org/en/info/help.html#api

Note: Clé API gratuite requise.
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


CANLII_API_BASE = "https://api.canlii.org/v1"


async def search_canlii(company_name: str, db: Optional[AsyncSession] = None) -> List[dict]:
    """
    Recherche les jugements CanLII pour une entreprise.

    Args:
        company_name: Nom de l'entreprise à rechercher
        db: Session DB optionnelle pour sauvegarder les résultats

    Returns:
        Liste des jugements trouvés
    """
    if not settings.canlii_api_key:
        print("CanLII: Clé API non configurée")
        return []

    encoded_name = quote(company_name)

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            # Recherche dans les décisions québécoises
            url = f"{CANLII_API_BASE}/caseBrowse/fr/qc/"
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

    Structure attendue:
    {
        "caseId": "2019qccs1234",
        "citation": "2019 QCCS 1234",
        "title": "Tremblay c. Construction ABC inc.",
        "date": "2019-05-15",
        "court": "Cour supérieure",
        "url": "https://www.canlii.org/fr/qc/qccs/doc/2019/..."
    }
    """
    return {
        "canlii_id": case.get("caseId", ""),
        "citation": case.get("citation", ""),
        "title": case.get("title", ""),
        "date": case.get("date"),
        "court": case.get("court", ""),
        "url": case.get("url", f"https://www.canlii.org/fr/qc/{case.get('caseId', '')}"),
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

    # Si déjà des données récentes, les retourner
    if existing:
        return existing

    # Rechercher sur CanLII
    # Essayer avec le nom légal et les variantes
    search_terms = [contractor.nom_legal]
    if contractor.neq:
        search_terms.append(contractor.neq)

    all_cases = []
    for term in search_terms:
        cases = await search_canlii(term, db)
        all_cases.extend(cases)
        await asyncio.sleep(0.5)  # Rate limiting

    # Dédoublonner
    seen_ids = set()
    for case in all_cases:
        canlii_id = case.get("canlii_id", "")
        if canlii_id in seen_ids:
            continue
        seen_ids.add(canlii_id)

        # Déterminer l'issue (condamné, acquitté, réglé, en_cours)
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
    """Détermine le type de litige basé sur le titre."""
    title_lower = title.lower()

    if "petites créances" in title_lower:
        return "petites_créances"
    elif "construction" in title_lower or "rbq" in title_lower:
        return "construction"
    elif "salaire" in title_lower or "paie" in title_lower:
        return "travail"
    elif "bail" in title_lower or "locatif" in title_lower:
        return "bail"
    else:
        return "civil"


def determine_issue(title: str, citation: str) -> str:
    """
    Détermine l'issue du litige.

    Note: C'est une approximation basée sur le titre.
    Une analyse plus précise nécessiterait de lire le contenu du jugement.
    """
    title_lower = title.lower()

    # Mots-clés suggérant une condamnation
    condamnation_keywords = ["condamné", "payer", "dommages", "accord partiel", "rejet"]
    if any(kw in title_lower for kw in condamnation_keywords):
        return "condamné"

    # Mots-clés suggérant un acquittement
    acquittement_keywords = ["acquitté", "rejeté", "mal fondé", "sans cause"]
    if any(kw in title_lower for kw in acquittement_keywords):
        return "acquitté"

    # Mots-clés suggérant un règlement
    reglement_keywords = ["règlement", "transaction", "entente"]
    if any(kw in title_lower for kw in reglement_keywords):
        return "réglé"

    return "en_cours"