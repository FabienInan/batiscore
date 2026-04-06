# Architecture MVP — Vérification Entrepreneur RBQ

> Application de vérification d'entrepreneurs en construction au Québec.  
> Sources de données 100% publiques/gratuites. Rapport vendu 7,99–12,99$.  
> Stack : Python (backend) + Next.js (frontend) + PostgreSQL.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Sources de données](#2-sources-de-données)
3. [Modèle de données](#3-modèle-de-données)
4. [Pipeline d'ingestion](#4-pipeline-dingestion)
5. [Scoring engine](#5-scoring-engine)
6. [API REST](#6-api-rest)
7. [Frontend](#7-frontend)
8. [Paiement](#8-paiement)
9. [Infrastructure](#9-infrastructure)
10. [Roadmap MVP](#10-roadmap-mvp)
11. [Coûts estimés](#11-coûts-estimés)

---

## 1. Vue d'ensemble

```
┌──────────────────────────────────────────────────────────────────┐
│                        Sources publiques                         │
│  RBQ CSV   REQ CSV   OPC scraping   CanLII   CNESST   SEAO JSON  │
└─────────────────────────┬────────────────────────────────────────┘
                          │ ETL quotidien (Python + cron)
┌─────────────────────────▼────────────────────────────────────────┐
│                       PostgreSQL                                  │
│         contractors · events · plaintes · scores                  │
└─────────────────────────┬────────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────────┐
│              Scoring Engine (Python)  →  score 0–100             │
└─────────────────────────┬────────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────────┐
│                    FastAPI — API REST                             │
│         /search  /report  /verify  /webhook (Stripe)             │
└──────────┬──────────────────────────────────┬────────────────────┘
           │                                  │
┌──────────▼──────────┐            ┌──────────▼──────────┐
│   Next.js frontend  │            │   API B2B (JSON)     │
│   (rapport + paiement)          │   pour partenaires   │
└─────────────────────┘            └─────────────────────┘
```

---
## 2. Sources de données

> **⚠️ Note :** Le domaine `donneesquebec.ca` a expiré et redirige vers GoDaddy (avril 2026).
> Les URLs ci-dessous pointent vers des miroirs fonctionnels (ouvert.canada.ca, portails gouvernementaux, Wayback Machine).
> Les fichiers de téléchargement directs (`donneesquebec.ca/.../download/...`) sont aussi cassés — il faut passer par les pages miroirs ou la Wayback Machine.

---

### 2.1 RBQ — Registre des licences actives ⭐ Source principale

| Attribut | Valeur |
|---|---|
| URL (miroir) | `https://ouvert.canada.ca/data/fr/dataset/755b45d6-7aee-46df-a216-748a0191c79f` |
| URL (originale cassée) | ~~`https://www.donneesquebec.ca/recherche/dataset/licencesactives`~~ |
| Wayback Machine | `https://web.archive.org/web/2026*/https://www.donneesquebec.ca/recherche/dataset/licencesactives` |
| Format | JSON + CSV (ZIP), mis à jour régulièrement |
| Licence | CC-BY 4.0 Québec |
| Coût | Gratuit |
| Identifie l'entrepreneur | ✅ Oui — nominatif |

**Champs disponibles :**
- Numéro de licence RBQ
- Nom de l'entreprise + NEQ
- Adresse + ville
- Catégories et sous-catégories de licence
- Statut (valide / suspendu / annulé / révoqué)
- Nombre de réclamations au cautionnement
- Montants des réclamations

**Note importante :** Le registre inclut aussi les licences des 5 dernières années (pas seulement les actives). Télécharger les deux fichiers.

**Liens de téléchargement direct (via Wayback Machine si cassés) :**
```python
# Téléchargement — URLs originales (cassées, utiliser Wayback Machine ou ouvert.canada.ca)
# Page miroir ouvert.canada.ca : https://ouvert.canada.ca/data/fr/dataset/755b45d6-7aee-46df-a216-748a0191c79f

# JSON
RBQ_JSON_URL = "https://www.donneesquebec.ca/recherche/dataset/755b45d6-7aee-46df-a216-748a0191c79f/resource/5183fdd4-55b1-418c-8a7d-0a70058ed68d/download/rdl01_extractiondonneesouvertes.json"

# CSV (ZIP)
RBQ_CSV_URL = "https://www.donneesquebec.ca/recherche/dataset/755b45d6-7aee-46df-a216-748a0191c79f/resource/32f6ec46-85fd-45e9-945b-965d9235840a/download/rdl01_extractiondonneesouvertes.zip"

# Fallback Wayback Machine :
# Préfixer l'URL avec https://web.archive.org/web/2026/
```

**Alternative directe :** Répertoire en ligne de la RBQ : `https://www.rbq.gouv.qc.ca/` (recherche par licence)

---

### 2.2 REQ — Registre des entreprises du Québec

| Attribut | Valeur |
|---|---|
| URL (données ouvertes) | `https://www.registreentreprises.gouv.qc.ca/RQAnonymeGR/GR/GR03/GR03A2_22A_PIU_RecupDonnPub_PC/PageDonneesOuvertes.aspx` |
| URL (Données Québec, cassée) | ~~`https://www.donneesquebec.ca/recherche/dataset/registre-des-entreprises`~~ |
| Wayback Machine | `https://web.archive.org/web/2026*/https://www.donneesquebec.ca/recherche/fr/dataset/registre-des-entreprises` |
| Recherche en ligne | `https://www.quebec.ca/entreprises-et-travailleurs-autonomes/obtenir-renseignements-entreprise/rechercher-entreprise-registre` |
| Format | CSV / JSON |
| Coût | Gratuit |
| Identifie l'entrepreneur | ✅ Oui — nominatif |

**Champs disponibles :**
- NEQ (clé de jointure avec RBQ)
- Nom légal + noms secondaires
- Statut (immatriculé / radié / en liquidation)
- Date d'immatriculation
- Forme juridique (compagnie / travailleur autonome / société)
- Indicateur de faillite / insolvabilité
- Code SCIAN (secteur d'activité)

```python
# Téléchargement bulk depuis le Registraire directement
REQ_DONNEES_OUVERTES = "https://www.registreentreprises.gouv.qc.ca/RQAnonymeGR/GR/GR03/GR03A2_22A_PIU_RecupDonnPub_PC/PageDonneesOuvertes.aspx"
```

---

### 2.3 OPC — Profil commerçant (scraping à la demande)

| Attribut | Valeur |
|---|---|
| URL | `https://www.opc.gouv.qc.ca/consommateur/se-renseigner-sur-un-commercant/` |
| Méthode | Scraping HTTP (Playwright ou requests + BeautifulSoup) |
| Coût | Gratuit |
| Identifie l'entrepreneur | ✅ Oui — par nom ou NEQ |
| Timing | À la demande (au moment de générer un rapport) |

> ✅ **Cette URL est toujours fonctionnelle** (hébergée par l'OPC, pas sur donneesquebec.ca).

**Données récupérées :**
- Nombre de plaintes reçues
- Mises en garde actives
- Types d'infractions signalées

**Implémentation :**
```python
import httpx
from bs4 import BeautifulSoup

async def scrape_opc_profile(neq: str) -> dict:
    url = f"https://www.opc.gouv.qc.ca/consommateur/se-renseigner-sur-un-commercant/?neq={neq}"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
    soup = BeautifulSoup(resp.text, "html.parser")
    # Parser le nombre de plaintes et mises en garde
    # ...
    return {"plaintes": nb_plaintes, "mises_en_garde": mises_en_garde}
```

**Important :** Une requête par rapport généré, pas en bulk. Respecter un délai de 2–3 secondes entre requêtes.

---

### 2.4 OPC — Données ouvertes (CSV statistiques)

| Attribut | Valeur |
|---|---|
| URL (miroir) | `https://ouvert.canada.ca/data/fr/dataset/bcc45cfc-bfb3-4afd-b162-eb76dfd4e8a3` |
| URL (originale cassée) | ~~`https://www.donneesquebec.ca/recherche/dataset/liste-des-plaintes-recues`~~ |
| Format | CSV mensuel (174 703 lignes analysées) |
| Coût | Gratuit |
| Identifie l'entrepreneur | ❌ Non — 100% anonymisé |
| Usage | Stats éditoriales uniquement |

**Lien de téléchargement direct (dernier fichier connu) :**
```python
# Fichier CSV OPC plaintes — le nom de fichier change mensuellement
# Consulter la page miroir pour le lien le plus récent :
# https://ouvert.canada.ca/data/fr/dataset/bcc45cfc-bfb3-4afd-b162-eb76dfd4e8a3
OPC_CSV_URL = "https://www.donneesquebec.ca/recherche/dataset/bcc45cfc-bfb3-4afd-b162-eb76dfd4e8a3/resource/b3926d33-575a-4de8-aa85-fb95c9459685/download/opc-plaintes-2026-02-23.csv"
# ⚠️ Si cassé, préfixer avec https://web.archive.org/web/2026/
```

**Champs disponibles :** DATE, COCON (catégorie), MOTIF, COLEG (code légal), MODE_PAIEMENT, VILLE_SIEGE_SOCIAL, CODE_ACTIVITE.

**Aucun nom de commerçant dans ce fichier.** Utiliser uniquement pour :
- Afficher "12 765 plaintes en rénovation au QC" (contenu marketing)
- Statistiques sectorielles dans les pages publiques de l'app

---

### 2.5 CanLII — Jugements publiés

| Attribut | Valeur |
|---|---|
| URL | `https://www.canlii.org/fr/qc/` + API REST |
| API | `https://api.canlii.org/v1/` (clé gratuite) |
| Coût | Gratuit (clé API sur demande) |
| Identifie l'entrepreneur | ✅ Oui — noms dans les jugements |

> ✅ **Ces URLs sont toujours fonctionnelles** (hébergées par CanLII, pas sur donneesquebec.ca).

**Données récupérées :**
- Jugements Cour du Québec, Cour supérieure, cours municipales
- Décisions arbitrales publiées
- Historique complet accessible

```python
CANLII_API_KEY = "votre_cle_api"
CANLII_BASE = "https://api.canlii.org/v1"

async def search_canlii(company_name: str) -> list:
    url = f"{CANLII_BASE}/caseBrowse/fr/qc/?keyword={company_name}&api_key={CANLII_API_KEY}"
    # ...
```

**Limite :** Seulement les décisions publiées — délai de 3–6 mois pour les petites créances.

---

### 2.6 CNESST — Défauts employeurs

| Attribut | Valeur |
|---|---|
| URL | `https://www.cnesst.gouv.qc.ca/fr/entreprises/cotisations/` |
| Méthode | Scraping liste publique des défauts |
| Coût | Gratuit |
| Identifie l'entrepreneur | ✅ Oui — nominatif (partiel) |

> ✅ **Cette URL est toujours fonctionnelle** (hébergée par la CNESST, pas sur donneesquebec.ca).

**Données récupérées :** Liste des employeurs en défaut de cotisation SST. Signal fort de fragilité financière.

---

### 2.7 SEAO — Appels d'offres publics (bonus crédibilité)

| Attribut | Valeur |
|---|---|
| URL (miroir) | `https://ouvert.canada.ca/data/fr/dataset/d23b2e02-085d-43e5-9e6e-e1d558ebfdd5` |
| URL (originale cassée) | ~~`https://www.donneesquebec.ca/recherche/dataset/systeme-electronique-dappel-doffres-seao`~~ |
| Site officiel SEAO | `https://seao.gouv.qc.ca/` |
| Outil Espace DATA | `http://www.espacedata.ca/` |
| Format | JSON hebdomadaire + XML mensuel |
| Coût | Gratuit |
| Identifie l'entrepreneur | ✅ Oui — nominatif |

**Usage dans le rapport :** Afficher les contrats publics gagnés par l'entrepreneur comme signal positif de crédibilité.

---

### 2.8 Permis municipaux (bonus)

| Ville | URL | Format |
|---|---|---|
| Montréal | `https://donnees.montreal.ca/dataset/permis-de-construction` | JSON/CSV |
| Québec | ~~`https://www.donneesquebec.ca/recherche/dataset/permis-construction-ville-quebec`~~ → Chercher sur `https://ouvert.canada.ca/data/fr/dataset?q=permis+construction+quebec` | CSV |
| Laval | `https://www.donneesouvertes.laval.ca/` | CSV |

**Usage :** Vérifier si l'entrepreneur a des chantiers actifs (signal d'activité réelle).

---

### Résumé des substitutions

| Source | URL cassée (donneesquebec.ca) | Alternative fonctionnelle |
|---|---|---|
| RBQ | `donneesquebec.ca/recherche/dataset/licencesactives` | `ouvert.canada.ca/data/fr/dataset/755b45d6-7aee-46df-a216-748a0191c79f` |
| REQ | `donneesquebec.ca/recherche/dataset/registre-entreprises-ouvertes` | `registreentreprises.gouv.qc.ca/.../PageDonneesOuvertes.aspx` |
| OPC CSV | `donneesquebec.ca/recherche/dataset/liste-des-plaintes-recues` | `ouvert.canada.ca/data/fr/dataset/bcc45cfc-bfb3-4afd-b162-eb76dfd4e8a3` |
| SEAO | `donneesquebec.ca/recherche/dataset/systeme-electronique-dappel-doffres-seao` | `ouvert.canada.ca/data/fr/dataset/d23b2e02-085d-43e5-9e6e-e1d558ebfdd5` |
| Permis QC | `donneesquebec.ca/recherche/dataset/permis-construction-ville-quebec` | Chercher sur `ouvert.canada.ca` |

> **Note sur les liens de téléchargement direct :** Beaucoup de fichiers CSV/JSON avaient des URLs de téléchargement sur `donneesquebec.ca/.../download/...`. Ces liens sont aussi cassés. Deux options :
> 1. **Wayback Machine** : préfixer l'URL avec `https://web.archive.org/web/2026/`
> 2. **ouvert.canada.ca** : les pages miroir listent les mêmes liens de téléchargement — certains pointent vers des serveurs de diffusion gouvernementaux (ex: `diffusion.mern.gouv.qc.ca`) qui eux fonctionnent encore.

### Fréquence de mise à jour et stratégie de pull
 
#### Fréquences déclarées par les diffuseurs
 
| Source | Fréquence déclarée | Dernière MAJ connue | Notes |
|---|---|---|---|
| RBQ | ~Mensuel à trimestriel | 2025-11-12 | Pas de fréquence explicite dans les métadonnées. Le registre en ligne sur `rbq.gouv.qc.ca` est temps réel. |
| REQ | Mensuel | — | Bulk dump de 2M+ entreprises via le Registraire. |
| OPC CSV | Mensuel | 2026-02-23 | Le nom du fichier inclut la date (ex: `opc-plaintes-2026-02-23.csv`). |
| OPC profil | Temps réel | — | Scraping à la demande, pas de dump périodique. |
| SEAO | Hebdomadaire (JSON) + Mensuel (XML) | 2026-03-25 | Fichiers nommés `hebdo_YYYYMMDD_YYYYMMDD.json`. |
| CNESST | Temps réel | — | Scraping à la demande, pas de dump périodique connu. |
| CanLII | Temps réel | — | API queryable à la demande. Nouvelles décisions publiées avec un délai de 3–6 mois (petites créances). |
| Permis MTL | ~Mensuel | — | Données ouvertes Montréal, mise à jour régulière. |
 
#### Stratégie de pull recommandée
 
Deux rythmes distincts à implémenter :
 
**1. Batch périodique (cron) — maintenir la base locale à jour**
 
| Source | Fréquence de pull | Jour recommandé | Stratégie |
|---|---|---|---|
| RBQ | 1x / mois | 1er du mois | Télécharger le fichier complet, diff/upsert par numéro de licence |
| REQ | 1x / mois | 1er du mois | Bulk download, upsert par NEQ |
| OPC CSV | 1x / mois | Fin de mois (~25) | Nouveau fichier complet remplace le précédent |
| SEAO | 1x / semaine | Lundi | Fichier JSON hebdo, append des nouveaux contrats |
| Permis MTL | 1x / mois | 1er du mois | Télécharger, upsert par numéro de permis |
 
**2. Temps réel à la demande — au moment de générer un rapport prospect**
 
| Source | Quand | Cache suggéré |
|---|---|---|
| OPC profil (scraping) | À chaque génération de rapport | Cache 7 jours par NEQ |
| CNESST défauts (scraping) | À chaque génération de rapport | Cache 7 jours par nom/NEQ |
| CanLII jugements (API) | À chaque génération de rapport | Cache 30 jours par nom d'entreprise |
| RBQ en ligne (validation) | Optionnel — vérifier si la licence est encore valide | Cache 24h par numéro de licence |
 
#### Exemple d'implémentation cron
 
```python
# crontab suggestions
# RBQ + REQ + OPC CSV + Permis MTL : mensuel, le 1er à 3h du matin
0 3 1 * * /usr/bin/python3 /app/scripts/pull_monthly_sources.py
 
# SEAO : hebdomadaire, chaque lundi à 4h du matin
0 4 * * 1 /usr/bin/python3 /app/scripts/pull_seao_weekly.py
```
 
```python
# Pseudo-code pour le pull mensuel
async def pull_monthly_sources():
    # 1. RBQ
    rbq_data = await download_and_extract(RBQ_CSV_URL)
    await upsert_rbq(rbq_data, key="numero_licence")
 
    # 2. REQ
    req_data = await download_and_extract(REQ_DONNEES_OUVERTES)
    await upsert_req(req_data, key="neq")
 
    # 3. OPC CSV
    opc_data = await download_opc_csv()  # détecte le dernier fichier disponible
    await replace_opc_stats(opc_data)
 
    # 4. Permis MTL
    permis_data = await download_json("https://donnees.montreal.ca/dataset/permis-de-construction")
    await upsert_permis(permis_data, key="numero_permis")
 
    log.info("Pull mensuel terminé")
```
 
```python
# Pseudo-code pour les lookups temps réel avec cache
from functools import lru_cache
from datetime import timedelta
 
@cached(ttl=timedelta(days=7))
async def get_opc_profile(neq: str) -> dict:
    return await scrape_opc_profile(neq)
 
@cached(ttl=timedelta(days=30))
async def get_canlii_judgments(company_name: str) -> list:
    return await search_canlii(company_name)
 
@cached(ttl=timedelta(days=7))
async def get_cnesst_defaults(company_name: str) -> dict:
    return await scrape_cnesst(company_name)
```

## 3. Modèle de données

```sql
-- Entrepreneurs (table centrale)
CREATE TABLE contractors (
    id              SERIAL PRIMARY KEY,
    neq             VARCHAR(10) UNIQUE,          -- Numéro entreprise Québec
    licence_rbq     VARCHAR(15),                  -- Numéro licence RBQ
    nom_legal       VARCHAR(255) NOT NULL,
    nom_normalized  VARCHAR(255),                 -- Pour fuzzy search (lowercase, sans accents)
    adresse         VARCHAR(255),
    ville           VARCHAR(100),
    code_postal     VARCHAR(7),
    telephone       VARCHAR(20),
    forme_juridique VARCHAR(50),                  -- compagnie / autonome / société
    date_fondation  DATE,
    statut_req      VARCHAR(30),                  -- actif / radié / en_liquidation
    statut_rbq      VARCHAR(30),                  -- valide / suspendu / annulé / révoqué
    categories_rbq  TEXT[],                       -- ['général', 'électricité', ...]
    score           INTEGER DEFAULT NULL,          -- 0-100, calculé par scoring engine
    score_updated_at TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Index pour recherche
CREATE INDEX idx_contractors_nom ON contractors USING gin(to_tsvector('french', nom_legal));
CREATE INDEX idx_contractors_nom_norm ON contractors (nom_normalized);
CREATE INDEX idx_contractors_tel ON contractors (telephone);
CREATE INDEX idx_contractors_neq ON contractors (neq);
CREATE INDEX idx_contractors_licence ON contractors (licence_rbq);

-- Événements RBQ (réclamations, suspensions, etc.)
CREATE TABLE rbq_events (
    id              SERIAL PRIMARY KEY,
    contractor_id   INTEGER REFERENCES contractors(id),
    event_type      VARCHAR(50),   -- réclamation / suspension / annulation / renouvellement
    event_date      DATE,
    montant         DECIMAL(12,2),
    description     TEXT,
    source          VARCHAR(20) DEFAULT 'rbq',
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Plaintes OPC
CREATE TABLE opc_plaintes (
    id              SERIAL PRIMARY KEY,
    contractor_id   INTEGER REFERENCES contractors(id),
    nb_plaintes     INTEGER DEFAULT 0,
    mises_en_garde  TEXT[],
    types_infractions TEXT[],
    fetched_at      TIMESTAMP DEFAULT NOW()
);

-- Litiges CanLII
CREATE TABLE litiges (
    id              SERIAL PRIMARY KEY,
    contractor_id   INTEGER REFERENCES contractors(id),
    source          VARCHAR(20),   -- canlii / soquij
    tribunal        VARCHAR(100),
    date_decision   DATE,
    type_litige     VARCHAR(100),  -- civil / pénal / petites_créances
    issue           VARCHAR(50),   -- condamné / acquitté / réglé / en_cours
    montant         DECIMAL(12,2),
    url_decision    TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Contrats SEAO (signal crédibilité positive)
CREATE TABLE seao_contracts (
    id              SERIAL PRIMARY KEY,
    contractor_id   INTEGER REFERENCES contractors(id),
    titre           VARCHAR(500),
    organisme       VARCHAR(255),
    montant         DECIMAL(14,2),
    date_attribution DATE,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Rapports générés (pour facturation et cache)
CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id   INTEGER REFERENCES contractors(id),
    tier            VARCHAR(20),    -- basic / complet / premium
    prix            DECIMAL(6,2),
    stripe_payment_intent VARCHAR(100),
    statut_paiement VARCHAR(20) DEFAULT 'pending', -- pending / paid / refunded
    pdf_url         TEXT,
    email_acheteur  VARCHAR(255),
    created_at      TIMESTAMP DEFAULT NOW(),
    expires_at      TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
);

-- Cache OPC (éviter de scraper à chaque rapport)
CREATE TABLE opc_cache (
    neq             VARCHAR(10) PRIMARY KEY,
    data            JSONB,
    fetched_at      TIMESTAMP DEFAULT NOW()
);
```

---

## 4. Pipeline d'ingestion

### 4.1 Structure des fichiers

```
ingestion/
├── config.py              # URLs, chemins, credentials
├── run.py                 # Point d'entrée principal
├── sources/
│   ├── rbq.py             # Ingestion CSV RBQ
│   ├── req.py             # Ingestion CSV REQ
│   ├── opc_stats.py       # Ingestion CSV statistiques OPC
│   ├── opc_scraper.py     # Scraping profil commerçant OPC
│   ├── canlii.py          # API CanLII
│   ├── cnesst.py          # Scraping CNESST
│   └── seao.py            # JSON SEAO
├── transforms/
│   ├── normalize.py       # Normalisation noms, téléphones, NEQ
│   └── merge.py           # Jointures inter-sources
└── scheduler.py           # Cron jobs
```

### 4.2 Ingestion RBQ (source principale)

```python
# sources/rbq.py
import pandas as pd
import httpx
from sqlalchemy.orm import Session

RBQ_URL = "https://www.donneesquebec.ca/recherche/dataset/licencesactives/resource/[ID]/download"

def ingest_rbq(db: Session):
    # Télécharger le CSV
    resp = httpx.get(RBQ_URL, timeout=120)
    df = pd.read_csv(pd.io.common.BytesIO(resp.content), encoding="utf-8-sig", sep=";")

    for _, row in df.iterrows():
        contractor = db.query(Contractor).filter_by(licence_rbq=row["NO_LICENCE"]).first()
        if not contractor:
            contractor = Contractor(licence_rbq=row["NO_LICENCE"])

        contractor.nom_legal = row["NOM_ENTREPRISE"]
        contractor.neq = row.get("NEQ")
        contractor.statut_rbq = row["STATUT"].lower()
        contractor.categories_rbq = row["CATEGORIES"].split(",") if row.get("CATEGORIES") else []
        contractor.ville = row.get("VILLE")
        contractor.nom_normalized = normalize_name(row["NOM_ENTREPRISE"])

        # Réclamations
        nb_reclamations = int(row.get("NB_RECLAMATIONS", 0))
        if nb_reclamations > 0:
            upsert_rbq_event(db, contractor, nb_reclamations, row)

        db.add(contractor)

    db.commit()
    print(f"RBQ: {len(df)} entrepreneurs ingérés")
```

### 4.3 Normalisation des noms

```python
# transforms/normalize.py
import re
import unicodedata

def normalize_name(name: str) -> str:
    """
    'Rénovations Tremblay & Fils Inc.' → 'renovations tremblay fils inc'
    Permet le fuzzy match même avec fautes de frappe légères.
    """
    name = name.lower()
    # Supprimer accents
    name = unicodedata.normalize("NFD", name)
    name = "".join(c for c in name if unicodedata.category(c) != "Mn")
    # Supprimer ponctuation et mots vides
    name = re.sub(r"[&.,'\-]", " ", name)
    name = re.sub(r"\b(inc|ltee|ltée|enr|cie|co|corp|construction|renovation|renovations)\b", "", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name
```

### 4.4 Scheduler

```python
# scheduler.py
from apscheduler.schedulers.blocking import BlockingScheduler

scheduler = BlockingScheduler()

@scheduler.scheduled_job("cron", hour=3, minute=0)   # 3h du matin
def daily_rbq():
    ingest_rbq(get_db())

@scheduler.scheduled_job("cron", hour=4, minute=0)
def daily_req():
    ingest_req(get_db())

@scheduler.scheduled_job("cron", day_of_week="mon", hour=5)  # Hebdo
def weekly_seao():
    ingest_seao(get_db())

@scheduler.scheduled_job("cron", hour=6, minute=0)
def daily_scoring():
    recalculate_all_scores(get_db())

scheduler.start()
```

---

## 5. Scoring Engine

### 5.1 Logique de score (0–100)

Le score représente le **niveau de risque** — plus il est bas, plus l'entrepreneur est risqué.

```
Score de départ : 100

Déductions :
  Licence suspendue ou révoquée      → -50 points (bloquant)
  Entreprise radiée / faillite       → -40 points (bloquant)
  Réclamation cautionnement RBQ      → -15 points chacune (max -45)
  Mise en garde OPC active           → -20 points
  Plainte OPC (par plainte)          → -5 points (max -20)
  Litige judiciaire condamné         → -10 points chacun (max -30)
  Entreprise < 1 an d'existence      → -10 points

Bonus :
  Contrats publics SEAO              → +5 points
  Entreprise > 10 ans                → +5 points
  Aucun incident sur 5 ans           → +5 points
```

```python
# scoring/engine.py

def calculate_score(contractor_id: int, db: Session) -> int:
    c = db.query(Contractor).get(contractor_id)
    events = db.query(RBQEvent).filter_by(contractor_id=contractor_id).all()
    plaintes = db.query(OPCPlainte).filter_by(contractor_id=contractor_id).first()
    litiges = db.query(Litige).filter_by(contractor_id=contractor_id).all()
    contrats = db.query(SEAOContract).filter_by(contractor_id=contractor_id).count()

    score = 100

    # Bloquants
    if c.statut_rbq in ("suspendu", "annulé", "révoqué"):
        score -= 50
    if c.statut_req in ("radié", "en_liquidation"):
        score -= 40

    # Réclamations RBQ
    nb_reclamations = sum(1 for e in events if e.event_type == "réclamation")
    score -= min(nb_reclamations * 15, 45)

    # OPC
    if plaintes:
        if plaintes.mises_en_garde:
            score -= 20
        score -= min(plaintes.nb_plaintes * 5, 20)

    # Litiges
    condamnations = [l for l in litiges if l.issue == "condamné"]
    score -= min(len(condamnations) * 10, 30)

    # Ancienneté
    if c.date_fondation:
        age_ans = (date.today() - c.date_fondation).days / 365
        if age_ans < 1:
            score -= 10
        elif age_ans > 10:
            score += 5

    # Bonus contrats publics
    if contrats > 0:
        score += 5

    # Bonus historique propre
    if nb_reclamations == 0 and not plaintes and not condamnations:
        score += 5

    return max(0, min(100, score))


def score_label(score: int) -> dict:
    if score >= 80:
        return {"label": "Fiable", "color": "green"}
    elif score >= 60:
        return {"label": "Acceptable", "color": "amber"}
    elif score >= 40:
        return {"label": "À surveiller", "color": "orange"}
    else:
        return {"label": "À risque élevé", "color": "red"}
```

---

## 6. API REST

### 6.1 Stack

- **FastAPI** (Python 3.11+)
- **SQLAlchemy** ORM + **asyncpg**
- **Pydantic** validation
- **Redis** cache (résultats de recherche 1h, scores 24h)

### 6.2 Endpoints

```
GET  /api/search?q={query}&ville={ville}    Recherche entrepreneur
GET  /api/contractor/{id}                   Profil public (données gratuites)
POST /api/report/checkout                   Initier paiement Stripe
GET  /api/report/{report_id}                Accéder au rapport (après paiement)
GET  /api/report/{report_id}/pdf            Télécharger le PDF
POST /api/webhook/stripe                    Webhook confirmation paiement
GET  /api/verify/{licence_rbq}              Vérification rapide licence (B2B)
```

### 6.3 Endpoint recherche

```python
# api/routes/search.py
from fastapi import APIRouter, Query
from sqlalchemy import or_, func

router = APIRouter()

@router.get("/search")
async def search_contractors(
    q: str = Query(..., min_length=2),
    ville: str = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Recherche par: nom, numéro RBQ, téléphone, NEQ.
    Retourne max 10 résultats, triés par pertinence.
    """
    q_normalized = normalize_name(q)

    # Détection du type de requête
    if re.match(r"^\d{4}-\d{4}-\d{2}$", q):
        # Format licence RBQ
        results = await db.execute(
            select(Contractor).where(Contractor.licence_rbq == q)
        )
    elif re.match(r"^\d{10}$", q):
        # Format NEQ
        results = await db.execute(
            select(Contractor).where(Contractor.neq == q)
        )
    elif re.match(r"^\d{3}[-.]?\d{3}[-.]?\d{4}$", q):
        # Téléphone
        phone_clean = re.sub(r"\D", "", q)
        results = await db.execute(
            select(Contractor).where(func.replace(Contractor.telephone, "-", "") == phone_clean)
        )
    else:
        # Recherche par nom (fuzzy)
        results = await db.execute(
            select(Contractor)
            .where(
                func.similarity(Contractor.nom_normalized, q_normalized) > 0.3
            )
            .order_by(func.similarity(Contractor.nom_normalized, q_normalized).desc())
            .limit(10)
        )
        # Activer l'extension pg_trgm dans PostgreSQL:
        # CREATE EXTENSION IF NOT EXISTS pg_trgm;

    contractors = results.scalars().all()

    # Filtrer par ville si précisé
    if ville:
        contractors = [c for c in contractors if ville.lower() in (c.ville or "").lower()]

    return {
        "count": len(contractors),
        "results": [contractor_preview(c) for c in contractors]
    }


def contractor_preview(c: Contractor) -> dict:
    return {
        "id": c.id,
        "nom": c.nom_legal,
        "ville": c.ville,
        "licence_rbq": c.licence_rbq,
        "statut_rbq": c.statut_rbq,
        "categories": c.categories_rbq[:3],  # Limiter l'aperçu
        "score": c.score,
        "score_label": score_label(c.score)["label"] if c.score else None,
    }
```

### 6.4 Endpoint rapport + paiement

```python
# api/routes/report.py

@router.post("/report/checkout")
async def create_checkout(
    contractor_id: int,
    tier: Literal["complet", "premium"],
    email: str,
    db: AsyncSession = Depends(get_db)
):
    prix = 7.99 if tier == "complet" else 12.99

    # Créer l'entrée rapport en DB
    report = Report(
        contractor_id=contractor_id,
        tier=tier,
        prix=prix,
        email_acheteur=email,
        statut_paiement="pending"
    )
    db.add(report)
    await db.commit()

    # Créer Stripe PaymentIntent
    intent = stripe.PaymentIntent.create(
        amount=int(prix * 100),
        currency="cad",
        metadata={"report_id": str(report.id)},
        receipt_email=email,
    )

    report.stripe_payment_intent = intent.id
    await db.commit()

    return {
        "client_secret": intent.client_secret,
        "report_id": str(report.id)
    }


@router.post("/webhook/stripe")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    sig = request.headers.get("stripe-signature")
    event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)

    if event.type == "payment_intent.succeeded":
        intent = event.data.object
        report_id = intent.metadata.get("report_id")

        report = await db.get(Report, report_id)
        report.statut_paiement = "paid"

        # Déclencher la génération du rapport
        await generate_report_async(report_id, db)
        await db.commit()

    return {"status": "ok"}


@router.get("/report/{report_id}")
async def get_report(report_id: UUID, db: AsyncSession = Depends(get_db)):
    report = await db.get(Report, report_id)
    if not report or report.statut_paiement != "paid":
        raise HTTPException(status_code=403, detail="Rapport non disponible")
    if report.expires_at < datetime.now():
        raise HTTPException(status_code=410, detail="Rapport expiré")

    contractor = await db.get(Contractor, report.contractor_id)
    events = await get_rbq_events(report.contractor_id, db)
    plaintes = await get_opc_plaintes(contractor.neq)   # Scraping à la demande
    litiges = await get_canlii_litiges(contractor.nom_legal)

    return build_report_json(contractor, events, plaintes, litiges, report.tier)
```

### 6.5 Endpoint B2B (API partenaires)

```python
@router.get("/verify/{licence_rbq}")
async def quick_verify(
    licence_rbq: str,
    api_key: str = Header(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Endpoint léger pour partenaires B2B.
    Retourne statut + score en JSON. Facturé 1,50-2,00$ / appel.
    """
    validate_api_key(api_key)      # Vérifier quota + facturer
    contractor = await db.execute(
        select(Contractor).where(Contractor.licence_rbq == licence_rbq)
    )
    c = contractor.scalar_one_or_none()
    if not c:
        return {"found": False, "licence": licence_rbq}

    return {
        "found": True,
        "licence": licence_rbq,
        "nom": c.nom_legal,
        "statut": c.statut_rbq,
        "score": c.score,
        "score_label": score_label(c.score)["label"],
        "nb_reclamations": await count_reclamations(c.id, db),
        "verified_at": datetime.now().isoformat()
    }
```

---

## 7. Frontend

### 7.1 Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Stripe.js** (paiement côté client)
- **React PDF** (affichage rapport)

### 7.2 Pages

```
/                          Page d'accueil + barre de recherche
/recherche?q=...           Résultats de recherche (liste)
/entrepreneur/[id]         Profil public gratuit
/rapport/[id]/checkout     Page de paiement
/rapport/[id]              Rapport complet (après paiement)
/api-partenaires           Page d'info pour le B2B
```

### 7.3 Flux utilisateur principal

```
1. Utilisateur entre un nom / numéro / téléphone
           ↓
2. /recherche → liste de résultats (jusqu'à 10)
           ↓
3. Sélectionne le bon entrepreneur
           ↓
4. /entrepreneur/[id] → aperçu gratuit
   - Statut licence (valide/invalide)
   - Score affiché (chiffre flou si pas payé)
   - Nombre de réclamations
   - Bouton "Voir le rapport complet — 7,99$"
           ↓
5. /rapport/[id]/checkout → formulaire email + Stripe Elements
           ↓
6. Paiement Stripe → webhook → génération rapport
           ↓
7. /rapport/[id] → rapport complet + lien PDF
   - Score détaillé avec explication
   - Timeline des événements
   - Détail réclamations RBQ
   - Plaintes OPC
   - Jugements CanLII
   - Contrats publics SEAO
```

### 7.4 Composant aperçu gratuit

```tsx
// components/ContractorPreview.tsx
export function ContractorPreview({ contractor }) {
  const statusColor = contractor.statut_rbq === "valide" ? "green" : "red"

  return (
    <div className="border rounded-lg p-6">
      <h1 className="text-xl font-medium">{contractor.nom_legal}</h1>
      <p className="text-sm text-gray-500">{contractor.ville} · RBQ {contractor.licence_rbq}</p>

      {/* Statut licence — toujours affiché gratuitement */}
      <div className={`mt-4 px-3 py-2 rounded text-sm bg-${statusColor}-50 text-${statusColor}-800`}>
        Licence {contractor.statut_rbq.toUpperCase()}
        {contractor.categories_rbq.slice(0, 3).map(c => (
          <span key={c} className="ml-2 badge">{c}</span>
        ))}
      </div>

      {/* Score — flou sans paiement */}
      <div className="mt-4 relative">
        <div className="text-4xl font-medium blur-sm select-none">
          {contractor.score ?? "??"}
          <span className="text-lg text-gray-400"> / 100</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm text-gray-600">Score visible dans le rapport</span>
        </div>
      </div>

      {/* Nombre de réclamations — affiché gratuitement */}
      {contractor.nb_reclamations > 0 && (
        <div className="mt-4 text-amber-700 bg-amber-50 rounded p-3 text-sm">
          ⚠️ {contractor.nb_reclamations} réclamation(s) au cautionnement RBQ
        </div>
      )}

      <button
        onClick={() => router.push(`/rapport/${contractor.id}/checkout`)}
        className="mt-6 w-full btn-primary"
      >
        Voir le rapport complet — 7,99 $
      </button>
    </div>
  )
}
```

---

## 8. Paiement

### 8.1 Stack

- **Stripe** (PaymentIntents + Webhooks)
- Taxes canadiennes via Stripe Tax (TPS/TVQ automatiques)

### 8.2 Configuration Stripe

```python
# config.py
STRIPE_SECRET_KEY = os.environ["STRIPE_SECRET_KEY"]
STRIPE_WEBHOOK_SECRET = os.environ["STRIPE_WEBHOOK_SECRET"]
STRIPE_PUBLISHABLE_KEY = os.environ["STRIPE_PUBLISHABLE_KEY"]

PRIX = {
    "complet": 799,    # en cents CAD
    "premium": 1299,
}
```

### 8.3 Variables d'environnement requises

```bash
# .env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/rbq_app
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
CANLII_API_KEY=...
OPC_SCRAPING_DELAY=2.5   # secondes entre requêtes OPC
```

---

## 9. Infrastructure

### 9.1 Stack déploiement (MVP)

| Composant | Service | Coût/mois |
|---|---|---|
| Backend FastAPI | Railway ou Render | 20–25$ |
| PostgreSQL | Neon (serverless) ou Railway | 20–30$ |
| Redis cache | Upstash | 5–10$ |
| Frontend Next.js | Vercel | 0–20$ |
| Stockage PDF | Cloudflare R2 | ~1$ |
| Scheduler (cron) | Railway (même instance) | inclus |
| **Total** | | **~50–90$/mois** |

### 9.2 Structure projet

```
rbq-app/
├── backend/
│   ├── main.py                 # FastAPI app
│   ├── config.py
│   ├── database.py             # SQLAlchemy async setup
│   ├── models.py               # ORM models
│   ├── api/
│   │   ├── routes/
│   │   │   ├── search.py
│   │   │   ├── report.py
│   │   │   └── webhook.py
│   │   └── deps.py             # Dépendances (db, auth)
│   ├── ingestion/
│   │   ├── run.py
│   │   ├── sources/
│   │   │   ├── rbq.py
│   │   │   ├── req.py
│   │   │   ├── opc_scraper.py
│   │   │   ├── canlii.py
│   │   │   ├── cnesst.py
│   │   │   └── seao.py
│   │   ├── transforms/
│   │   │   ├── normalize.py
│   │   │   └── merge.py
│   │   └── scheduler.py
│   ├── scoring/
│   │   └── engine.py
│   ├── pdf/
│   │   └── generator.py        # WeasyPrint ou ReportLab
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx            # Accueil
│   │   ├── recherche/page.tsx
│   │   ├── entrepreneur/[id]/page.tsx
│   │   └── rapport/[id]/
│   │       ├── checkout/page.tsx
│   │       └── page.tsx
│   ├── components/
│   │   ├── SearchBar.tsx
│   │   ├── ContractorPreview.tsx
│   │   ├── ReportFull.tsx
│   │   ├── ScoreGauge.tsx
│   │   └── StripeCheckout.tsx
│   └── package.json
├── migrations/
│   └── 001_init.sql
├── docker-compose.yml          # Dev local
└── README.md
```

### 9.3 Docker Compose (dev local)

```yaml
# docker-compose.yml
version: "3.9"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: rbq_app
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports: ["5432:5432"]
    command: >
      postgres -c shared_preload_libraries=pg_trgm

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: .env
    depends_on: [db, redis]
    volumes:
      - ./backend:/app

  scheduler:
    build: ./backend
    command: python ingestion/scheduler.py
    env_file: .env
    depends_on: [db]

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
      NEXT_PUBLIC_STRIPE_KEY: pk_test_...
```

### 9.4 Dépendances Python

```txt
# requirements.txt
fastapi==0.110.0
uvicorn[standard]==0.27.0
sqlalchemy[asyncio]==2.0.28
asyncpg==0.29.0
alembic==1.13.1
pydantic==2.6.3
pydantic-settings==2.2.1
httpx==0.27.0
beautifulsoup4==4.12.3
playwright==1.42.0         # Scraping OPC si JavaScript requis
pandas==2.2.1
stripe==8.8.0
apscheduler==3.10.4
redis==5.0.3
weasyprint==61.2           # Génération PDF
python-multipart==0.0.9
```

---

## 10. Roadmap MVP

### Phase 1 — Semaines 1–2 : Data pipeline

- [ ] Télécharger et parser CSV RBQ (licences actives + historique 5 ans)
- [ ] Télécharger et parser CSV REQ
- [ ] Script de normalisation des noms (fuzzy match)
- [ ] Jointure RBQ ↔ REQ par NEQ
- [ ] Créer le schéma PostgreSQL + migrations
- [ ] Première ingestion complète (~40 000 entrepreneurs)
- [ ] Scheduler cron quotidien opérationnel

### Phase 2 — Semaines 3–4 : Scoring + API

- [ ] Implémenter le scoring engine (score 0–100)
- [ ] Scraper OPC profil commerçant (requête unitaire)
- [ ] Intégrer API CanLII (jugements publiés)
- [ ] Développer endpoints FastAPI : search, contractor, verify
- [ ] Activer `pg_trgm` pour fuzzy search
- [ ] Tests unitaires scoring engine
- [ ] Cache Redis (recherches 1h, scores 24h)

### Phase 3 — Semaines 5–6 : Frontend + paiement

- [ ] Barre de recherche + page résultats
- [ ] Page profil entrepreneur (aperçu gratuit)
- [ ] Intégration Stripe (PaymentIntent + Webhook)
- [ ] Génération rapport PDF (WeasyPrint)
- [ ] Page rapport complet (après paiement)
- [ ] Email de livraison (SendGrid ou Resend)

### Phase 4 — Semaine 7–8 : Hardening + lancement

- [ ] Scraping CNESST défauts employeurs
- [ ] Ingestion SEAO contrats publics
- [ ] Tests end-to-end (10 entrepreneurs réels)
- [ ] SEO : pages statiques par ville + catégorie
- [ ] Déploiement Railway + Vercel
- [ ] Configuration Stripe Tax (TPS/TVQ QC)
- [ ] Monitoring (Sentry + logs structurés)

---

## 11. Coûts estimés

### Développement (solo senior)

| Phase | Durée estimée |
|---|---|
| Pipeline ingestion | 2 semaines |
| Scoring + API | 2 semaines |
| Frontend + paiement | 2 semaines |
| Tests + déploiement | 2 semaines |
| **Total MVP** | **~6–8 semaines** |

### Infrastructure mensuelle (post-lancement)

| Service | Coût CAD/mois |
|---|---|
| Railway (backend + scheduler) | 25$ |
| Neon PostgreSQL | 25$ |
| Upstash Redis | 10$ |
| Vercel (frontend) | 0–20$ |
| Cloudflare R2 (PDFs) | 1$ |
| Stripe (2,9% + 0,30$) | Variable |
| Resend (emails) | 0–20$ |
| **Total fixe** | **~61–100$/mois** |

### Sources données gratuites — coût = 0$

Toutes les sources du MVP (RBQ, REQ, OPC, CanLII, CNESST, SEAO) sont gratuites.  
Marge brute estimée : **~97–98%** sur chaque rapport vendu.

### Évolution vers SOQUIJ (post-MVP)

Ajouter SOQUIJ Plumitifs quand les revenus justifient l'investissement :
- Seuil recommandé : 500+ rapports/mois
- Coût SOQUIJ : ~200$/mois
- Impact par rapport : +0,40$ de coût → justifié par hausse de prix (9,99$ → 14,99$)

---

## Notes d'implémentation

**pg_trgm obligatoire** — activer l'extension PostgreSQL pour le fuzzy search sur les noms :
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_contractors_trgm ON contractors USING gin(nom_normalized gin_trgm_ops);
```

**Scraping OPC — délai obligatoire** — respecter un délai de 2–3 secondes entre requêtes pour ne pas faire bannir l'IP. En production, utiliser un pool de 2–3 IPs (proxy rotatif ou deux instances Railway dans régions différentes).

**PDF génération** — WeasyPrint produit du HTML → PDF de qualité. Préparer un template HTML/CSS du rapport et le rendre avec Jinja2 avant conversion.

**Cas "entrepreneur non trouvé"** — traiter comme un résultat à part entière, pas une erreur. Afficher clairement : "Aucun entrepreneur trouvé sous ce nom dans le registre RBQ — travailler avec un entrepreneur sans licence est illégal au Québec."

**Stripe Tax** — activer le module Stripe Tax pour calculer automatiquement TPS (5%) + TVQ (9,975%) sur les ventes au Québec.