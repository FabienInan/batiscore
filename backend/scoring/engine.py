from datetime import date, datetime
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Contractor, RBQEvent, OPCPlainte, Litige, SEAOContract


def calculate_score_breakdown(contractor: Contractor, events: List[RBQEvent], plaintes: OPCPlainte | None, litiges: List[Litige], nb_contrats: int) -> list[dict]:
    """Retourne la liste des facteurs qui ont influencé le score."""
    factors = []

    if contractor.statut_rbq in ("suspendu", "annulé", "révoqué"):
        factors.append({"label": f"Licence RBQ {contractor.statut_rbq}", "points": -50, "type": "negative"})
    elif contractor.statut_rbq == "réouverte":
        factors.append({"label": "Licence RBQ réouverte", "points": -10, "type": "warning"})

    if contractor.statut_req in ("radié", "en_liquidation", "faillite"):
        factors.append({"label": f"Entreprise {contractor.statut_req} au REQ", "points": -40, "type": "negative"})

    nb_reclamations = sum(1 for e in events if e.event_type == "réclamation")
    if nb_reclamations:
        pts = -min(nb_reclamations * 15, 45)
        factors.append({"label": f"{nb_reclamations} réclamation(s) cautionnement RBQ", "points": pts, "type": "negative"})

    nb_cnesst = sum(1 for e in events if e.event_type == "cnesst_infraction")
    if nb_cnesst:
        pts = -min(nb_cnesst * 10, 20)
        factors.append({"label": f"{nb_cnesst} infraction(s) CNESST", "points": pts, "type": "negative"})

    for e in events:
        if e.event_type == "decision_annulation":
            factors.append({"label": "Décision d'annulation de licence", "points": -35, "type": "negative"})
        elif e.event_type == "decision_suspension":
            factors.append({"label": "Décision de suspension de licence", "points": -20, "type": "negative"})
        elif e.event_type == "decision_condition":
            factors.append({"label": "Décision avec condition sur licence", "points": -8, "type": "negative"})
        elif e.event_type == "decision_regisseurs":
            factors.append({"label": "Décision Bureau des régisseurs", "points": -12, "type": "negative"})

    if plaintes:
        if plaintes.mises_en_garde and len(plaintes.mises_en_garde) > 0:
            factors.append({"label": "Mise en garde OPC", "points": -15, "type": "negative"})
        if plaintes.nb_plaintes > 0:
            pts = -min(plaintes.nb_plaintes * 5, 15)
            factors.append({"label": f"{plaintes.nb_plaintes} plainte(s) OPC", "points": pts, "type": "negative"})

    for l in litiges:
        if l.source == "canlii":
            if l.type_litige == "decision_annulation":
                factors.append({"label": "Décision d'annulation de licence (CanLII)", "points": -35, "type": "negative"})
            elif l.type_litige == "decision_suspension":
                factors.append({"label": "Décision de suspension de licence (CanLII)", "points": -20, "type": "negative"})
            elif l.type_litige == "decision_condition":
                factors.append({"label": "Décision avec condition sur licence (CanLII)", "points": -8, "type": "negative"})
            elif l.type_litige == "decision_regisseurs":
                factors.append({"label": "Décision Bureau des régisseurs (CanLII)", "points": -12, "type": "negative"})

    condamnations = [l for l in litiges if l.source != "canlii" and l.issue == "condamné"]
    if condamnations:
        pts = -min(len(condamnations) * 8, 25)
        factors.append({"label": f"{len(condamnations)} condamnation(s) judiciaire(s)", "points": pts, "type": "negative"})

    if contractor.statut_req == "actif":
        factors.append({"label": "Immatriculé au REQ", "points": 5, "type": "positive"})

    if contractor.date_fondation:
        from datetime import date
        age_ans = (date.today() - contractor.date_fondation).days / 365
        if age_ans >= 10:
            factors.append({"label": f"Ancienneté > 10 ans", "points": 15, "type": "positive"})
        elif age_ans >= 5:
            factors.append({"label": f"Ancienneté > 5 ans", "points": 10, "type": "positive"})
        elif age_ans >= 2:
            factors.append({"label": f"Ancienneté > 2 ans", "points": 5, "type": "positive"})
        else:
            factors.append({"label": f"Entreprise récente (< 2 ans)", "points": 0, "type": "neutral"})

    if nb_contrats > 0:
        factors.append({"label": "Contrats publics SEAO", "points": 10, "type": "positive"})

    return factors


