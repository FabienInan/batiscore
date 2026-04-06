-- Extension pour fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Table centrale des entrepreneurs
CREATE TABLE IF NOT EXISTS contractors (
    id              SERIAL PRIMARY KEY,
    neq             VARCHAR(10) UNIQUE,
    licence_rbq     VARCHAR(15),
    nom_legal       VARCHAR(255) NOT NULL,
    nom_normalized  VARCHAR(255),
    adresse         VARCHAR(255),
    ville           VARCHAR(100),
    code_postal     VARCHAR(7),
    telephone       VARCHAR(20),
    forme_juridique VARCHAR(50),
    date_fondation  DATE,
    statut_req      VARCHAR(30),
    statut_rbq      VARCHAR(30),
    categories_rbq  TEXT[],
    score           INTEGER DEFAULT NULL,
    score_updated_at TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Index pour recherche full-text et fuzzy
CREATE INDEX IF NOT EXISTS idx_contractors_nom ON contractors USING gin(to_tsvector('french', nom_legal));
CREATE INDEX IF NOT EXISTS idx_contractors_nom_norm ON contractors (nom_normalized);
CREATE INDEX IF NOT EXISTS idx_contractors_tel ON contractors (telephone);
CREATE INDEX IF NOT EXISTS idx_contractors_neq ON contractors (neq);
CREATE INDEX IF NOT EXISTS idx_contractors_licence ON contractors (licence_rbq);
CREATE INDEX IF NOT EXISTS idx_contractors_trgm ON contractors USING gin(nom_normalized gin_trgm_ops);

-- Événements RBQ
CREATE TABLE IF NOT EXISTS rbq_events (
    id              SERIAL PRIMARY KEY,
    contractor_id   INTEGER REFERENCES contractors(id) ON DELETE CASCADE,
    event_type      VARCHAR(50),
    event_date      DATE,
    montant         DECIMAL(12,2),
    description     TEXT,
    source          VARCHAR(20) DEFAULT 'rbq',
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rbq_events_contractor ON rbq_events(contractor_id);

-- Plaintes OPC
CREATE TABLE IF NOT EXISTS opc_plaintes (
    id              SERIAL PRIMARY KEY,
    contractor_id   INTEGER REFERENCES contractors(id) ON DELETE CASCADE UNIQUE,
    nb_plaintes     INTEGER DEFAULT 0,
    mises_en_garde  TEXT[],
    types_infractions TEXT[],
    fetched_at      TIMESTAMP DEFAULT NOW()
);

-- Litiges CanLII
CREATE TABLE IF NOT EXISTS litiges (
    id              SERIAL PRIMARY KEY,
    contractor_id   INTEGER REFERENCES contractors(id) ON DELETE CASCADE,
    source          VARCHAR(20),
    tribunal        VARCHAR(100),
    date_decision   DATE,
    type_litige     VARCHAR(100),
    issue           VARCHAR(50),
    montant         DECIMAL(12,2),
    url_decision    TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_litiges_contractor ON litiges(contractor_id);

-- Contrats SEAO
CREATE TABLE IF NOT EXISTS seao_contracts (
    id              SERIAL PRIMARY KEY,
    contractor_id   INTEGER REFERENCES contractors(id) ON DELETE CASCADE,
    titre           VARCHAR(500),
    organisme       VARCHAR(255),
    montant         DECIMAL(14,2),
    date_attribution DATE,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seao_contractor ON seao_contracts(contractor_id);

-- Rapports générés
CREATE TABLE IF NOT EXISTS reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id   INTEGER REFERENCES contractors(id) ON DELETE CASCADE,
    tier            VARCHAR(20),
    prix            DECIMAL(6,2),
    stripe_payment_intent VARCHAR(100),
    statut_paiement VARCHAR(20) DEFAULT 'pending',
    pdf_url         TEXT,
    email_acheteur  VARCHAR(255),
    created_at      TIMESTAMP DEFAULT NOW(),
    expires_at      TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_reports_contractor ON reports(contractor_id);

-- Cache OPC
CREATE TABLE IF NOT EXISTS opc_cache (
    neq             VARCHAR(10) PRIMARY KEY,
    data            JSONB,
    fetched_at      TIMESTAMP DEFAULT NOW()
);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contractors_updated_at
    BEFORE UPDATE ON contractors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();