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

## 5. Data plane verification on UI

Goal: give the user a **simple UI to run real dataplane checks** (inside the Mininet/OVS Linux network namespaces) without giving the browser root access.

### How it works (high-level)
- **Frontend** calls FastAPI endpoints to run tests.
- **Backend** is the only component allowed to execute privileged `ip netns exec ...` commands.
- Backend runs a **single allowlisted script** via `sudo -n` (non-interactive) and receives **JSON** back.

This keeps the system safe:
- browser never runs `sudo`
- backend can’t run arbitrary root commands (only the allowlisted runner)

### What implemented
#### 1) Runner script (privileged execution)
File: `onos-testbed/scripts/fyp-netns-test.sh` (installed to `/usr/local/bin/fyp-netns-test`)

Supported commands:
- `list`: list namespaces + their IPv4 addresses (used to populate dropdowns)
- `ping <src_ns> <dst_ip> [count] [timeout_seconds]`
- `iperf <src_ns> <dst_ns> <dst_ip> <tcp|udp> [port] [duration_seconds] [udp_mbps] [tos_hex]`

Important behaviors:
- uses strict bash: `set -euo pipefail`
- validates inputs (namespace format `h1`, `h2`, IPv4, numeric ranges)
- always returns **JSON** on stdout
- uses `timeout` to avoid hanging processes
- for `iperf`, it starts an `iperf3 -s -1` server in `dst_ns` then runs the client in `src_ns`

#### 2) Backend API + service wrapper
Files:
- `backend/api/tests.py`
- `backend/services/testbed/runner.py`
- `backend/schemas/tests.py`

Endpoints (all **login-required** via `get_current_user`):
- `GET /tests/namespaces`: calls runner `list`
- `POST /tests/ping`: calls runner `ping`
- `POST /tests/iperf`: calls runner `iperf` and parses a small summary:
  - TCP: `throughput_mbps`, `retransmits`
  - UDP: `throughput_mbps`, `jitter_ms`, `loss_pct`

Implementation details:
- backend uses `sudo -n` so it fails fast if sudoers isn’t configured (instead of hanging)
- backend reads runner path from env:
  - `NETNS_TEST_RUNNER=/usr/local/bin/fyp-netns-test`
- improved error reporting: if runner returns non-JSON, backend returns a useful detail snippet (stderr/stdout)

#### 3) Frontend UI
Files:
- `frontend/src/components/pages/Tests.tsx`
- `frontend/src/utils/testsApi.ts`

UI features:
- requires login (otherwise redirects to `/login`)
- “Ping test” card:
  - select source namespace
  - input destination IP
  - shows reachable/unreachable + loss + avg rtt
- “iperf3 test” card:
  - pick source + destination namespaces
  - pick TCP/UDP
  - configure duration + port (+ UDP bandwidth)
  - shows summary metrics + collapsible raw output

### Required server setup (one-time)
#### 1) Install the runner to a stable path
```bash
sudo install -m 0755 "/home/henry/FYP/onos-testbed/scripts/fyp-netns-test.sh" /usr/local/bin/fyp-netns-test
```

#### 2) Allowlist runner in sudoers (passwordless)
Edit sudoers:
```bash
sudo visudo
```
Add:
```text
henry ALL=(root) NOPASSWD: /usr/local/bin/fyp-netns-test *
```

#### 3) Point backend to the installed runner and restart backend
```bash
export NETNS_TEST_RUNNER=/usr/local/bin/fyp-netns-test
```

### Key bugs fixed (and why)
#### 1) `unbound variable` in runner
Symptom:
- `sudo /usr/local/bin/fyp-netns-test list` → `$4: unbound variable`

Cause:
- script uses `set -u` and an `awk '{print $4}'` inside a double-quoted string accidentally expanded bash positional `$4`.

Fix:
- escape `$4` correctly so it is passed literally into `awk`.

#### 2) `runner returned non-JSON` for iperf
Symptom:
- UI shows `runner returned non-JSON`
- backend `/tests/iperf` returns 400

Cause:
- `iperf3 --json` pretty-prints using **tabs/newlines**; JSON strings cannot contain literal control characters.

Fix:
- improved `json_escape()` to first “slurp” the entire input then escape:
  - backslashes, quotes, **tabs**, and newlines

### How to test manually (CLI)
List namespaces (must work without prompting password):
```bash
sudo -n /usr/local/bin/fyp-netns-test list
```

Ping:
```bash
sudo -n /usr/local/bin/fyp-netns-test ping h1 10.0.0.2 3 6
```

iperf UDP:
```bash
sudo -n /usr/local/bin/fyp-netns-test iperf h1 h2 10.0.0.2 udp 5201 5 10
```