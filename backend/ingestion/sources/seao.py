"""
Ingestion des données SEAO (appels d'offres publics).

Sources (par ordre de priorité):
1. Fichier local : backend/data/seao.json  (télécharger manuellement)
   Le fichier JSON est publié hebdomadairement sur donneesquebec.ca
   (aucun snapshot Wayback disponible — téléchargement manuel requis)

Site officiel: https://seao.gouv.qc.ca/
Signal utilisé: contrats publics gagnés → +5 points de crédibilité
"""
import json
from datetime import datetime
from pathlib import Path
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ingestion.transforms.normalize import normalize_name, normalize_neq, ContractorIndex
from models import Contractor, SEAOContract

LOCAL_SEAO_PATH = Path(__file__).parent.parent.parent / "data" / "seao.json"


async def ingest_seao(db: AsyncSession) -> int:
    """
    Ingère les contrats SEAO.
    Priorité: fichier local data/seao.json
    """
    if LOCAL_SEAO_PATH.exists():
        print(f"SEAO: Fichier local trouvé ({LOCAL_SEAO_PATH.stat().st_size / 1024 / 1024:.1f} Mo)")
        return await ingest_seao_from_file(str(LOCAL_SEAO_PATH), db)

    print("SEAO: Pas de fichier local disponible.")
    print(f"SEAO: Téléchargez le fichier JSON et placez-le dans {LOCAL_SEAO_PATH}")
    print("SEAO: Source: https://seao.gouv.qc.ca/ ou donneesquebec.ca")
    return 0


async def ingest_seao_from_file(filepath: str, db: AsyncSession) -> int:
    """Ingère le fichier SEAO depuis un JSON local."""
    print(f"SEAO: Lecture de {filepath}")

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Supporter plusieurs structures JSON possibles
    if isinstance(data, dict):
        contracts = (
            data.get("releases")        # Format OCDS (donneesquebec.ca depuis 2021)
            or data.get("contrats")
            or data.get("contracts")
            or data.get("data")
            or data.get("results")
            or []
        )
    elif isinstance(data, list):
        contracts = data
    else:
        print("SEAO: Format JSON non reconnu")
        return 0

    print(f"SEAO: {len(contracts):,} contrats/releases")
    return await process_seao_contracts(contracts, db)


async def process_seao_contracts(contracts: list, db: AsyncSession) -> int:
    """Traite une liste de contrats SEAO avec lookups en mémoire."""
    ingested = 0
    skipped = 0

    # Précharger tous les contractors en mémoire
    idx = await ContractorIndex.load(db)

    # Précharger les SEAOContracts existants pour déduplication
    existing_result = await db.execute(
        select(SEAOContract.contractor_id, SEAOContract.titre)
    )
    existing_seao = set()
    for row in existing_result:
        if row[1]:
            existing_seao.add((row[0], row[1][:500]))
    print(f"SEAO: {len(existing_seao):,} contrats existants en cache déduplication")

    for contract in contracts:
        try:
            matched = await process_seao_contract(contract, db, idx, existing_seao)
            if matched:
                ingested += 1
            else:
                skipped += 1

            if ingested % 500 == 0 and ingested > 0:
                await db.commit()
                print(f"SEAO: {ingested:,} contrats ingérés...")

        except Exception as e:
            print(f"SEAO: Erreur - {e}")
            continue

    await db.commit()
    print(f"SEAO: {ingested:,} contrats ingérés, {skipped:,} ignorés (entrepreneur non trouvé)")
    return ingested


def _extract_ocds_fields(release: dict) -> dict:
    """
    Extrait les champs utiles d'un release OCDS (Open Contracting Data Standard).
    Format utilisé par donneesquebec.ca pour les données SEAO depuis 2021.
    """
    # Fournisseur (supplier) dans parties
    supplier = next(
        (p for p in release.get("parties", []) if "supplier" in p.get("roles", [])),
        None,
    )
    neq = None
    nom_fournisseur = None
    if supplier:
        neq = supplier.get("details", {}).get("neq")
        nom_fournisseur = supplier.get("name")

    # Organisme acheteur
    buyer = release.get("buyer", {})
    organisme = buyer.get("name")

    # Titre du contrat
    titre = release.get("tender", {}).get("title")

    # Montant (awards[0].value.amount)
    montant = None
    awards = release.get("awards", [])
    if awards:
        montant = awards[0].get("value", {}).get("amount")

    # Date (contracts[0].dateSigned ou awards[0].date)
    date_raw = None
    contracts = release.get("contracts", [])
    if contracts:
        date_raw = contracts[0].get("dateSigned")
    if not date_raw and awards:
        date_raw = awards[0].get("date")
    if not date_raw:
        date_raw = release.get("date")

    return {
        "neq": str(neq) if neq else None,
        "nom_fournisseur": nom_fournisseur,
        "titre": titre,
        "organisme": organisme,
        "montant": montant,
        "date_raw": date_raw,
    }


