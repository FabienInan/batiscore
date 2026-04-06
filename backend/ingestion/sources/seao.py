"""
Ingestion des données SEAO (appels d'offres publics).

Source: https://www.donneesquebec.ca/recherche/dataset/systeme-electronique-dappel-doffres-seao
Format: JSON hebdomadaire

Usage: Afficher les contrats publics gagnés comme signal positif de crédibilité.
"""
import json
from datetime import datetime
from typing import List, Optional

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Contractor, SEAOContract
from ingestion.transforms.normalize import normalize_name, normalize_neq


# URL à remplacer par la vraie URL du dataset
SEAO_URL = "https://www.donneesquebec.ca/recherche/dataset/systeme-electronique-dappel-doffres-seao/resource/[ID]/download"


async def ingest_seao(db: AsyncSession):
    """
    Ingestion du fichier JSON SEAO.

    Structure attendue:
    [
        {
            "titre": "Rénovation école primaire...",
            "organisme": "Commission scolaire de Montréal",
            "montant": 2500000.00,
            "date_adjudication": "2024-01-15",
            "fournisseur": "Construction ABC inc.",
            "neq_fournisseur": "1234567890"
        },
        ...
    ]
    """
    print("SEAO: Téléchargement des contrats publics...")

    try:
        async with httpx.AsyncClient(timeout=180) as client:
            resp = await client.get(SEAO_URL)

        if resp.status_code != 200:
            print(f"SEAO: Erreur HTTP {resp.status_code}")
            return 0

        # Parser le JSON
        try:
            data = resp.json()
        except json.JSONDecodeError:
            print("SEAO: Erreur parsing JSON")
            return 0

        print(f"SEAO: {len(data)} contrats trouvés")

        ingested = 0
        for contract in data:
            try:
                await process_seao_contract(contract, db)
                ingested += 1

                if ingested % 100 == 0:
                    await db.commit()

            except Exception as e:
                print(f"SEAO: Erreur contrat: {e}")
                continue

        await db.commit()
        print(f"SEAO: {ingested} contrats ingérés")
        return ingested

    except Exception as e:
        print(f"SEAO: Erreur ingestion: {e}")
        return 0


async def process_seao_contract(contract: dict, db: AsyncSession):
    """
    Traite un contrat SEAO et l'associe à un entrepreneur.
    """
    # Chercher le contractor par NEQ ou nom
    neq = contract.get("neq_fournisseur")
    nom_fournisseur = contract.get("fournisseur", "")

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
        nom_norm = normalize_name(nom_fournisseur)
        if nom_norm:
            result = await db.execute(
                select(Contractor).where(Contractor.nom_normalized == nom_norm)
            )
            contractor = result.scalar_one_or_none()

    if not contractor:
        return

    # Vérifier si le contrat existe déjà
    titre = contract.get("titre", "")
    date_attr = contract.get("date_adjudication")

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
            montant = float(montant)
        except (ValueError, TypeError):
            montant = None

    date_attribution = None
    if date_attr:
        try:
            date_attribution = datetime.strptime(str(date_attr), "%Y-%m-%d").date()
        except:
            pass

    seao_contract = SEAOContract(
        contractor_id=contractor.id,
        titre=titre,
        organisme=contract.get("organisme"),
        montant=montant,
        date_attribution=date_attribution,
    )
    db.add(seao_contract)


async def get_contrats_publics(contractor_id: int, db: AsyncSession) -> List[SEAOContract]:
    """
    Récupère les contrats publics SEAO pour un entrepreneur.
    """
    result = await db.execute(
        select(SEAOContract)
        .where(SEAOContract.contractor_id == contractor_id)
        .order_by(SEAOContract.date_attribution.desc())
    )
    return result.scalars().all()


async def get_total_contrats_publics(contractor_id: int, db: AsyncSession) -> dict:
    """
    Récupère le total des contrats publics pour un entrepreneur.
    """
    contrats = await get_contrats_publics(contractor_id, db)

    total_montant = 0
    for c in contrats:
        if c.montant:
            total_montant += float(c.montant)

    return {
        "nb_contrats": len(contrats),
        "montant_total": total_montant,
        "organismes": list(set(c.organisme for c in contrats if c.organisme)),
    }