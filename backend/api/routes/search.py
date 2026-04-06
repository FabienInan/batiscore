import re
from typing import Optional

from fastapi import APIRouter, Query, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Contractor
from ingestion.transforms.normalize import normalize_name
from scoring.engine import score_label


router = APIRouter()


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

    # Détection du type de requête
    if re.match(r"^\d{4}-\d{4}-\d{2}$", q):
        # Format licence RBQ
        result = await db.execute(
            select(Contractor).where(Contractor.licence_rbq == q)
        )
        contractors = result.scalars().all()
    elif re.match(r"^\d{10}$", q):
        # Format NEQ
        result = await db.execute(
            select(Contractor).where(Contractor.neq == q)
        )
        contractors = result.scalars().all()
    elif re.match(r"^\d{3}[-.]?\d{3}[-.]?\d{4}$", q):
        # Téléphone
        phone_clean = re.sub(r"\D", "", q)
        result = await db.execute(
            select(Contractor).where(func.replace(Contractor.telephone, "-", "") == phone_clean)
        )
        contractors = result.scalars().all()
    else:
        # Recherche par nom (fuzzy)
        result = await db.execute(
            select(Contractor)
            .where(func.similarity(Contractor.nom_normalized, q_normalized) > 0.3)
            .order_by(func.similarity(Contractor.nom_normalized, q_normalized).desc())
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
    return {
        "id": c.id,
        "nom": c.nom_legal,
        "ville": c.ville,
        "licence_rbq": c.licence_rbq,
        "neq": c.neq,
        "statut_rbq": c.statut_rbq,
        "categories": c.categories_rbq[:3] if c.categories_rbq else [],
        "score": c.score,
        "score_label": score_label(c.score)["label"] if c.score else None,
    }