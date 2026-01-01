from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.services.devices.service import get_device_name_map, sync_hosts_from_onos
from database import get_db

router = APIRouter(prefix="/hosts", tags=["hosts"])


@router.get("")
def list_hosts(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns ONOS hosts enriched with DB-friendly names.

    We store host-friendly names in the existing `devices` table by saving host
    rows with `type='host'` and `device_id=<host_id>`.
    """
    onos_payload = sync_hosts_from_onos(db)
    hosts: List[Dict[str, Any]] = (onos_payload or {}).get("hosts", []) or []

    ids = [h.get("id") for h in hosts if h.get("id")]
    name_map = get_device_name_map(db, ids)

    for h in hosts:
        hid = h.get("id")
        h["friendly_name"] = name_map.get(hid) if hid else None

    return {"hosts": hosts}

