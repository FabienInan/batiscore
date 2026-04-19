# Multi-Factor Scoring for Google Places Text Search

## Context

The text search (`search_place`) is the fallback after phone search and address search. It currently validates candidates with a binary `_name_matches` function (~100 lines) plus city matching, returning the first candidate that passes. This produces false negatives (good matches rejected by strict boolean logic) and doesn't compare candidates against each other.

## Architecture: Retrieve → Re-rank

Instead of binary accept/reject per candidate, retrieve up to N candidates per query, score each on multiple dimensions, and keep the best if it meets a threshold.

## Scope

- **Only `search_place`** (text search) — the fallback after phone and address search
- `search_place_by_phone` and `search_place_by_address` are **unchanged**

## Scorer: `_score_candidate`

```python
@dataclass
class MatchScore:
    place_id: str
    name: str
    total: float
    breakdown: dict
```

### Factors and Weights

| Factor | Weight | Logic |
|---|---|---|
| **Nom** | 40% | `max(token_sort_ratio, partial_ratio)` on normalized names (using `_normalize_for_compare`) |
| **Ville** | 25% | 1.0 if ville in address, 0.5 if `partial_ratio > 80`, else 0 |
| **Code postal** | 20% | Full match = 0.6, FSA (first 3 chars) match = 0.4, absence = 0 |
| **Type activité** | 10% | `primaryType` is construction-related = 1.0, else 0.3 |
| **Numéro rue** | 5% | Exact match = 1.0, else 0 |

### Threshold

Score global ≥ **0.75** to accept a match.

### N candidates

Up to **10** candidates per Google Text Search query.

## Changes to `search_place`

- Add `places.primaryType` to the fieldMask
- For each query, score all candidates with `_score_candidate`
- Track the best score across all queries
- Return the place_id of the best candidate if total ≥ 0.75, else None
- Log the breakdown for debugging

## Deletions

- `_name_matches` function — fully replaced by the scorer's name factor

## Preserved

- `_normalize_for_compare` — reused by the scorer
- `_significant_words` — still used by name normalization
- `_clean_name` — still used for query construction
- `_short_name` — still used for query construction
- `_is_number_name` — still used as pre-filter
- `_is_valid_qc_phone` — unchanged
- `search_place_by_phone` — unchanged
- `search_place_by_address` — unchanged
- `get_place_details` — unchanged
- `fetch_google_reviews` — unchanged
- `get_google_reviews_for_contractor` — unchanged

## New Helpers

- `_score_candidate(rbq_name, rbq_ville, rbq_postal, candidate) -> MatchScore` — the multi-factor scorer
- `_extract_postal_code(address: str) -> str | None` — extract Canadian postal code from address
- `_extract_street_number(address: str) -> str | None` — extract street number from address
- `_is_construction_type(primary_type: str | None) -> bool` — check if primaryType is construction-related

## Execution Priority

1. Phone search — unchanged
2. Address search — unchanged
3. Text search — **now uses multi-factor scoring**