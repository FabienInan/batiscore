from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(ENV_PATH), extra="ignore")

    # Database
    database_url: str = "postgresql+asyncpg://dev:dev@localhost:5432/rbq_app"

    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_publishable_key: str = ""

    # CanLII API
    canlii_api_key: str = ""

    # Google Places API
    google_places_api_key: str = ""

    # OPC Scraping
    opc_scraping_delay: float = 2.5

    # Prix (en cents CAD)
    prix_complet: int = 799
    prix_premium: int = 1299

    # =============================================================================
    # URLs des sources de données
    # Note: donneesquebec.ca a expiré (avril 2026) - utiliser les miroirs
    # =============================================================================

    # RBQ — Registre des licences
    # URL directe donneesquebec.ca (fonctionnelle depuis juin 2026)
    # Fallback: Wayback Machine
    rbq_mirror_url: str = "https://ouvert.canada.ca/data/fr/dataset/755b45d6-7aee-46df-a216-748a0191c79f"
    rbq_json_url: str = "https://www.donneesquebec.ca/recherche/dataset/755b45d6-7aee-46df-a216-748a0191c79f/resource/5183fdd4-55b1-418c-8a7d-0a70058ed68d/download/rdl01_extractiondonneesouvertes.json"
    rbq_zip_url: str = "https://www.donneesquebec.ca/recherche/dataset/755b45d6-7aee-46df-a216-748a0191c79f/resource/32f6ec46-85fd-45e9-945b-965d9235840a/download/rdl01_extractiondonneesouvertes.zip"
    # Wayback fallback:
    rbq_wayback_prefix: str = "https://web.archive.org/web/20251207002513/"

    # REQ — Registre des entreprises du Québec
    # URL directe Registraire: 403 / Cloudflare challenge depuis 2026
    # Solution: télécharger manuellement le ZIP et le placer dans backend/data/req.zip
    req_url: str = "https://www.donneesquebec.ca/recherche/dataset/registre-des-entreprises"
    req_download_url: str = "https://www.donneesquebec.ca/recherche/dataset/registre-des-entreprises/resource/eac1b5f1-d8c0-4690-9c51-316d44ed9d94/download"

    # SEAO — Appels d'offres publics
    # La découverte d'URL est faite dynamiquement via ingestion/sources/ckan_discovery.py
    seao_official_url: str = "https://seao.gouv.qc.ca/"

    # CNESST — Employeurs contrevenants (URL fonctionnelle)
    cnesst_url: str = "https://www.cnesst.gouv.qc.ca/fr/salle-presse/employeurs-contrevenants"

    # OPC — Profil commerçant (URL fonctionnelle)
    opc_search_url: str = "https://www.opc.gouv.qc.ca/se-renseigner"

    # CanLII — Jugements (URLs fonctionnelles)
    canlii_base_url: str = "https://api.canlii.org/v1"
    canlii_site_url: str = "https://www.canlii.org/fr/qc/"

    # Scheduler d'ingestion (démarré dans le lifespan de FastAPI)
    enable_scheduler: bool = False

settings = Settings()