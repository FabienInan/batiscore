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

    # URLs des sources RBQ (licences actives)
    # JSON: https://www.donneesquebec.ca/recherche/dataset/755b45d6-7aee-46df-a216-748a0191c79f/resource/5183fdd4-55b1-418c-8a7d-0a70058ed68d/download/rdl01_extractiondonneesouvertes.json
    # ZIP (CSV): https://www.donneesquebec.ca/recherche/dataset/755b45d6-7aee-46df-a216-748a0191c79f/resource/32f6ec46-85fd-45e9-945b-965d9235840a/download/rdl01_extractiondonneesouvertes.zip
    rbq_json_url: str = "https://www.donneesquebec.ca/recherche/dataset/755b45d6-7aee-46df-a216-748a0191c79f/resource/5183fdd4-55b1-418c-8a7d-0a70058ed68d/download/rdl01_extractiondonneesouvertes.json"
    rbq_zip_url: str = "https://www.donneesquebec.ca/recherche/dataset/755b45d6-7aee-46df-a216-748a0191c79f/resource/32f6ec46-85fd-45e9-945b-965d9235840a/download/rdl01_extractiondonneesouvertes.zip"

    # URLs des sources REQ (Registre des entreprises)
    # Page: https://www.donneesquebec.ca/recherche/dataset/registre-des-entreprises
    # Le fichier ZIP contient 6 CSVs avec NEQ comme identifiant unique
    req_zip_url: str = "https://www.registreentreprises.gouv.qc.ca/RQAnonymeGR/GR/GR03/GR03A2_22A_PIU_RecupDonnPub_PC/FichierDonneesOuvertes.aspx"

    # URL SEAO (appels d'offres publics)
    # Utiliser le fichier le plus récent: https://www.donneesquebec.ca/recherche/dataset/systeme-electronique-dappel-doffres-seao
    seao_url: str = "https://www.donneesquebec.ca/recherche/dataset/systeme-electronique-dappel-doffres-seao"

    # CNESST - Employeurs contrevenants
    # Page: https://www.cnesst.gouv.qc.ca/fr/salle-presse/employeurs-contrevenants
    # Pas de téléchargement direct - scraping requis
    cnesst_url: str = "https://www.cnesst.gouv.qc.ca/fr/salle-presse/employeurs-contrevenants"

    # OPC - Profil commerçant
    opc_search_url: str = "https://www.opc.gouv.qc.ca/consommateur/se-renseigner-sur-un-commercant/"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()