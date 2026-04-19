# Multi-Factor Scoring for Google Places Text Search

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the binary `_name_matches` validation in `search_place` with a multi-factor scorer that evaluates candidates on name, city, postal code, activity type, and street number, keeping the best candidate if its score ≥ 0.75.

**Architecture:** Retrieve → Re-rank. The text search fetches up to 10 candidates per query, scores each on 5 weighted factors, and keeps the best across all queries if it meets the threshold. Phone and address search remain unchanged.

**Tech Stack:** Python 3.14, rapidfuzz (fuzz.token_sort_ratio, fuzz.partial_ratio), httpx, Google Places API (New)

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `backend/ingestion/sources/google_places.py` | Modify | Add `_MatchScore`, `_extract_postal_code`, `_extract_street_number`, `_is_construction_type`, `_score_candidate`; rewrite `search_place`; delete `_name_matches` |

No new files. No tests directory exists yet — this plan focuses on the production code change.

---

### Task 1: Add helper functions for postal code and street number extraction

**Files:**
- Modify: `backend/ingestion/sources/google_places.py` (after `_is_valid_qc_phone`, ~line 233)

- [ ] **Step 1: Add `_extract_postal_code`**

Insert after `_is_valid_qc_phone` (line 233):

```python
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
```

- [ ] **Step 2: Add `_extract_street_number`**

Insert after `_extract_postal_code`:

```python
def _extract_street_number(address: str) -> str | None:
    """Extrait le numéro civique du début d'une adresse (ex: '1234' dans '1234 Rue Saint-Laurent')."""
    m = re.match(r"(\d+)", address.strip())
    return m.group(1) if m else None
```

- [ ] **Step 3: Add `_is_construction_type`**

Insert after `_extract_street_number`:

```python
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
```

- [ ] **Step 4: Verify syntax**

Run: `python3 -c "import ast; ast.parse(open('backend/ingestion/sources/google_places.py').read()); print('OK')"`
Expected: OK

- [ ] **Step 5: Commit**

```bash
git add backend/ingestion/sources/google_places.py
git commit -m "feat: add postal code, street number, and construction type helpers for scorer"
```

---

### Task 2: Add `_MatchScore` dataclass and `_score_candidate` function

**Files:**
- Modify: `backend/ingestion/sources/google_places.py` (after helpers from Task 1)

- [ ] **Step 1: Add `_MatchScore` dataclass**

Insert at the top of the file, after the imports (~line 14), add `from dataclasses import dataclass` to imports. Then after the helpers from Task 1:

```python
@dataclass
class _MatchScore:
    place_id: str
    name: str
    total: float
    breakdown: dict
```

- [ ] **Step 2: Add `_score_candidate` function**

Insert after `_MatchScore`:

```python
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
```

- [ ] **Step 3: Verify syntax**

Run: `python3 -c "import ast; ast.parse(open('backend/ingestion/sources/google_places.py').read()); print('OK')"`
Expected: OK

- [ ] **Step 4: Commit**

```bash
git add backend/ingestion/sources/google_places.py
git commit -m "feat: add multi-factor scorer _score_candidate for Google Places text search"
```

---

### Task 3: Rewrite `search_place` to use the scorer

**Files:**
- Modify: `backend/ingestion/sources/google_places.py` (function `search_place`, ~lines 362-429)

- [ ] **Step 1: Rewrite `search_place`**

Replace the entire `search_place` function with:

```python
async def search_place(
    client: httpx.AsyncClient, nom: str, ville: str,
    noms_commerciaux: list[str] | None = None,
    code_postal: str | None = None,
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
            score = _score_candidate(reference_names, ville, code_postal, candidate)
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
```

- [ ] **Step 2: Update the call site in `fetch_google_reviews`**

In `fetch_google_reviews` (~line 487), the call to `search_place` now needs `code_postal`. Update:

```python
place_id = await search_place(client, nom, ville, noms_commerciaux=noms_commerciaux, code_postal=code_postal)
```

And add the `code_postal` parameter to `fetch_google_reviews` signature (~line 457):

```python
async def fetch_google_reviews(
    nom: str, ville: str, noms_commerciaux: list[str] | None = None,
    telephone: str | None = None, adresse: str | None = None,
    code_postal: str | None = None,
) -> Optional[dict]:
```

