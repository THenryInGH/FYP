# 1. Postgresql Setup
# 2. Database Design
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
# 4. SQLAlchemy
# 5. 