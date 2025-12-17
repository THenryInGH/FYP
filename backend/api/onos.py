from __future__ import annotations

from typing import Any

from fastapi import APIRouter

from backend.services.onos.onos_client import get_network_info

router = APIRouter()


@router.get("/network")
def network_snapshot() -> dict[str, Any]:
    """
    Simple ONOS proxy endpoint.

    This lets the frontend fetch topology/state from your backend instead of
    calling ONOS directly (so ONOS credentials stay server-side).
    """
    return get_network_info()

