"""
migrate_chat_history_to_conversations.py
---------------------------------------
One-time helper to migrate the legacy `chat_history` table (prompt/response pairs)
into the newer `conversations` + `messages` tables.

Strategy:
- For each user_id that has legacy chat_history rows, create a single Conversation
  titled "Imported chat history" (unless one already exists).
- For each legacy row, create two Message rows:
  - role='user', content=prompt
  - role='assistant', content=response

This keeps user-visible history. It does NOT store old network snapshots / RAG
context, because those should be generated fresh per request.

Usage:
    uv run python3 database/create_missing_tables.py
    uv run python3 database/migrate_chat_history_to_conversations.py
"""

from __future__ import annotations

from datetime import datetime
import sys
from pathlib import Path
from typing import Dict, Optional

from sqlalchemy.orm import Session

# Ensure imports resolve from project root (so `database/` is treated as a package,
# not as the current working directory shadowing it).
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from database import SessionLocal
from database.models import ChatHistory, Conversation, Message


def _ensure_conversation(db: Session, user_id: int) -> Conversation:
    existing: Optional[Conversation] = (
        db.query(Conversation)
        .filter(Conversation.user_id == user_id, Conversation.title == "Imported chat history")
        .order_by(Conversation.conversation_id.asc())
        .first()
    )
    if existing:
        return existing

    convo = Conversation(
        user_id=user_id,
        title="Imported chat history",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(convo)
    db.commit()
    db.refresh(convo)
    return convo


def main() -> None:
    db: Optional[Session] = None
    try:
        db = SessionLocal()
        # Map user_id -> conversation
        convos: Dict[int, Conversation] = {}

        rows = db.query(ChatHistory).order_by(ChatHistory.user_id.asc(), ChatHistory.chat_id.asc()).all()
        if not rows:
            print("ℹ️  No legacy chat_history rows found; nothing to migrate.")
            return

        created_messages = 0
        for r in rows:
            convo = convos.get(r.user_id)
            if convo is None:
                convo = _ensure_conversation(db, r.user_id)
                convos[r.user_id] = convo

            ts = r.created_at
            # Create user message
            if r.prompt:
                db.add(
                    Message(
                        conversation_id=convo.conversation_id,
                        role="user",
                        content=r.prompt,
                        created_at=ts,
                    )
                )
                created_messages += 1
            # Create assistant message
            if r.response:
                db.add(
                    Message(
                        conversation_id=convo.conversation_id,
                        role="assistant",
                        content=r.response,
                        created_at=ts,
                    )
                )
                created_messages += 1

        # Update updated_at for each conversation
        now = datetime.utcnow()
        for convo in convos.values():
            convo.updated_at = now

        db.commit()
        print(f"✅ Migrated legacy chat_history into messages. Created {created_messages} message row(s).")
    finally:
        if db is not None:
            db.close()


if __name__ == "__main__":
    main()

