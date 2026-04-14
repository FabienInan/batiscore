"""
Ingestion des PDFs RBQ de réclamations cautionnement.

Fichiers (à placer dans entrepreneur-checker/data/) :
  - reclamations-en-cours.pdf   : réclamations actives (numéro licence + nb réclamations)
  - tableau-indemnites-versees.pdf : indemnités versées (numéro licence + montant)

Clé de jointure : numéro de licence RBQ (format XXXX-XXXX-XX)
"""
import re
from decimal import Decimal
from pathlib import Path
from typing import Optional

from pypdf import PdfReader
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Contractor, RBQEvent
from ingestion.transforms.normalize import normalize_licence_rbq, ContractorIndex

DATA_DIR = Path(__file__).parent.parent.parent / "data"
PDF_RECLAMATIONS = DATA_DIR / "reclamations-en-cours.pdf"
PDF_INDEMNITES   = DATA_DIR / "tableau-indemnites-versees.pdf"

LICENCE_RE = re.compile(r"\b(\d{4}\s*[-–]\s*\d{4}\s*[-–]\s*\d{2})\b")
MONTANT_RE = re.compile(r"([\d\s]+[,.]?\d*)\s*[$]")


def _extract_text(path: Path) -> str:
    reader = PdfReader(str(path))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def _parse_reclamations(text: str) -> list[dict]:
    """
    Parse les lignes du PDF réclamations-en-cours.
    Retourne [{licence, nb_reclamations}]
    """
    entries = []
    # Chaque ligne utile contient un numéro de licence suivi d'un chiffre en fin de bloc
    # On scanne ligne par ligne et on associe le dernier entier trouvé au dernier numéro de licence
    current_licence = None
    nb = None

    for line in text.splitlines():
        line = line.strip()
        # Chercher un numéro de licence
        m = LICENCE_RE.search(line)
        if m:
            if current_licence and nb:
                entries.append({"licence": normalize_licence_rbq(current_licence), "nb_reclamations": nb})
            current_licence = m.group(1)
            nb = None

        # Chercher un nombre isolé en fin de ligne (nombre de réclamations)
        if current_licence:
            m2 = re.search(r"\b(\d+)\s*$", line)
            if m2:
                nb = int(m2.group(1))

    if current_licence and nb:
        entries.append({"licence": normalize_licence_rbq(current_licence), "nb_reclamations": nb})

    return [e for e in entries if e["licence"]]


def _parse_indemnites(text: str) -> list[dict]:
    """
    Parse les lignes du PDF tableau-indemnites-versees.
    Format d'une ligne : XXXX-XXXX-XX  NOM   nb_rec  nb_ind  montant $
    Exemple : 2656-5838-16 Les Pavages Augellco inc. 1 1 2 678,36 $

    Retourne [{licence, nb_reclamations, nb_indemnites, montant}]
    """
    # Regex qui capture en fin de ligne : nb_rec  nb_ind  montant $
    # Le montant est en format français : "2 678,36" ou "40 000,00"
    ROW_RE = re.compile(
        r"(\d{4}[-\s]\d{4}[-\s]\d{2})"                   # licence
        r".+?"                                              # nom (non-greedy)
        r"\s+(\d+)"                                        # nb_reclamations
        r"\s+(\d+)"                                        # nb_indemnites
        r"\s+(\d{1,3}(?:[\s\xa0]\d{3})*,\d{2})"          # montant français
        r"\s*[$]"
    )

    entries = []
    for line in text.splitlines():
        line = line.strip()
        m = ROW_RE.search(line)
        if not m:
            continue
        try:
            licence = normalize_licence_rbq(m.group(1))
            nb_rec = int(m.group(2))
            nb_ind = int(m.group(3))
            montant_str = m.group(4).replace("\xa0", "").replace(" ", "").replace(",", ".")
            montant = Decimal(montant_str)
            entries.append({
                "licence": licence,
                "nb_reclamations": nb_rec,
                "nb_indemnites": nb_ind,
                "montant": montant,
            })
        except Exception:
            continue

    return [e for e in entries if e["licence"]]


