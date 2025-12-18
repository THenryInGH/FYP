from __future__ import annotations

from typing import Any, Dict, List

from sqlalchemy.orm import Session

from backend.services.onos.onos_client import get_network_devices
from database.models import Device


def sync_devices_from_onos(db: Session) -> Dict[str, Any]:
    """
    Pull devices from ONOS, upsert into DB, and return the ONOS payload.

    We intentionally preserve `Device.name` (global friendly name) when refreshing
    metadata from ONOS.
    """
    onos_payload = get_network_devices()
    onos_devices: List[Dict[str, Any]] = (onos_payload or {}).get("devices", []) or []

    for d in onos_devices:
        device_id = d.get("id")
        if not device_id:
            continue

        existing: Device | None = db.query(Device).filter(Device.device_id == device_id).first()
        if existing is None:
            db.add(
                Device(
                    device_id=device_id,
                    name=None,
                    type=d.get("type"),
                    annotations=d.get("annotations"),
                    extra_metadata=d,
                )
            )
        else:
            # Preserve friendly name, but keep ONOS metadata fresh.
            existing.type = d.get("type")
            existing.annotations = d.get("annotations")
            existing.extra_metadata = d

    db.commit()
    return onos_payload


def get_device_name_map(db: Session, device_ids: List[str]) -> Dict[str, str | None]:
    if not device_ids:
        return {}
    rows: List[Device] = db.query(Device).filter(Device.device_id.in_(device_ids)).all()
    return {r.device_id: r.name for r in rows}


def set_device_friendly_name(db: Session, device_id: str, name: str | None) -> None:
    device: Device | None = db.query(Device).filter(Device.device_id == device_id).first()
    if device is None:
        device = Device(device_id=device_id, name=name)
        db.add(device)
    else:
        device.name = name
    db.commit()


__all__ = [
    "sync_devices_from_onos",
    "get_device_name_map",
    "set_device_friendly_name",
]

