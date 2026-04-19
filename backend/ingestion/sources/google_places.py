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

# Mots vides à ignorer dans la comparaison de noms
_STOP_WORDS = {
    "inc", "ltee", "ltée", "ltd", "enr", "cie", "co", "corp", "sa", "sro", "sep", "css",
    "senc", "les", "le", "la", "du", "de", "des", "et", "and", "the",
    "construction", "renovation", "reno", "entreprise",
    "general", "generale", "specialisee",
    # Mots de métier — trop génériques pour distinguer 2 entreprises du même domaine
    "peinture", "plomberie", "electricite", "toiture", "couverture",
    "maconnerie", "charpente", "excavation", "installation", "vente",
    "service", "services", "entretien", "entretiens", "residentielle",
    "calfeutrage", "isolation", "ventilation", "chauffage", "climatisation",
    "refrigeration", "refrigération", "soudures", "soudure", "platre", "platrage",
    "ebénisterie", "ebenisterie", "menuiserie", "cabinets", "armoires",
    "electrique", "electriques", "mecanique", "mecaniques",
    # Toponymes / termes trop génériques
    "quebec", "québec", "canada", "montreal", "montréal", "laval",
    "location", "groupe", "centre", "mega",
    # Termes commerciaux génériques
    "gestion", "distribution", "entreprises", "immeubles", "habitations",
    "solutions", "concepts", "projets", "produits", "developpement",
    # Non-construction
    "ecole", "school", "preschool",
}

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


