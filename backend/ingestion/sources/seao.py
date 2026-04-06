"""
Ingestion des données SEAO (appels d'offres publics).

Source miroir: https://ouvert.canada.ca/data/fr/dataset/d23b2e02-085d-43e5-9e6e-e1d558ebfdd5
Site officiel: https://seao.gouv.qc.ca/

Usage: Afficher les contrats publics gagnés comme signal positif de crédibilité.

Note: donneesquebec.ca a expiré - utiliser le miroir ouvert.canada.ca
"""
import json
from datetime import datetime
from typing import List

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from models import Contractor, SEAOContract
from ingestion.transforms.normalize import normalize_name, normalize_neq


async def ingest_seao(db: AsyncSession):
    """
    Ingestion des contrats publics SEAO.

    Le miroir ouvert.canada.ca contient les fichiers JSON hebdomadaires.
    """
    print("SEAO: Récupération des contrats publics...")
    print(f"SEAO: Miroir - {settings.seao_mirror_url}")

    # Note: Pour le MVP, l'ingestion SEAO nécessite un téléchargement manuel
    # car le miroir peut nécessiter une navigation sur le site
    print("SEAO: Consulter le miroir pour télécharger le fichier JSON le plus récent")

    return 0


async def ingest_seao_from_file(filepath: str, db: AsyncSession) -> int:
    """
    Ingestion du fichier SEAO depuis un fichier local (JSON).

    Usage:
        python -m ingestion.run --source seao --file /path/to/seao.json
    """
    print(f"SEAO: Lecture de {filepath}")

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, dict):
        data = data.get("contrats", data.get("data", []))

    print(f"SEAO: {len(data):,} contrats")

    return await process_seao_contracts(data, db)


async def process_seao_contracts(contracts: list, db: AsyncSession) -> int:
    """Traite une liste de contrats SEAO."""
    ingested = 0

    for contract in contracts:
        try:
            await process_seao_contract(contract, db)
            ingested += 1

            if ingested % 100 == 0:
                await db.commit()

        except Exception as e:
            print(f"SEAO: Erreur - {e}")
            continue

    await db.commit()
    print(f"SEAO: {ingested:,} contrats ingérés")
    return ingested


async def process_seao_contract(contract: dict, db: AsyncSession):
    """
    Traite un contrat SEAO et l'associe à un entrepreneur.
    """
    # Chercher le contractor par NEQ ou nom
    neq = contract.get("neq_fournisseur") or contract.get("NEQ")
    nom_fournisseur = contract.get("fournisseur") or contract.get("nom_fournisseur") or contract.get("nom")

    contractor = None

    # 1. Chercher par NEQ
    if neq:
        neq_clean = normalize_neq(str(neq))
        if neq_clean:
            result = await db.execute(
                select(Contractor).where(Contractor.neq == neq_clean)
            )
            contractor = result.scalar_one_or_none()

    # 2. Chercher par nom
    if not contractor and nom_fournisseur:
        nom_norm = normalize_name(str(nom_fournisseur))
        if nom_norm:
            result = await db.execute(
                select(Contractor).where(Contractor.nom_normalized == nom_norm)
            )
            contractor = result.scalar_one_or_none()

    if not contractor:
        return

    # Vérifier si le contrat existe déjà
    titre = contract.get("titre") or contract.get("titre_contrat") or contract.get("objet")
    date_attr = contract.get("date_adjudication") or contract.get("date")

    existing = await db.execute(
        select(SEAOContract).where(
            SEAOContract.contractor_id == contractor.id,
            SEAOContract.titre == titre
        )
    )
    if existing.scalar_one_or_none():
        return

    # Créer l'entrée SEAOContract
    montant = contract.get("montant")
    if montant:
        try:
            montant = float(str(montant).replace(" ", "").replace(",", "."))
        except:
            montant = None

    date_attribution = None
    if date_attr:
        try:
            date_attribution = datetime.strptime(str(date_attr)[:10], "%Y-%m-%d").date()
        except:
            pass

    seao_contract = SEAOContract(
        contractor_id=contractor.id,
        titre=titre[:500] if titre else None,
        organisme=contract.get("organisme") or contract.get("organisme_public"),
        montant=montant,
        date_attribution=date_attribution,
    )
    db.add(seao_contract)


async def get_contrats_publics(contractor_id: int, db: AsyncSession) -> List[SEAOContract]:
    """Récupère les contrats publics SEAO pour un entrepreneur."""
    result = await db.execute(
        select(SEAOContract)
        .where(SEAOContract.contractor_id == contractor_id)
        .order_by(SEAOContract.date_attribution.desc())
    )
    return result.scalars().all()