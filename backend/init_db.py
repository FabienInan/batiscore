#!/usr/bin/env python3
"""Créer les tables de la base de données."""
import asyncio
from sqlalchemy import text
from database import engine, Base
from models import Contractor, RBQEvent, OPCPlainte, Litige, SEAOContract, Report, OPCCache


async def init_db():
    async with engine.begin() as conn:
        # Extension nécessaire pour similarity() (recherche floue)
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
        await conn.run_sync(Base.metadata.create_all)
        # Migration: ajout colonne case_id si absente
        await conn.execute(text(
            "ALTER TABLE rbq_events ADD COLUMN IF NOT EXISTS case_id VARCHAR(100)"
        ))
    print("Tables créées avec succès!")


if __name__ == "__main__":
    asyncio.run(init_db())