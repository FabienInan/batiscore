from datetime import date
from typing import List

from sqlalchemy.orm import Session

from models import Contractor, RBQEvent, OPCPlainte, Litige


def calculate_score(contractor: Contractor, events: List[RBQEvent], plaintes: OPCPlainte | None, litiges: List[Litige], nb_contrats: int) -> int:
    """
    Calcule le score de fiabilité d'un entrepreneur (0-100).

    Score de départ: 100
    Déductions:
      - Licence suspendue/révoquée: -50
      - Entreprise radiée/faillite: -40
      - Réclamation RBQ: -15 chacune (max -45)
      - Mise en garde OPC: -20
      - Plainte OPC: -5 chacune (max -20)
      - Litige condamné: -10 chacun (max -30)
      - Entreprise < 1 an: -10

    Bonus:
      - Contrats publics SEAO: +5
      - Entreprise > 10 ans: +5
      - Historique propre: +5
    """
    score = 100

    # === BLOQUANTS ===

    # Licence RBQ suspendue/révoquée
    if contractor.statut_rbq in ("suspendu", "annulé", "révoqué"):
        score -= 50

    # Entreprise radiée ou en liquidation
    if contractor.statut_req in ("radié", "en_liquidation"):
        score -= 40

    # === RÉCLAMATIONS RBQ ===

    nb_reclamations = sum(1 for e in events if e.event_type == "réclamation")
    score -= min(nb_reclamations * 15, 45)

    # === OPC ===

    if plaintes:
        if plaintes.mises_en_garde and len(plaintes.mises_en_garde) > 0:
            score -= 20
        score -= min(plaintes.nb_plaintes * 5, 20)

    # === LITIGES ===

    condamnations = [l for l in litiges if l.issue == "condamné"]
    score -= min(len(condamnations) * 10, 30)

    # === ANCIENNETETÉ ===

    if contractor.date_fondation:
        age_jours = (date.today() - contractor.date_fondation).days
        age_ans = age_jours / 365

        if age_ans < 1:
            score -= 10
        elif age_ans > 10:
            score += 5

    # === BONUS CONTRATS PUBLICS ===

    if nb_contrats > 0:
        score += 5

    # === BONUS HISTORIQUE PROPRE ===

    if nb_reclamations == 0 and (not plaintes or plaintes.nb_plaintes == 0) and len(condamnations) == 0:
        score += 5

    return max(0, min(100, score))


def score_label(score: int) -> dict:
    """Retourne le label et la couleur associés à un score."""
    if score is None:
        return {"label": "Non évalué", "color": "gray"}

    if score >= 80:
        return {"label": "Fiable", "color": "green"}
    elif score >= 60:
        return {"label": "Acceptable", "color": "amber"}
    elif score >= 40:
        return {"label": "À surveiller", "color": "orange"}
    else:
        return {"label": "À risque élevé", "color": "red"}


async def recalculate_all_scores(db: Session):
    """Recalcule les scores de tous les entrepreneurs."""
    from sqlalchemy import select

    result = await db.execute(select(Contractor))
    contractors = result.scalars().all()

    for contractor in contractors:
        events_result = await db.execute(
            select(RBQEvent).where(RBQEvent.contractor_id == contractor.id)
        )
        events = events_result.scalars().all()

        plaintes_result = await db.execute(
            select(OPCPlainte).where(OPCPlainte.contractor_id == contractor.id)
        )
        plaintes = plaintes_result.scalar_one_or_none()

        litiges_result = await db.execute(
            select(Litige).where(Litige.contractor_id == contractor.id)
        )
        litiges = litiges_result.scalars().all()

        contrats_count = await db.execute(
            select(SEAOContract).where(SEAOContract.contractor_id == contractor.id)
        )
        nb_contrats = len(contrats_count.scalars().all())

        contractor.score = calculate_score(contractor, events, plaintes, litiges, nb_contrats)
        contractor.score_updated_at = date.today()

    await db.commit()
    print(f"Scores recalculés pour {len(contractors)} entrepreneurs")