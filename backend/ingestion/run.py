#!/usr/bin/env python3
"""
Point d'entrée pour l'ingestion des données.

Usage:
    python -m ingestion.run --source rbq
    python -m ingestion.run --source req
    python -m ingestion.run --source seao
    python -m ingestion.run --source cnesst
    python -m ingestion.run --source all
    python -m ingestion.run --scoring
"""

import asyncio
import argparse

from database import async_session
from ingestion.sources.rbq import ingest_rbq
from ingestion.sources.req import ingest_req
from ingestion.sources.seao import ingest_seao
from ingestion.sources.cnesst import scrape_cnesst_default_list
from scoring.engine import recalculate_all_scores


async def run_ingestion(source: str):
    """Exécute l'ingestion pour une source donnée."""
    async with async_session() as db:
        if source == "rbq":
            await ingest_rbq(db)
        elif source == "req":
            await ingest_req(db)
        elif source == "seao":
            await ingest_seao(db)
        elif source == "cnesst":
            await scrape_cnesst_default_list(db)
        elif source == "all":
            print("=== Ingestion complète ===")
            await ingest_rbq(db)
            await ingest_req(db)
            await ingest_seao(db)
            await scrape_cnesst_default_list(db)
            await recalculate_all_scores(db)
            print("=== Ingestion terminée ===")
        elif source == "scoring":
            await recalculate_all_scores(db)
        else:
            print(f"Source inconnue: {source}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingestion des données RBQ")
    parser.add_argument("--source", choices=["rbq", "req", "seao", "all"], default="rbq")
    args = parser.parse_args()

    asyncio.run(run_ingestion(args.source))