And in `get_google_reviews_for_contractor` (~line 534), pass `code_postal`:

```python
data = await fetch_google_reviews(
    contractor.nom_legal, contractor.ville or "",
    noms_commerciaux=contractor.noms_secondaires,
    telephone=contractor.telephone,
    adresse=contractor.adresse,
    code_postal=contractor.code_postal,
)
```

- [ ] **Step 3: Verify syntax**

Run: `python3 -c "import ast; ast.parse(open('backend/ingestion/sources/google_places.py').read()); print('OK')"`
Expected: OK

- [ ] **Step 4: Commit**

```bash
git add backend/ingestion/sources/google_places.py
git commit -m "feat: rewrite search_place with multi-factor scoring, pass code_postal through call chain"
```

---

### Task 4: Delete `_name_matches` function

**Files:**
- Modify: `backend/ingestion/sources/google_places.py` (delete `_name_matches`, ~lines 114-216)

- [ ] **Step 1: Delete `_name_matches` function**

Delete the entire `_name_matches` function (lines 114-216). Also delete the local `_JUNK` set defined inside it (lines 119-138) since it's no longer used — the global `_STOP_WORDS` serves that purpose for the remaining code.

- [ ] **Step 2: Verify no remaining references to `_name_matches`**

Run: `grep -n '_name_matches' backend/ingestion/sources/google_places.py`
Expected: No output (no references)

- [ ] **Step 3: Verify syntax**

Run: `python3 -c "import ast; ast.parse(open('backend/ingestion/sources/google_places.py').read()); print('OK')"`
Expected: OK

- [ ] **Step 4: Commit**

```bash
git add backend/ingestion/sources/google_places.py
git commit -m "refactor: remove _name_matches replaced by multi-factor scorer"
```

---

### Task 5: Add `rapidfuzz` to requirements.txt

**Files:**
- Modify: `backend/requirements.txt`

- [ ] **Step 1: Add rapidfuzz to requirements**

Add `rapidfuzz>=3.0.0` to `backend/requirements.txt` (alphabetical order, after `pydantic-settings`):

```
rapidfuzz>=3.0.0
```

- [ ] **Step 2: Commit**

```bash
git add backend/requirements.txt
git commit -m "chore: add rapidfuzz to requirements.txt"
```

---

### Task 6: End-to-end smoke test

**Files:**
- No file changes — verification only

- [ ] **Step 1: Verify the full module imports cleanly**

Run: `cd backend && python3 -c "from ingestion.sources.google_places import search_place, _score_candidate, _MatchScore; print('Import OK')"`
Expected: Import OK

- [ ] **Step 2: Test `_score_candidate` with a known-good match**

Run:
```bash
cd backend && python3 -c "
from ingestion.sources.google_places import _score_candidate
score = _score_candidate(
    reference_names=['Construction Tremblay & Fils Inc.'],
    rbq_ville='Québec',
    rbq_postal='G1R 2B5',
    candidate={
        'id': 'test123',
        'name': 'Tremblay & Fils Construction',
        'formattedAddress': '1234 Rue Saint-Jean, Québec, QC G1R 2B5',
        'primaryType': 'general_contractor',
    },
)
print(f'Score: {score.total} Breakdown: {score.breakdown}')
assert score.total >= 0.75, f'Expected >= 0.75, got {score.total}'
print('PASS: good match accepted')
"
```
Expected: Score ≥ 0.75, PASS

- [ ] **Step 3: Test `_score_candidate` with a clear mismatch**

Run:
```bash
cd backend && python3 -c "
from ingestion.sources.google_places import _score_candidate
score = _score_candidate(
    reference_names=['Plomberie Gagnon Inc.'],
    rbq_ville='Sherbrooke',
    rbq_postal='J1H 1A1',
    candidate={
        'id': 'test456',
        'name': 'Restaurant Paris',
        'formattedAddress': '500 Rue Main, Montréal, QC H2X 1A1',
        'primaryType': 'restaurant',
    },
)
print(f'Score: {score.total} Breakdown: {score.breakdown}')
assert score.total < 0.75, f'Expected < 0.75, got {score.total}'
print('PASS: bad match rejected')
"
```
Expected: Score < 0.75, PASS