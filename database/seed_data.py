"""
seed_data.py
-------------
Populate the PostgreSQL database with the static JSON fixtures under
`database/data/`. The script is intentionally idempotent – rerunning it will
upsert rows based on each table's primary key.

Usage:
    python3 database/seed_data.py

Requirements:
    - .env configured with DB_USER/DB_PASS/DB_HOST/DB_PORT/DB_NAME
    - Dependencies installed (sqlalchemy, psycopg2-binary, python-dotenv)
"""

from __future__ import annotations

from rag.embedded_server import embed_text

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from database import SessionLocal
from models import ConfigSample, Device, User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DATA_DIR = Path(__file__).parent / "data"


def _load_json(filename: str) -> List[Dict[str, Any]]:
    path = DATA_DIR / filename
    if not path.exists():
        print(f"⚠️  Skipping {filename}: file not found at {path}")
        return []
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _parse_timestamp(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    value = value.strip()
    # Accept a few common timestamp layouts.
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%SZ"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    raise ValueError(f"Unsupported timestamp format: {value}")


def seed_users(session: Session) -> None:
    rows = _load_json("users.json")
    if not rows:
        print("ℹ️  No user rows to insert.")
        return

    for row in rows:
        password_hash = row["password_hash"]
        # Your fixtures may contain placeholder values (e.g. "hash123").
        # If it doesn't look like a real bcrypt hash, treat it as plaintext and hash it.
        if isinstance(password_hash, str) and not password_hash.startswith("$2"):
            password_hash = pwd_context.hash(password_hash)

        payload = {
            "user_id": int(row["user_id"]),
            "username": row["username"],
            "email": row["email"],
            "password_hash": password_hash,
            "created_at": _parse_timestamp(row.get("created_at")),
        }
        session.merge(User(**payload))
    session.commit()
    print(f"✅ Seeded {len(rows)} user row(s).")


def seed_devices(session: Session) -> None:
    rows = _load_json("devices.json")
    if not rows:
        print("ℹ️  No device rows to insert.")
        return

    for row in rows:
        payload = {
            "device_id": row["device_id"],
            "name": row.get("name"),
            "type": row.get("type"),
            "annotations": row.get("annotations"),
            "extra_metadata": row.get("extra_metadata"),
        }
        session.merge(Device(**payload))
    session.commit()
    print(f"✅ Seeded {len(rows)} device row(s).")


def seed_config_samples(session: Session) -> None:
    rows = _load_json("config_samples.json")
    if not rows:
        print("ℹ️  No config sample rows to insert.")
        return

    for row in rows:
        sample_id_raw = row.get("sample_id")
        sample_id = int(sample_id_raw) if sample_id_raw is not None else None
        payload = {
            "sample_id": sample_id,
            "category": row.get("category"),
            "intent_text": row.get("intent_text"),
            "config_json": row.get("config_json"),
            "extra_metadata": row.get("extra_metadata"),
            "embedding": embed_text(row.get("intent_text")),  # Populate later once an embedding pipeline is ready.
        }
        session.merge(ConfigSample(**payload))
    session.commit()
    print(f"✅ Seeded {len(rows)} config sample row(s).")


def main() -> None:
    session: Optional[Session] = None
    try:
        session = SessionLocal()
        seed_users(session)
        seed_devices(session)
        seed_config_samples(session)
    finally:
        if session is not None:
            session.close()


if __name__ == "__main__":
    main()

