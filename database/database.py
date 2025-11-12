"""
database.py
------------
This file sets up the SQLAlchemy engine, session, and base class.

It handles:
✅ Connecting to PostgreSQL using environment variables
✅ Creating sessions for queries
✅ Providing a Base class for ORM models
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# 1️⃣ Load environment variables from .env
load_dotenv()

# 2️⃣ Read database credentials
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

# 3️⃣ Construct the PostgreSQL connection string
# Format: postgresql+psycopg2://username:password@host:port/database_name
DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# 4️⃣ Create the SQLAlchemy Engine
# The Engine manages the connection pool and communicates with the database.
engine = create_engine(DATABASE_URL)

# 5️⃣ Create a SessionLocal class to generate database sessions
# autocommit=False → manual transaction commits (safer)
# autoflush=False → prevents auto-updates before commit
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 6️⃣ Base class for all ORM models
Base = declarative_base()

# 7️⃣ Dependency for FastAPI routes
# Each request gets its own DB session (thread-safe)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
