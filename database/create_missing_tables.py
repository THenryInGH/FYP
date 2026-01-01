"""
create_missing_tables.py
------------------------
Creates any missing tables defined in `database/models.py` without dropping
existing data.

This is a lightweight alternative to Alembic for small projects.

Usage:
    uv run python3 database/create_missing_tables.py
"""

from __future__ import annotations

import sys
from pathlib import Path

# Ensure imports resolve from project root (so `database/` is treated as a package,
# not as the current working directory shadowing it).
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from database import Base, engine  # noqa: E402

# Import models so SQLAlchemy registers all table metadata.
import database.models  # noqa: F401, E402


def main() -> None:
    print("🚀 Creating missing tables (no drops)...")
    Base.metadata.create_all(bind=engine)
    print("✅ Done.")


if __name__ == "__main__":
    main()

