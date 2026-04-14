# Architecture — Vérification Entrepreneur RBQ

> Application de vérification d'entrepreneurs en construction au Québec.  
> Sources de données 100% publiques/gratuites.  
> Stack : Python/FastAPI (backend) + Next.js (frontend) + PostgreSQL.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Sources de données](#2-sources-de-données)
3. [Modèle de données](#3-modèle-de-données)
4. [Pipeline d'ingestion](#4-pipeline-dingestion)
5. [Scoring engine](#5-scoring-engine)
6. [API REST](#6-api-rest)
7. [Frontend](#7-frontend)
8. [Infrastructure](#8-infrastructure)
9. [Roadmap](#9-roadmap)

---

## 1. Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Sources publiques                           │
│  RBQ JSON   REQ ZIP   RBQ PDFs   SEAO JSON   CNESST   OPC   CanLII │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ ingestion (Python)
┌──────────────────────────▼──────────────────────────────────────────┐
│                        PostgreSQL + pg_trgm                         │
│     contractors · rbq_events · opc_plaintes · litiges               │
│     seao_contracts · opc_cache · reports                            │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│              Scoring Engine (Python) → score 0–100                  │
│              + score_breakdown (facteurs détaillés)                 │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                   FastAPI — API REST                                 │
│        /api/search   /api/report/{id}   /api/webhook                │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   Next.js frontend      │
              │  /recherche  /rapport   │
              └─────────────────────────┘
```

---

## 2. Sources de données

> **Note :** `donneesquebec.ca` a expiré en avril 2026. Les fichiers JSON/ZIP doivent être
> téléchargés manuellement depuis les miroirs gouvernementaux ou la Wayback Machine et
> placés dans `backend/data/`.

---

### 2.1 RBQ — Licences actives ✅ Implémenté

| Attribut | Valeur |
|---|---|
| Fichier local | `backend/data/rbq.json` (83 MB) |
| Miroir | `ouvert.canada.ca/data/fr/dataset/755b45d6-7aee-46df-a216-748a0191c79f` |
| Format | JSON (OCDS-like) |
| Fréquence pull | Mensuel |
| Code | `backend/ingestion/sources/rbq.py` |

**Champs extraits :**
- Numéro de licence (`licence_rbq`)
- Nom + NEQ (`nom_legal`, `neq`)
- Adresse, ville, téléphone
- Statut (`valide` / `suspendu` / `annulé` / `révoqué`)
- Catégories de licence (tableau)
- Date de délivrance → `date_fondation` (si REQ absent)
- Noms secondaires (`Autre nom`)

**Scheduler :** Quotidien à 3h00.

---

### 2.2 REQ — Registre des entreprises ✅ Implémenté

| Attribut | Valeur |
|---|---|
| Fichier local | `backend/data/req.zip` (245 MB) |
| Source | `registreentreprises.gouv.qc.ca/.../PageDonneesOuvertes.aspx` |
| Wayback Machine | `web.archive.org/web/2025*/donneesquebec.ca/recherche/fr/dataset/registre-des-entreprises` |
| Format | ZIP contenant `Entreprise.csv` + `Nom.csv` |
| Fréquence pull | Mensuel |
| Code | `backend/ingestion/sources/req.py` |

**Champs extraits :**
- NEQ (clé de jointure avec RBQ)
- Statut (`actif` / `radié` / `en_liquidation` / `faillite`)
- Date de fondation (prioritaire sur RBQ)
- Noms secondaires (depuis `Nom.csv`)
- Indicateur faillite (`IND_FAIL`)

**Scheduler :** Quotidien à 4h00.

---

### 2.3 RBQ Décisions — Bureau des régisseurs ✅ Implémenté

| Attribut | Valeur |
|---|---|
| URL | `rbq.gouv.qc.ca/audience-et-decisions/decisions-des-regisseurs/` |
| Méthode | Scraping HTML + parsing PDF |
| Fenêtre | 60 derniers jours |
| Code | `backend/ingestion/sources/rbq_decisions.py` |

**Types d'événements générés (`rbq_events`) :**
- `decision_annulation` (-35 pts)
- `decision_suspension` (-20 pts)
- `decision_condition` (-8 pts)
- `decision_regisseurs` (-12 pts)

---

### 2.4 RBQ PDFs — Réclamations cautionnement ✅ Implémenté

| Attribut | Valeur |
|---|---|
| Fichiers | `data/reclamations-en-cours.pdf` + `data/tableau-indemnites-versees.pdf` |
| Mise à jour | Manuelle mensuelle (rbq.gouv.qc.ca) |
| Code | `backend/ingestion/sources/rbq_pdf.py` |

**Données extraites :**
- Réclamations en cours par numéro de licence
- Indemnités versées : nombre + montant (format français `37 548,97 $`)

**Résultats ingérés :** 120 réclamations parsées, 359 indemnités parsées → 55 événements matchés en base.

**Matching :** Par `licence_rbq` (direct, sans fuzzy).

**Déduplication :** Par `(contractor_id, source, description)` — permet plusieurs événements par source si les descriptions diffèrent.

**Note technique :** Le regex de licence supporte les espaces autour des tirets (`1974 -5694 -25`). Le `$` dans les regex doit utiliser `[$]` et non `\$`.

---

### 2.5 SEAO — Contrats publics ✅ Implémenté

| Attribut | Valeur |
|---|---|
| Fichier local | `backend/data/seao.json` (22 MB) |
| Format | JSON **OCDS** (Open Contracting Data Standard) depuis 2021 |
| Fréquence pull | Hebdomadaire (fichiers `hebdo_YYYYMMDD_YYYYMMDD.json`) |
| Code | `backend/ingestion/sources/seao.py` |

**Structure OCDS :**
```json
{
  "releases": [{
    "parties": [{"roles": ["supplier"], "details": {"neq": "1148214522"}, "name": "..."}],
    "buyer": {"name": "Commission de la fonction publique"},
    "tender": {"title": "CFP-2526-009_Umbrella"},
    "awards": [{"value": {"amount": 65000.0}, "date": "2025-04-01"}],
    "contracts": [{"dateSigned": "2025-04-01"}]
  }]
}
```

**Résultats :** 5 760 releases → 1 360 contrats matchés (855 entrepreneurs), 1,7 G$ de valeur totale.  
Non-matchés (4 400) : fournisseurs hors construction (pharma, TI, etc.).

**Scheduler :** Lundi à 5h00.

---

### 2.6 CNESST — Infractions employeurs ✅ Implémenté

| Attribut | Valeur |
|---|---|
| URL | `cnesst.gouv.qc.ca/fr/salle-presse/employeurs-contrevenants` |
| Méthode | Scraping AJAX (Drupal Views) avec pagination |
| Matching | Par `nom_normalized` (pas de NEQ dans les données CNESST) |
| Code | `backend/ingestion/sources/cnesst.py` |

**Événement généré :** `cnesst_infraction` (-10 pts chacun, max -20 pts).

**Scheduler :** Lundi à 5h30.

---

### 2.7 OPC — Profil commerçant ✅ Implémenté (partiel)

| Attribut | Valeur |
|---|---|
| URL | `opc.gouv.qc.ca/consommateur/se-renseigner-sur-un-commercant/` |
| Méthode | httpx + BeautifulSoup, **à la demande** |
| Cache | 7 jours par `contractor_id` (table `opc_plaintes`) |
| Cache intermédiaire | 24h par NEQ (table `opc_cache`) |
| Code | `backend/ingestion/sources/opc_scraper.py` |

**⚠️ Limitation connue :** La page OPC utilise reCAPTCHA + rendu JavaScript. Le scraper httpx actuel peut retourner des résultats vides. Réécriture en **Playwright** recommandée.

**Données visées :**
- Nombre de plaintes reçues
- Mises en garde actives (-15 pts si présentes)
- Types d'infractions

---

### 2.8 CanLII — Litiges judiciaires ✅ Implémenté

| Attribut | Valeur |
|---|---|
| API | `api.canlii.org/v1/` |
| Clé | Gratuite sur demande (configurer `CANLII_API_KEY` dans `.env`) |
| Méthode | Batch : parcours `caseBrowse/fr/qcrbq/` + matching par nom d'entreprise |
| Rate limit | 5 000 req/jour · 1.2 req/s — arrêt automatique sur 429 |
| Déduplication | `case_id` en colonne dédiée + set en mémoire |
| Code | `backend/ingestion/sources/canlii.py` |

**Données extraites :**
- Tribunal, date de décision, keywords (résumé), description
- Type détecté : `decision_annulation` / `decision_suspension` / `decision_condition` / `decision_regisseurs`
- URL de la décision (canlii.org)
- Stockage : table `litiges` (distincte de `rbq_events`)

**Ingestion en deux passes :** 1) Parcourir `caseBrowse` pour matcher les noms d'entreprises, 2) Récupérer les métadonnées uniquement pour les cas matchés. Les anciennes entrées CanLII dans `rbq_events` sont migrées automatiquement vers `litiges` au début de chaque ingestion.

**Nettoyage des doublons :** Au démarrage de l'ingestion, un `DELETE` supprime les doublons CanLII dans `rbq_events` (même `contractor_id` + `event_type` + `event_date`).

---

### Résumé des statuts

| Source | Statut | Données en base |
|---|---|---|
| RBQ licences | ✅ Actif | 49 337 entrepreneurs |
| REQ | ✅ Actif | 49 213 mis à jour (`statut_req`, `date_fondation`) |
| RBQ Décisions | ✅ Actif | Événements présents |
| RBQ PDFs | ✅ Actif (manuel) | 55 événements |
| SEAO | ✅ Actif | 1 360 contrats, 855 entrepreneurs |
| CNESST | ✅ Actif | Infractions présentes |
| OPC | ⚠️ Partiel (JS non géré) | Cache à la demande |
| CanLII | ✅ Actif (batch) | Décisions régisseurs matchées |

---

### Sources envisagées non implémentées

| Source | Données | Notes |
|---|---|---|
| **BSF** (Bureau surintendant faillites) | Faillites Canada | Complète REQ pour corporations fédérales |
| **Revenu Québec stratagèmes** | Stratagèmes fiscaux | Non viable : blocage 403, pagination cassée, données limitées aux particuliers |
| **Permis municipaux** | Chantiers actifs | Montréal open data disponible |

---

## 3. Modèle de données

```sql
-- Table centrale
CREATE TABLE contractors (
    id               SERIAL PRIMARY KEY,
    neq              VARCHAR(10) UNIQUE,       -- Numéro entreprise Québec
    licence_rbq      VARCHAR(15),
    nom_legal        VARCHAR(255) NOT NULL,
    nom_normalized   VARCHAR(255),             -- Pour similarity() via pg_trgm
    adresse          VARCHAR(255),
    ville            VARCHAR(100),
    code_postal      VARCHAR(7),
    telephone        VARCHAR(20),
    forme_juridique  VARCHAR(50),
    date_fondation   DATE,
    statut_req       VARCHAR(30),              -- actif / radié / en_liquidation / faillite
    statut_rbq       VARCHAR(30),              -- valide / suspendu / annulé / révoqué
    categories_rbq   TEXT[],                   -- paires ["Generale","1.2","Specialisee","10"]
    noms_secondaires TEXT[],                   -- noms commerciaux alternatifs
    score            INTEGER,                  -- 0–100
    score_updated_at TIMESTAMP,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);

-- Événements négatifs (RBQ décisions, CNESST, réclamations PDF)
CREATE TABLE rbq_events (
    id            SERIAL PRIMARY KEY,
    contractor_id INTEGER REFERENCES contractors(id),
    event_type    VARCHAR(50),   -- decision_annulation / decision_suspension /
                                 -- decision_condition / decision_regisseurs /
                                 -- cnesst_infraction / réclamation
    event_date    DATE,
    montant       NUMERIC(12,2),
    description   TEXT,
    source        VARCHAR(20),    -- rbq / rbq_decisions / cnesst /
                                  -- rbq_pdf_reclamations / rbq_pdf_indemnites
    case_id       VARCHAR(100)    -- identifiant CanLII pour déduplication
);

-- Plaintes OPC (scraping à la demande, cache 7 jours)
CREATE TABLE opc_plaintes (
    id                SERIAL PRIMARY KEY,
    contractor_id     INTEGER REFERENCES contractors(id),
    nb_plaintes       INTEGER DEFAULT 0,
    mises_en_garde    TEXT[],
    types_infractions TEXT[],
    fetched_at        TIMESTAMP
);

-- Cache intermédiaire OPC (24h par NEQ)
CREATE TABLE opc_cache (
    neq        VARCHAR(10) PRIMARY KEY,
    data       JSONB,
    fetched_at TIMESTAMP
);

-- Litiges judiciaires CanLII
CREATE TABLE litiges (
    id            SERIAL PRIMARY KEY,
    contractor_id INTEGER REFERENCES contractors(id),
    source        VARCHAR(20) DEFAULT 'canlii',
    tribunal      VARCHAR(100),
    date_decision DATE,
    type_litige   VARCHAR(50),  -- petites_créances / construction / travail / civil
    issue         VARCHAR(30),  -- condamné / acquitté / réglé / en_cours
    url_decision  TEXT,
    montant       NUMERIC(12,2),
    description   TEXT           -- citation · keywords · PDF URL
);

-- Contrats publics SEAO
CREATE TABLE seao_contracts (
    id              SERIAL PRIMARY KEY,
    contractor_id   INTEGER REFERENCES contractors(id),
    titre           VARCHAR(500),
    organisme       VARCHAR(255),
    montant         NUMERIC(14,2),
    date_attribution DATE
);

-- Rapports générés (pour paiement futur)
CREATE TABLE reports (
    id            SERIAL PRIMARY KEY,
    contractor_id INTEGER REFERENCES contractors(id),
    paid          BOOLEAN DEFAULT FALSE,
    stripe_id     VARCHAR(100),
    created_at    TIMESTAMP DEFAULT NOW()
);
```

**Extension requise :** `CREATE EXTENSION IF NOT EXISTS pg_trgm;`  
(nécessaire pour `similarity()` dans la recherche floue — à inclure dans `init_db.py`)

---

## 4. Pipeline d'ingestion

### Structure

```
backend/
  ingestion/
    run.py              # CLI : python -m ingestion.run --source [rbq|req|seao|cnesst|rbq_pdf|canlii|scoring|all]
    local_ingest.py     # Ingestion depuis fichiers locaux (rbq_licences.json)
    sources/
      rbq.py            # RBQ JSON → contractors (upsert par licence_rbq)
      req.py            # REQ ZIP → contractors (update statut_req, date_fondation)
      rbq_decisions.py  # Scraping décisions régisseurs → rbq_events
      rbq_pdf.py        # PDF réclamations/indemnités → rbq_events
      seao.py           # SEAO JSON OCDS → seao_contracts
      cnesst.py         # Scraping CNESST → rbq_events
      opc_scraper.py    # Scraping OPC à la demande → opc_plaintes
      canlii.py         # API CanLII (batch + on-demand) → litiges + rbq_events
    transforms/
      normalize.py      # normalize_name(), normalize_neq(), normalize_licence_rbq(), ContractorIndex
```

### Optimisation : ContractorIndex

Toutes les sources d'ingestion utilisent `ContractorIndex` (dans `transforms/normalize.py`) pour éviter les requêtes N+1 :

- Au démarrage, un seul `SELECT * FROM contractors` charge tous les entrepreneurs en mémoire
- 3 dictionnaires : `by_licence`, `by_neq`, `by_nom` pour lookups O(1)
- La déduplication utilise des sets en mémoire (`{(contractor_id, source, description)}`) au lieu de SELECT par record
- Commits groupés toutes les 5 000 (RBQ/REQ) ou 500 (SEAO) lignes

| Source | Avant (requêtes DB) | Après | Gain |
|--------|---------------------|-------|------|
| RBQ | ~49 000 SELECT + 49 000 savepoints | 1 SELECT + 10 commits | ~98x |
| REQ | ~100 000 SELECT | 1 SELECT + commits | ~100x |
| SEAO | ~17 000 SELECT | 1 SELECT + commits | ~85x |
| CNESST | ~500 SELECT | 1 SELECT | ~500x |

### Scheduler (APScheduler)

| Heure | Source | Méthode |
|---|---|---|
| 3h00 quotidien | RBQ | Fichier `/app/data/rbq.json` |
| 4h00 quotidien | REQ | Fichier `/app/data/req.zip` |
| Lundi 5h00 | SEAO | Fichier `/app/data/seao.json` |
| Lundi 5h30 | CNESST | Scraping AJAX |
| 6h00 quotidien | Scores | `recalculate_all_scores()` |

Les PDFs RBQ (`rbq_pdf`) et CanLII (`canlii`) ne sont **pas** dans le scheduler — ingestion manuelle ou via `--source all`.

### Commandes d'ingestion manuelle

```bash
cd backend
python -m ingestion.run --source rbq
python -m ingestion.run --source req
python -m ingestion.run --source seao
python -m ingestion.run --source cnesst
python -m ingestion.run --source rbq_decisions
python -m ingestion.run --source rbq_pdf
python -m ingestion.run --source canlii
python -m ingestion.run --source scoring
# Ou tout en une fois :
python -m ingestion.run --source all
```

### Fichiers de données

| Fichier | Utilisé par |
|---|---|
| `backend/data/rbq.json` | rbq.py |
| `backend/data/req.zip` | req.py |
| `backend/data/seao.json` | seao.py |
| `data/reclamations-en-cours.pdf` | rbq_pdf.py |
| `data/tableau-indemnites-versees.pdf` | rbq_pdf.py |

---

## 5. Scoring engine

**Fichier :** `backend/scoring/engine.py`

### Modèle (base 70)

Le score part de 70 — une entreprise sans historique ni signaux positifs est "neutre" (ni bonne ni mauvaise). Les bonus doivent être gagnés.

```python
score = 70  # base

# --- Pénalités graves ---
if statut_rbq in ("suspendu", "annulé", "révoqué"):  score -= 50
if statut_req in ("radié", "en_liquidation", "faillite"):  score -= 40

# --- Pénalités réclamations cautionnement ---
nb_reclamations = count(events, type="réclamation")
score -= min(nb_reclamations * 15, 45)

# --- Pénalités CNESST ---
nb_cnesst = count(events, type="cnesst_infraction")
score -= min(nb_cnesst * 10, 20)

# --- Pénalités décisions régisseurs ---
for event in events:
    if event.type == "decision_annulation":   score -= 35
    elif event.type == "decision_suspension": score -= 20
    elif event.type == "decision_condition":  score -= 8
    elif event.type == "decision_regisseurs": score -= 12

# --- Pénalités OPC ---
if plaintes.mises_en_garde:         score -= 15
score -= min(plaintes.nb_plaintes * 5, 15)

# --- Pénalités CanLII ---
condamnations = [l for l in litiges if l.issue == "condamné"]
score -= min(len(condamnations) * 8, 25)

# --- Bonus ---
if statut_req == "actif":           score += 5
if age >= 10 ans:                   score += 15
elif age >= 5 ans:                  score += 10
elif age >= 2 ans:                  score += 5
if nb_contrats_seao > 0:            score += 10

score = max(0, min(100, score))
```

### Seuils d'affichage

| Score | Label | Couleur |
|---|---|---|
| ≥ 85 | Fiable | Vert |
| 70–84 | Acceptable | Jaune/Ambre |
| 50–69 | À surveiller | Orange |
| < 50 | À risque élevé | Rouge |

### Score breakdown

Chaque rapport retourne aussi `score_breakdown` : liste de facteurs avec `label`, `points` (+/-), et `type` (`positive`/`negative`/`neutral`). Affiché comme chips colorés dans le frontend.

---

## 6. API REST

**Base URL :** `http://localhost:8000`  
**Framework :** FastAPI + SQLAlchemy async (asyncpg)

| Endpoint | Description |
|---|---|
| `GET /health` | Healthcheck |
| `GET /api/search?q={query}` | Recherche floue par nom (`pg_trgm similarity > 0.3`) |
| `GET /api/report/{id}` | Rapport complet : infos + events + plaintes OPC + litiges CanLII + contrats SEAO + score breakdown |
| `GET /api/report/{id}/reseau` | Détection sociétés phénix : entreprises liées + score phénix pondéré |
| `POST /api/webhook` | Webhook Stripe (paiements futurs) |

**Réponse `/api/search` :**
```json
{
  "count": 10,
  "results": [{
    "id": 61842,
    "nom": "R.C Peintre inc.",
    "ville": "Sainte-Perpétue",
    "licence_rbq": "5685-1470-01",
    "neq": "1169942571",
    "statut_rbq": "valide",
    "statut_req": "actif",
    "categories": ["Generale", "1.2", "Specialisee", "11.2"],
    "score": 90,
    "score_label": "Fiable"
  }]
}
```

**Réponse `/api/report/{id}` :**
```json
{
  "contractor": {
    "nom_legal": "R.C Peintre inc.",
    "statut_rbq": "valide",
    "statut_req": "actif",
    "date_fondation": "2014-04-16",
    "score": 90,
    "score_label": "Fiable",
    "score_breakdown": [
      {"label": "Immatriculé au REQ", "points": 5, "type": "positive"},
      {"label": "Ancienneté > 10 ans", "points": 15, "type": "positive"}
    ]
  },
  "events": [...],
  "litiges": [...],
  "contrats_publics": [...]
}
```

**CORS :** Actif pour `http://localhost:3000`. Les erreurs 500 survenant avant le middleware CORS s'affichent comme "Access-Control-Allow-Origin" côté browser — inspecter les logs backend pour le vrai message.

### Détection sociétés phénix (`/api/report/{id}/reseau`)

**8 signaux pondérés :**

| Signal | Points max | Logique |
|--------|-----------|---------|
| Temporalité critique | 25 | Société liée avec événement négatif < 18 mois avant la fondation du contractor |
| Même téléphone | 20 | Match exact sur `telephone` |
| Code postal (FSA) | 12 | 3 premiers caractères de `code_postal` identiques |
| Catégories RBQ (Jaccard) | 12 | Overlap > 50% entre `categories_rbq` |
| Jeunesse + négatif | 10 | `date_fondation` < 24 mois + société liée avec statut négatif |
| Nom similaire | 8 | `pg_trgm similarity > 0.7` + même ville |
| Noms secondaires | 8 | `noms_secondaires` d'une entreprise matche le nom d'une autre |
| Adresse partagée | 5 | Même `adresse` + `ville`, seuil à 8 colocataires |

**Scoring :** Score global = max des `points_lien` des entreprises liées, boosté de 30% si une entreprise liée a un statut négatif (RBQ annulé/suspendu/révoqué ou REQ radié/faillite). Plafonné à 100.

**Seuils d'affichage :**

| Score | Niveau | Couleur |
|---|---|---|
| 0–20 | Aucun | Non affiché |
| 21–40 | Léger | Ambre |
| 41–60 | Suspect | Orange |
| 61–80 | Probable | Rouge |
| 81–100 | Avéré | Rouge foncé |

**Réponse :**
```json
{
  "risque_phenix": true,
  "score_phenix": 72,
  "niveau_risque": "probable",
  "nb_entreprises_liees": 3,
  "signaux": [
    {"type": "temporalité critique", "points": 25, "details": "Fondée 8 mois après problème chez société liée"},
    {"type": "même téléphone", "points": 20, "details": "514-555-1234"}
  ],
  "entreprises": [
    {
      "id": 123, "nom": "...", "ville": "...", "statut_rbq": "annulé",
      "lien": "même téléphone",
      "lien_details": ["même téléphone", "temporalité critique"],
      "alerte": true, "points_lien": 58
    }
  ]
}
```

---

## 7. Frontend

**Framework :** Next.js 14 (App Router) + Tailwind CSS  
**Port :** 3000

### Pages

| Route | Fichier | Description |
|---|---|---|
| `/recherche` | `app/recherche/page.tsx` | Recherche en temps réel, résultats avec score + badges statut |
| `/rapport/[id]` | `app/rapport/[id]/page.tsx` | Rapport complet |
| `/entrepreneur/[id]` | `app/entrepreneur/[id]/page.tsx` | Page intermédiaire (non liée depuis recherche) |

### Fonctionnalités clés

**Recherche (`/recherche`) :**
- Debounce 300ms
- Badge rouge "⚠ REQ radié/en faillite" si `statut_req` ∈ {radié, en_liquidation, faillite}
- Clic sur carte → `/rapport/${id}` directement (pas de page intermédiaire)
- Couleurs score : vert ≥85 / ambre 70-84 / orange 50-69 / rouge <50

**Rapport (`/rapport/[id]`) :**
- Badges statut RBQ + REQ
- Score avec breakdown (chips colorés : vert=bonus, rouge=pénalité)
- Catégories RBQ groupées : `Gén. 1.2, 1.3` / `Spéc. 10, 11.2` / `ADM GPC`
- Événements RBQ (décisions, réclamations)
- Contrats SEAO
- Litiges CanLII
- Gestion d'erreur : 404 / 500 / "Impossible de joindre le serveur"

---

## 8. Infrastructure

### Démarrage local

**Prérequis :** PostgreSQL 16+ avec l'extension `pg_trgm`, Python 3.11+, Node.js 20+.

```bash
# 1. Copier la config
cp .env.example .env
# Éditer DATABASE_URL si nécessaire (default: postgresql+asyncpg://dev:dev@localhost:5432/rbq_app)

# 2. Créer la base PostgreSQL
createdb rbq_app
psql -d rbq_app -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"

# 3. Lancer le backend
cd backend
pip install -r requirements.txt
playwright install chromium  # pour le scraping OPC
python init_db.py            # crée les tables
uvicorn main:app --reload    # http://localhost:8000

# 4. Lancer le frontend (dans un autre terminal)
cd frontend
npm install
npm run dev                  # http://localhost:3000
```

### Migrations de schéma

Pas d'Alembic. Pour ajouter une colonne après déploiement :
```bash
psql -d rbq_app -c "ALTER TABLE contractors ADD COLUMN IF NOT EXISTS ma_colonne TEXT;"
```

Pour réinitialiser la base :
```bash
cd backend && python init_db.py
```

`init_db.py` crée l'extension `pg_trgm` et toutes les tables via SQLAlchemy `create_all`.

### Variables d'environnement

| Variable | Valeur par défaut | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://dev:dev@localhost:5432/rbq_app` | Connexion PostgreSQL |
| `CANLII_API_KEY` | — | Clé API CanLII (en attente) |
| `STRIPE_SECRET_KEY` | — | Paiements (non actif) |

---

## 9. Roadmap

### Complété ✅

- [x] Ingestion RBQ (49 337 licences, date_fondation, noms_secondaires, catégories)
- [x] Ingestion REQ (49 213 mis à jour : statut_req, date_fondation)
- [x] Décisions régisseurs RBQ (scraping + parsing PDF)
- [x] PDFs réclamations cautionnement (117 réclamations, 359 indemnités)
- [x] SEAO contrats publics (OCDS format, 1 360 contrats, 1,7 G$)
- [x] CNESST infractions employeurs (scraping AJAX Drupal)
- [x] OPC plaintes (scraping httpx, cache 7j)
- [x] CanLII litiges (API batch + rate limiting, déduplication par `case_id`)
- [x] Scoring engine base 70 + breakdown
- [x] Détection sociétés phénix — scoring pondéré à 8 signaux (temporalité, téléphone, code postal FSA, catégories RBQ, jeunesse+négatif, nom, noms secondaires, adresse)
- [x] Optimisation ingestion : ContractorIndex (lookups O(1) au lieu de N+1 SELECT)
- [x] Déduplication en mémoire pour toutes les sources
- [x] Recherche floue (`pg_trgm`)
- [x] Rapport complet avec breakdown
- [x] Badges statut REQ radié/faillite (recherche + rapport)
- [x] Catégories RBQ groupées (Gén./Spéc.)
- [x] Identification 204 entreprises avec licence RBQ valide mais REQ radié/faillite

### Priorité haute ⏳

- [ ] **Phase 2 phénix** — Ingérer dirigeants REQ (`Personne.csv`) + répondants RBQ pour détection par personnes physiques
- [ ] **OPC Playwright** — réécrire scraper pour gérer reCAPTCHA + JS
- [ ] **rbq_licences.json** — inspecter et ingérer (83 MB, licences historiques)
- [ ] **BSF faillites Canada** — données insolvabilité fédérales

### Priorité basse

- [ ] Automatisation download SEAO hebdomadaire (URL pattern `hebdo_YYYYMMDD_YYYYMMDD.json`)
- [ ] Extraction `code_postal` depuis champ `Adresse` RBQ (regex)
- [ ] Permis municipaux Montréal
- [ ] Paiement Stripe (7,99–12,99$)
- [ ] API B2B JSON pour partenaires
