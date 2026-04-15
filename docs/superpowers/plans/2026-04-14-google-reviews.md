# Google Reviews Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display Google Reviews rating and count alongside the Batiscore score in the contractor report, fetched on-demand with a 7-day cache.

**Architecture:** On-demand fetch with DB cache (same pattern as OPC). New `GoogleReviewsCache` model, new `google_places.py` API module, integration into existing report route, and a Google Reviews card in the frontend report hero section.

**Tech Stack:** Python/FastAPI (backend), Google Places API (New), SQLAlchemy (async), Next.js/React (frontend), Tailwind CSS

---

### Task 1: Add GoogleReviewsCache model

**Files:**
- Modify: `backend/models.py`

- [ ] **Step 1: Add the GoogleReviewsCache model after OPCCache**

```python
class GoogleReviewsCache(Base):
    __tablename__ = "google_reviews_cache"

    contractor_id = Column(Integer, ForeignKey("contractors.id"), primary_key=True)
    place_id = Column(String(200), nullable=True)
    rating = Column(Float, nullable=True)
    nb_avis = Column(Integer, nullable=True)
    fetched_at = Column(DateTime, default=datetime.utcnow)
```

- [ ] **Step 2: Add `Float` to the SQLAlchemy import line**

Change the import line at the top of `models.py` from:

```python
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Numeric, ARRAY, ForeignKey
```

to:

```python
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Numeric, Float, ARRAY, ForeignKey
```

- [ ] **Step 3: Verify the model loads**

Run: `cd /Users/fabien/Documents/projets/entrepreneur-checker/backend && python -c "from models import GoogleReviewsCache; print(GoogleReviewsCache.__tablename__)"`

Expected: `google_reviews_cache`

- [ ] **Step 4: Commit**

```bash
git add backend/models.py
git commit -m "feat: add GoogleReviewsCache model for Google Places caching"
```

---

### Task 2: Add google_places_api_key to config

**Files:**
- Modify: `backend/config.py`

- [ ] **Step 1: Add the setting**

After the CanLII API key line (`canlii_api_key: str = ""`), add:

```python
    # Google Places API
    google_places_api_key: str = ""
```

- [ ] **Step 2: Verify the config loads**

Run: `cd /Users/fabien/Documents/projets/entrepreneur-checker/backend && python -c "from config import settings; print('google_places_api_key:', repr(settings.google_places_api_key))"`

Expected: `google_places_api_key: ''`

- [ ] **Step 3: Commit**

```bash
git add backend/config.py
git commit -m "feat: add google_places_api_key to settings"
```

---

### Task 3: Create google_places.py module

**Files:**
- Create: `backend/ingestion/sources/google_places.py`

This module has two functions: `search_place()` to find the Place ID, and `fetch_google_reviews()` which orchestrates search + details and returns rating + nb_avis.

- [ ] **Step 1: Create the module**

```python
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
```

- [ ] **Step 2: Verify the module loads**

Run: `cd /Users/fabien/Documents/projets/entrepreneur-checker/backend && python -c "from ingestion.sources.google_places import fetch_google_reviews; print('module loaded')"`

Expected: `module loaded`

- [ ] **Step 3: Commit**

```bash
git add backend/ingestion/sources/google_places.py
git commit -m "feat: add google_places.py module for Places API (New)"
```

---

### Task 4: Create get_google_reviews_for_contractor function

**Files:**
- Modify: `backend/ingestion/sources/google_places.py`

This function follows the exact same pattern as `get_opc_plaintes_for_contractor` — check cache, fetch if expired, upsert.

- [ ] **Step 1: Add imports and cache function at the end of google_places.py**

Add these imports at the top (after existing imports):

```python
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import Contractor, GoogleReviewsCache
```

Then add this function at the end of the file:

```python
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
```

- [ ] **Step 2: Verify the function loads**

Run: `cd /Users/fabien/Documents/projets/entrepreneur-checker/backend && python -c "from ingestion.sources.google_places import get_google_reviews_for_contractor; print('function loaded')"`

Expected: `function loaded`

- [ ] **Step 3: Commit**

```bash
git add backend/ingestion/sources/google_places.py
git commit -m "feat: add get_google_reviews_for_contractor with 7-day cache"
```

---

### Task 5: Integrate Google Reviews into report route

**Files:**
- Modify: `backend/api/routes/report.py`

- [ ] **Step 1: Add import**

After the existing CanLII import line:

```python
from ingestion.sources.canlii import get_litiges_for_contractor
```

Add:

```python
from ingestion.sources.google_places import get_google_reviews_for_contractor
```

- [ ] **Step 2: Add Google Reviews fetch block in get_report()**

After the CanLII block (after line 70: `litiges = []`), add:

```python
    # Récupérer les avis Google (on-demand avec cache 7j)
    google_reviews = None
    try:
        google_reviews = await get_google_reviews_for_contractor(contractor_id, db)
    except Exception as e:
        print(f"Google: Échec silencieux pour contractor {contractor_id}: {e}")
        await db.rollback()
```

- [ ] **Step 3: Add google_reviews to the response dict**

After the `"contrats_publics"` section in the return dict (around line 141), add:

