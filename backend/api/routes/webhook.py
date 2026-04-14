from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def webhook_health():
    """Health check for webhook endpoint."""
    return {"status": "ok"}