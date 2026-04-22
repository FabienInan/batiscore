import re
from datetime import date
from typing import Optional

from fastapi import APIRouter, Query, Depends
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Contractor
from ingestion.transforms.normalize import normalize_name
from scoring.engine import score_label


router = APIRouter()


def _extract_digits(q: str) -> str:
    """Extrait uniquement les chiffres d'une chaîne."""
    return re.sub(r"\D", "", q)


@router.get("/search")
async def search_contractors(
    q: str = Query(..., min_length=2),
    ville: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Recherche par: nom, numéro RBQ, téléphone, NEQ.
    Retourne max 10 résultats.
    """
    q_normalized = normalize_name(q)
    query_digits = _extract_digits(q)

    # Détection du type de requête
    if re.match(r"^\d{4}-\d{4}-\d{2}$", q):
        # Format licence RBQ exact
        result = await db.execute(
            select(Contractor).where(Contractor.licence_rbq == q)
        )
        contractors = result.scalars().all()
    elif re.match(r"^[\d\s\-\.\(\)\+]+$", q) and len(query_digits) >= 7:
        # Requête composée uniquement de chiffres + séparateurs téléphoniques
        # → recherche par téléphone (et potentiellement NEQ si exactement 10 chiffres)
        phone_digits = query_digits[-10:] if len(query_digits) >= 10 else query_digits

        conditions = [Contractor.telephone == phone_digits]
        if len(query_digits) == 10:
            conditions.append(Contractor.neq == query_digits)

        result = await db.execute(
            select(Contractor).where(or_(*conditions))
        )
        contractors = result.scalars().all()
    else:
        # Recherche par nom (fuzzy) — nom_legal ET noms commerciaux
        nom_sim = func.similarity(Contractor.nom_normalized, q_normalized)
        # Chercher aussi dans les noms commerciaux (noms_secondaires)
        nom_sec_sim = func.similarity(
            func.array_to_string(Contractor.noms_secondaires, ' '), q_normalized
        )

        result = await db.execute(
            select(Contractor)
            .where(
                (nom_sim > 0.3) | ((Contractor.noms_secondaires.isnot(None)) & (nom_sec_sim > 0.3))
            )
            .order_by(func.greatest(nom_sim, nom_sec_sim).desc())
            .limit(10)
        )
        contractors = result.scalars().all()

    # Filtrer par ville si précisé
    if ville:
        contractors = [c for c in contractors if ville.lower() in (c.ville or "").lower()]

    return {
        "count": len(contractors),
        "results": [contractor_preview(c) for c in contractors]
    }


@router.get("/contractor/{contractor_id}")
async def get_contractor(
    contractor_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Profil public d'un entrepreneur."""
    result = await db.execute(
        select(Contractor).where(Contractor.id == contractor_id)
    )
    contractor = result.scalar_one_or_none()

    if not contractor:
        return {"found": False}

    return contractor_preview(contractor)


def contractor_preview(c: Contractor) -> dict:
    rbq_valide = c.statut_rbq == 'valide' and (c.date_expiration_rbq is None or c.date_expiration_rbq >= date.today())
    return {
        "id": c.id,
        "nom": c.nom_legal,
        "ville": c.ville,
        "licence_rbq": c.licence_rbq,
        "neq": c.neq,
        "statut_rbq": c.statut_rbq,
        "statut_req": c.statut_req,
        "rbq_valide": rbq_valide,
        "categories": c.categories_rbq[:3] if c.categories_rbq else [],
        "score": c.score,
        "score_label": score_label(c.score)["label"] if c.score else None,
    }