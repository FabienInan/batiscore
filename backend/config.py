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

    # =============================================================================
    # URLs des sources de données
    # Note: donneesquebec.ca a expiré (avril 2026) - utiliser les miroirs
    # =============================================================================

    # RBQ — Registre des licences
    # Miroir: ouvert.canada.ca
    # Fallback: Wayback Machine (préfixer avec https://web.archive.org/web/2026/)
    rbq_mirror_url: str = "https://ouvert.canada.ca/data/fr/dataset/755b45d6-7aee-46df-a216-748a0191c79f"
    rbq_json_url: str = "https://www.donneesquebec.ca/recherche/dataset/755b45d6-7aee-46df-a216-748a0191c79f/resource/5183fdd4-55b1-418c-8a7d-0a70058ed68d/download/rdl01_extractiondonneesouvertes.json"
    rbq_zip_url: str = "https://www.donneesquebec.ca/recherche/dataset/755b45d6-7aee-46df-a216-748a0191c79f/resource/32f6ec46-85fd-45e9-945b-965d9235840a/download/rdl01_extractiondonneesouvertes.zip"
    # Wayback fallback:
    rbq_wayback_prefix: str = "https://web.archive.org/web/2026/"

    # REQ — Registre des entreprises du Québec
    # URL directe du Registraire (toujours fonctionnelle)
    req_url: str = "https://www.registreentreprises.gouv.qc.ca/RQAnonymeGR/GR/GR03/GR03A2_22A_PIU_RecupDonnPub_PC/PageDonneesOuvertes.aspx"

    # SEAO — Appels d'offres publics
    # Miroir: ouvert.canada.ca
    seao_mirror_url: str = "https://ouvert.canada.ca/data/fr/dataset/d23b2e02-085d-43e5-9e6e-e1d558ebfdd5"
    seao_official_url: str = "https://seao.gouv.qc.ca/"

    # CNESST — Employeurs contrevenants (URL fonctionnelle)
    cnesst_url: str = "https://www.cnesst.gouv.qc.ca/fr/salle-presse/employeurs-contrevenants"

    # OPC — Profil commerçant (URL fonctionnelle)
    opc_search_url: str = "https://www.opc.gouv.qc.ca/consommateur/se-renseigner-sur-un-commercant/"

    # CanLII — Jugements (URLs fonctionnelles)
    canlii_base_url: str = "https://api.canlii.org/v1"
    canlii_site_url: str = "https://www.canlii.org/fr/qc/"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()