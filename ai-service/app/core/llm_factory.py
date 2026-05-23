"""
LLM Factory — supports OpenAI, Anthropic, Google Gemini, and Ollama.
Switch providers by setting LLM_PROVIDER in .env.
"""
from langchain_core.language_models import BaseChatModel
from langchain_core.embeddings import Embeddings
from app.core.config import settings
import structlog

log = structlog.get_logger()


def get_llm() -> BaseChatModel:
    """Return configured LLM based on LLM_PROVIDER setting."""
    provider = settings.LLM_PROVIDER
    model = settings.LLM_MODEL
    temperature = settings.LLM_TEMPERATURE

    log.info("Loading LLM", provider=provider, model=model)

    if provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=model or "gpt-4o-mini",
            temperature=temperature,
            max_tokens=settings.LLM_MAX_TOKENS,
            api_key=settings.OPENAI_API_KEY,
            streaming=True,
        )

    elif provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model=model or "claude-3-5-haiku-20241022",
            temperature=temperature,
            max_tokens=settings.LLM_MAX_TOKENS,
            api_key=settings.ANTHROPIC_API_KEY,
            streaming=True,
        )

    elif provider == "google":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model=model or "gemini-1.5-flash",
            temperature=temperature,
            max_output_tokens=settings.LLM_MAX_TOKENS,
            google_api_key=settings.GOOGLE_API_KEY,
        )

    elif provider == "ollama":
        from langchain_ollama import ChatOllama
        return ChatOllama(
            model=model or "llama3.2",
            temperature=temperature,
            base_url=settings.OLLAMA_BASE_URL,
        )

    else:
        raise ValueError(f"Unknown LLM provider: {provider}")


def get_embeddings() -> Embeddings:
    """Return embedding model. Uses OpenAI or Ollama nomic-embed."""
    if settings.LLM_PROVIDER == "ollama":
        from langchain_ollama import OllamaEmbeddings
        return OllamaEmbeddings(
            model="nomic-embed-text",
            base_url=settings.OLLAMA_BASE_URL,
        )
    else:
        # Default: OpenAI embeddings (works with any LLM provider)
        from langchain_openai import OpenAIEmbeddings
        return OpenAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            api_key=settings.OPENAI_API_KEY or "dummy",  # if using Anthropic/Google
        )
