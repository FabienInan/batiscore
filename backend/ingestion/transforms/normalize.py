import re
import unicodedata
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Contractor


def normalize_name(name: str) -> str:
    """
    Normalise un nom d'entreprise pour le fuzzy matching.

    'Rénovations Tremblay & Fils Inc.' → 'renovations tremblay fils'

    Args:
        name: Nom de l'entreprise à normaliser

    Returns:
        Nom normalisé (lowercase, sans accents, sans mots vides)
    """
    if not name:
        return ""

    name = name.lower()

    # Supprimer les accents
    name = unicodedata.normalize("NFD", name)
    name = "".join(c for c in name if unicodedata.category(c) != "Mn")

    # Supprimer la ponctuation
    name = re.sub(r"[&.,'\-]", " ", name)

    # Supprimer les mots vides (formes juridiques courantes)
    stop_words = [
        "inc", "ltee", "ltée", "enr", "cie", "co", "corp",
        "construction", "renovation", "renovations", "entreprise",
        "les", "le", "la", "du", "de", "et", "and"
    ]
    pattern = r"\b(" + "|".join(stop_words) + r")\b"
    name = re.sub(pattern, "", name)

    # Normaliser les espaces
    name = re.sub(r"\s+", " ", name).strip()

    return name


def normalize_phone(phone: str) -> str:
    """Normalise un numéro de téléphone: XXX-XXX-XXXX"""
    if not phone:
        return ""

    # Garder seulement les chiffres
    digits = re.sub(r"\D", "", phone)

    # Formater si 10 chiffres
    if len(digits) == 10:
        return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"

    return phone


def normalize_neq(neq: str) -> str:
    """Normalise un NEQ: 10 chiffres."""
    if not neq:
        return ""

    digits = re.sub(r"\D", "", neq)
    return digits if len(digits) == 10 else neq


def normalize_licence_rbq(licence: str) -> str:
    """Normalise un numéro de licence RBQ: XXXX-XXXX-XX"""
    if not licence:
        return ""

    digits = re.sub(r"\D", "", licence)

    if len(digits) == 10:
        return f"{digits[:4]}-{digits[4:8]}-{digits[8:]}"

    return licence


class ContractorIndex:
    """Index en mémoire des contractors pour lookups O(1) pendant l'ingestion.

    Usage:
        idx = await ContractorIndex.load(db)
        contractor = idx.by_licence.get("5685-1470-01")
    """

    def __init__(self, by_licence: dict, by_neq: dict, by_nom: dict):
        self.by_licence = by_licence
        self.by_neq = by_neq
        self.by_nom = by_nom

    @classmethod
    async def load(cls, db: AsyncSession) -> "ContractorIndex":
        """Charge tous les contractors en mémoire."""
        result = await db.execute(select(Contractor))
        contractors = result.scalars().all()

        by_licence = {}
        by_neq = {}
        by_nom = {}

        for c in contractors:
            if c.licence_rbq:
                by_licence[c.licence_rbq] = c
            if c.neq:
                by_neq[c.neq] = c
            if c.nom_normalized:
                by_nom[c.nom_normalized] = c

        print(f"Index: {len(contractors):,} contractors chargés "
              f"({len(by_licence):,} par licence, {len(by_neq):,} par NEQ, {len(by_nom):,} par nom)")
        return cls(by_licence, by_neq, by_nom)