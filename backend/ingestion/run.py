#!/usr/bin/env python3
"""
Point d'entrée pour l'ingestion des données.

Usage:
    python -m ingestion.run --source rbq
    python -m ingestion.run --source req
    python -m ingestion.run --source all
"""

import asyncio
import argparse

from database import async_session
from ingestion.sources.rbq import ingest_rbq
# from ingestion.sources.req import ingest_req
# from ingestion.sources.seao import ingest_seao


async def run_ingestion(source: str):
    """Exécute l'ingestion pour une source donnée."""
    async with async_session() as db:
        if source == "rbq":
            await ingest_rbq(db)
        elif source == "req":
            # await ingest_req(db)
            print("Ingestion REQ non implémentée")
        elif source == "seao":
            # await ingest_seao(db)
            print("Ingestion SEAO non implémentée")
        elif source == "all":
            await ingest_rbq(db)
            # await ingest_req(db)
            # await ingest_seao(db)
        else:
            print(f"Source inconnue: {source}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingestion des données RBQ")
    parser.add_argument("--source", choices=["rbq", "req", "seao", "all"], default="rbq")
    args = parser.parse_args()

    asyncio.run(run_ingestion(args.source))