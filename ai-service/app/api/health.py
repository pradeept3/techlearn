from fastapi import APIRouter, Request
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health(request: Request):
    rag = getattr(request.app.state, "rag", None)
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "rag_ready": rag is not None and rag.vectorstore is not None,
        "service": "TechLearn AI Service",
    }


@router.get("/")
async def root():
    return {"message": "TechLearn AI Service — visit /docs for API reference"}
