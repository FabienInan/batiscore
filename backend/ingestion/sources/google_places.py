"""
Intégration Google Places API (New) pour les avis entrepreneurs.

Source : https://places.googleapis.com/v1/
API : Clé API — Text Search + Place Details.

Retourne la note moyenne et le nombre d'avis pour un entrepreneur.
Appels : 2 par contractor (search + details). Cache 7j en base.
"""
import re
import unicodedata
from datetime import datetime
from typing import Optional

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from config import settings
from models import Contractor, GoogleReviewsCache

GOOGLE_PLACES_BASE = "https://places.googleapis.com/v1"
CACHE_TTL_DAYS = 7


def _normalize_for_compare(s: str) -> str:
    """Normalise une chaîne pour comparaison : minuscule, sans accents, sans ponctuation."""
    s = s.lower()
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[&.,'\-]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _name_matches(google_name: str, reference_names: list[str], threshold: float = 0.35) -> bool:
    """
    Vérifie si le nom Google correspond à l'un des noms de référence.
    Utilise la similarité PostgreSQL-style (trigrammes simplifiés) ou un matching
    par sous-chaîne pour les cas où le nom commercial est contenu dans le nom Google.
    """
    g = _normalize_for_compare(google_name)
    if not g:
        return False

    for ref in reference_names:
        r = _normalize_for_compare(ref)
        if not r:
            continue
        # Sous-chaîne : "cyril" dans "peinture cyril" ou inversement
        if r in g or g in r:
            return True
        # Mot-clé commun significatif : on cherche un mot de 3+ chars commun
        g_words = {w for w in g.split() if len(w) >= 3}
        r_words = {w for w in r.split() if len(w) >= 3}
        common = g_words & r_words
        # S'il y a au moins 1 mot commun significatif qui n'est pas un stop word
        stop_words = {"inc", "ltee", "enr", "cie", "construction", "renovation",
                      "entreprise", "peinture", "plomberie", "electricite",
                      "toiture", "couverture", "maconnerie", "charpente",
                      "excavation", "installation", "vente", "service", "services"}
        significant_common = common - stop_words
        if significant_common:
            return True

    return False


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
    client: httpx.AsyncClient, nom: str, ville: str, neq: str | None = None,
    noms_commerciaux: list[str] | None = None,
) -> Optional[str]:
    """
    Recherche un lieu sur Google Places par NEQ puis nom + ville.
    Essaie plusieurs variantes, du NEQ (plus fiable) au nom court.
    Vérifie que le nom Google correspond à l'entrepreneur avant de retourner.
    Retourne le placeId du premier résultat validé, ou None.
    """
    clean = _clean_name(nom)
    short = _short_name(nom)

    # Noms de référence pour la validation du match
    reference_names = [nom, clean, short]
    if noms_commerciaux:
        reference_names.extend(noms_commerciaux)

    # Stratégies de recherche, de la plus fiable à la plus large
    queries = []
    # 1) NEQ — beaucoup d'entreprises ont leur NEQ dans leur fiche Google
    if neq:
        queries.append(f"NEQ {neq} {ville}".strip())
    # 2) Nom commercial (si disponible) — "Peinture Cyril Repentigny"
    if noms_commerciaux:
        for nc in noms_commerciaux:
            queries.append(f"{nc} {ville}")
    # 3) Nom nettoyé (sans suffixes juridiques)
    if clean != nom:
        queries.append(f"{clean} {ville}")
    # 4) Nom légal complet
    queries.append(f"{nom} {ville}")
    # 5) Nom court (sans préfixes descriptifs)
    if short and short != clean and short != nom:
        queries.append(f"{short} {ville}")

    for query in queries:
        print(f"Google: searching '{query}'")
        resp = await client.post(
            f"{GOOGLE_PLACES_BASE}/places:searchText",
            headers={
                "X-Goog-Api-Key": settings.google_places_api_key,
                "Content-Type": "application/json",
                "X-Goog-FieldMask": "places.id,places.displayName",
            },
            json={"textQuery": query},
        )
        if resp.status_code != 200:
            print(f"Google: HTTP {resp.status_code}")
            continue
        places = resp.json().get("places", [])
        # Parcourir les résultats et valider le nom
        for place in places:
            place_id = place.get("id")
            display_name = place.get("displayName", {}).get("text", "")
            if _name_matches(display_name, reference_names):
                print(f"Google: validated place_id={place_id} ('{display_name}') for query '{query}'")
                return place_id
            print(f"Google: skipping '{display_name}' — doesn't match reference names")
        print(f"Google: no validated results for '{query}'")
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
    nom: str, ville: str, neq: str | None = None,
    noms_commerciaux: list[str] | None = None,
) -> Optional[dict]:
    """
    Orchestre la recherche + détails pour un entrepreneur.
    Retourne {"place_id": str, "rating": float, "nb_avis": int} ou None.
    """
    if not settings.google_places_api_key:
        return None

    async with httpx.AsyncClient(timeout=10) as client:
        place_id = await search_place(
            client, nom, ville, neq=neq, noms_commerciaux=noms_commerciaux
        )
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
        contractor.nom_legal, contractor.ville or "",
        neq=contractor.neq,
        noms_commerciaux=contractor.noms_secondaires,
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