# Logs happened across whole project
## 1. Shift from GPU machine to single machine only as GPU instability
- llm-engine 
    - using Groq API currently no need to set up llama.cpp here first
    - first install uv and packages required
    ```bash
    uv sync
    ```
    - set up env file for GROQ API key at the dir, llm-engine
    - 
- frontend
    - change .env from private IP to localhost
- database

## 2. ONOS disconnect with testbed with unknown reason
- solved by reset the testbed
1. stop onos `sudo systemctl stop onos`
2. delete cache:
```bash
sudo rm -rf /opt/onos/apache-karaf-4.2.9/data/db/*
sudo rm -rf /opt/onos/apache-karaf-4.2.9/data/cache/*

```
3. clean topo (may need to run twice)
```bash
cd FYP/onos-testbed/scripts
bash clean-topo.sh
```

4. start onos
`sudo systemctl start onos`

5. setup topo 
```bash
cd FYP/onos-testbed/scripts
bash mesh-topo.sh
```

6. (Optional) ping between hosts if ping test failed the first time

## 3. Project structure update
- combine all service at backend
    - frontend pass to backend to fetch onos info
- run at tmux with following command
```bash
cd /home/henry/FYP
source .venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

## 4. Code review 
### Backend
#### App entrypoint (`backend/main.py`)
- defines the app + middleware + which routes exist.
- add CORS middleware (for now the port forwarding case where laptop browser will see the resource is not coming back from localhost)
- includes routers

#### API (`backend/api/*`)
- HTTP endpoints 
- request/response shapes
- dependency injection
##### 1. `backend/api/chat.py`
- POST /generate
- wraps the LLM call and returns status/response/timings.
- depends on `backend/services/llm/groq_client.py

##### 2. `backend/api/auth.py`
- `POST /auth/register`: validate input, checks uniqueness, hashes password, stores, user.
- `POST /auth/login`: checks password, returns JWT + user.
- `GET /auth/me`: protected route, returns current user.
- Depends on:
    1. schemas (`backend/schemas/auth.py`)
    2. auth service (`backend/services/auth/service.py`)
    3. auth dependency (`backend/services/auth/deps.py`)
    4. user repo (`backend/services/users/repo.py`)
    5. DB session dependency from top-level `database/get_db`
##### 3. `backend/api/devices.py`
- `GET /devices`: fetch devices from ONOS, upsert into DB, attach `friendly_name`.
- `PUT /devices/(device_id)/name`: **auth-protected** rename; writes to DB.
- depends on devices service (`backend/services/devices/service.py`) and auth dependency (`get_current_user`)

##### 4. `backend/api/onos.py`
- backend proxy for ONOS so the browser never needs ONOS creds.
- `GET /onos/network` and also `GET /onos/devices|hosts|links|flows|intents`
- `POST /onos/intents`, `DELETE /onos/intents/{app_id}/{key}`
- depends on ONOS client (`backend/services/onos/onos_client.py`)


#### Services (`backend/services/*`)
- business logic
- external integrations (DB/ONOS/LLM)
- where "real work" happens.

##### 1. `backend/services/auth/service.py`
- password hashing/verification
- JWT encode/decode
- reads env like `JWT_SECRET`, `JWT_EXPIRE_MINUTES`

##### 2. `backend/services/auth/deps.py`
- the gatekeeper dependency get_current_user()
- extracts authorization: bearer ..., validates token, loads the user.

##### 3. `backend/services/users/repo.py`
- DB queries for user lookups and create

##### 4. `backend/services/devices/service.py`
- sync devices from ONOS into DB
- preserve Device.name (global friendly name)
- provide mapping and update functions

##### 5. `backend/services/onos/onos_client.py`
- talks to ONOS REST API using `requests`
- centralizes ONOS auth + base URL
- Used by:
    - `backend/api/onos.py`
    - `backend/services/devices/service.py`
    - `backend/services/llm/groq_client.py`

##### 6. `backend/services/llm/groq_client.py`
- prompt engineering here 
- sends to Groq API
- returns content + timing info

##### 7. `backend/services/llm/chat_history.py`
- in-memory chat history 
- next-step is going to move to DB per user
#### Schemas (`backend/schemas/*`)
- pydantic models 
> Pydantic models are Python classes that automatically validate, parse and document data coming into and going out of API
- what comes in/goes out
##### 1. `backend/schemas/auth.py`
- RegisterRequest, LoginRequest
- UserPublic (safe output; no password hash)
- TokenResponse (JWT + user)
- Note: password max is 72 because bcrypt limits.

##### 2. `backend/schemas/devices.py`
- DeviceNameUpdateRequest (body of rename endpoint)

#### Package init files (`__init__.py`)
- usually empty, just make folders importable.

### Frontend
### Database