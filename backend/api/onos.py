from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Body, HTTPException

from backend.services.onos.onos_client import (
    delete_intent,
    get_network_devices,
    get_network_flows,
    get_network_hosts,
    get_network_info,
    get_network_intents,
    get_network_links,
    post_intent,
)

router = APIRouter()


@router.get("/network")
def network_snapshot() -> dict[str, Any]:
    """
    Simple ONOS proxy endpoint.

    This lets the frontend fetch topology/state from your backend instead of
    calling ONOS directly (so ONOS credentials stay server-side).
    """
    return get_network_info()


@router.get("/devices")
def devices() -> dict[str, Any]:
    return get_network_devices()


@router.get("/hosts")
def hosts() -> dict[str, Any]:
    return get_network_hosts()


@router.get("/links")
def links() -> dict[str, Any]:
    return get_network_links()


@router.get("/flows")
def flows() -> dict[str, Any]:
    return get_network_flows()


@router.get("/intents")
def intents() -> dict[str, Any]:
    return get_network_intents()


@router.post("/intents")
def create_intent(payload: dict = Body(...)) -> dict[str, Any]:
    try:
        res = post_intent(payload) or {"status": "ok"}
        return {"status": "success", "result": res}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/intents/{app_id}/{key}")
def remove_intent(app_id: str, key: str) -> dict[str, Any]:
    try:
        delete_intent(app_id, key)
        return {"status": "success"}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

