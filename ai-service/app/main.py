"""
TechLearn AI Service
FastAPI + LangChain RAG pipeline with multi-LLM support
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import structlog

from app.core.config import settings
from app.core.database import init_db
from app.rag.pipeline import RAGPipeline
from app.api import chat, code_runner, health

log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize resources on startup, clean up on shutdown."""
    log.info("Starting TechLearn AI Service", llm_provider=settings.LLM_PROVIDER)
    await init_db()

    # Initialize RAG pipeline (loads vector store)
    pipeline = RAGPipeline()
    await pipeline.initialize()
    app.state.rag = pipeline

    log.info("AI Service ready", vector_db=settings.VECTOR_DB)
    yield

    log.info("Shutting down AI Service")


app = FastAPI(
    title="TechLearn AI Service",
    description="RAG-powered AI tutor with multi-LLM support",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, tags=["health"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(code_runner.router, prefix="/code", tags=["code"])
