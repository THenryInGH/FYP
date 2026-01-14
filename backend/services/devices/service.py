from __future__ import annotations

from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from backend.services.onos.onos_client import get_network_devices, get_network_hosts
from database.models import Device


def _host_primary_ip(host: Dict[str, Any]) -> Optional[str]:
    ips = host.get("ipAddresses") or []
    if not isinstance(ips, list):
        return None
    for ip in ips:
        if isinstance(ip, str) and ip and "." in ip:
            return ip
    return None


def host_stable_id(host: Dict[str, Any]) -> Optional[str]:
    """
    Return a stable identifier for a host row in our DB.

    ONOS host `id` is derived from MAC/VLAN and can change after topology resets.
    In our Mininet-style testbed, the host IPv4 is the most stable key, so we
    persist host friendly names under `host:<ip>`.
    """
    ip = _host_primary_ip(host)
    if ip:
        return f"host:{ip}"
    hid = host.get("id")
    return hid if isinstance(hid, str) and hid else None


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

    # Migration helper: older versions stored hosts keyed by ONOS host_id (MAC/VLAN).
    # Build a best-effort mapping from IP -> friendly name from existing DB rows so
    # we can preserve names across topology resets (where host_id changes).
    existing_host_rows: List[Device] = db.query(Device).filter(Device.type == "host").all()
    legacy_ip_to_name: Dict[str, str] = {}
    for row in existing_host_rows:
        if not row.name:
            continue
        meta = row.extra_metadata if isinstance(row.extra_metadata, dict) else {}
        ips = meta.get("ipAddresses") or []
        if not isinstance(ips, list):
            continue
        for ip in ips:
            if isinstance(ip, str) and ip and ip not in legacy_ip_to_name:
                legacy_ip_to_name[ip] = row.name

    live_stable_ids: set[str] = set()
    live_ips: set[str] = set()

    for h in onos_hosts:
        stable_id = host_stable_id(h)
        if not stable_id:
            continue

        ip = _host_primary_ip(h)
        if ip:
            live_ips.add(ip)
        live_stable_ids.add(stable_id)

        existing: Device | None = db.query(Device).filter(Device.device_id == stable_id).first()
        if existing is None:
            initial_name = legacy_ip_to_name.get(ip) if ip else None
            db.add(
                Device(
                    device_id=stable_id,
                    name=initial_name,
                    type="host",
                    annotations=h.get("annotations"),
                    extra_metadata=h,
                )
            )
        else:
            existing.type = existing.type or "host"
            existing.annotations = h.get("annotations")
            existing.extra_metadata = h
            # If this row has no friendly name yet but we can migrate one from legacy,
            # set it once (do not overwrite user edits).
            if (existing.name is None or existing.name == "") and ip and ip in legacy_ip_to_name:
                existing.name = legacy_ip_to_name[ip]

    # Cleanup legacy host rows keyed by old ONOS host_id (MAC/VLAN) if they correspond
    # to a currently-live IP. This avoids duplicates in the Devices management table.
    for row in existing_host_rows:
        if isinstance(row.device_id, str) and row.device_id.startswith("host:"):
            continue
        meta = row.extra_metadata if isinstance(row.extra_metadata, dict) else {}
        ips = meta.get("ipAddresses") or []
        if not isinstance(ips, list):
            continue
        if any(isinstance(ip, str) and ip in live_ips for ip in ips):
            db.delete(row)

    db.commit()
    return onos_payload


def get_device_name_map(db: Session, device_ids: List[str]) -> Dict[str, str | None]:
    if not device_ids:
        return {}
    rows: List[Device] = db.query(Device).filter(Device.device_id.in_(device_ids)).all()
    return {r.device_id: r.name for r in rows}


def enrich_onos_hosts_with_friendly_names(db: Session, hosts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Attach `friendly_name` to ONOS host dicts using our stable host id.

    Key point for correctness:
    - Friendly name is stored under a stable key (host:<ip>)
    - ONOS host `id` (MAC/VLAN derived) is refreshed every sync, so when we build
      intents we still use the *current* MAC-based host id from ONOS.
    """
    stable_ids = [host_stable_id(h) for h in hosts]
    ids = [sid for sid in stable_ids if sid]
    name_map = get_device_name_map(db, ids)
    for h in hosts:
        sid = host_stable_id(h)
        h["managed_id"] = sid
        h["friendly_name"] = name_map.get(sid) if sid else None
    return hosts


def enrich_onos_devices_with_friendly_names(db: Session, devices: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    ids = [d.get("id") for d in devices if d.get("id")]
    name_map = get_device_name_map(db, ids)
    for d in devices:
        did = d.get("id")
        d["friendly_name"] = name_map.get(did) if did else None
    return devices


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
    "enrich_onos_devices_with_friendly_names",
    "enrich_onos_hosts_with_friendly_names",
    "set_device_friendly_name",
    "delete_managed_device",
    "list_managed_devices",
    "host_stable_id",
]

