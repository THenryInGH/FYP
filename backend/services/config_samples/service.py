from __future__ import annotations

from typing import Any, Dict, List

from sqlalchemy.orm import Session

from database.models import ConfigSample
from database.rag.embedded_server import embed_text


def list_config_samples(
    db: Session,
    *,
    query: str | None = None,
    category: str | None = None,
    limit: int = 20,
    offset: int = 0,
) -> List[ConfigSample]:
    q = db.query(ConfigSample)

    if category:
        q = q.filter(ConfigSample.category.ilike(category))

    if query:
        like = f"%{query}%"
        q = q.filter(
            (ConfigSample.intent_text.ilike(like)) | (ConfigSample.category.ilike(like))
        )

    return q.order_by(ConfigSample.sample_id.desc()).offset(offset).limit(limit).all()


def create_config_sample(
    db: Session,
    *,
    category: str,
    intent_text: str,
    config_json: Any,
    extra_metadata: Any | None = None,
) -> ConfigSample:
    embedding = embed_text(intent_text)
    row = ConfigSample(
        category=category,
        intent_text=intent_text,
        config_json=config_json,
        extra_metadata=extra_metadata,
        embedding=embedding,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def delete_config_sample(db: Session, sample_id: int) -> bool:
    row: ConfigSample | None = db.query(ConfigSample).filter(ConfigSample.sample_id == sample_id).first()
    if row is None:
        return False
    db.delete(row)
    db.commit()
    return True


__all__ = ["list_config_samples", "create_config_sample", "delete_config_sample"]

