from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.services.devices.service import get_device_name_map, host_stable_id, sync_hosts_from_onos
from database import get_db

router = APIRouter(prefix="/hosts", tags=["hosts"])


@router.get("")
def list_hosts(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns ONOS hosts enriched with DB-friendly names.

    We store host-friendly names in the existing `devices` table by saving host
    rows with `type='host'` and `device_id=host:<ip>` (stable across topology resets).
    """
    onos_payload = sync_hosts_from_onos(db)
    hosts: List[Dict[str, Any]] = (onos_payload or {}).get("hosts", []) or []

    stable_ids = [host_stable_id(h) for h in hosts]
    ids = [sid for sid in stable_ids if sid]
    name_map = get_device_name_map(db, ids)

    for h in hosts:
        sid = host_stable_id(h)
        h["friendly_name"] = name_map.get(sid) if sid else None
        # Helpful for debugging / UI operations (optional).
        h["managed_id"] = sid

    return {"hosts": hosts}

