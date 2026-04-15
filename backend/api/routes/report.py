from types import SimpleNamespace
from typing import Literal
from uuid import UUID
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Contractor, Report, RBQEvent, SEAOContract
from scoring.engine import calculate_score, calculate_score_breakdown, score_label
from ingestion.sources.opc_scraper import get_opc_plaintes_for_contractor
from ingestion.sources.canlii import get_litiges_for_contractor
from ingestion.sources.google_places import get_google_reviews_for_contractor
from ingestion.transforms.normalize import normalize_name


router = APIRouter()


@router.get("/report/{contractor_id}")
async def get_report(
    contractor_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Rapport complet d'un entrepreneur (gratuit)."""
    contractor = await db.get(Contractor, contractor_id)

    if not contractor:
        raise HTTPException(status_code=404, detail="Entrepreneur non trouvé")

    # Extraire TOUTES les valeurs du contractor AVANT les blocs try/except
    # car db.rollback() expire l'objet et empêche le lazy-loading en async
    contractor_data = SimpleNamespace(
        id=contractor.id,
        nom_legal=contractor.nom_legal,
        neq=contractor.neq,
        licence_rbq=contractor.licence_rbq,
        adresse=contractor.adresse,
        ville=contractor.ville,
        telephone=contractor.telephone,
        statut_rbq=contractor.statut_rbq,
        statut_req=contractor.statut_req,
        categories_rbq=contractor.categories_rbq,
        date_fondation=contractor.date_fondation,
        score=contractor.score,
        score_updated_at=contractor.score_updated_at,
    )

    # Récupérer les événements RBQ
    events_result = await db.execute(
        select(RBQEvent).where(RBQEvent.contractor_id == contractor_id)
    )
    events = events_result.scalars().all()

    # Récupérer les plaintes OPC (scraping on-demand avec cache 24h)
    try:
        plaintes = await get_opc_plaintes_for_contractor(contractor_id, db)
    except Exception as e:
        print(f"OPC: Échec silencieux pour contractor {contractor_id}: {e}")
        await db.rollback()
        plaintes = None

    # Récupérer les litiges CanLII (API on-demand)
    try:
        litiges = await get_litiges_for_contractor(contractor_id, db)
    except Exception as e:
        print(f"CanLII: Échec silencieux pour contractor {contractor_id}: {e}")
        await db.rollback()
        litiges = []

    # Récupérer les avis Google (on-demand avec cache 7j)
    google_reviews = None
    try:
        google_reviews = await get_google_reviews_for_contractor(contractor_id, db)
    except Exception as e:
        print(f"Google: Échec silencieux pour contractor {contractor_id}: {e}")
        await db.rollback()

    # Récupérer les contrats publics
    contrats_result = await db.execute(
        select(SEAOContract).where(SEAOContract.contractor_id == contractor_id)
    )
    contrats = contrats_result.scalars().all()

    # Calculer le score à la volée et le persister si absent ou obsolète
    score = calculate_score(contractor_data, list(events), plaintes, list(litiges), len(contrats))
    score_breakdown = calculate_score_breakdown(contractor_data, list(events), plaintes, list(litiges), len(contrats))

    if contractor_data.score != score:
        # Re-fetch le contractor car il a pu être expiré après rollback
        fresh = await db.get(Contractor, contractor_id)
        if fresh:
            fresh.score = score
            fresh.score_updated_at = datetime.utcnow()
            try:
                await db.commit()
            except Exception:
                await db.rollback()

    return {
        "contractor": {
            "id": contractor_data.id,
            "nom_legal": contractor_data.nom_legal,
            "neq": contractor_data.neq,
            "licence_rbq": contractor_data.licence_rbq,
            "adresse": contractor_data.adresse,
            "ville": contractor_data.ville,
            "telephone": contractor_data.telephone,
            "statut_rbq": contractor_data.statut_rbq,
            "statut_req": contractor_data.statut_req,
            "categories_rbq": contractor_data.categories_rbq,
            "date_fondation": str(contractor_data.date_fondation) if contractor_data.date_fondation else None,
            "score": score,
            "score_label": get_score_label(score),
            "score_breakdown": score_breakdown,
        },
        "events": [
            {
                "type": e.event_type,
                "date": str(e.event_date) if e.event_date else None,
                "montant": float(e.montant) if e.montant else None,
                "description": e.description,
                "source": e.source,
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
                "description": l.description,
                "source": l.source,
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
        **({"google_reviews": google_reviews} if google_reviews else {}),
    }


def get_score_label(score: int) -> str:
    if score is None:
        return "Non évalué"
    if score >= 85:
        return "Fiable"
    elif score >= 70:
        return "Acceptable"
    elif score >= 50:
        return "À surveiller"
    else:
        return "À risque élevé"


# ---------------------------------------------------------------------------
# Réseau d'entreprises / détection sociétés phénix — scoring pondéré
# ---------------------------------------------------------------------------

STATUTS_NEGATIFS_RBQ = {"annulé", "suspendu", "révoqué"}
STATUTS_NEGATIFS_REQ = {"radié", "faillite", "en_liquidation"}

# Pondérations des signaux de détection phénix
POIDS_TEMPORALITE = 25
POIDS_TELEPHONE = 20
POIDS_FSA = 12
POIDS_CATEGORIES = 12
POIDS_JEUNESSE_NEGATIF = 10
POIDS_NOM = 8
POIDS_NOMS_SECONDAIRES = 8
POIDS_ADRESSE = 5

MAX_COLOCATAIRES_ADRESSE = 8


def _has_negative_status(c: Contractor) -> bool:
    return (
        c.statut_rbq in STATUTS_NEGATIFS_RBQ
        or c.statut_req in STATUTS_NEGATIFS_REQ
    )


def _date_probleme(c: Contractor) -> date | None:
    """Estime la date du problème : date de fondation si statut négatif, sinon None."""
    if _has_negative_status(c) and c.date_fondation:
        return c.date_fondation
    return None


def _jaccard_categories(cat_a: list | None, cat_b: list | None) -> float:
    """Similarité de Jaccard entre deux ensembles de catégories RBQ."""
    a = set(cat_a or [])
    b = set(cat_b or [])
    if not a or not b:
        return 0.0
    intersection = len(a & b)
    union = len(a | b)
    return intersection / union if union else 0.0


def _niveau_risque(score: int) -> str:
    if score <= 20:
        return "aucun"
    elif score <= 40:
        return "léger"
    elif score <= 60:
        return "suspect"
    elif score <= 80:
        return "probable"
    else:
        return "avéré"


@router.get("/report/{contractor_id}/reseau")
async def get_reseau(
    contractor_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Détecte les entreprises liées avec scoring phénix pondéré.

    Signaux et pondérations :
    - Temporalité critique : 25 pts (société liée en problème < 18 mois avant fondation)
    - Même téléphone : 20 pts
    - Code postal (FSA) : 12 pts
    - Catégories RBQ (Jaccard > 0.5) : 12 pts
    - Jeunesse + statut négatif : 10 pts
    - Nom similaire : 8 pts
    - Noms secondaires : 8 pts
    - Adresse partagée : 5 pts
    """
    contractor = await db.get(Contractor, contractor_id)
    if not contractor:
        raise HTTPException(status_code=404, detail="Entrepreneur non trouvé")

    # Charger les events du contractor pour l'analyse temporelle
    events_result = await db.execute(
        select(RBQEvent).where(RBQEvent.contractor_id == contractor_id)
    )
    contractor_events = events_result.scalars().all()

    # Date du problème la plus ancienne pour le contractor
    contractor_dates_probleme: list[date] = []
    if contractor.date_fondation and _has_negative_status(contractor):
        contractor_dates_probleme.append(contractor.date_fondation)
    for ev in contractor_events:
        if ev.event_type in ("decision_annulation", "decision_suspension", "réclamation") and ev.event_date:
            contractor_dates_probleme.append(ev.event_date)

    # Dictionnaire des entreprises liées : id -> {contractor, signaux}
    linked: dict[int, dict] = {}

    def _ensure_linked(c: Contractor) -> dict:
        if c.id not in linked:
            linked[c.id] = {"contractor": c, "signaux": []}
        return linked[c.id]

    # --- Signal 1 : Même téléphone (20 pts) ---
    if contractor.telephone:
        res = await db.execute(
            select(Contractor)
            .where(Contractor.telephone == contractor.telephone)
            .where(Contractor.id != contractor_id)
            .limit(20)
        )
        for c in res.scalars().all():
            entry = _ensure_linked(c)
            entry["signaux"].append({
                "type": "même téléphone",
                "points": POIDS_TELEPHONE,
                "details": contractor.telephone,
            })

    # --- Signal 2 : Même adresse + ville (5 pts, seuil à 8) ---
    if contractor.adresse and contractor.ville:
        count_res = await db.execute(
            select(func.count(Contractor.id))
            .where(Contractor.adresse == contractor.adresse)
            .where(Contractor.ville == contractor.ville)
        )
        nb_at_address = count_res.scalar() or 0

        if nb_at_address <= MAX_COLOCATAIRES_ADRESSE:
            res = await db.execute(
                select(Contractor)
                .where(Contractor.adresse == contractor.adresse)
                .where(Contractor.ville == contractor.ville)
                .where(Contractor.id != contractor_id)
                .limit(20)
            )
            for c in res.scalars().all():
                entry = _ensure_linked(c)
                entry["signaux"].append({
                    "type": "même adresse",
                    "points": POIDS_ADRESSE,
                    "details": f"{contractor.adresse}, {contractor.ville}",
                })

    # --- Signal 3 : Même code postal FSA (12 pts) ---
    fsa = (contractor.code_postal or "")[:3].upper()
    if len(fsa) == 3 and fsa.isalpha():
        res = await db.execute(
            select(Contractor)
            .where(func.substr(Contractor.code_postal, 1, 3) == fsa)
            .where(Contractor.id != contractor_id)
            .limit(30)
        )
        for c in res.scalars().all():
            entry = _ensure_linked(c)
            entry["signaux"].append({
                "type": "même code postal",
                "points": POIDS_FSA,
                "details": f"Code postal {fsa}...",
            })

    # --- Signal 4 : Nom similaire + même ville (8 pts) ---
    if contractor.nom_normalized and len(contractor.nom_normalized) >= 5 and contractor.ville:
        res = await db.execute(
            select(Contractor)
            .where(func.similarity(Contractor.nom_normalized, contractor.nom_normalized) > 0.7)
            .where(Contractor.ville == contractor.ville)
            .where(Contractor.id != contractor_id)
            .order_by(func.similarity(Contractor.nom_normalized, contractor.nom_normalized).desc())
            .limit(10)
        )
        for c in res.scalars().all():
            entry = _ensure_linked(c)
            entry["signaux"].append({
                "type": "nom similaire",
                "points": POIDS_NOM,
                "details": f"{contractor.nom_legal} ↔ {c.nom_legal}",
            })

    # --- Signal 5 : Noms secondaires (8 pts) ---
    # Vérifier si le nom du contractor apparaît dans les noms_secondaires d'autres entreprises
    # ou inversement
    if contractor.nom_normalized:
        res = await db.execute(
            select(Contractor)
            .where(Contractor.id != contractor_id)
            .limit(5000)  # scan large car ARRAY n'est pas facilement queryable
        )
        all_contractors = res.scalars().all()
        for c in all_contractors:
            match_found = False
            # Nom du contractor dans les noms_secondaires de c
            if c.noms_secondaires:
                for ns in c.noms_secondaires:
                    if normalize_name(ns) == contractor.nom_normalized:
                        match_found = True
                        break
            # Noms_secondaires du contractor dans le nom de c
            if not match_found and contractor.noms_secondaires:
                for ns in contractor.noms_secondaires:
                    if normalize_name(ns) == (c.nom_normalized or ""):
                        match_found = True
                        break
            if match_found:
                entry = _ensure_linked(c)
                entry["signaux"].append({
                    "type": "nom secondaire",
                    "points": POIDS_NOMS_SECONDAIRES,
                    "details": f"Nom commercial similaire",
                })

    # --- Calcul des scores par entreprise liée ---
    entreprises = []
    signaux_globaux = {}  # type -> signal le plus fort

    for c_id, data in linked.items():
        c = data["contractor"]
        signaux = data["signaux"]

        # Dédupliquer les signaux par type (garder le plus fort)
        signaux_by_type: dict[str, dict] = {}
        for s in signaux:
            if s["type"] not in signaux_by_type or s["points"] > signaux_by_type[s["type"]]["points"]:
                signaux_by_type[s["type"]] = s

        # Calculer les points de lien (somme des signaux, plafonné par type)
        points_lien = sum(s["points"] for s in signaux_by_type.values())

        # --- Signal contextuel : catégories RBQ Jaccard (12 pts) ---
        jaccard = _jaccard_categories(contractor.categories_rbq, c.categories_rbq)
        if jaccard > 0.5:
            cat_points = POIDS_CATEGORIES
        elif jaccard > 0.3:
            cat_points = POIDS_CATEGORIES // 2
        else:
            cat_points = 0
        if cat_points > 0:
            signaux_by_type["catégories similaires"] = {
                "type": "catégories similaires",
                "points": cat_points,
                "details": f"Jaccard {jaccard:.0%} — mêmes spécialités",
            }
            points_lien += cat_points

        # --- Signal contextuel : temporalité critique (25 pts) ---
        temporalite_points = 0
        if contractor.date_fondation and _has_negative_status(c):
            date_prob = _date_probleme(c)
            if date_prob:
                delta_days = (contractor.date_fondation - date_prob).days
                if -180 <= delta_days <= 540:  # -6 mois à +18 mois
                    temporalite_points = POIDS_TEMPORALITE
                    mois = round(delta_days / 30)
                    if mois >= 0:
                        detail = f"Fondée {mois} mois après problème chez société liée"
                    else:
                        detail = f"Fondée {abs(mois)} mois avant problème chez société liée"
                elif 540 < delta_days <= 1080:  # 18-36 mois
                    temporalite_points = POIDS_TEMPORALITE // 2
                    detail = f"Fondée {round(delta_days / 30)} mois après problème chez société liée"
                if temporalite_points > 0:
                    signaux_by_type["temporalité critique"] = {
                        "type": "temporalité critique",
                        "points": temporalite_points,
                        "details": detail,
                    }
                    points_lien += temporalite_points

        # --- Signal contextuel : jeunesse + négatif (10 pts) ---
        jeunesse_points = 0
        if contractor.date_fondation:
            age_mois = (date.today() - contractor.date_fondation).days / 30
            if age_mois < 24 and _has_negative_status(c):
                jeunesse_points = POIDS_JEUNESSE_NEGATIF
                signaux_by_type["jeunesse + négatif"] = {
                    "type": "jeunesse + négatif",
                    "points": jeunesse_points,
                    "details": f"Entreprise récente ({round(age_mois)} mois) liée à société en difficulté",
                }
                points_lien += jeunesse_points

        # --- Signal anti-phénix : ordre temporel inversé ---
        # Si la société liée a été fondée APRÈS le contractor, c'est potentiellement
        # un doublon ou une réimmatriculation, pas un phénix. On réduit le score.
        # Un vrai phénix : société A en difficulté → société B propre créée après.
        # Un doublon : société A (ancienne, toujours active) → société B (nouvelle, radiée).
        doublon_penalty = 0
        if contractor.date_fondation and c.date_fondation:
            if c.date_fondation > contractor.date_fondation and _has_negative_status(c):
                # La société liée est plus récente ET en difficulté → doublon probable
                doublon_penalty = points_lien // 2  # Réduire de 50%
                signaux_by_type["doublon possible"] = {
                    "type": "doublon possible",
                    "points": -doublon_penalty,
                    "details": f"Fondée après le contractor ({c.date_fondation.year} vs {contractor.date_fondation.year}) — probablement un doublon",
                }
                points_lien = max(0, points_lien - doublon_penalty)

        # Alerte = statut négatif sur l'entreprise liée
        alerte = _has_negative_status(c)

        entreprises.append({
            "id": c.id,
            "nom": c.nom_legal,
            "ville": c.ville,
            "licence_rbq": c.licence_rbq,
            "statut_rbq": c.statut_rbq,
            "statut_req": c.statut_req,
            "score": c.score,
            "date_fondation": str(c.date_fondation) if c.date_fondation else None,
            "lien": max(signaux_by_type.values(), key=lambda s: s["points"])["type"] if signaux_by_type else "inconnu",
            "lien_details": [s["type"] for s in signaux_by_type.values()],
            "alerte": alerte,
            "points_lien": points_lien,
        })

        # Agréger les signaux globaux (garder le plus fort par type)
        for s in signaux_by_type.values():
            if s["type"] not in signaux_globaux or s["points"] > signaux_globaux[s["type"]]["points"]:
                signaux_globaux[s["type"]] = s

    # Trier : par points_lien décroissant
    entreprises.sort(key=lambda x: x["points_lien"], reverse=True)

    # Score phénix global = max des points_lien, boosté si alerte
    # Le boost est limité pour éviter que des doublons de données (même entreprise,
    # deux entrées) ne produisent un score phénix élevé. On ajoute un bonus fixe
    # plutôt qu'un multiplicateur.
    score_phenix = 0
    if entreprises:
        max_points = max(e["points_lien"] for e in entreprises)
        has_alerte = any(e["alerte"] for e in entreprises)
        if has_alerte:
            # Bonus fixe de 15 pts pour statut négatif (au lieu de ×1.3)
            score_phenix = min(100, max_points + 15)
        else:
            score_phenix = min(100, max_points)
    score_phenix = max(0, min(100, score_phenix))

    risque_phenix = score_phenix > 20

    return {
        "risque_phenix": risque_phenix,
        "score_phenix": score_phenix,
        "niveau_risque": _niveau_risque(score_phenix),
        "nb_entreprises_liees": len(entreprises),
        "signaux": list(signaux_globaux.values()),
        "entreprises": entreprises,
    }