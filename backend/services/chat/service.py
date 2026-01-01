from __future__ import annotations

import os
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.services.llm.chat_history import system_prompt
from backend.services.llm.groq_client import DEFAULT_MODEL, get_samples_json
from backend.services.onos.onos_client import get_network_info
from database.models import Conversation, Message


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _context_limit_tokens() -> int:
    # Rough budget; keep under model limit by default.
    # You can tune this per model later.
    raw = os.getenv("CHAT_CONTEXT_BUDGET_TOKENS", "6000")
    try:
        return int(raw)
    except ValueError:
        return 6000


def _estimate_tokens(text: str) -> int:
    # Very rough heuristic: ~4 chars per token in English.
    # Good enough to warn/hard-stop for long chats.
    return max(1, int(len(text) / 4))


def list_conversations(db: Session, *, user_id: int) -> List[Conversation]:
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc().nullslast(), Conversation.conversation_id.desc())
        .all()
    )


def create_conversation(db: Session, *, user_id: int, title: str | None = None) -> Conversation:
    now = _now()
    convo = Conversation(user_id=user_id, title=title, created_at=now, updated_at=now)
    db.add(convo)
    db.commit()
    db.refresh(convo)
    return convo


def get_conversation(db: Session, *, user_id: int, conversation_id: int) -> Conversation | None:
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == user_id, Conversation.conversation_id == conversation_id)
        .first()
    )


def list_messages(db: Session, *, user_id: int, conversation_id: int, limit: int = 200) -> List[Message]:
    convo = get_conversation(db, user_id=user_id, conversation_id=conversation_id)
    if convo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.message_id.asc())
        .limit(limit)
        .all()
    )


def _build_grounded_user_prompt(user_text: str, *, use_rag: bool) -> Tuple[str, Dict[str, float]]:
    timings: Dict[str, float] = {}
    t_start = time.perf_counter()

    if use_rag:
        t_rag = time.perf_counter()
        samples = get_samples_json(user_text, top_k=3)
        timings["rag_seconds"] = time.perf_counter() - t_rag
    else:
        samples = {"summary": [], "raw_samples": [], "note": "RAG disabled by request.", "timings": {}}

    t_net = time.perf_counter()
    network_info = get_network_info()
    timings["network_fetch_seconds"] = time.perf_counter() - t_net

    samples_summary = samples.get("summary", [])
    samples_raw = samples.get("raw_samples", [])
    samples_note = str(samples.get("note", "Use these samples as guidance."))
    rag_timings = samples.get("timings") or {}

    # Put grounding only on the *current* user message.
    grounded = (
        "Here are the current network state:\n"
        f"{network_info}\n\n"
        f"Here are similar intents and configs retrieved from the library ({'enabled' if use_rag else 'disabled'}):\n"
        f"Summary:\n{samples_summary}\n"
        f"Raw samples:\n{samples_raw}\n"
        f"Note: {samples_note}\n"
        "Now process this user request and output ONOS Intent config JSON:\n"
        f"{user_text}\n"
    )

    timings["prompt_build_seconds"] = time.perf_counter() - t_start
    return grounded, {**rag_timings, **timings}


def _check_context_budget(history: List[Message], current_grounded_prompt: str) -> None:
    # Estimate budget using system prompt + all history + current grounded prompt.
    total_tokens = _estimate_tokens(system_prompt) + _estimate_tokens(current_grounded_prompt)
    for m in history:
        total_tokens += _estimate_tokens(m.content)

    if total_tokens > _context_limit_tokens():
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Conversation context too long. Please start a new chat.",
        )


def _to_groq_messages(history: List[Message], current_grounded_prompt: str) -> List[Dict[str, str]]:
    msgs: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]
    for m in history:
        role = m.role
        if role not in ("user", "assistant", "system"):
            role = "user"
        msgs.append({"role": role, "content": m.content})
    msgs.append({"role": "user", "content": current_grounded_prompt})
    return msgs


def send_message(
    db: Session,
    *,
    user_id: int,
    conversation_id: int,
    user_text: str,
    model: str | None,
    use_rag: bool,
) -> Dict[str, Any]:
    from groq import Groq  # local import to keep module import light

    convo = get_conversation(db, user_id=user_id, conversation_id=conversation_id)
    if convo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    # Load existing messages in this conversation (user-visible only).
    history = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.message_id.asc())
        .all()
    )

    grounded_prompt, grounding_timings = _build_grounded_user_prompt(user_text, use_rag=use_rag)
    _check_context_budget(history, grounded_prompt)

    selected_model = model or DEFAULT_MODEL
    messages_for_llm = _to_groq_messages(history, grounded_prompt)

    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not set in environment")

    t_llm = time.perf_counter()
    client = Groq(api_key=groq_key)
    chat_completion = client.chat.completions.create(messages=messages_for_llm, model=selected_model)
    llm_seconds = time.perf_counter() - t_llm

    reply = chat_completion.choices[0].message.content

    now = _now()
    # Create user-visible rows (raw user text + assistant reply).
    user_msg = Message(conversation_id=conversation_id, role="user", content=user_text, created_at=now)
    assistant_msg = Message(conversation_id=conversation_id, role="assistant", content=reply, created_at=now)
    db.add(user_msg)
    db.add(assistant_msg)

    # Set conversation title if missing.
    if not convo.title:
        convo.title = (user_text.strip()[:60] or "New chat")
    convo.updated_at = now

    db.commit()
    db.refresh(convo)
    db.refresh(user_msg)
    db.refresh(assistant_msg)

    timings = {**grounding_timings, "llm_seconds": llm_seconds}
    return {
        "conversation": convo,
        "user_message": user_msg,
        "assistant_message": assistant_msg,
        "model": selected_model,
        "use_rag": use_rag,
        "timings": timings,
    }


__all__ = [
    "list_conversations",
    "create_conversation",
    "get_conversation",
    "list_messages",
    "send_message",
]

