#!/usr/bin/env python3
"""
Point d'entrée pour l'ingestion des données.

Usage:
    python -m ingestion.run --source rbq
    python -m ingestion.run --source req
    python -m ingestion.run --source seao
    python -m ingestion.run --source cnesst
    python -m ingestion.run --source rbq_decisions
    python -m ingestion.run --source rbq_pdf
    python -m ingestion.run --source canlii
    python -m ingestion.run --source scoring
    python -m ingestion.run --source all

Fichiers locaux (optionnel, pris en priorité sur le téléchargement):
    backend/data/rbq.json   → curl -L -o backend/data/rbq.json "<URL_WAYBACK_RBQ>"
    backend/data/req.zip    → curl -L -o backend/data/req.zip "<URL_WAYBACK_REQ>"
    backend/data/seao.json  → téléchargement manuel requis (pas de source automatique)
    backend/data/reclamations-en-cours.pdf → PDF RBQ réclamations (manuel)
    backend/data/tableau-indemnites-versees.pdf → PDF RBQ indemnités (manuel)
"""

import asyncio
import argparse

from database import async_session
from ingestion.sources.rbq import ingest_rbq
from ingestion.sources.req import ingest_req
from ingestion.sources.seao import ingest_seao
from ingestion.sources.cnesst import scrape_cnesst_default_list
from ingestion.sources.rbq_decisions import ingest_rbq_decisions
from ingestion.sources.rbq_pdf import ingest_rbq_pdfs
from ingestion.sources.canlii import ingest_canlii_rbq
from scoring.engine import recalculate_all_scores


async def run_ingestion(source: str):
    """Exécute l'ingestion pour une source donnée."""
    async with async_session() as db:
        if source == "rbq":
            count = await ingest_rbq(db)
            print(f"RBQ: {count:,} entrepreneurs traités")

        elif source == "req":
            count = await ingest_req(db)
            print(f"REQ: {count:,} entreprises traitées")

        elif source == "seao":
            count = await ingest_seao(db)
            print(f"SEAO: {count:,} contrats traités")

        elif source == "cnesst":
            results = await scrape_cnesst_default_list(db)
            print(f"CNESST: {len(results)} employeurs en défaut traités")

        elif source == "rbq_pdf":
            result = await ingest_rbq_pdfs(db)
            print(f"RBQ PDF: {result['matched']} événements insérés")

        elif source == "rbq_decisions":
            count = await ingest_rbq_decisions(db)
            print(f"RBQ Décisions: {count} décisions liées")

        elif source == "canlii":
            count = await ingest_canlii_rbq(db)
            print(f"CanLII RBQ: {count} décisions ingérées")

        elif source == "scoring":
            await recalculate_all_scores(db)

        elif source == "all":
            print("=== Ingestion complète ===")
            counts = {}
            counts["rbq"] = await ingest_rbq(db)
            counts["req"] = await ingest_req(db)
            counts["seao"] = await ingest_seao(db)
            cnesst = await scrape_cnesst_default_list(db)
            counts["cnesst"] = len(cnesst)
            counts["rbq_decisions"] = await ingest_rbq_decisions(db)
            rbq_pdf_result = await ingest_rbq_pdfs(db)
            counts["rbq_pdf"] = rbq_pdf_result["matched"]
            counts["canlii"] = await ingest_canlii_rbq(db)
            await recalculate_all_scores(db)
            print("=== Résumé ===")
            for src, count in counts.items():
                status = "✓" if count > 0 else "⚠ (0 — fichier manquant?)"
                print(f"  {src.upper()}: {count:,} {status}")
            print("=== Ingestion terminée ===")

        else:
            print(f"Source inconnue: {source}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingestion des données")
    parser.add_argument(
        "--source",
        choices=["rbq", "req", "seao", "cnesst", "rbq_decisions", "rbq_pdf", "canlii", "scoring", "all"],
        default="rbq",
        help="Source à ingérer (défaut: rbq)",
    )
    args = parser.parse_args()
    asyncio.run(run_ingestion(args.source))
