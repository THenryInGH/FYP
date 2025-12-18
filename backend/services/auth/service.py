from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from passlib.context import CryptContext
from passlib.exc import UnknownHashError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _jwt_secret() -> str:
    # Default is dev-only; set JWT_SECRET in production.
    return os.getenv("JWT_SECRET", "dev-secret-change-me")


def _jwt_algorithm() -> str:
    return os.getenv("JWT_ALGORITHM", "HS256")


def _jwt_exp_minutes() -> int:
    raw = os.getenv("JWT_EXPIRE_MINUTES", "60")
    try:
        return int(raw)
    except ValueError:
        return 60


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    # If legacy/seed data stored an unknown hash format, treat as invalid creds
    # instead of crashing the request with a 500.
    try:
        return pwd_context.verify(password, password_hash)
    except (UnknownHashError, ValueError):
        return False


def create_access_token(*, subject: str, expires_minutes: int | None = None, **claims: Any) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=expires_minutes or _jwt_exp_minutes())
    payload: dict[str, Any] = {
        "sub": subject,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
        **claims,
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=_jwt_algorithm())


def decode_access_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, _jwt_secret(), algorithms=[_jwt_algorithm()])


__all__ = [
    "hash_password",
    "verify_password",
    "create_access_token",
    "decode_access_token",
]

