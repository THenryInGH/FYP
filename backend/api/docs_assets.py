from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(prefix="/docs-assets", tags=["docs"])


def _asset_map() -> dict[str, Path]:
    """
    Map public asset keys -> absolute paths in the repo.

    We intentionally whitelist known files to avoid path traversal and to avoid
    accidentally exposing sensitive files on the server.
    """
    repo_root = Path(__file__).resolve().parents[2]
    return {
        # Diagrams
        "system-architecture.png": repo_root / "diagram" / "system architecture.png",
        # Evaluation charts
        "avg_accuracy_by_model.png": repo_root / "evaluation" / "charts" / "avg_accuracy_by_model.png",
        "avg_response_time_by_model.png": repo_root / "evaluation" / "charts" / "avg_response_time_by_model.png",
        "avg_response_time_by_model_log.png": repo_root / "evaluation" / "charts" / "avg_response_time_by_model_log.png",
    }


@router.get("/{asset_key}")
def get_docs_asset(asset_key: str) -> FileResponse:
    assets = _asset_map()
    path = assets.get(asset_key)
    if path is None:
        raise HTTPException(status_code=404, detail="Unknown asset")
    if not path.exists():
        raise HTTPException(status_code=404, detail="Asset not found on server")
    return FileResponse(path)


__all__ = ["router"]

