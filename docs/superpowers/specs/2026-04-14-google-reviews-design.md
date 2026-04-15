# Google Reviews Integration — Design Spec

**Date:** 2026-04-14
**Status:** Approved

## Goal

Display Google Reviews rating alongside the Batiscore score in the contractor report. Google data is a **complementary signal** — it never affects the Batiscore score, which remains based solely on official government data.

## Architecture

**Approach: On-demand with 7-day cache** (same pattern as existing OPC cache).

When a report is requested:
1. Check `google_reviews_cache` for the contractor
2. If cache is fresh (< 7 days) → return cached data
3. If expired or missing → call Google Places API → store in cache → return
4. If no match or API failure → silent (no `google_reviews` field in response)

## Backend Changes

### New model: `GoogleReviewsCache`

Table `google_reviews_cache` in `models.py`:

| Column | Type | Notes |
|---|---|---|
| `contractor_id` | Integer, FK, unique | 1:1 with contractor |
| `place_id` | String(200) | Google Place ID for re-fetches |
| `rating` | Float | Average rating 1.0–5.0 |
| `nb_avis` | Integer | Review count |
| `fetched_at` | DateTime | For TTL |

No individual reviews stored — only aggregate rating and count.

### New module: `ingestion/sources/google_places.py`

Two sequential API calls using Google Places API (New):

1. **Text Search**: `POST https://places.googleapis.com/v1/places:searchText`
   - Body: `{ textQuery: "{nom_legal} {ville}" }`
   - Header: `X-Goog-Api-Key`
   - Field mask: `places.id,places.displayName`
   - Returns first result's `placeId`

2. **Place Details**: `GET https://places.googleapis.com/v1/places/{placeId}`
   - Header: `X-Goog-Api-Key`
   - Field mask: `rating,userRatingCount`
   - Returns `rating` (float) and `userRatingCount` (int)

Error handling: timeout 10s, silent on failure (return None).

Config: new `google_places_api_key` in `settings` / `.env`.

### Report route integration: `api/routes/report.py`

After the OPC fetch block, add a Google Reviews fetch block with the same pattern:

- Query `google_reviews_cache` for this contractor
- If `fetched_at` is within 7 days → use cache
- Otherwise → call `google_places.py` → upsert cache → return
- On failure or no match → skip silently

New optional field in report response:

```json
{
  "google_reviews": {
    "rating": 4.2,
    "nb_avis": 47
  }
}
```

Field is **absent** (not null) when no Google data is available.

### Database migration

Add `google_reviews_cache` table via `init_db.py` or Alembic. Table is created by `Base.metadata.create_all` on app startup (existing pattern).

## Frontend Changes

### Report page: `app/rapport/[id]/page.tsx`

Add `google_reviews` to the `Report` interface:

```typescript
google_reviews?: {
  rating: number;
  nb_avis: number;
};
```

Display a Google Reviews card in the hero section, next to the Batiscore score card:

- Only rendered when `google_reviews` is present
- Shows star rating (filled/empty stars based on rating), numeric rating, and review count
- Same dark card style as the score card
- Layout: score card on left, Google card on right (flex row, wraps on mobile)

### Entrepreneur page: `app/entrepreneur/[id]/page.tsx`

No changes — the entrepreneur page is a lightweight summary. Google Reviews only shown on the full report.

## API Cost Estimation

- Google Places API (New): $17/1000 calls (Text Search + Place Details = 2 calls per contractor)
- Free tier: $200/month credit = ~5,900 contractor lookups/month
- With 7-day cache: only first view triggers API calls. Repeat views are free.
- For a site with ~1,000 unique contractor views/week: ~2,000 API calls/week ≈ $34/month — within free tier

## Scoring Impact

**None.** Google Reviews are displayed only. The Batiscore score calculation in `scoring/engine.py` is unchanged.

## Edge Cases

| Case | Behavior |
|---|---|
| No Google match for contractor | `google_reviews` field absent from response, report renders normally |
| API timeout or error | Silent fallback, no cache written |
| Rating is 0 or null from Google | Store as-is, frontend shows 0 stars |
| Contractor name changes | Cache still serves old data until 7-day TTL expires, then re-fetches |
| Google API key not configured | Skip entire Google block (same as missing key for CanLII) |