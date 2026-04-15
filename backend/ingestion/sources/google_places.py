"""
Intégration Google Places API (New) pour les avis entrepreneurs.

Source : https://places.googleapis.com/v1/
API : Clé API — Text Search + Place Details.

Retourne la note moyenne et le nombre d'avis pour un entrepreneur.
Appels : 2 par contractor (search + details). Cache 7j en base.
"""
from typing import Optional

import httpx
from config import settings

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