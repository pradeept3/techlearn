"""
TechLearn RAG Pipeline

Flow:
  User message
    → Contextualize (rewrite with chat history)
    → Retrieve from vector DB (top-k course chunks)
    → Build prompt with retrieved context
    → LLM generates streaming response
    → Return response + source metadata
"""
from typing import AsyncIterator, Any
from langchain_core.vectorstores import VectorStore
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain.text_splitter import RecursiveCharacterTextSplitter
import structlog

from app.core.config import settings
from app.core.llm_factory import get_llm, get_embeddings

log = structlog.get_logger()

# ─── System Prompt ────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are **Aria**, the AI tutor for TechLearn — an education platform covering Python, SQL, Machine Learning, Java, Spring Boot, Cloud, NLP, and Large Language Models.

You have access to TechLearn's full course library through retrieval. Use the retrieved course content below as your primary source of truth when answering.

**Your teaching style:**
- Explain concepts clearly with real-world analogies
- Always include working code examples when relevant
- Use bullet points and structure for clarity
- Highlight key terms in **bold**
- Add 💡 tips for gotchas and best practices
- When asked to compare things, use concise tables
- If the question is outside the course content, say so and answer from general knowledge

**Retrieved course content:**
{context}

**Instructions:**
- Prioritize retrieved content over general knowledge
- If you cite from a specific lesson, mention it
- Keep responses focused and actionable
- Offer to go deeper: "Want me to show you a full example?" or "I can quiz you on this"
"""

CONTEXTUALIZE_PROMPT = """Given the chat history and the latest user question, 
rewrite the question to be self-contained (resolve pronouns like "it", "that", "this").
If the question is already clear, return it unchanged. Do NOT answer the question.

