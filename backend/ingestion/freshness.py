"""
Contrôles de fraîcheur des fichiers sources d'ingestion.

- ensure_writable : vérifie que le processus peut écrire le fichier (ou son dossier)
  avant de tenter un téléchargement, pour échouer clairement au lieu de
  consommer des téléchargements inutiles.
- assert_fresh : vérifie après l'ingestion que le fichier n'est pas plus vieux
  que le seuil. Sert à faire échouer le job au lieu de se contenter d'un
  fichier périmé sans rien signaler.
"""
import os
import pwd
from datetime import datetime
from pathlib import Path


class SourceRefreshError(RuntimeError):
    """Un fichier source n'a pas pu être rafraîchi ou est périmé."""


def _current_user() -> str:
    try:
        return pwd.getpwuid(os.getuid()).pw_name
    except Exception:
        return str(os.getuid())


def _owner(path: Path) -> str:
    try:
        return pwd.getpwuid(path.stat().st_uid).pw_name
    except Exception:
        return "inconnu"


def age_days(path: Path) -> float:
    return (datetime.now().timestamp() - path.stat().st_mtime) / 86400


def ensure_writable(path: Path) -> None:
    """Lève SourceRefreshError si le processus ne peut pas écrire `path`."""
    if path.exists():
        writable = os.access(path, os.W_OK)
    else:
        writable = os.access(path.parent, os.W_OK)

    if not writable:
        owner = _owner(path) if path.exists() else _owner(path.parent)
        raise SourceRefreshError(
            f"{path} n'est pas inscriptible par l'utilisateur {_current_user()} "
            f"(propriétaire : {owner}). Corriger les droits (chown) pour le service."
        )


def assert_fresh(label: str, path: Path, max_days: int) -> None:
    """Lève SourceRefreshError si le fichier est absent ou plus vieux que max_days."""
    if not path.exists():
        raise SourceRefreshError(f"{label} : fichier absent ({path})")

    age = age_days(path)
    if age > max_days:
        raise SourceRefreshError(
            f"{label} : fichier périmé ({age:.0f} jours, maximum {max_days} jours) : {path}"
        )
