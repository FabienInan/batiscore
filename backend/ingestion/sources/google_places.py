"""
Intégration Google Places API (New) pour les avis entrepreneurs.

Source : https://places.googleapis.com/v1/
API : Clé API — Text Search + Place Details.

Retourne la note moyenne et le nombre d'avis pour un entrepreneur.
Appels : 2 par contractor (search + details). Cache 7j en base.
"""
import re
from datetime import datetime
from typing import Optional

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from config import settings
from models import Contractor, GoogleReviewsCache

GOOGLE_PLACES_BASE = "https://places.googleapis.com/v1"
CACHE_TTL_DAYS = 7

# Suffixes juridiques québécois à retirer pour la recherche Google
_SUFFIX_RE = re.compile(
    r"\s*,?\s*"
    r"(inc\.|s\.e\.n\.c\.|s\.e\.n\.c|ltée|ltée\.|ltd\.|inc|s\.a\.|s\.a|"
    r"s\.r\.o\.|s\.r\.o|s\.e\.p\.|s\.e\.p|c\.s\.s\.|c\.s\.s)"
    r"\s*$",
    re.IGNORECASE,
)

# Préfixes descriptifs à retirer pour un nom plus court
_PREFIX_RE = re.compile(
    r"^(construction\s+et\s+r[eé]novation|construction\s+et\s+r[eé]no|"
    r"construction|r[eé]novation|r[eé]no|entrepreneur\s+g[eé]n[eé]ral|"
    r"excavation|peinture|plomberie|[eé]lectricit[eé]|toiture|couverture|"
    r"ma[cç]onnerie|charpente|isolations?|vente|installation|services?\s+de)\s+",
    re.IGNORECASE,
)


def _clean_name(nom: str) -> str:
    """Retire les suffixes juridiques du nom pour améliorer la recherche Google."""
    return _SUFFIX_RE.sub("", nom).strip()


def _short_name(nom: str) -> str:
    """Retire suffixes + préfixes descriptifs pour un nom ultra-court.
    ex: 'Construction Et Renovation M. Dubeau inc.' → 'M. Dubeau'
    """
    name = _clean_name(nom)
    return _PREFIX_RE.sub("", name).strip()


async def search_place(
    client: httpx.AsyncClient, nom: str, ville: str, neq: str | None = None
) -> Optional[str]:
    """
    Recherche un lieu sur Google Places par NEQ puis nom + ville.
    Essaie plusieurs variantes, du NEQ (plus fiable) au nom court.
    Retourne le placeId du premier résultat, ou None.
    """
    clean = _clean_name(nom)
    short = _short_name(nom)

    # Stratégies de recherche, de la plus fiable à la plus large
    queries = []
    # 1) NEQ — beaucoup d'entreprises ont leur NEQ dans leur fiche Google
    if neq:
        queries.append(f"NEQ {neq} {ville}".strip())
    # 2) Nom nettoyé (sans suffixes juridiques)
    if clean != nom:
        queries.append(f"{clean} {ville}")
    # 3) Nom légal complet
    queries.append(f"{nom} {ville}")
    # 4) Nom court (sans préfixes descriptifs)
    if short and short != clean and short != nom:
        queries.append(f"{short} {ville}")

    for query in queries:
        print(f"Google: searching '{query}'")
        resp = await client.post(
            f"{GOOGLE_PLACES_BASE}/places:searchText",
            headers={
                "X-Goog-Api-Key": settings.google_places_api_key,
                "Content-Type": "application/json",
                "X-Goog-FieldMask": "places.id",
            },
            json={"textQuery": query},
        )
        if resp.status_code != 200:
            print(f"Google: HTTP {resp.status_code}")
            continue
        places = resp.json().get("places", [])
        if places:
            print(f"Google: found place_id={places[0].get('id')}")
            return places[0].get("id")
        print(f"Google: no results")
    return None


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
    nom: str, ville: str, neq: str | None = None
) -> Optional[dict]:
    """
    Orchestre la recherche + détails pour un entrepreneur.
    Retourne {"place_id": str, "rating": float, "nb_avis": int} ou None.
    """
    if not settings.google_places_api_key:
        return None

    async with httpx.AsyncClient(timeout=10) as client:
        place_id = await search_place(client, nom, ville, neq=neq)
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
        # Cache vide (pas de match) : réessayer après 1 jour
        # Cache avec données : valable 7 jours
        ttl = 1 if cached.rating is None else CACHE_TTL_DAYS
        if age < ttl:
            if cached.rating is not None:
                return {"rating": cached.rating, "nb_avis": cached.nb_avis or 0}
            return None

    # Fetch depuis l'API
    data = await fetch_google_reviews(
        contractor.nom_legal, contractor.ville or "", neq=contractor.neq
    )

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