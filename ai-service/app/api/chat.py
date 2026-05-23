"""
Chat API — handles message sending and SSE streaming.
"""
import json
import asyncio
from fastapi import APIRouter, Request, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from sse_starlette.sse import EventSourceResponse
import structlog

from app.rag.pipeline import RAGPipeline

log = structlog.get_logger()
router = APIRouter()


def get_rag(request: Request) -> RAGPipeline:
    return request.app.state.rag


# ─── Schemas ──────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    session_id: str
    message: str
    context: Optional[str] = None  # current lesson title/content snippet
    chat_history: Optional[list] = None


class ChatResponse(BaseModel):
    response: str
    sources: list
    session_id: str


# ─── Non-streaming endpoint ────────────────────────────────────────────────────

@router.post("", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    rag: RAGPipeline = Depends(get_rag),
):
    """Standard non-streaming chat endpoint."""
    log.info("Chat request", session_id=body.session_id, message_len=len(body.message))
    result = await rag.query(
        message=body.message,
        session_id=body.session_id,
        chat_history=body.chat_history,
        context=body.context,
    )
    return result


# ─── Streaming SSE endpoint ────────────────────────────────────────────────────

@router.get("/stream")
async def chat_stream(
    request: Request,
    session_id: str = Query(...),
    message: str = Query(...),
    context: Optional[str] = Query(None),
    rag: RAGPipeline = Depends(get_rag),
):
    """
    Server-Sent Events streaming endpoint.
    Frontend connects via EventSource and receives delta chunks.

    Event format:
      data: {"type": "delta", "content": "..."}
      data: {"type": "sources", "sources": [...]}
      data: {"type": "done"}
      data: {"type": "error", "message": "..."}
    """
    log.info("Stream request", session_id=session_id)

    async def event_generator():
        try:
            async for event in rag.stream(
                message=message,
                session_id=session_id,
                context=context,
            ):
                if await request.is_disconnected():
                    log.info("Client disconnected", session_id=session_id)
                    break
                yield {"data": json.dumps(event)}
        except asyncio.CancelledError:
            log.info("Stream cancelled", session_id=session_id)
        except Exception as e:
            log.error("Stream error", error=str(e))
            yield {"data": json.dumps({"type": "error", "message": str(e)})}

    return EventSourceResponse(event_generator())


# ─── Session management ────────────────────────────────────────────────────────

@router.get("/sessions")
async def list_sessions():
    """List recent chat sessions (placeholder — implement with DB)."""
    return {"sessions": []}


@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get messages for a session."""
    return {"session_id": session_id, "messages": []}


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a chat session."""
    return {"deleted": session_id}