```python
        **({"google_reviews": google_reviews} if google_reviews else {}),
```

The full return block becomes:

```python
    return {
        "contractor": { ... },
        "events": [ ... ],
        "litiges": [ ... ],
        "contrats_publics": [ ... ],
        **({"google_reviews": google_reviews} if google_reviews else {}),
    }
```

- [ ] **Step 4: Verify the route still loads**

Run: `cd /Users/fabien/Documents/projets/entrepreneur-checker/backend && python -c "from api.routes.report import router; print('report route loaded')"`

Expected: `report route loaded`

- [ ] **Step 5: Commit**

```bash
git add backend/api/routes/report.py
git commit -m "feat: integrate Google Reviews into report endpoint"
```

---

### Task 6: Add Google Reviews card to frontend report page

**Files:**
- Modify: `frontend/app/rapport/[id]/page.tsx`

- [ ] **Step 1: Add google_reviews to the Report interface**

After the `contrats_publics` array in the `Report` interface (around line 95), add:

```typescript
  google_reviews?: {
    rating: number
    nb_avis: number
  }
```

- [ ] **Step 2: Add Star icon import**

Add `Star` to the lucide-react import list:

```typescript
import {
  MapPin,
  Phone,
  Calendar,
  Printer,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
  Award,
  Network,
  TriangleAlert,
  ArrowLeft,
  Building2,
  Star,
} from 'lucide-react'
```

- [ ] **Step 3: Add the Google Reviews card next to the Score card**

In the hero section, replace the existing score card div (lines 218-224) with a flex container that holds both cards. Replace:

```tsx
            <div className={`flex flex-col items-center p-5 rounded-2xl border self-start min-w-[8rem] ${getScoreBg(c.score)}`}>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score</div>
              <div className={`text-4xl font-black ${getScoreColor(c.score)}`}>
                {c.score ?? '?'}
              </div>
              <div className="text-[10px] font-medium text-slate-500 mt-1">{c.score_label}</div>
            </div>
```

with:

```tsx
            <div className="flex flex-col sm:flex-row gap-3 self-start">
              <div className={`flex flex-col items-center p-5 rounded-2xl border min-w-[8rem] ${getScoreBg(c.score)}`}>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score</div>
                <div className={`text-4xl font-black ${getScoreColor(c.score)}`}>
                  {c.score ?? '?'}
                </div>
                <div className="text-[10px] font-medium text-slate-500 mt-1">{c.score_label}</div>
              </div>
              {report.google_reviews && (
                <div className="flex flex-col items-center p-5 rounded-2xl border min-w-[8rem] bg-slate-800 border-slate-700">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Google</div>
                  <div className="flex items-center gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= Math.round(report.google_reviews!.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
                      />
                    ))}
                  </div>
                  <div className="text-sm font-bold text-white">{report.google_reviews.rating.toFixed(1)}</div>
                  <div className="text-[10px] font-medium text-slate-500 mt-0.5">{report.google_reviews.nb_avis} avis</div>
                </div>
              )}
            </div>
```

- [ ] **Step 4: Verify the frontend builds**

Run: `cd /Users/fabien/Documents/projets/entrepreneur-checker/frontend && npx next build 2>&1 | tail -5`

Expected: Build completes without errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/app/rapport/[id]/page.tsx
git commit -m "feat: add Google Reviews card to report page hero section"
```

---

### Task 7: Add GOOGLE_PLACES_API_KEY to .env.example

**Files:**
- Modify: `.env.example` (or `.env` if no example file exists)

- [ ] **Step 1: Check if .env.example exists, add the key**

Run: `ls /Users/fabien/Documents/projets/entrepreneur-checker/.env*`

If `.env.example` exists, add after the CanLII line:

```
# Google Places API
GOOGLE_PLACES_API_KEY=
```

If only `.env` exists, add the same line there.

- [ ] **Step 2: Commit**

```bash
git add .env.example  # or .env
git commit -m "feat: add GOOGLE_PLACES_API_KEY to env template"
```

---

### Task 8: Create the database table and end-to-end verification

**Files:**
- No new files

- [ ] **Step 1: Create the table via SQLAlchemy**

The app creates all tables on startup via `Base.metadata.create_all`. Run the app briefly:

```bash
cd /Users/fabien/Documents/projets/entrepreneur-checker/backend && python -c "
import asyncio
from database import engine, Base
from models import GoogleReviewsCache

async def create():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print('Table google_reviews_cache created')

asyncio.run(create())
"
```

- [ ] **Step 2: Verify the table exists**

```bash
cd /Users/fabien/Documents/projets/entrepreneur-checker/backend && python -c "
import asyncio
from database import engine
from sqlalchemy import text

async def check():
    async with engine.connect() as conn:
        result = await conn.execute(text(\"SELECT column_name FROM information_schema.columns WHERE table_name='google_reviews_cache' ORDER BY ordinal_position\"))
        cols = [r[0] for r in result]
        print('Columns:', cols)

asyncio.run(check())
"
```

Expected: `Columns: ['contractor_id', 'place_id', 'rating', 'nb_avis', 'fetched_at']`

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Google Reviews integration — model, API, cache, frontend card"
```