from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field
from pydantic.config import ConfigDict


class ConversationCreateRequest(BaseModel):
    title: str | None = Field(default=None, max_length=200)


class ConversationPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    conversation_id: int
    title: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class MessagePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    message_id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime | None = None


class SendMessageRequest(BaseModel):
    content: str = Field(min_length=1)
    model: str | None = None
    use_rag: bool = True


class SendMessageResponse(BaseModel):
    conversation: ConversationPublic
    user_message: MessagePublic
    assistant_message: MessagePublic

