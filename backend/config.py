import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://dev:dev@localhost:5432/rbq_app"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_publishable_key: str = ""

    # CanLII API
    canlii_api_key: str = ""

    # OPC Scraping
    opc_scraping_delay: float = 2.5

    # Prix (en cents CAD)
    prix_complet: int = 799
    prix_premium: int = 1299

    # URLs des sources RBQ
    rbq_actives_url: str = "https://www.donneesquebec.ca/recherche/dataset/licencesactives/resource/[ID]/download"
    rbq_historique_url: str = ""

    # URLs des sources REQ
    req_url: str = "https://www.donneesquebec.ca/recherche/dataset/registre-entreprises-ouvertes/..."

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()