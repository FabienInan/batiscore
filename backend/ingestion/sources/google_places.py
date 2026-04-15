"""
Intégration Google Places API (New) pour les avis entrepreneurs.

Source : https://places.googleapis.com/v1/
API : Clé API — Text Search + Place Details.

Retourne la note moyenne et le nombre d'avis pour un entrepreneur.
Appels : 2 par contractor (search + details). Cache 7j en base.
"""
from datetime import datetime
from typing import Optional

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from config import settings
from models import Contractor, GoogleReviewsCache

GOOGLE_PLACES_BASE = "https://places.googleapis.com/v1"
CACHE_TTL_DAYS = 7


async def search_place(
    client: httpx.AsyncClient, nom: str, ville: str
) -> Optional[str]:
    """
    Recherche un lieu sur Google Places par nom + ville.
    Retourne le placeId du premier résultat, ou None.
    """
    resp = await client.post(
        f"{GOOGLE_PLACES_BASE}/places:searchText",
        headers={
            "X-Goog-Api-Key": settings.google_places_api_key,
            "Content-Type": "application/json",
            "X-Goog-FieldMask": "places.id",
        },
        json={"textQuery": f"{nom} {ville}"},
    )
    if resp.status_code != 200:
        return None
    places = resp.json().get("places", [])
    if not places:
        return None
    return places[0].get("id")


async def get_place_details(
    client: httpx.AsyncClient, place_id: str
) -> Optional[dict]:
    """
    Récupère les détails d'un lieu Google (rating, userRatingCount).
    Retourne {"rating": float, "nb_avis": int} ou None.
    """
    resp = await client.get(
        f"{GOOGLE_PLACES_BASE}/places/{place_id}",
        headers={
            "X-Goog-Api-Key": settings.google_places_api_key,
            "X-Goog-FieldMask": "rating,userRatingCount",
        },
    )
    if resp.status_code != 200:
        return None
    data = resp.json()
    rating = data.get("rating")
    nb_avis = data.get("userRatingCount", 0)
    if rating is None:
        return None
    return {"rating": rating, "nb_avis": nb_avis}


async def fetch_google_reviews(
    nom: str, ville: str
) -> Optional[dict]:
    """
    Orchestre la recherche + détails pour un entrepreneur.
    Retourne {"place_id": str, "rating": float, "nb_avis": int} ou None.
    """
    if not settings.google_places_api_key:
        return None

    async with httpx.AsyncClient(timeout=10) as client:
        place_id = await search_place(client, nom, ville)
        if not place_id:
            return None

        details = await get_place_details(client, place_id)
        if not details:
            return None

        return {"place_id": place_id, **details}


async def get_google_reviews_for_contractor(
    contractor_id: int, db: AsyncSession
) -> Optional[dict]:
    """
    Récupère les avis Google pour un entrepreneur.
    Utilise le cache si < 7 jours, sinon fetch depuis l'API.
    Retourne {"rating": float, "nb_avis": int} ou None.
    """
    result = await db.execute(
        select(Contractor).where(Contractor.id == contractor_id)
    )
    contractor = result.scalar_one_or_none()

    if not contractor:
        return None

    # Vérifier le cache
    cache_result = await db.execute(
        select(GoogleReviewsCache).where(
            GoogleReviewsCache.contractor_id == contractor_id
        )
    )
    cached = cache_result.scalar_one_or_none()

    if cached and cached.fetched_at:
        age = (datetime.utcnow() - cached.fetched_at).days
        if age < CACHE_TTL_DAYS:
            if cached.rating is not None:
                return {"rating": cached.rating, "nb_avis": cached.nb_avis or 0}
            return None

    # Fetch depuis l'API
    data = await fetch_google_reviews(contractor.nom_legal, contractor.ville or "")

    if data:
        if cached:
            cached.place_id = data["place_id"]
            cached.rating = data["rating"]
            cached.nb_avis = data["nb_avis"]
            cached.fetched_at = datetime.utcnow()
        else:
            db.add(GoogleReviewsCache(
                contractor_id=contractor_id,
                place_id=data["place_id"],
                rating=data["rating"],
                nb_avis=data["nb_avis"],
            ))
        try:
            await db.commit()
        except Exception:
            await db.rollback()
        return {"rating": data["rating"], "nb_avis": data["nb_avis"]}

    # Pas de match Google — enregistrer un cache vide pour ne pas ré-essayer
    if cached:
        cached.rating = None
        cached.nb_avis = None
        cached.fetched_at = datetime.utcnow()
    else:
        db.add(GoogleReviewsCache(
            contractor_id=contractor_id,
            place_id=None,
            rating=None,
            nb_avis=None,
        ))
    try:
        await db.commit()
    except Exception:
        await db.rollback()
    return None