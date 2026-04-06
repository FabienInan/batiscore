from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

import stripe

from config import settings
from database import get_db
from models import Report


router = APIRouter()


@router.post("/webhook/stripe")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Webhook pour les événements Stripe."""
    payload = await request.body()
    sig = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig,
            settings.stripe_webhook_secret,
            api_key=settings.stripe_secret_key
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event.type == "payment_intent.succeeded":
        intent = event.data.object
        report_id = intent.metadata.get("report_id")

        if report_id:
            report = await db.get(Report, report_id)
            if report:
                report.statut_paiement = "paid"
                await db.commit()

                # TODO: Déclencher la génération du rapport PDF
                # await generate_report_pdf(report_id, db)

    return {"status": "ok"}