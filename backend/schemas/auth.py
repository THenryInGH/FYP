from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field
from pydantic.config import ConfigDict


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: str = Field(min_length=5, max_length=100)
    # bcrypt only supports 72 bytes; enforce it to avoid truncation/bugs.
    password: str = Field(min_length=8, max_length=72)


class LoginRequest(BaseModel):
    username_or_email: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=1, max_length=72)


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    username: str
    email: str
    created_at: datetime | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic

