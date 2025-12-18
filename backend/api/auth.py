from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserPublic
from backend.services.auth.deps import get_current_user
from backend.services.auth.service import create_access_token, hash_password, verify_password
from backend.services.users.repo import (
    create_user,
    get_user_by_email,
    get_user_by_username,
    get_user_by_username_or_email,
)
from database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)) -> UserPublic:
    if get_user_by_username(db, req.username) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")
    if get_user_by_email(db, req.email) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")

    user = create_user(
        db,
        username=req.username,
        email=req.email,
        password_hash=hash_password(req.password),
    )
    return UserPublic.model_validate(user)


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = get_user_by_username_or_email(db, req.username_or_email)
    if user is None or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(subject=str(user.user_id))
    return TokenResponse(access_token=token, user=UserPublic.model_validate(user))


@router.get("/me", response_model=UserPublic)
def me(current_user=Depends(get_current_user)) -> UserPublic:
    return UserPublic.model_validate(current_user)