def _normalize_for_compare(s: str) -> str:
    """Normalise pour comparaison : minuscule, sans accents, sans ponctuation."""
    s = s.lower()
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[&.,'\-]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _significant_words(s: str) -> set[str]:
    """Extrait les mots significatifs d'un nom (sans accents, sans stop words, 3+ chars)."""
    words = _normalize_for_compare(s).split()
    return {w for w in words if len(w) >= 3 and w not in _STOP_WORDS}


def _is_number_name(nom: str) -> bool:
    """Détecte les noms à numéro (ex: '9388-3346 Québec inc.') — pas assez d'info pour matcher Google."""
    cleaned = _SUFFIX_RE.sub("", nom).strip()
    # Si le nom commence par des chiffres (avec ou sans tirets), c'est un nom à numéro
    if re.match(r"^\d", cleaned):
        # Enlever les mots "Québec"/"Canada" et les chiffres/tirets, voir s'il reste du texte
        stripped = re.sub(r"\b(quebec|canada|limited|ltee)\b", "", cleaned, flags=re.IGNORECASE).strip()
        stripped = re.sub(r"[\d\-.']", "", stripped).strip()
        return len(stripped) < 3
    return False


def _name_matches(google_name: str, reference_names: list[str]) -> bool:
    """
    Vérifie que le nom Google correspond à l'un des noms de référence.
    Critère : au moins 2 mots significatifs communs, ou 1 mot distinctif
    (5+ chars, probablement un nom propre).
    Si le nom de référence n'a que des mots courts (initiales), exige
    que le nom Google contienne ces initiales exactes.
    """
    g_words = _significant_words(google_name)
    if not g_words:
        return False

    for ref in reference_names:
        r_words = _significant_words(ref)

        # Si le nom de référence n'a pas de mots longs (que des initiales/mots courts),
        # exiger que le nom Google contienne cette séquence normalisée
        long_words = {w for w in r_words if len(w) >= 4}
        if not long_words:
            ref_norm = _normalize_for_compare(ref).replace(" ", "")
            g_norm = _normalize_for_compare(google_name).replace(" ", "")
            if ref_norm in g_norm or g_norm in ref_norm:
                return True
            # Ou les initiales doivent matcher (ex: "HD" dans "ISOLATION HD")
            ref_initials = "".join(w[0] for w in _normalize_for_compare(ref).split() if w[0].isalpha())
            g_initials = "".join(w[0] for w in _normalize_for_compare(google_name).split() if w[0].isalpha())
            if ref_initials and ref_initials == g_initials:
                return True
            continue

        common = g_words & r_words
        if len(common) >= 2:
            return True
        # 1 seul mot significatif commun : vérifier aussi les mots bruts
        # (incluant les mots de métier) — si 2+ mots bruts communs, OK
        if len(common) == 1:
            g_raw = set(_normalize_for_compare(google_name).split())
            r_raw = set(_normalize_for_compare(ref).split())
            raw_common = g_raw & r_raw
            if len(raw_common) >= 2:
                return True
    return False


def _short_name(nom: str) -> str:
    """Retire suffixes + préfixes descriptifs pour un nom ultra-court.
    ex: 'Construction Et Renovation M. Dubeau inc.' → 'M. Dubeau'
    """
    name = _clean_name(nom)
    return _PREFIX_RE.sub("", name).strip()


async def search_place(
    client: httpx.AsyncClient, nom: str, ville: str,
    noms_commerciaux: list[str] | None = None,
) -> Optional[str]:
    """
    Recherche un lieu sur Google Places par nom + ville.
    Essaie plusieurs variantes du nom, du plus spécifique au plus court.
    Valide que le nom Google ET la ville correspondent avant de retourner.
    Retourne le placeId du premier résultat validé, ou None.
    """
    clean = _clean_name(nom)
    short = _short_name(nom)

    # Noms de référence pour validation
    reference_names = [nom]
    if noms_commerciaux:
        reference_names.extend(noms_commerciaux)

    # Normaliser la ville pour comparaison
    ville_norm = _normalize_for_compare(ville)

    # Stratégies de recherche, de la plus spécifique à la plus large
    queries = []
    # Noms commerciaux en premier (souvent plus proches du nom Google)
    if noms_commerciaux:
        for nc in noms_commerciaux:
            queries.append(f"{nc} {ville}")
    if clean != nom:
        queries.append(f"{clean} {ville}")
    queries.append(f"{nom} {ville}")
    if short and short != clean and short != nom:
        queries.append(f"{short} {ville}")

    for query in queries:
        print(f"Google: searching '{query}'")
        resp = await client.post(
            f"{GOOGLE_PLACES_BASE}/places:searchText",
            headers={
                "X-Goog-Api-Key": settings.google_places_api_key,
                "Content-Type": "application/json",
                "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
            },
            json={"textQuery": query},
        )
        if resp.status_code != 200:
            print(f"Google: HTTP {resp.status_code}")
            continue
        places = resp.json().get("places", [])
        for place in places:
            place_id = place.get("id")
            display_name = place.get("displayName", {}).get("text", "")
            address = place.get("formattedAddress", "")

            # Vérifier que la ville correspond (au moins un mot de la ville dans l'adresse)
            addr_norm = _normalize_for_compare(address)
            if ville_norm and ville_norm not in addr_norm:
                # Vérifier aussi les mots individuels de la ville
                ville_words = ville_norm.split()
                if not any(w in addr_norm for w in ville_words if len(w) >= 4):
                    print(f"Google: skipping '{display_name}' — city mismatch ({ville} not in {address})")
                    continue

            if _name_matches(display_name, reference_names):
                print(f"Google: matched '{display_name}' for query '{query}'")
                return place_id
            print(f"Google: skipping '{display_name}' — name doesn't match reference names")
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
    nom: str, ville: str, noms_commerciaux: list[str] | None = None,
) -> Optional[dict]:
    """
    Orchestre la recherche + détails pour un entrepreneur.
    Retourne {"place_id": str, "rating": float, "nb_avis": int} ou None.
    """
    if not settings.google_places_api_key:
        return None

    # Noms à numéro (ex: "9388-3346 Québec inc.") — pas assez d'info pour matcher
    if _is_number_name(nom) and not noms_commerciaux:
        return None

    async with httpx.AsyncClient(timeout=10) as client:
        place_id = await search_place(client, nom, ville, noms_commerciaux=noms_commerciaux)
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