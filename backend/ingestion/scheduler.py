"""
Scheduler pour les tâches d'ingestion récurrentes.

Utilise APScheduler pour exécuter:
- Ingestion RBQ quotidienne (3h)
- Ingestion REQ quotidienne (4h)
- Ingestion SEAO hebdomadaire (lundi 5h)
- Recalcul des scores (6h)
"""
import asyncio
import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from database import async_session
from ingestion.sources.rbq import ingest_rbq
from ingestion.sources.req import ingest_req
from ingestion.sources.seao import ingest_seao
from ingestion.sources.cnesst import scrape_cnesst_default_list
from ingestion.sources.rbq_decisions import ingest_rbq_decisions
from ingestion.sources.canlii import ingest_canlii_rbq
from scoring.engine import recalculate_all_scores


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def run_rbq_ingestion():
    """Tâche: Ingestion RBQ quotidienne."""
    logger.info("Début ingestion RBQ...")
    try:
        async with async_session() as db:
            await ingest_rbq(db)
        logger.info("Ingestion RBQ terminée")
    except Exception as e:
        logger.error(f"Erreur ingestion RBQ: {e}")


async def run_req_ingestion():
    """Tâche: Ingestion REQ quotidienne."""
    logger.info("Début ingestion REQ...")
    try:
        async with async_session() as db:
            await ingest_req(db)
        logger.info("Ingestion REQ terminée")
    except Exception as e:
        logger.error(f"Erreur ingestion REQ: {e}")


async def run_seao_ingestion():
    """Tâche: Ingestion SEAO hebdomadaire."""
    logger.info("Début ingestion SEAO...")
    try:
        async with async_session() as db:
            await ingest_seao(db)
        logger.info("Ingestion SEAO terminée")
    except Exception as e:
        logger.error(f"Erreur ingestion SEAO: {e}")


async def run_cnesst_scraping():
    """Tâche: Scraping CNESST hebdomadaire."""
    logger.info("Début scraping CNESST...")
    try:
        async with async_session() as db:
            await scrape_cnesst_default_list(db)
        logger.info("Scraping CNESST terminé")
    except Exception as e:
        logger.error(f"Erreur scraping CNESST: {e}")


async def run_rbq_decisions():
    """Tâche: Scraping décisions Bureau des régisseurs (60 derniers jours)."""
    logger.info("Début scraping RBQ décisions...")
    try:
        async with async_session() as db:
            await ingest_rbq_decisions(db)
        logger.info("Scraping RBQ décisions terminé")
    except Exception as e:
        logger.error(f"Erreur scraping RBQ décisions: {e}")


async def run_canlii():
    """Tâche: Ingestion CanLII qcrbq (décisions historiques)."""
    logger.info("Début ingestion CanLII...")
    try:
        async with async_session() as db:
            await ingest_canlii_rbq(db)
        logger.info("Ingestion CanLII terminée")
    except Exception as e:
        logger.error(f"Erreur ingestion CanLII: {e}")


async def run_scoring():
    """Tâche: Recalcul des scores quotidien."""
    logger.info("Début recalcul scores...")
    try:
        async with async_session() as db:
            await recalculate_all_scores(db)
        logger.info("Recalcul scores terminé")
    except Exception as e:
        logger.error(f"Erreur recalcul scores: {e}")


def setup_scheduler():
    """Configure les tâches planifiées."""

    # RBQ - tous les jours à 3h
    scheduler.add_job(
        run_rbq_ingestion,
        CronTrigger(hour=3, minute=0),
        id="rbq_daily",
        name="Ingestion RBQ quotidienne",
        replace_existing=True,
    )

    # REQ - tous les jours à 4h
    scheduler.add_job(
        run_req_ingestion,
        CronTrigger(hour=4, minute=0),
        id="req_daily",
        name="Ingestion REQ quotidienne",
        replace_existing=True,
    )

    # SEAO - tous les lundis à 5h
    scheduler.add_job(
        run_seao_ingestion,
        CronTrigger(day_of_week="mon", hour=5, minute=0),
        id="seao_weekly",
        name="Ingestion SEAO hebdomadaire",
        replace_existing=True,
    )

    # CNESST - tous les lundis à 5h30
    scheduler.add_job(
        run_cnesst_scraping,
        CronTrigger(day_of_week="mon", hour=5, minute=30),
        id="cnesst_weekly",
        name="Scraping CNESST hebdomadaire",
        replace_existing=True,
    )

    # RBQ Décisions (Bureau des régisseurs) - tous les jours à 5h45
    scheduler.add_job(
        run_rbq_decisions,
        CronTrigger(hour=5, minute=45),
        id="rbq_decisions_daily",
        name="Scraping décisions RBQ quotidien",
        replace_existing=True,
    )

    # CanLII qcrbq - tous les dimanches à 2h (rate limit: 5000 req/jour)
    scheduler.add_job(
        run_canlii,
        CronTrigger(day_of_week="sun", hour=2, minute=0),
        id="canlii_weekly",
        name="Ingestion CanLII hebdomadaire",
        replace_existing=True,
    )

    # Scoring - tous les jours à 6h
    scheduler.add_job(
        run_scoring,
        CronTrigger(hour=6, minute=0),
        id="scoring_daily",
        name="Recalcul scores quotidien",
        replace_existing=True,
    )

    logger.info("Scheduler configuré avec 7 tâches")


def start_scheduler():
    """Démarre le scheduler."""
    setup_scheduler()
    scheduler.start()
    logger.info("Scheduler démarré")


def stop_scheduler():
    """Arrête le scheduler."""
    scheduler.shutdown()
    logger.info("Scheduler arrêté")


if __name__ == "__main__":
    # Exécution manuelle pour test
    print("Démarrage du scheduler (Ctrl+C pour arrêter)...")
    start_scheduler()

    try:
        # Garder le processus actif
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        stop_scheduler()