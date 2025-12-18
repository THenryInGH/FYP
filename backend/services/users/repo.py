from __future__ import annotations

from sqlalchemy import or_
from sqlalchemy.orm import Session

from database.models import User


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.user_id == user_id).first()


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_username_or_email(db: Session, username_or_email: str) -> User | None:
    return (
        db.query(User)
        .filter(or_(User.username == username_or_email, User.email == username_or_email))
        .first()
    )


def create_user(db: Session, *, username: str, email: str, password_hash: str) -> User:
    user = User(username=username, email=email, password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


__all__ = [
    "get_user_by_id",
    "get_user_by_username",
    "get_user_by_email",
    "get_user_by_username_or_email",
    "create_user",
]

