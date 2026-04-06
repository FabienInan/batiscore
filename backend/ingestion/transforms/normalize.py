import re
import unicodedata


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