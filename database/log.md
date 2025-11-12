# 1. Postgresql Setup
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Switch to postgres user
sudo -i -u postgres

# Open SQL shell
psql

# Inside psql:
CREATE DATABASE fyp_db;
\c fyp_db

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

# verify 
\dx # list installed extensions
\dt # show tables
\q
exit
exit

psql -U fyp_admin -d fyp_db -h localhost -p 5432
sudo -u postgres psql

```
# 2. Database Design
[ERD](/diagram/ERD.drawio)

# 3. Database Creation
## Config_samples (vector database)
```sql
CREATE TABLE config_samples (
    id SERIAL PRIMARY KEY,                     -- unique identifier
    intent_text TEXT NOT NULL,                 -- natural language input
    config_json JSONB NOT NULL,                -- ONOS configuration output
    embedding VECTOR(1536),                    -- vector representation of intent_text
    category VARCHAR(64),                      -- optional (Connectivity, QoS, etc.)
    metadata JSONB,                            -- optional notes (description, version, etc.)
    created_at TIMESTAMP DEFAULT NOW()         -- optional timestamp
);

```

## Using SQLAlchemy
Three files created:
1. database.py
2. models.py
3. init_db.py

```bash
cd database
uv run init_db.py

# verification
sudo -u postgres psql -d fyp_db
\dt

# permission issue faced
-- Give your user ownership of the schema
ALTER SCHEMA public OWNER TO fyp_admin;

-- Allow your user full privileges on the schema
GRANT ALL PRIVILEGES ON SCHEMA public TO fyp_admin;

-- Make sure they can create objects inside the schema
ALTER ROLE fyp_admin SET search_path TO public;

```
# 4. SQLAlchemy
    - ORM (Object Relational Mapper)
    - layer on top of psycopg2 that converts Python classes into SQL tables
    - provides Pythonic CRUD operations instead of manual SQL string

# 5. psycopg2
    - low-level communication bridge between Python and Postgresql
    - handles: 
        - network connections
        - sending SQL queries
        - receiving results
        - transactions