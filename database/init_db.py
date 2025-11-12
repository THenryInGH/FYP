"""
init_db.py
-----------
This script initializes (creates) all tables defined in models.py.

Run it once after configuring PostgreSQL connection and models.
"""

from database import Base, engine
import models

print("🚀 Initializing database and creating tables...")
Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully in PostgreSQL!")
