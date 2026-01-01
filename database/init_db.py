"""
init_db.py
-----------
This script initializes (creates) all tables defined in models.py.

Run it once after configuring PostgreSQL connection and models.
"""

import sys
from pathlib import Path

# Ensure imports resolve from project root (so `database/` is treated as a package,
# not as the current working directory shadowing it).
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from database import Base, engine  # noqa: E402
import database.models  # noqa: F401, E402

print("🚀 Initializing database and creating tables...")
Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully in PostgreSQL!")