def calculate_score(contractor: Contractor, events: List[RBQEvent], plaintes: OPCPlainte | None, litiges: List[Litige], nb_contrats: int) -> int:
    """
    Calcule le score de fiabilité d'un entrepreneur (0-100).

    Score de base: 70 (licence valide, aucun incident connu)
    Être jeune n'est pas une pénalité — l'ancienneté est un bonus.

    Bonus:
      - Immatriculé REQ actif: +5
      - Ancienneté 2–5 ans: +5
      - Ancienneté 5–10 ans: +10
      - Ancienneté > 10 ans: +15
      - Contrats publics SEAO: +10

    Déductions:
      - Licence suspendue/révoquée: -50
      - Entreprise radiée/faillite: -40
      - Réclamation RBQ: -15 chacune (max -45)
      - Décision annulation: -35
      - Décision suspension: -20
      - Décision condition: -8
      - Décision régisseurs (autre): -12
      - Mise en garde OPC: -15
      - Plainte OPC: -5 chacune (max -15)
      - Litige condamné: -8 chacun (max -25)
    """
    score = 70

    # === DÉDUCTIONS — incidents actifs ===

    # Licence RBQ suspendue/révoquée
    if contractor.statut_rbq in ("suspendu", "annulé", "révoqué"):
        score -= 50
    elif contractor.statut_rbq == "réouverte":
        score -= 10

    # Entreprise radiée ou en faillite
    if contractor.statut_req in ("radié", "en_liquidation", "faillite"):
        score -= 40

    # Réclamations cautionnement RBQ
    nb_reclamations = sum(1 for e in events if e.event_type == "réclamation")
    score -= min(nb_reclamations * 15, 45)

    # Infractions CNESST (condamnations pénales)
    nb_cnesst = sum(1 for e in events if e.event_type == "cnesst_infraction")
    score -= min(nb_cnesst * 10, 20)

    # Décisions Bureau des régisseurs RBQ
    nb_decisions = 0
    for e in events:
        if e.event_type == "decision_annulation":
            score -= 35
            nb_decisions += 1
        elif e.event_type == "decision_suspension":
            score -= 20
            nb_decisions += 1
        elif e.event_type == "decision_condition":
            score -= 8
            nb_decisions += 1
        elif e.event_type == "decision_regisseurs":
            score -= 12
            nb_decisions += 1

    # OPC
    if plaintes:
        if plaintes.mises_en_garde and len(plaintes.mises_en_garde) > 0:
            score -= 15
        score -= min(plaintes.nb_plaintes * 5, 15)

    # Litiges CanLII — décisions Bureau des régisseurs (sévérité par type)
    for l in litiges:
        if l.source == "canlii":
            if l.type_litige == "decision_annulation":
                score -= 35
            elif l.type_litige == "decision_suspension":
                score -= 20
            elif l.type_litige == "decision_condition":
                score -= 8
            elif l.type_litige == "decision_regisseurs":
                score -= 12

    # Autres litiges (cours de justice) — condamnations génériques
    condamnations = [l for l in litiges if l.source != "canlii" and l.issue == "condamné"]
    score -= min(len(condamnations) * 8, 25)

    # === BONUS — signaux positifs ===

    # Immatriculé REQ actif
    if contractor.statut_req == "actif":
        score += 5

    # Ancienneté (bonus seulement, pas de pénalité pour les jeunes entreprises)
    if contractor.date_fondation:
        age_ans = (date.today() - contractor.date_fondation).days / 365

        if age_ans >= 10:
            score += 15
        elif age_ans >= 5:
            score += 10
        elif age_ans >= 2:
            score += 5

    # Contrats publics SEAO
    if nb_contrats > 0:
        score += 10

    return max(0, min(100, score))


def score_label(score: int) -> dict:
    """Retourne le label et la couleur associés à un score."""
    if score is None:
        return {"label": "Non évalué", "color": "gray"}

    if score >= 85:
        return {"label": "Fiable", "color": "green"}
    elif score >= 70:
        return {"label": "Acceptable", "color": "amber"}
    elif score >= 50:
        return {"label": "À surveiller", "color": "orange"}
    else:
        return {"label": "À risque élevé", "color": "red"}


async def recalculate_all_scores(db: AsyncSession):
    """Recalcule les scores de tous les entrepreneurs."""
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
        plaintes = plaintes_result.scalars().first()

        litiges_result = await db.execute(
            select(Litige).where(Litige.contractor_id == contractor.id)
        )
        litiges = litiges_result.scalars().all()

        contrats_result = await db.execute(
            select(SEAOContract).where(SEAOContract.contractor_id == contractor.id)
        )
        nb_contrats = len(contrats_result.scalars().all())

        contractor.score = calculate_score(contractor, events, plaintes, litiges, nb_contrats)
        contractor.score_updated_at = datetime.utcnow()

    await db.commit()
    print(f"Scores recalculés pour {len(contractors)} entrepreneurs")
