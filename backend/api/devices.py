from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from backend.schemas.devices import DeviceNameUpdateRequest
from backend.services.auth.deps import get_current_user
from backend.services.devices.service import (
    delete_managed_device,
    get_device_name_map,
    list_managed_devices,
    set_device_friendly_name,
    sync_devices_from_onos,
)
from database import get_db

router = APIRouter(prefix="/devices", tags=["devices"])


@router.get("")
def list_devices(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns ONOS devices enriched with DB-friendly names.

    Shape is intentionally close to ONOS: `{ devices: [...] }`, with each device
    getting an extra `friendly_name` field.
    """
    onos_payload = sync_devices_from_onos(db)
    devices: List[Dict[str, Any]] = (onos_payload or {}).get("devices", []) or []

    ids = [d.get("id") for d in devices if d.get("id")]
    name_map = get_device_name_map(db, ids)

    for d in devices:
        did = d.get("id")
        d["friendly_name"] = name_map.get(did) if did else None

    return {"devices": devices}


@router.put("/{device_id}/name", status_code=status.HTTP_204_NO_CONTENT)
def update_device_name(
    device_id: str,
    req: DeviceNameUpdateRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
) -> Response:
    # Optional: keep DB in sync with ONOS devices list (best-effort)
    try:
        sync_devices_from_onos(db)
    except Exception:
        # If ONOS is down, we still allow writing a name for a known device_id.
        pass

    name = req.name.strip() if isinstance(req.name, str) else None
    set_device_friendly_name(db, device_id, name)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/managed")
def managed_devices(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns rows from the DB `devices` table, plus whether each row is currently
    present in ONOS (active).

    This is meant for the Devices management page.
    """
    # Refresh live ONOS devices (best-effort; if ONOS is down, we still return DB rows)
    live_ids: set[str] = set()
    try:
        onos_payload = sync_devices_from_onos(db)
        live = (onos_payload or {}).get("devices", []) or []
        live_ids = {d.get("id") for d in live if d.get("id")}
    except Exception:
        live_ids = set()

    rows = list_managed_devices(db)
    out = []
    for r in rows:
        out.append(
            {
                "device_id": r.device_id,
                "name": r.name,
                "type": r.type,
                "active": (r.device_id in live_ids) if r.type != "host" else None,
            }
        )
    return {"devices": out}


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_device(
    device_id: str,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
) -> Response:
    ok = delete_managed_device(db, device_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

