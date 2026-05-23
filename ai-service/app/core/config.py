from pydantic_settings import BaseSettings
from typing import Literal, List
from functools import lru_cache


class Settings(BaseSettings):
    # ─── App ──────────────────────────────────────────────────────────────────
    APP_NAME: str = "TechLearn AI Service"
    DEBUG: bool = False
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:8080"]

    # ─── LLM Provider ─────────────────────────────────────────────────────────
    # Choose: openai | anthropic | google | ollama
    LLM_PROVIDER: Literal["openai", "anthropic", "google", "ollama"] = "openai"
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_TEMPERATURE: float = 0.1
    LLM_MAX_TOKENS: int = 2048

    # OpenAI
    OPENAI_API_KEY: str = ""

    # Anthropic
    ANTHROPIC_API_KEY: str = ""

    # Google Gemini
    GOOGLE_API_KEY: str = ""

    # Ollama (local)
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # ─── Embeddings ────────────────────────────────────────────────────────────
    EMBEDDING_MODEL: str = "text-embedding-3-small"  # or "nomic-embed-text" for Ollama

    # ─── Vector DB ────────────────────────────────────────────────────────────
    # Choose: pinecone | weaviate | chroma
    VECTOR_DB: Literal["pinecone", "weaviate", "chroma"] = "chroma"
    CHROMA_PERSIST_DIR: str = "./data/chroma"

    # Pinecone
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX: str = "techlearn-courses"
    PINECONE_NAMESPACE: str = "lessons"

    # Weaviate
    WEAVIATE_URL: str = "http://localhost:8090"
    WEAVIATE_API_KEY: str = ""
    WEAVIATE_CLASS: str = "TechLearnLesson"

    # ─── RAG ──────────────────────────────────────────────────────────────────
    RAG_TOP_K: int = 4
    RAG_SCORE_THRESHOLD: float = 0.6
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200

    # ─── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/techlearn"

    # ─── Auth (shared secret with Spring Boot) ────────────────────────────────
    JWT_SECRET: str = "your-super-secret-key-minimum-256-bits-long-change-in-production"

    # ─── Code Execution ────────────────────────────────────────────────────────
    CODE_EXECUTION_TIMEOUT: int = 10  # seconds
    ENABLE_CODE_EXECUTION: bool = True
    DOCKER_AVAILABLE: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
