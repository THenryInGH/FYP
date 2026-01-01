from __future__ import annotations

from typing import Any, Dict, List

from sqlalchemy.orm import Session

from backend.services.onos.onos_client import get_network_devices, get_network_hosts
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


def sync_hosts_from_onos(db: Session) -> Dict[str, Any]:
    """
    Pull hosts from ONOS, upsert into the same `devices` table (type='host').

    This lets us reuse the existing `Device.name` column as a friendly-name store
    for both switches and hosts.
    """
    onos_payload = get_network_hosts()
    onos_hosts: List[Dict[str, Any]] = (onos_payload or {}).get("hosts", []) or []

    for h in onos_hosts:
        host_id = h.get("id")
        if not host_id:
            continue

        existing: Device | None = db.query(Device).filter(Device.device_id == host_id).first()
        if existing is None:
            db.add(
                Device(
                    device_id=host_id,
                    name=None,
                    type="host",
                    annotations=h.get("annotations"),
                    extra_metadata=h,
                )
            )
        else:
            existing.type = existing.type or "host"
            existing.annotations = h.get("annotations")
            existing.extra_metadata = h

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


def delete_managed_device(db: Session, device_id: str) -> bool:
    row: Device | None = db.query(Device).filter(Device.device_id == device_id).first()
    if row is None:
        return False
    db.delete(row)
    db.commit()
    return True


def list_managed_devices(db: Session) -> List[Device]:
    return db.query(Device).order_by(Device.device_id.asc()).all()


__all__ = [
    "sync_devices_from_onos",
    "sync_hosts_from_onos",
    "get_device_name_map",
    "set_device_friendly_name",
    "delete_managed_device",
    "list_managed_devices",
]

