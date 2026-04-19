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
    rbq_adresse: str | None = None,
) -> _MatchScore:
    """
    Score un candidat Google Places sur 5 facteurs pondérés.
    Prend le meilleur score nom parmi tous les noms de référence.
    """
    gmb_name = candidate.get("name", "")
    gmb_address = candidate.get("formattedAddress", "")
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
    gmb_addr_norm = _normalize_for_compare(gmb_address)
    if rbq_ville_norm and rbq_ville_norm in gmb_addr_norm:
        scores["ville"] = 1.0
    elif rbq_ville_norm and fuzz.partial_ratio(rbq_ville_norm, gmb_addr_norm) > 80:
        scores["ville"] = 0.5
    else:
        scores["ville"] = 0.0

    # ── 3. CODE POSTAL (poids 20%) ───────────────────────────
    gmb_postal = _extract_postal_code(gmb_address)
    # Normaliser rbq_postal au même format (ex: "G1R2B5" → "G1R 2B5")
    rbq_postal_norm = _extract_postal_code(rbq_postal) if rbq_postal else None
    if gmb_postal and rbq_postal_norm:
        full_match = 0.6 if gmb_postal == rbq_postal_norm else 0.0
        fsa_match = 0.4 if gmb_postal[:3] == rbq_postal_norm[:3] else 0.0
        scores["postal"] = full_match + fsa_match
    else:
        scores["postal"] = 0.0

    # ── 4. TYPE D'ACTIVITÉ (poids 10%) ───────────────────────
    scores["type"] = 1.0 if _is_construction_type(gmb_primary_type) else 0.3

    # ── 5. NUMÉRO DE RUE (poids 5%) ──────────────────────────
    rbq_num = _extract_street_number(rbq_adresse) if rbq_adresse else None
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
    reference_names: list[str] | None = None,
) -> Optional[str]:
    """
    Recherche un lieu Google par numéro de téléphone (FindPlaceFromText).
    Valide le nom du résultat vs les noms de référence pour éviter les faux positifs.
    Le téléphone est une preuve forte d'identité — on rejette juste les noms
    sans rapport (token_sort_ratio < 0.45 vs noms de référence).
    Retourne le placeId ou None.
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
            "fields": "place_id,name",
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

    # Valider le nom si des noms de référence sont fournis
    if reference_names:
        # Ajouter le nom court aux références pour attraper les cas
        # comme "Entreprises de construction Dawco" → "DAWCO"
        all_refs = list(reference_names)
        for ref in reference_names:
            short = _short_name(ref)
            if short and short != ref:
                all_refs.append(short)

        g_norm = _normalize_for_compare(name)

        # Comparaison 1: noms complets normalisés (garde les initiales comme "E.G.")
        best_max = 0.0
        best_ts = 0.0
        best_pr = 0.0
        for ref in all_refs:
            r_norm = _normalize_for_compare(ref)
            ts = fuzz.token_sort_ratio(r_norm, g_norm) / 100
            pr = fuzz.partial_ratio(r_norm, g_norm) / 100
            best_max = max(best_max, ts, pr)
            best_ts = max(best_ts, ts)
            best_pr = max(best_pr, pr)

        # Comparaison 2: mots significatifs uniquement (filtre le bruit type "inc", "g", "s")
        g_sig = " ".join(sorted(_significant_words(name)))
        sig_best_max = 0.0
        if g_sig:
            for ref in all_refs:
                r_sig = " ".join(sorted(_significant_words(ref)))
                if r_sig:
                    ts2 = fuzz.token_sort_ratio(r_sig, g_sig) / 100
                    pr2 = fuzz.partial_ratio(r_sig, g_sig) / 100
                    sig_best_max = max(sig_best_max, ts2, pr2)

        # Le téléphone est une preuve forte — on rejette juste les noms sans rapport.
        # On accepte si l'une des deux comparaisons passe le seuil :
        # - Comparaison complète : max(token_sort, partial) ≥ 0.60, avec token_sort ≥ 0.45
        #   si le nom Google est court (≤ 2 mots significatifs). Exception pr ≥ 0.90.
        # - Comparaison significative : max ≥ 0.60 (mots clés seulement, moins de bruit).
        g_sig_words = [w for w in g_norm.split() if len(w) >= 3 and w not in _STOP_WORDS]
        short_name_check = len(g_sig_words) <= 2
        full_pass = best_max >= 0.60 and (not short_name_check or best_ts >= 0.45 or best_pr >= 0.90)
        sig_pass = sig_best_max >= 0.60
        rejected = not full_pass and not sig_pass

        if rejected:
            print(f"Google: phone match '{name}' REJECTED nom_max={best_max:.3f} sig_max={sig_best_max:.3f}")
            return None
        print(f"Google: phone match → '{name}' (nom_max={best_max:.3f} sig_max={sig_best_max:.3f})")
    else:
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
    code_postal: str | None = None,
    adresse: str | None = None,
) -> Optional[str]:
    """
    Recherche un lieu sur Google Places par nom + ville.
    Essaie plusieurs variantes du nom, du plus spécifique au plus court.
    Score chaque candidat sur 5 facteurs, garde le meilleur si score ≥ 0.75.
    Retourne le placeId du meilleur match, ou None.
    """
    clean = _clean_name(nom)
    short = _short_name(nom)

    # Noms de référence pour scoring
    reference_names = [nom]
    if noms_commerciaux:
        reference_names.extend(noms_commerciaux)

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

    best_match: _MatchScore | None = None

    for query in queries:
        print(f"Google: searching '{query}'")
        resp = await client.post(
            f"{GOOGLE_PLACES_BASE}/places:searchText",
            headers={
                "X-Goog-Api-Key": settings.google_places_api_key,
                "Content-Type": "application/json",
                "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.primaryType",
            },
            json={"textQuery": query},
        )
        if resp.status_code != 200:
            print(f"Google: HTTP {resp.status_code}")
            continue
        places = resp.json().get("places", [])
        for place in places:
            candidate = {
                "id": place.get("id", ""),
                "name": place.get("displayName", {}).get("text", ""),
                "formattedAddress": place.get("formattedAddress", ""),
                "primaryType": place.get("primaryType"),
            }
            score = _score_candidate(reference_names, ville, code_postal, candidate, rbq_adresse=adresse)
            print(f"Google: candidate '{candidate['name']}' score={score.total} {score.breakdown}")
            if best_match is None or score.total > best_match.total:
                best_match = score

    if best_match and best_match.total >= 0.75:
        print(f"Google: best match '{best_match.name}' score={best_match.total} (threshold=0.75)")
        return best_match.place_id

    if best_match:
        print(f"Google: best score {best_match.total} < 0.75, rejected")
    else:
        print("Google: no candidates found")
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
    code_postal: str | None = None,
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
            reference_names = [nom]
            if noms_commerciaux:
                reference_names.extend(noms_commerciaux)
            place_id = await search_place_by_phone(
                client, telephone,
                reference_names=reference_names,
            )

        # 2. Recherche par adresse (géocodage + nearby + fuzzy match)
        if not place_id and adresse:
            place_id = await search_place_by_address(
                client, adresse, nom, noms_commerciaux=noms_commerciaux,
            )

        # 3. Dernier recours : recherche par nom (text search)
        if not place_id:
            place_id = await search_place(client, nom, ville, noms_commerciaux=noms_commerciaux, code_postal=code_postal, adresse=adresse)

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
        code_postal=contractor.code_postal,
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