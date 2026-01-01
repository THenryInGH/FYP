from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from backend.schemas.config_samples import ConfigSampleCreateRequest, ConfigSamplePublic
from backend.services.auth.deps import get_current_user
from backend.services.config_samples.service import (
    create_config_sample,
    delete_config_sample,
    list_config_samples,
)
from database import get_db

router = APIRouter(prefix="/config-samples", tags=["config-samples"])


@router.get("", response_model=List[ConfigSamplePublic])
def list_samples(
    db: Session = Depends(get_db),
    q: str | None = Query(default=None, description="Substring search on category/intent_text"),
    category: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> List[ConfigSamplePublic]:
    rows = list_config_samples(db, query=q, category=category, limit=limit, offset=offset)
    return [ConfigSamplePublic.model_validate(r) for r in rows]


@router.post("", response_model=ConfigSamplePublic, status_code=status.HTTP_201_CREATED)
def create_sample(
    req: ConfigSampleCreateRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
) -> ConfigSamplePublic:
    row = create_config_sample(
        db,
        category=req.category,
        intent_text=req.intent_text,
        config_json=req.config_json,
        extra_metadata=req.extra_metadata,
    )
    return ConfigSamplePublic.model_validate(row)


@router.delete("/{sample_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_sample(
    sample_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
) -> Response:
    ok = delete_config_sample(db, sample_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sample not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