def _extract_legacy_fields(contract: dict) -> dict:
    """Extrait les champs d'un contrat au format legacy (avant OCDS)."""
    return {
        "neq": contract.get("neq_fournisseur") or contract.get("NEQ") or contract.get("neq"),
        "nom_fournisseur": (
            contract.get("fournisseur")
            or contract.get("nom_fournisseur")
            or contract.get("nom")
            or contract.get("adjudicataire")
        ),
        "titre": (
            contract.get("titre")
            or contract.get("titre_contrat")
            or contract.get("objet")
            or contract.get("description")
        ),
        "organisme": contract.get("organisme") or contract.get("organisme_public") or contract.get("acheteur"),
        "montant": contract.get("montant") or contract.get("valeur") or contract.get("montant_contrat"),
        "date_raw": contract.get("date_adjudication") or contract.get("date_attribution") or contract.get("date"),
    }


async def process_seao_contract(
    contract: dict, db: AsyncSession, idx: ContractorIndex, existing_seao: set
) -> bool:
    """
    Associe un contrat SEAO à un entrepreneur existant.
    Supporte le format OCDS (releases) et le format legacy.
    Retourne True si un entrepreneur a été trouvé et le contrat créé.
    """
    # Détecter le format : OCDS si la clé "parties" est présente
    if "parties" in contract or "tender" in contract:
        fields = _extract_ocds_fields(contract)
    else:
        fields = _extract_legacy_fields(contract)

    neq = fields["neq"]
    nom_fournisseur = fields["nom_fournisseur"]
    titre = fields["titre"]
    organisme = fields["organisme"]
    montant_raw = fields["montant"]
    date_attr_raw = fields["date_raw"]

    contractor = None

    # 1. Chercher par NEQ (lookup O(1))
    if neq:
        neq_clean = normalize_neq(str(neq))
        if neq_clean:
            contractor = idx.by_neq.get(neq_clean)

    # 2. Chercher par nom normalisé (lookup O(1))
    if not contractor and nom_fournisseur:
        nom_norm = normalize_name(str(nom_fournisseur))
        if nom_norm:
            contractor = idx.by_nom.get(nom_norm)

    if not contractor:
        return False

    # Déduplication en mémoire O(1)
    if titre:
        dedup_key = (contractor.id, titre[:500])
        if dedup_key in existing_seao:
            return False

    # Parser le montant
    montant = None
    if montant_raw is not None:
        try:
            montant = float(montant_raw) if isinstance(montant_raw, (int, float)) else float(
                str(montant_raw).replace(" ", "").replace(",", ".").replace("$", "")
            )
        except (ValueError, TypeError):
            montant = None

    # Parser la date (ISO 8601 ou formats FR)
    date_attribution = None
    if date_attr_raw:
        date_str = str(date_attr_raw)[:10]  # garder YYYY-MM-DD
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%Y/%m/%d"):
            try:
                date_attribution = datetime.strptime(date_str, fmt).date()
                break
            except (ValueError, TypeError):
                continue

    new_contract = SEAOContract(
        contractor_id=contractor.id,
        titre=titre[:500] if titre else None,
        organisme=str(organisme)[:255] if organisme else None,
        montant=montant,
        date_attribution=date_attribution,
    )
    db.add(new_contract)

    # Ajouter au set de déduplication
    if titre:
        existing_seao.add((contractor.id, titre[:500]))

    return True


async def get_contrats_publics(contractor_id: int, db: AsyncSession) -> List[SEAOContract]:
    """Récupère les contrats publics SEAO pour un entrepreneur."""
    result = await db.execute(
        select(SEAOContract)
        .where(SEAOContract.contractor_id == contractor_id)
        .order_by(SEAOContract.date_attribution.desc())
    )
    return result.scalars().all()