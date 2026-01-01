from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.schemas.chat import (
    ConversationCreateRequest,
    ConversationPublic,
    MessagePublic,
    SendMessageRequest,
    SendMessageResponse,
)
from backend.services.auth.deps import get_current_user
from backend.services.chat.service import (
    create_conversation,
    list_conversations,
    list_messages,
    send_message,
)
from database import get_db

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/conversations", response_model=List[ConversationPublic])
def conversations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> List[ConversationPublic]:
    rows = list_conversations(db, user_id=current_user.user_id)
    return [ConversationPublic.model_validate(r) for r in rows]


@router.post("/conversations", response_model=ConversationPublic)
def new_conversation(
    req: ConversationCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> ConversationPublic:
    convo = create_conversation(db, user_id=current_user.user_id, title=req.title)
    return ConversationPublic.model_validate(convo)


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessagePublic])
def conversation_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> List[MessagePublic]:
    rows = list_messages(db, user_id=current_user.user_id, conversation_id=conversation_id)
    return [MessagePublic.model_validate(m) for m in rows]


@router.post("/conversations/{conversation_id}/messages", response_model=SendMessageResponse)
def post_message(
    conversation_id: int,
    req: SendMessageRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> SendMessageResponse:
    result = send_message(
        db,
        user_id=current_user.user_id,
        conversation_id=conversation_id,
        user_text=req.content,
        model=req.model,
        use_rag=req.use_rag,
    )
    return SendMessageResponse(
        conversation=ConversationPublic.model_validate(result["conversation"]),
        user_message=MessagePublic.model_validate(result["user_message"]),
        assistant_message=MessagePublic.model_validate(result["assistant_message"]),
    )

