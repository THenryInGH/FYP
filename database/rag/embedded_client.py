"""
embedded_client.py
------------------
Utility functions to embed arbitrary text using the shared SentenceTransformer
instance and fetch the most similar configuration samples from PostgreSQL.

This module relies on:
    - `rag.embedded_server.embed_text` for computing 768-d embeddings
    - `database.SessionLocal` for DB access
    - pgvector's `<->` operator to order by cosine distance
"""

from __future__ import annotations

import time
from typing import Any, Dict, List, Sequence

from sqlalchemy import text
from sqlalchemy.orm import Session

from database import SessionLocal
from .embedded_server import embed_text


def _vectorize(text_value: str) -> List[float]:
    """Return a plain Python list so pgvector accepts the payload."""
    return embed_text(text_value)


def get_similar_samples(
    query_text: str,
    *,
    top_k: int = 3,
) -> Dict[str, Any]:
    """
    Encode the user intent, query pgvector for the nearest config samples,
    and return both the matches and timing metrics.
    """
    session: Session | None = None
    timings: Dict[str, float] = {}
    try:
        session = SessionLocal()

        t0 = time.perf_counter()
        query_vec = _vectorize(query_text)
        timings["embedding_seconds"] = time.perf_counter() - t0

        sql = text(
            """
            SELECT
                sample_id,
                category,
                intent_text,
                config_json,
                extra_metadata
            FROM config_samples
            ORDER BY embedding <-> CAST(:query_vec AS vector)
            LIMIT :limit
            """
        )

        t1 = time.perf_counter()
        rows: Sequence[Dict[str, Any]] = session.execute(
            sql,
            {"query_vec": query_vec, "limit": top_k},
        ).mappings().all()
        timings["db_query_seconds"] = time.perf_counter() - t1

        return {
            "query": query_text,
            "matches": [dict(row) for row in rows],
            "timings": timings,
        }
    finally:
        if session is not None:
            session.close()


__all__ = ["get_similar_samples"]

if __name__ == "__main__":
    print(get_similar_samples("Allocate 1Gbps bandwidth between HostA and HostB"))
