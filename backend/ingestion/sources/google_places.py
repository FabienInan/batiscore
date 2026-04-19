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
from dataclasses import dataclass
from typing import Optional

import httpx
from rapidfuzz import fuzz
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from config import settings
from models import Contractor, GoogleReviewsCache

GOOGLE_PLACES_BASE = "https://places.googleapis.com/v1"
GOOGLE_MAPS_BASE = "https://maps.googleapis.com/maps/api/place"
GOOGLE_GEOCODE_BASE = "https://maps.googleapis.com/maps/api/geocode"
CACHE_TTL_DAYS = 7

# Codes régionaux québécois valides
_QC_AREA_CODES = {"418", "431", "450", "468", "514", "579", "581", "819", "873"}

# Mots vides à ignorer dans la comparaison de noms
_STOP_WORDS = {
    "inc", "ltee", "ltée", "ltd", "enr", "cie", "co", "corp", "sa", "sro", "sep", "css",
    "senc", "les", "le", "la", "du", "de", "des", "et", "and", "the",
    "construction", "constructions", "renovation", "reno", "entreprise",
    "general", "generale", "specialisee",
    # Mots de métier — trop génériques pour distinguer 2 entreprises du même domaine
    "peinture", "plomberie", "electricite", "toiture", "couverture",
    "maconnerie", "charpente", "excavation", "installation", "vente",
    "service", "services", "entretien", "entretiens", "residentielle",
    "calfeutrage", "isolation", "ventilation", "chauffage", "climatisation",
    "refrigeration", "refrigération", "soudures", "soudure", "platre", "platrage",
    "ebénisterie", "ebenisterie", "menuiserie", "cabinets", "armoires",
    "electrique", "electriques", "mecanique", "mecaniques",
    "portes", "fenetres", "demolition",
    "plancher", "planchers", "couvre",
    "systemes", "interieur", "interieurs",
    "parc", "transport", "ramonage", "ramoneur",
    "tirage", "joints",
    "bus",
    # Toponymes / termes trop génériques
    "quebec", "québec", "canada", "montreal", "montréal", "laval",
    "location", "groupe", "centre", "mega",
    # Termes commerciaux génériques
    "gestion", "distribution", "entreprises", "immeubles", "habitations",
    "solutions", "concepts", "projets", "produits", "developpement",
    # Types de service (trop génériques pour distinguer 2 entreprises)
    "apres", "sinistre", "sinistres",
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
    Privilégie la précision : un faux négatif est acceptable, un faux positif ne l'est pas.
    """
    _JUNK = {"inc", "ltee", "ltée", "ltd", "enr", "cie", "co", "corp", "sa",
              "sro", "sep", "css", "senc", "les", "le", "la", "du", "de",
              "des", "et", "and", "the",
              # Mots de métier exclus du fallback brut (trop de faux positifs)
              "construction", "constructions", "renovation", "reno",
              "peinture", "plomberie", "maconnerie", "maçonnerie",
              "excavation", "excavations", "isolation", "ventilation",
              "chauffage", "climatisation", "toiture", "toitures",
              "couverture", "couvertures", "charpente", "installation",
              "calfeutrage", "ceramique", "céramique", "gouttieres",
              "gouttières", "platre", "platrage", "ebenisterie",
              "ébénisterie", "menuiserie", "soudures", "soudure",
              "refrigeration", "réfrigération", "electrique", "électrique",
              "electric", "service", "services", "entretien", "entretiens",
              "residentielle", "planchers", "pavage", "armoires",
              "forestier", "boulanger", "boulangerie",
              "demolition", "ramonage", "ramoneur", "occasion",
              "portes", "fenetres", "plancher", "planchers",
              "couvre", "systemes", "interieur", "interieurs",
              "parc", "transport"}

    g_words = _significant_words(google_name)
    if not g_words:
        return False

    for ref in reference_names:
        r_words = _significant_words(ref)

        # Si le nom de référence n'a pas de mots longs (que des initiales/mots courts),
        # exiger que le nom Google contienne cette séquence normalisée
        long_words = {w for w in r_words if len(w) >= 4}
        if not long_words:
            # Si TOUS les mots du nom sont génériques (stop words), le nom
            # n'est pas assez distinctif pour un match substring
            # (ex: "PARC-O-BUS" = uniquement des mots vides → ne pas matcher)
            ref_all_generic = all(
                w in _STOP_WORDS or len(w) < 3 for w in _normalize_for_compare(ref).split()
            )
            ref_norm = _normalize_for_compare(ref).replace(" ", "")
            g_norm = _normalize_for_compare(google_name).replace(" ", "")
            if ref_norm == g_norm:
                return True
            # Substring : vérifier que le plus court est un mot complet
            # du plus long (évite "nmp" coincidental dans "constructionmpfinc")
            if not ref_all_generic and (ref_norm in g_norm or g_norm in ref_norm):
                shorter = min(ref_norm, g_norm, key=len)
                if len(shorter) >= 4:
                    return True
                longer_name = ref if len(ref_norm) > len(g_norm) else google_name
                longer_words = _normalize_for_compare(longer_name).split()
                if shorter in longer_words:
                    return True
            # Ou les initiales doivent matcher (ex: "HD" dans "ISOLATION HD")
            ref_initials = "".join(w[0] for w in _normalize_for_compare(ref).split() if w[0].isalpha())
            g_initials = "".join(w[0] for w in _normalize_for_compare(google_name).split() if w[0].isalpha())
            if ref_initials and g_initials and ref_initials == g_initials:
                return True
            continue

        common = g_words & r_words
        # Vérifier les mots non-matchés de la référence AVANT de valider
        # (ex: "Tirage de joints Laplante" vs "Plâtrage MC - Tirage de joints"
        #  partagent "tirage+joints" mais "Laplante" est non-matché → rejet)
        r_unmatched = r_words - common
        if r_unmatched and any(len(w) >= 3 for w in r_unmatched):
            # La référence a un identifiant non-matché (nom propre, abréviation)
            # → le match commun est probablement des mots de métier génériques
            continue
        if len(common) >= 2:
            return True
        # 1 seul mot significatif commun : vérifier aussi les mots bruts
        if len(common) == 1:
            g_raw = {w for w in _normalize_for_compare(google_name).split() if w not in _JUNK and len(w) >= 3}
            r_raw = {w for w in _normalize_for_compare(ref).split() if w not in _JUNK and len(w) >= 3}
            raw_common = g_raw & r_raw
            if len(raw_common) >= 2:
                return True
            # Si 1 seul mot brut commun mais c'est un nom propre distinctif
            if len(raw_common) == 1:
                word = next(iter(raw_common))
                if len(word) >= 5 and word not in _STOP_WORDS:
                        # Vérifier les initiales célibataires (ex: "C." vs "S." Lyonnais)
                    r_singles = {w for w in _normalize_for_compare(ref).split() if len(w) == 1 and w.isalpha()}
                    g_singles = {w for w in _normalize_for_compare(google_name).split() if len(w) == 1 and w.isalpha()}
                    if r_singles and g_singles and r_singles != g_singles:
                        continue
                    # Vérifier que Google n'a pas trop de mots non-partagés
                    # (ex: "Gélinas Ramonage" vs "Gélinas Construction")
                    g_sig_only = g_words - r_words
                    if len(g_sig_only) >= 3:
                        continue
                    # Si la référence n'a qu'1 mot significatif (ex: un nom de famille),
                    # 1 mot non-partagé côté Google suffit pour rejeter
                    # (ex: "Grenier Occasion" ≠ "Construction B. Grenier")
                    if len(r_words) == 1 and len(g_sig_only) >= 1:
                        continue
                    return True
    return False


def _short_name(nom: str) -> str:
    """Retire suffixes + préfixes descriptifs pour un nom ultra-court.
    ex: 'Construction Et Renovation M. Dubeau inc.' → 'M. Dubeau'
    """
    name = _clean_name(nom)
    return _PREFIX_RE.sub("", name).strip()


def _is_valid_qc_phone(phone: str) -> bool:
    """Vérifie qu'un numéro est un téléphone québécois valide (10 chiffres, code régional QC)."""
    digits = re.sub(r"\D", "", phone)
    if len(digits) != 10:
        return False
    return digits[:3] in _QC_AREA_CODES


_POSTAL_RE = re.compile(r"[A-Z]\d[A-Z]\s?\d[A-Z]\d", re.IGNORECASE)


def _extract_postal_code(address: str) -> str | None:
    """Extrait le code postal canadien d'une adresse (ex: 'G1R 2B5')."""
    m = _POSTAL_RE.search(address.upper())
    if m:
        pc = m.group()
        # Normaliser : toujours avec espace (ex: G1R 2B5)
        if " " not in pc:
            pc = pc[:3] + " " + pc[3:]
        return pc
    return None


def _extract_street_number(address: str) -> str | None:
    """Extrait le numéro civique du début d'une adresse (ex: '1234' dans '1234 Rue Saint-Laurent')."""
    m = re.match(r"(\d+)", address.strip())
    return m.group(1) if m else None


_CONSTRUCTION_TYPES = {
    "general_contractor", "roofing_contractor", "painter",
    "electrician", "plumber", "home_improvement_store",
    "construction_company", "building_contractor",
}


def _is_construction_type(primary_type: str | None) -> bool:
    """Vérifie si le primaryType Google correspond à la construction."""
    if not primary_type:
        return False
    return primary_type in _CONSTRUCTION_TYPES


@dataclass
class _MatchScore:
    place_id: str
    name: str
    total: float
    breakdown: dict


_MATCH_WEIGHTS = {
    "nom":        0.40,
    "ville":      0.25,
    "postal":     0.20,
    "type":       0.10,
    "numero_rue": 0.05,
}

def _score_candidate(
    reference_names: list[str],
    rbq_ville: str,
    rbq_postal: str | None,
    candidate: dict,
) -> _MatchScore:
    """
    Score un candidat Google Places sur 5 facteurs pondérés.
    Prend le meilleur score nom parmi tous les noms de référence.
    """
    gmb_name = candidate.get("name", "")
    gmb_address = candidate.get("formattedAddress", "").lower()
    gmb_primary_type = candidate.get("primaryType")
    place_id = candidate.get("id", "")

    scores = {}

    # ── 1. NOM (poids 40%) ──────────────────────────────────
    best_nom = 0.0
    for ref_name in reference_names:
        ref_norm = _normalize_for_compare(ref_name)
        gmb_norm = _normalize_for_compare(gmb_name)
        token_sort = fuzz.token_sort_ratio(ref_norm, gmb_norm) / 100
        partial = fuzz.partial_ratio(ref_norm, gmb_norm) / 100
        best_nom = max(best_nom, token_sort, partial)
    scores["nom"] = best_nom

    # ── 2. VILLE (poids 25%) ─────────────────────────────────
    rbq_ville_norm = _normalize_for_compare(rbq_ville)
    if rbq_ville_norm and rbq_ville_norm in _normalize_for_compare(gmb_address):
        scores["ville"] = 1.0
    elif rbq_ville_norm and fuzz.partial_ratio(rbq_ville_norm, _normalize_for_compare(gmb_address)) > 80:
        scores["ville"] = 0.5
    else:
        scores["ville"] = 0.0

    # ── 3. CODE POSTAL (poids 20%) ───────────────────────────
    gmb_postal = _extract_postal_code(gmb_address)
    if gmb_postal and rbq_postal:
        full_match = 0.6 if gmb_postal == rbq_postal else 0.0
        fsa_match = 0.4 if gmb_postal[:3] == rbq_postal[:3] else 0.0
        scores["postal"] = full_match + fsa_match
    else:
        scores["postal"] = 0.0

    # ── 4. TYPE D'ACTIVITÉ (poids 10%) ───────────────────────
    scores["type"] = 1.0 if _is_construction_type(gmb_primary_type) else 0.3

    # ── 5. NUMÉRO DE RUE (poids 5%) ──────────────────────────
    rbq_num = _extract_street_number(reference_names[0]) if reference_names else None
    gmb_num = _extract_street_number(gmb_address)
    scores["numero_rue"] = 1.0 if rbq_num and gmb_num and rbq_num == gmb_num else 0.0

    # ── SCORE PONDÉRÉ FINAL ──────────────────────────────────
    total = sum(scores[k] * _MATCH_WEIGHTS[k] for k in _MATCH_WEIGHTS)

    return _MatchScore(
        place_id=place_id,
        name=gmb_name,
        total=round(total, 3),
        breakdown=scores,
    )


async def search_place_by_phone(
    client: httpx.AsyncClient, phone: str,
) -> Optional[str]:
    """
    Recherche un lieu Google par numéro de téléphone (FindPlaceFromText).
    Retourne le placeId ou None. Quasi aucun faux positif.
    Utilise l'ancienne API Places (plus fiable pour les numéros de téléphone).
    """
    digits = re.sub(r"\D", "", phone)
    if len(digits) == 10:
        phone_e164 = f"+1{digits}"
    elif len(digits) == 11 and digits.startswith("1"):
        phone_e164 = f"+{digits}"
    else:
        return None

    print(f"Google: searching by phone {phone_e164}")
    resp = await client.get(
        f"{GOOGLE_MAPS_BASE}/findplacefromtext/json",
        params={
            "input": phone_e164,
            "inputtype": "phonenumber",
            "fields": "place_id,name,formatted_address",
            "key": settings.google_places_api_key,
        },
    )
    if resp.status_code != 200:
        print(f"Google: phone search HTTP {resp.status_code}")
        return None
    data = resp.json()
    candidates = data.get("candidates", [])
    if not candidates:
        print(f"Google: no results for phone {phone_e164}")
        return None
    place = candidates[0]
    place_id = place.get("place_id")
    name = place.get("name", "")
    print(f"Google: phone match → '{name}' (place_id={place_id})")
    return place_id


async def search_place_by_address(
    client: httpx.AsyncClient, adresse: str, nom: str,
    noms_commerciaux: list[str] | None = None,
) -> Optional[str]:
    """
    Recherche un lieu Google via adresse RBQ : géocodage → Nearby Search → fuzzy name match.
    Plus fiable que la recherche textuelle car ancré géographiquement.
    Retourne le placeId du meilleur match (score >= 65) ou None.
    """
    # 1. Géocoder l'adresse RBQ
    print(f"Google: geocoding '{adresse}'")
    geo_resp = await client.get(
        f"{GOOGLE_GEOCODE_BASE}/json",
        params={
            "address": adresse,
            "key": settings.google_places_api_key,
        },
    )
    if geo_resp.status_code != 200:
        print(f"Google: geocode HTTP {geo_resp.status_code}")
        return None
    geo_data = geo_resp.json()
    if not geo_data.get("results"):
        print(f"Google: geocode no results for '{adresse}'")
        return None

    location = geo_data["results"][0]["geometry"]["location"]
    lat, lng = location["lat"], location["lng"]

    # 2. Nearby Search dans un rayon serré (200m)
    # Utilise le nom court pour le keyword (mots clés)
    short = _short_name(nom)
    keyword = short if short and len(short.split()) >= 2 else _clean_name(nom)
    # Ne garder que les 2 premiers mots du keyword pour élargir
    keyword_parts = keyword.split()[:2]
    keyword = " ".join(keyword_parts)

    print(f"Google: nearby search at {lat},{lng} radius=200m keyword='{keyword}'")
    nearby_resp = await client.get(
        f"{GOOGLE_MAPS_BASE}/nearbysearch/json",
        params={
            "location": f"{lat},{lng}",
            "radius": 200,
            "keyword": keyword,
            "key": settings.google_places_api_key,
        },
    )
    if nearby_resp.status_code != 200:
        print(f"Google: nearby HTTP {nearby_resp.status_code}")
        return None
    nearby_data = nearby_resp.json()
    candidates = nearby_data.get("results", [])
    if not candidates:
        print(f"Google: nearby no results")
        return None

    # 3. Fuzzy match sur le nom
    reference_names = [nom]
    if noms_commerciaux:
        reference_names.extend(noms_commerciaux)

    best_place_id = None
    best_score = 0
    best_name = ""

    for candidate in candidates:
        g_name = candidate.get("name", "")
        for ref in reference_names:
            score = fuzz.token_sort_ratio(
                _normalize_for_compare(ref),
                _normalize_for_compare(g_name),
            )
            if score > best_score:
                best_score = score
                best_place_id = candidate.get("place_id")
                best_name = g_name

    print(f"Google: nearby best match '{best_name}' score={best_score}")
    if best_score >= 70:
        print(f"Google: address match → '{best_name}' (score={best_score})")
        return best_place_id

    print(f"Google: nearby score {best_score} < 70, rejected")
    return None


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
    if short and short != clean and short != nom and len(short.split()) >= 2:
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
    telephone: str | None = None, adresse: str | None = None,
) -> Optional[dict]:
    """
    Orchestre la recherche + détails pour un entrepreneur.
    Priorité : téléphone > adresse (géocodage+nearby) > recherche par nom.
    Retourne {"place_id": str, "rating": float, "nb_avis": int} ou None.
    """
    if not settings.google_places_api_key:
        return None

    # Noms à numéro (ex: "9388-3346 Québec inc.") — pas assez d'info pour matcher
    if _is_number_name(nom) and not noms_commerciaux:
        return None

    async with httpx.AsyncClient(timeout=10) as client:
        place_id = None

        # 1. Recherche par téléphone (priorité — quasi aucun faux positif)
        if telephone and _is_valid_qc_phone(telephone):
            place_id = await search_place_by_phone(client, telephone)

        # 2. Recherche par adresse (géocodage + nearby + fuzzy match)
        if not place_id and adresse:
            place_id = await search_place_by_address(
                client, adresse, nom, noms_commerciaux=noms_commerciaux,
            )

        # 3. Dernier recours : recherche par nom (text search)
        if not place_id:
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
        telephone=contractor.telephone,
        adresse=contractor.adresse,
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