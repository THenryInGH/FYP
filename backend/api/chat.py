from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.services.llm.groq_client import send_prompt
from backend.services.auth.deps import get_current_user
from database import get_db

router = APIRouter(tags=["chat"])


class GenerateRequest(BaseModel):
    prompt: str
    model: str | None = None
    use_rag: bool = True


@router.post("/generate")
def generate_response(
    req: GenerateRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
) -> dict[str, Any]:
    """
    Backward-compatible endpoint: mirrors llm-engine/agent.py /generate.

    Frontend can keep using this path while migrating to new structure.
    """
    start = time.perf_counter()
    try:
        result = send_prompt(
            req.prompt,
            db=db,
            model=req.model,
            use_rag=req.use_rag,
        )

        timings = {}
        if isinstance(result, dict):
            timings = result.get("timings") or {}
            timings["total_seconds"] = time.perf_counter() - start
            return {
                "status": "success",
                "response": result.get("content"),
                "model": result.get("model") or req.model,
                "use_rag": result.get("use_rag", req.use_rag),
                "timings": timings,
            }

        # Defensive: if send_prompt returns plain text
        return {
            "status": "success",
            "response": result,
            "model": req.model,
            "use_rag": req.use_rag,
            "timings": {"total_seconds": time.perf_counter() - start},
        }
    except Exception as exc:
        return {"status": "error", "message": str(exc)}

