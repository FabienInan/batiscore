from typing import Literal
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import stripe

from config import settings
from database import get_db
from models import Contractor, Report, RBQEvent, Litige, SEAOContract


router = APIRouter()


@router.post("/report/checkout")
async def create_checkout(
    contractor_id: int,
    tier: Literal["complet", "premium"],
    email: str,
    db: AsyncSession = Depends(get_db)
):
    """Initier le paiement Stripe pour un rapport."""
    prix = settings.prix_complet if tier == "complet" else settings.prix_premium

    # Vérifier que l'entrepreneur existe
    result = await db.execute(
        select(Contractor).where(Contractor.id == contractor_id)
    )
    contractor = result.scalar_one_or_none()
    if not contractor:
        raise HTTPException(status_code=404, detail="Entrepreneur non trouvé")

    # Créer l'entrée rapport
    report = Report(
        contractor_id=contractor_id,
        tier=tier,
        prix=prix / 100,  # Convertir en dollars
        email_acheteur=email,
        statut_paiement="pending"
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    # Créer Stripe PaymentIntent
    intent = stripe.PaymentIntent.create(
        api_key=settings.stripe_secret_key,
        amount=prix,
        currency="cad",
        metadata={"report_id": str(report.id)},
        receipt_email=email,
    )

    report.stripe_payment_intent = intent.id
    await db.commit()

    return {
        "client_secret": intent.client_secret,
        "report_id": str(report.id)
    }


@router.get("/report/{report_id}")
async def get_report(
    report_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Accéder au rapport après paiement."""
    report = await db.get(Report, report_id)

    if not report:
        raise HTTPException(status_code=404, detail="Rapport non trouvé")
    if report.statut_paiement != "paid":
        raise HTTPException(status_code=403, detail="Rapport non payé")
    if report.expires_at and report.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Rapport expiré")

    # Récupérer les données complètes
    contractor = await db.get(Contractor, report.contractor_id)

    events_result = await db.execute(
        select(RBQEvent).where(RBQEvent.contractor_id == report.contractor_id)
    )
    events = events_result.scalars().all()

    litiges_result = await db.execute(
        select(Litige).where(Litige.contractor_id == report.contractor_id)
    )
    litiges = litiges_result.scalars().all()

    contrats_result = await db.execute(
        select(SEAOContract).where(SEAOContract.contractor_id == report.contractor_id)
    )
    contrats = contrats_result.scalars().all()

    return {
        "report_id": str(report.id),
        "tier": report.tier,
        "contractor": {
            "nom_legal": contractor.nom_legal,
            "neq": contractor.neq,
            "licence_rbq": contractor.licence_rbq,
            "adresse": contractor.adresse,
            "ville": contractor.ville,
            "telephone": contractor.telephone,
            "statut_rbq": contractor.statut_rbq,
            "statut_req": contractor.statut_req,
            "categories_rbq": contractor.categories_rbq,
            "date_fondation": str(contractor.date_fondation) if contractor.date_fondation else None,
            "score": contractor.score,
            "score_label": get_score_label(contractor.score),
        },
        "events": [
            {
                "type": e.event_type,
                "date": str(e.event_date) if e.event_date else None,
                "montant": float(e.montant) if e.montant else None,
                "description": e.description,
            }
            for e in events
        ],
        "litiges": [
            {
                "tribunal": l.tribunal,
                "date": str(l.date_decision) if l.date_decision else None,
                "type": l.type_litige,
                "issue": l.issue,
                "montant": float(l.montant) if l.montant else None,
                "url": l.url_decision,
            }
            for l in litiges
        ],
        "contrats_publics": [
            {
                "titre": c.titre,
                "organisme": c.organisme,
                "montant": float(c.montant) if c.montant else None,
                "date": str(c.date_attribution) if c.date_attribution else None,
            }
            for c in contrats
        ],
    }


def get_score_label(score: int) -> str:
    if score is None:
        return "Non évalué"
    if score >= 80:
        return "Fiable"
    elif score >= 60:
        return "Acceptable"
    elif score >= 40:
        return "À surveiller"
    else:
        return "À risque élevé"