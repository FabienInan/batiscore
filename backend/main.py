from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import search, report, webhook
from database import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: créer les tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown


app = FastAPI(
    title="RBQ Checker API",
    description="API de vérification d'entrepreneurs en construction au Québec",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS pour le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(search.router, prefix="/api", tags=["search"])
app.include_router(report.router, prefix="/api", tags=["report"])
app.include_router(webhook.router, prefix="/api", tags=["webhook"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}