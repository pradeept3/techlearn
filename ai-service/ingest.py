#!/usr/bin/env python3
"""
ingest.py — Load all course markdown files into the vector DB.

Run this once before starting the AI service, and again whenever
you add or update course content.

Usage:
  python ingest.py                    # ingest all tracks
  python ingest.py --track python     # ingest one track
  python ingest.py --reset            # clear DB first, then ingest
"""
import asyncio
import argparse
import os
from pathlib import Path
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
import structlog

from app.core.config import settings
from app.core.llm_factory import get_embeddings

log = structlog.get_logger()

CONTENT_DIR = Path("./data/courses")

TRACK_METADATA = {
    "python":        {"name": "Python", "tag": "Core"},
    "sql":           {"name": "SQL & Databases", "tag": "Core"},
    "ml":            {"name": "Machine Learning", "tag": "AI/ML"},
    "java":          {"name": "Java & Spring Boot", "tag": "Backend"},
    "cloud":         {"name": "Cloud & DevOps", "tag": "Infrastructure"},
    "nlp":           {"name": "NLP & AI", "tag": "AI/ML"},
    "llm":           {"name": "Large Language Models", "tag": "AI/ML"},
    "data-analysis": {"name": "Data Analysis", "tag": "Data"},
}


def load_documents(track_filter: str | None = None) -> list[Document]:
    """Load all markdown files from the courses directory."""
    docs = []
    tracks = [track_filter] if track_filter else list(TRACK_METADATA.keys())

    for track_id in tracks:
        track_dir = CONTENT_DIR / track_id
        if not track_dir.exists():
            log.warning("Track directory not found", track=track_id, path=str(track_dir))
            continue

        meta = TRACK_METADATA[track_id]
        for md_file in sorted(track_dir.glob("**/*.md")):
            content = md_file.read_text(encoding="utf-8")
            lesson_title = md_file.stem.replace("-", " ").replace("_", " ").title()

            docs.append(Document(
                page_content=content,
                metadata={
                    "track_id": track_id,
                    "track": meta["name"],
                    "tag": meta["tag"],
                    "lesson_title": lesson_title,
                    "source": str(md_file),
                    "filename": md_file.name,
                },
            ))
        log.info("Loaded track", track=track_id, files=len(list(track_dir.glob("**/*.md"))))

    return docs


def chunk_documents(docs: list[Document]) -> list[Document]:
    """Split documents into overlapping chunks for retrieval."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        separators=["\n## ", "\n### ", "\n#### ", "\n\n", "\n", ". ", " "],
        keep_separator=True,
    )
    chunks = splitter.split_documents(docs)
    log.info("Chunked documents", total_docs=len(docs), total_chunks=len(chunks))
    return chunks


def get_vectorstore(embeddings, reset: bool = False):
    """Get or create the vector store."""
    vdb = settings.VECTOR_DB

    if vdb == "chroma":
        from langchain_community.vectorstores import Chroma
        if reset and Path(settings.CHROMA_PERSIST_DIR).exists():
            import shutil
            shutil.rmtree(settings.CHROMA_PERSIST_DIR)
            log.info("Cleared Chroma DB")
        return Chroma(
            persist_directory=settings.CHROMA_PERSIST_DIR,
            embedding_function=embeddings,
            collection_name="techlearn_courses",
        )

    elif vdb == "pinecone":
        from pinecone import Pinecone, ServerlessSpec
        from langchain_pinecone import PineconeVectorStore
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        if reset and settings.PINECONE_INDEX in [i.name for i in pc.list_indexes()]:
            pc.delete_index(settings.PINECONE_INDEX)
            log.info("Deleted Pinecone index")
        if settings.PINECONE_INDEX not in [i.name for i in pc.list_indexes()]:
            pc.create_index(
                name=settings.PINECONE_INDEX,
                dimension=1536,  # text-embedding-3-small
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1"),
            )
            log.info("Created Pinecone index", index=settings.PINECONE_INDEX)
        return PineconeVectorStore(
            index=pc.Index(settings.PINECONE_INDEX),
            embedding=embeddings,
            namespace=settings.PINECONE_NAMESPACE,
        )

    elif vdb == "weaviate":
        import weaviate
        from langchain_weaviate import WeaviateVectorStore
        client = weaviate.connect_to_custom(
            http_host=settings.WEAVIATE_URL.replace("http://", "").split(":")[0],
            http_port=int(settings.WEAVIATE_URL.split(":")[-1]),
        )
        return WeaviateVectorStore(
            client=client,
            index_name=settings.WEAVIATE_CLASS,
            text_key="content",
            embedding=embeddings,
        )

    raise ValueError(f"Unknown vector DB: {vdb}")


async def main(track: str | None = None, reset: bool = False):
    log.info("Starting ingestion", vector_db=settings.VECTOR_DB, llm_provider=settings.LLM_PROVIDER)

    embeddings = get_embeddings()
    vectorstore = get_vectorstore(embeddings, reset=reset)

    docs = load_documents(track)
    if not docs:
        log.error("No documents found. Create markdown files in ./data/courses/<track_id>/")
        return

    chunks = chunk_documents(docs)

    # Batch ingest to avoid rate limits
    BATCH_SIZE = 50
    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i : i + BATCH_SIZE]
        vectorstore.add_documents(batch)
        log.info("Ingested batch", batch=f"{i//BATCH_SIZE + 1}/{(len(chunks)//BATCH_SIZE)+1}")
        await asyncio.sleep(0.5)  # rate limit buffer

    log.info("✅ Ingestion complete!", total_chunks=len(chunks), vector_db=settings.VECTOR_DB)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest course content into vector DB")
    parser.add_argument("--track", help="Ingest only one track (e.g. python, ml)")
    parser.add_argument("--reset", action="store_true", help="Clear vector DB before ingesting")
    args = parser.parse_args()
    asyncio.run(main(track=args.track, reset=args.reset))