async def ingest_rbq_pdfs(db: AsyncSession) -> dict:
    """Ingère les deux PDFs RBQ de réclamations et indemnités."""
    counts = {"reclamations": 0, "indemnites": 0, "matched": 0}

    # Précharger les contractors en mémoire
    idx = await ContractorIndex.load(db)

    # Précharger les events existants pour déduplication précise
    # Clé : (contractor_id, source, description_hash) — permet plusieurs events par source
    existing_result = await db.execute(
        select(RBQEvent.contractor_id, RBQEvent.source, RBQEvent.description)
    )
    existing_events = set()
    for row in existing_result:
        # Hachage court de la description pour une clé de dédup compacte
        existing_events.add((row[0], row[1], row[2]))
    print(f"RBQ PDF: {len(existing_events):,} events existants en cache déduplication")

    # --- Réclamations en cours ---
    if PDF_RECLAMATIONS.exists():
        print(f"RBQ PDF: Lecture {PDF_RECLAMATIONS.name}...")
        text = _extract_text(PDF_RECLAMATIONS)
        reclamations = _parse_reclamations(text)
        print(f"RBQ PDF: {len(reclamations)} réclamations parsées")

        for entry in reclamations:
            matched = _store_event_indexed(
                db, idx, existing_events,
                licence=entry["licence"],
                event_type="réclamation",
                source="rbq_pdf_reclamations",
                description=f"{entry['nb_reclamations']} réclamation(s) en cours",
                montant=None,
            )
            if matched:
                counts["matched"] += 1
        counts["reclamations"] = len(reclamations)
    else:
        print(f"RBQ PDF: {PDF_RECLAMATIONS.name} non trouvé")

    # --- Indemnités versées ---
    if PDF_INDEMNITES.exists():
        print(f"RBQ PDF: Lecture {PDF_INDEMNITES.name}...")
        text = _extract_text(PDF_INDEMNITES)
        indemnites = _parse_indemnites(text)
        print(f"RBQ PDF: {len(indemnites)} indemnités parsées")

        for entry in indemnites:
            matched = _store_event_indexed(
                db, idx, existing_events,
                licence=entry["licence"],
                event_type="réclamation",
                source="rbq_pdf_indemnites",
                description=f"{entry['nb_reclamations']} réclamation(s), {entry['nb_indemnites']} indemnité(s) versée(s)",
                montant=entry["montant"],
            )
            if matched:
                counts["matched"] += 1
        counts["indemnites"] = len(indemnites)
    else:
        print(f"RBQ PDF: {PDF_INDEMNITES.name} non trouvé")

    await db.commit()
    print(f"RBQ PDF: {counts['matched']} événements insérés "
          f"({counts['reclamations']} réclamations, {counts['indemnites']} indemnités)")
    return counts


def _store_event_indexed(
    db: AsyncSession,
    idx: ContractorIndex,
    existing_events: set,
    licence: Optional[str],
    event_type: str,
    source: str,
    description: str,
    montant: Optional[Decimal],
) -> bool:
    """Stocke un événement en utilisant l'index en mémoire, avec déduplication par description."""
    if not licence:
        return False

    contractor = idx.by_licence.get(licence)
    if not contractor:
        return False

    # Déduplication précise : même contractor + même source + même description
    dedup_key = (contractor.id, source, description)
    if dedup_key in existing_events:
        return False

    db.add(RBQEvent(
        contractor_id=contractor.id,
        event_type=event_type,
        source=source,
        description=description,
        montant=montant,
    ))
    existing_events.add(dedup_key)
    print(f"  → {contractor.nom_legal} ({licence}) : {description}"
          + (f" — {montant} $" if montant else ""))
    return True