Chat history: {chat_history}
Question: {input}
Rewritten question:"""


class RAGPipeline:
    """Manages vector store and RAG chain."""

    def __init__(self):
        self.vectorstore: VectorStore | None = None
        self.retriever = None
        self.llm = None
        self.rag_chain = None

    async def initialize(self):
        """Set up vector store and chain."""
        self.llm = get_llm()
        embeddings = get_embeddings()
        self.vectorstore = await self._load_vectorstore(embeddings)
        self.retriever = self.vectorstore.as_retriever(
            search_type="similarity_score_threshold",
            search_kwargs={
                "k": settings.RAG_TOP_K,
                "score_threshold": settings.RAG_SCORE_THRESHOLD,
            },
        )
        self.rag_chain = self._build_chain()
        log.info("RAG pipeline initialized", vector_db=settings.VECTOR_DB)

    async def _load_vectorstore(self, embeddings) -> VectorStore:
        """Load or create vector store based on VECTOR_DB setting."""
        vdb = settings.VECTOR_DB

        if vdb == "chroma":
            from langchain_community.vectorstores import Chroma
            return Chroma(
                persist_directory=settings.CHROMA_PERSIST_DIR,
                embedding_function=embeddings,
                collection_name="techlearn_courses",
            )

        elif vdb == "pinecone":
            from langchain_pinecone import PineconeVectorStore
            from pinecone import Pinecone
            pc = Pinecone(api_key=settings.PINECONE_API_KEY)
            index = pc.Index(settings.PINECONE_INDEX)
            return PineconeVectorStore(
                index=index,
                embedding=embeddings,
                namespace=settings.PINECONE_NAMESPACE,
            )

        elif vdb == "weaviate":
            import weaviate
            from langchain_weaviate import WeaviateVectorStore
            client = weaviate.connect_to_custom(
                http_host=settings.WEAVIATE_URL.replace("http://", "").split(":")[0],
                http_port=int(settings.WEAVIATE_URL.split(":")[-1]),
                auth_credentials=weaviate.auth.AuthApiKey(settings.WEAVIATE_API_KEY)
                if settings.WEAVIATE_API_KEY else None,
            )
            return WeaviateVectorStore(
                client=client,
                index_name=settings.WEAVIATE_CLASS,
                text_key="content",
                embedding=embeddings,
            )

        raise ValueError(f"Unknown vector DB: {vdb}")

    def _build_chain(self):
        """Build the full RAG chain with history-aware retrieval."""

        # Step 1: Contextualize query with chat history
        contextualize_prompt = ChatPromptTemplate.from_messages([
            ("system", CONTEXTUALIZE_PROMPT),
        ])
        contextualize_chain = contextualize_prompt | self.llm | StrOutputParser()

        def contextualize_if_needed(input_dict):
            history = input_dict.get("chat_history", [])
            if not history:
                return input_dict["input"]
            result = contextualize_chain.invoke({
                "input": input_dict["input"],
                "chat_history": "\n".join([
                    f"{'User' if isinstance(m, HumanMessage) else 'Aria'}: {m.content}"
                    for m in history[-6:]  # last 3 exchanges
                ]),
            })
            return result

        # Step 2: Full RAG chain
        rag_prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ])

        return (
            RunnablePassthrough.assign(
                contextualized_input=contextualize_if_needed
            )
            | RunnablePassthrough.assign(
                context=lambda x: self._format_docs(
                    self.retriever.invoke(x["contextualized_input"])
                ),
                retrieved_docs=lambda x: self.retriever.invoke(x["contextualized_input"]),
            )
            | {
                "answer": rag_prompt | self.llm | StrOutputParser(),
                "sources": lambda x: self._extract_sources(x.get("retrieved_docs", [])),
            }
        )

    def _format_docs(self, docs) -> str:
        if not docs:
            return "No specific course content found for this query."
        parts = []
        for i, doc in enumerate(docs, 1):
            meta = doc.metadata
            parts.append(
                f"[Source {i}: {meta.get('track', '')} — {meta.get('lesson_title', '')}]\n"
                f"{doc.page_content}"
            )
        return "\n\n---\n\n".join(parts)

    def _extract_sources(self, docs) -> list[dict]:
        return [
            {
                "trackId": doc.metadata.get("track_id", ""),
                "lessonTitle": doc.metadata.get("lesson_title", ""),
                "relevanceScore": doc.metadata.get("score", 0.8),
                "excerpt": doc.page_content[:200] + "...",
            }
            for doc in docs
        ]

    async def query(
        self,
        message: str,
        session_id: str,
        chat_history: list = None,
        context: str = None,
    ) -> dict:
        """Non-streaming query."""
        full_input = message
        if context:
            full_input = f"[Current lesson context: {context}]\n\n{message}"

        result = self.rag_chain.invoke({
            "input": full_input,
            "chat_history": chat_history or [],
        })
        return {
            "response": result["answer"],
            "sources": result["sources"],
            "session_id": session_id,
        }

    async def stream(
        self,
        message: str,
        session_id: str,
        chat_history: list = None,
        context: str = None,
    ) -> AsyncIterator[dict]:
        """Streaming query — yields delta events for SSE."""
        full_input = message
        if context:
            full_input = f"[Current lesson context: {context}]\n\n{message}"

        # First retrieve docs for sources
        contextualized = full_input
        docs = self.retriever.invoke(contextualized)
        sources = self._extract_sources(docs)
        context_str = self._format_docs(docs)

        # Build prompt and stream
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ])

        chain = prompt | self.llm | StrOutputParser()

        async for chunk in chain.astream({
            "input": full_input,
            "chat_history": chat_history or [],
            "context": context_str,
        }):
            yield {"type": "delta", "content": chunk}

        yield {"type": "sources", "sources": sources}
        yield {"type": "done"}


# ─── Content Ingestion ────────────────────────────────────────────────────────
async def ingest_course_content(pipeline: RAGPipeline, content_dir: str = "./data/courses"):
    """Chunk and ingest all course markdown files into the vector store."""
    import os
    from langchain_community.document_loaders import DirectoryLoader, TextLoader
    from langchain.text_splitter import RecursiveCharacterTextSplitter

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        separators=["\n## ", "\n### ", "\n\n", "\n", " "],
    )

    loader = DirectoryLoader(
        content_dir,
        glob="**/*.md",
        loader_cls=TextLoader,
        show_progress=True,
    )
    docs = loader.load()
    chunks = splitter.split_documents(docs)

    log.info("Ingesting documents", total_docs=len(docs), total_chunks=len(chunks))
    pipeline.vectorstore.add_documents(chunks)
    log.info("Ingestion complete")
