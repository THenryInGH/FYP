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
cd onos-testbed/scripts
bash clean-topo.sh
```

4. start onos
```bash
sudo systemctl start onos

app activate org.onosproject.fwd
```
5. setup topo 
```bash
cd FYP/onos-testbed/scripts
bash mesh-topo.sh
```

6. testing link failure
```bash
sudo ip link set veth-s1-s4 down
```

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

### Frontend (updated)
#### Core layout + routing
- `frontend/src/main.tsx` now nests docs pages under `/docs/*` and mounts the new multi-page docs layout.
- `frontend/src/components/layout/NavBar.tsx` includes navigation tabs + user popover (profile + logout).

#### Authentication + API
- `frontend/src/auth/AuthContext.tsx`: global auth state, stores token in `localStorage`, bootstrap `getMe()` on load.
- `frontend/src/utils/authStorage.ts`: localStorage helpers.
- `frontend/src/utils/onosApi.ts`: includes `Authorization` header for ONOS write operations; parses backend error details.
- `frontend/src/utils/chatApi.ts`, `testsApi.ts`, `devicesApi.ts`, `configSamplesApi.ts`: typed API clients with auth headers.

#### Chat (LLM)
- `frontend/src/components/chat/ChatInterface.tsx`
  - left-side conversation list, “New” chat
  - handles context limit error (shows “Start new chat”)
  - Apply Configuration posts intent JSON via backend ONOS proxy (auth required)

#### Feature pages
- `frontend/src/components/pages/Devices.tsx`: DB-friendly names for devices/hosts, delete stale rows.
- `frontend/src/components/pages/ConfigLibrary.tsx`: list/search samples, add/delete, JSON upload + pretty view.
- `frontend/src/components/pages/Tests.tsx`: ping + iperf3 forms, shows summary + raw output.

#### Docs (multi-page)
- `frontend/src/components/pages/docs/*`
  - `DocsLayout.tsx` sidebar layout
  - `DocsHome`, `DocsIntroduction`, `DocsFeatures`, `DocsGettingStarted`,
    `DocsTopology`, `DocsTroubleshooting`, `DocsEvaluation`

### Database (updated)
- `database/models.py`
  - Added **Conversation** and **Message** tables for multi-chat history.
  - `Device` table reused for both devices and hosts (friendly names).
  - `ConfigSample` table includes pgvector embeddings.
- `database/create_missing_tables.py`
  - lightweight “create tables if missing” helper (no drops).
- `database/migrate_chat_history_to_conversations.py`
  - one-time migration from legacy `chat_history` into `conversations/messages`.
- `database/seed_data.py`
  - hashes plaintext passwords if seed data contains placeholders.
  - embeds config samples at seed time.

### Backend (updated)
#### Chat + LLM grounding
- `backend/services/chat/service.py`
  - multi-conversation chat, context budget guard, system prompt.
  - **LLM grounding now refreshes ONOS data + enriches with friendly names**, so host IDs (MAC-based) stay correct after resets.
- `backend/services/llm/groq_client.py`
  - legacy `/generate` path also enriches network info using DB (when `db` is provided).

#### Devices/Hosts friendly names
- `backend/services/devices/service.py`
  - hosts are stored under **stable id** `host:<ip>` so names survive MAC changes.
  - migration helper moves old MAC-keyed rows to stable IDs.
  - enrich functions attach `friendly_name` + `managed_id` to ONOS payloads.
- `backend/api/hosts.py`, `backend/api/devices.py`
  - `/hosts` returns friendly names using stable host IDs.
  - `/devices/managed` also computes host active state via live host IDs.

#### Config Samples (RAG)
- `backend/api/config_samples.py` + `backend/services/config_samples/service.py`
  - list/search, create (auth required), delete.
  - embedding generated immediately on create.

#### Tests (ping + iperf3)
- `backend/api/tests.py` + `backend/services/testbed/runner.py` + `backend/schemas/tests.py`
  - `/tests/namespaces`, `/tests/ping`, `/tests/iperf`
  - ping returns structured output even on failure so UI can show raw output.

#### Docs assets
- `backend/api/docs_assets.py`
  - serves a **whitelisted set** of diagrams/charts for the Docs pages (safe, no path traversal).

### onos-testbed (updated)
- `onos-testbed/scripts/fyp-netns-test.sh`
  - allowlisted test runner for `list`, `ping`, `iperf`.
  - JSON escaping fixes for tabs/newlines, safe input validation.
- `onos-testbed/notes/test-runner-sudoers.md`
  - sudoers allowlist + runner install steps.

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
## 6. Host frontend on domain name
### Modify nginx configuration file 
```bash
sudo nano /etc/nginx/sites-available/fyp
```
```text
server {
  listen 80;
  server_name henryfyp.my www.henryfyp.my;

  root /home/henry/FYP/frontend/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```
### Build frontend 
```bash
cd /home/henry/FYP/frontend
npm install
VITE_API_BASE=/api npm run build
```

## 7. Code explanation 
### Backend
#### 1) `backend/main.py` — Application entrypoint
**Purpose:** Builds the FastAPI app, configures CORS, and registers all routers.

**Key flow:**
- `create_app()` creates the FastAPI instance.
- CORS is configured using env:
  - `FRONTEND_ORIGINS` (comma‑separated list)
  - If not set → allow `*`
  - Optional `FRONTEND_ORIGIN_REGEX` for port‑forwarding scenarios
- Routers included in order:
  - `chat_router` and `chat_conversations_router` (chat + multi‑chat)
  - `auth_router` (register/login/me)
  - `devices_router` + `hosts_router` (friendly names + host list)
  - `config_samples_router` (RAG library)
  - `tests_router` (ping/iperf)
  - `docs_assets_router` (serves diagrams/charts for Docs page)
  - `onos_router` (backend ONOS proxy)
- `/` route returns “FYP Backend is running”.

**Why it matters:** This file defines **what endpoints exist**, and sets the CORS policy so your frontend can call them safely.

---

#### 2) `backend/api/auth.py` — Auth endpoints
**Purpose:** Registration, login, and “who am I” (`/me`).

**Endpoints:**
- `POST /auth/register`
  - Validates `RegisterRequest`
  - Checks username/email uniqueness
  - Hashes password (`hash_password`)
  - Creates user in DB
  - Returns safe user info (`UserPublic`)
- `POST /auth/login`
  - Accepts username or email
  - Verifies password (`verify_password`)
  - Issues JWT (`create_access_token`)
  - Returns token + user
- `GET /auth/me`
  - Protected (`get_current_user`)
  - Returns current user profile

**Why it matters:** All write operations (apply intents, rename devices, tests, etc.) depend on this auth system.

---

#### 3) `backend/api/chat.py` — Legacy LLM endpoint (`/generate`)
**Purpose:** Backward‑compatible route used by older UI calls.

**Key flow:**
- `POST /generate` takes `prompt`, optional `model`, `use_rag`
- Requires auth (`get_current_user`)
- Passes DB session into `send_prompt()`:
  - So LLM grounding includes **friendly names** and **current ONOS host IDs**
- Returns `status`, `response`, `timings`, `model`, `use_rag`

**Why it matters:** This endpoint lets old frontend calls still work while you moved to the new `/chat/conversations` system.


#### 4) `backend/api/chat_conversations.py`
**Purpose:** All endpoints for **multi‑conversation chat history** (per user).

**Endpoints:**
- `GET /chat/conversations`  
  Lists all conversations for the logged‑in user (sorted by recent activity).
- `POST /chat/conversations`  
  Creates a new conversation (optional title).
- `GET /chat/conversations/{id}/messages`  
  Returns messages for a conversation.
- `POST /chat/conversations/{id}/messages`  
  Sends a user message → triggers LLM → stores response.

**Why it matters:** This replaces the old single in‑memory history and gives you **persistent, multi‑thread chat** per user.

---

#### 5) `backend/schemas/chat.py`
**Purpose:** Pydantic models for chat API payloads and responses.

**Key models:**
- `ConversationCreateRequest` — for creating a conversation
- `ConversationPublic` — safe conversation output
- `MessagePublic` — safe message output
- `SendMessageRequest` — user payload (content, model, use_rag)
- `SendMessageResponse` — assistant + user message result

**Why it matters:** Keeps inputs validated and outputs consistent across backend/frontend.

---

#### 6) `backend/services/chat/service.py`
**Purpose:** The **core chat logic**: DB CRUD + prompt grounding + LLM call.

**Main responsibilities:**
- **Conversation storage**: `list_conversations`, `create_conversation`, `list_messages`
- **Message creation**: creates user + assistant messages in DB
- **Context guard**: `_check_context_budget()` estimates tokens to avoid LLM overflow
- **Grounding**:
  - Pulls ONOS network state
  - Enriches with **friendly names** from DB
  - Attaches RAG samples (if enabled)
- **LLM call**: uses Groq model via `groq` SDK

**Why it matters:** This is the engine that turns user text into grounded LLM calls, and stores full history so chat is persistent and auditable.

---

#### 7) `backend/services/llm/groq_client.py`
**Purpose:** Core **LLM call** used by the legacy `/generate` endpoint.

**Key flow:**
- Builds a **grounded prompt**:
  - Pulls live ONOS state (`get_network_info`)
  - Optionally enriches with **friendly names** (if DB session provided)
  - Pulls top‑K RAG samples from config library
- Sends messages to Groq via `groq` SDK
- Returns response + timing breakdown

**Why it matters:** This is the single place where the LLM prompt is assembled for the old `/generate` path. It keeps LLM grounding consistent with live ONOS data.

---

#### 8) `backend/services/llm/chat_history.py`
**Purpose:** Legacy in‑memory chat history (old flow).

**Key flow:**
- Stores messages in a list (`add_message`, `get_history`)
- Provides a **constant system prompt**
- Used only by the legacy `/generate` route

**Why it matters:** This is **legacy**; multi‑conversation chat now uses DB, but the file remains for backward compatibility.

---

#### 9) `backend/services/onos/onos_client.py`
**Purpose:** Internal **ONOS REST client** used across backend.

**Key flow:**
- Reads credentials from env:
  - `ONOS_API_URL`, `ONOS_USER`, `ONOS_PASS`
- `_request()` wraps HTTP calls to ONOS
- Provides methods:
  - `get_network_info()`
  - `get_network_devices()`, `get_network_hosts()`, `get_network_links()`, `get_network_flows()`, `get_network_intents()`
  - `post_intent()` and `delete_intent()`

**Why it matters:** Centralizes ONOS access so frontend never sees ONOS credentials, and keeps all ONOS calls consistent.

---

#### 10) `backend/api/onos.py`
**Purpose:** **Backend proxy** endpoints for ONOS.

**Endpoints:**
- `GET /onos/devices|hosts|links|flows|intents|network` (read‑only)
- `POST /onos/intents` (auth‑protected)
- `DELETE /onos/intents/{appId}/{key}` (auth‑protected)

**Why it matters:** The UI only talks to **your backend**, never directly to ONOS—so credentials stay server‑side and you can enforce auth.

---

#### 11) `backend/services/devices/service.py`
**Purpose:** All logic for **devices + hosts sync** and friendly names.

**Key points:**
- `sync_devices_from_onos()`  
  Pulls ONOS devices → upserts into DB; **preserves friendly names**.
- `sync_hosts_from_onos()`  
  Pulls ONOS hosts → stores them in `devices` table as type=`host`.
- **Host stability fix:**  
  `host_stable_id()` uses `host:<ip>` as the DB key, so friendly names survive topology resets even when MAC changes.
- `enrich_onos_hosts_with_friendly_names()` and `enrich_onos_devices_with_friendly_names()`  
  Attach `friendly_name` to ONOS payload for UI/LLM grounding.

**Why it matters:** This is what keeps **host names consistent** even when ONOS host IDs change after a reset.

---

#### 12) `backend/api/hosts.py`
**Purpose:** Returns ONOS hosts enriched with friendly names.

**How:**
- Calls `sync_hosts_from_onos()` (updates DB with live ONOS hosts).
- Maps `friendly_name` by **stable host ID** (`host:<ip>`).
- Adds `managed_id` for debugging/management.

**Why it matters:** UI can reliably show host names even if ONOS host IDs (MACs) change.

---

#### 13) `backend/api/devices.py`
**Purpose:** Devices list + friendly name update + DB management.

**Endpoints:**
- `GET /devices`  
  Returns ONOS devices with `friendly_name`.
- `PUT /devices/{device_id}/name` (auth required)  
  Updates a friendly name in DB.
- `GET /devices/managed`  
  Lists DB rows with `active` flag (includes hosts now).
- `DELETE /devices/{device_id}` (auth required)  
  Deletes a managed row (does not delete ONOS device).

**Why it matters:** This is your “device name management” feature.

---

#### 14) `backend/schemas/devices.py`
**Purpose:** Pydantic schema for rename input.

- `DeviceNameUpdateRequest`: contains `name: str | None`.

---

#### 15) `backend/api/config_samples.py`
**Purpose:** Config library endpoints (RAG dataset).

**Endpoints:**
- `GET /config-samples`  
  Search + filter (latest 20 by default).
- `POST /config-samples` (auth required)  
  Create a sample, embed immediately.
- `DELETE /config-samples/{id}` (auth required)

**Why it matters:** This powers RAG and your “Samples” page.

---

#### 16) `backend/services/config_samples/service.py`
**Purpose:** DB operations for config samples.

- `list_config_samples()`  
  Search by category/intent text; return latest entries.
- `create_config_sample()`  
  Calls `embed_text()` to create vector embedding.
- `delete_config_sample()`  
  Removes a sample.

---

#### 17) `backend/schemas/config_samples.py`
**Purpose:** Pydantic models.

- `ConfigSampleCreateRequest`
- `ConfigSamplePublic`  
  Fields allow **Any** JSON because DB rows can be list/dict/etc.

---

#### 18) `backend/api/tests.py`
**Purpose:** Test endpoints (ping + iperf).

- `GET /tests/namespaces`  
  Lists namespaces (auth required).
- `POST /tests/ping`  
  Returns structured ping result even on failure.
- `POST /tests/iperf`  
  Runs iperf3 and returns summary.

---

#### 19) `backend/services/testbed/runner.py`
**Purpose:** Safe wrapper around the allowlisted test runner script.

- Executes `sudo -n` with timeouts.
- Parses JSON from runner.
- Returns helpful errors for sudo misconfig.

---

#### 20) `backend/schemas/tests.py`
**Purpose:** Request validation for ping/iperf.

- `PingTestRequest`
- `IperfTestRequest` (protocol, duration, udp_mbps, tos, etc.)

---

#### 21) `backend/api/docs_assets.py`
**Purpose:** Serves **whitelisted docs images** (diagram + evaluation charts).

- Prevents path traversal by mapping known filenames to exact paths.

---

#### 22) `backend/services/auth/service.py`
**Purpose:** Password hashing + JWT tokens.

- `hash_password`, `verify_password`
- `create_access_token`, `decode_access_token`

---

#### 23) `backend/services/auth/deps.py`
**Purpose:** Auth dependency (`get_current_user`).

- Extracts Bearer token
- Decodes JWT
- Loads user from DB
- Raises 401 on failure

---

#### 24) `backend/services/users/repo.py`
**Purpose:** User DB operations.

- `get_user_by_id`, `get_user_by_username`, `get_user_by_email`
- `get_user_by_username_or_email`, `create_user`

---

### Frontend 

#### 1) `frontend/src/main.tsx`
**Purpose:** Frontend entrypoint, sets up routing and Auth provider.

**Key flow:**
- Wraps app in `<AuthProvider>` (global auth state).
- Defines routes under `<App />` layout:
  - `/` dashboard
  - `/devices`, `/config-library`, `/tests`, `/login`
  - `/docs/*` nested routes for multi‑page docs

**Why it matters:** This file defines **your entire UI navigation** and connects pages to URLs.

---
#### 2) `frontend/src/App.tsx`
**Purpose:** App layout wrapper (NavBar + Footer + Outlet).

**Key flow:**
- Renders `<NavBar />` at top
- `<Outlet />` for page content
- `<Footer />` at bottom

**Why it matters:** This is the consistent UI shell across all pages.

---

#### 3) `frontend/src/components/layout/NavBar.tsx`
**Purpose:** Main navigation + user account popover.

**Key features:**
- Links to Dashboard, Devices, Samples, Tests, Docs, Login
- When logged in:
  - Shows “Hi, username”
  - Popover shows username/email/created_at
  - Logout button

**Why it matters:** Provides global access to all features and reinforces auth state.

---

#### 4) `frontend/src/auth/AuthContext.tsx`
**Purpose:** Global auth state for login/register/logout.

**Key flow:**
- On startup: reads token from `localStorage`
- Calls `/auth/me` to restore session
- Provides methods: `login`, `register`, `logout`
- Stores JWT token with `authStorage.ts`

**Why it matters:** Every “protected action” checks this state.

---

#### 5) `frontend/src/utils/authStorage.ts`
**Purpose:** Tiny helper for storing JWT in `localStorage`.

**Functions:**
- `getAccessToken`, `setAccessToken`, `clearAccessToken`

---

#### 6) `frontend/src/components/dashboard/Dashboard.tsx`
**Purpose:** Main landing page layout.

**Key flow:**
- Assembles dashboard sections: topology, metrics, charts, intent summary.
- Uses hooks/services to fetch ONOS data via backend.

**Why it matters:** This is the “monitoring” view for SDN state.

---

#### 7) `frontend/src/components/dashboard/TopologyCanvas.tsx`
**Purpose:** Renders network topology graph.

**Key flow:**
- Uses D3 force layout to draw nodes/links.
- Displays devices + hosts with labels.
- Truncates long labels for readability.

**Why it matters:** This is the visual anchor of your SDN system—users see live topology.

---

#### 8) `frontend/src/hooks/useOnosTopology.ts`
**Purpose:** Central hook to fetch topology data.

**Key flow:**
- Calls backend `/devices` and `/hosts` (not direct ONOS).
- Maps friendly names:
  - Devices: `friendly_name ?? short id`
  - Hosts: `friendly_name ?? ip ?? mac`
- Returns devices/hosts/links data for dashboard.

**Why it matters:** Ensures **friendly names and current host IDs** are shown in UI.

---

#### 9) `frontend/src/components/chat/ChatInterface.tsx`
**Purpose:** The **LLM chat panel** with conversation history.

**Key flow:**
- Left sidebar = conversations list.
- Right side = messages + intent JSON block.
- Uses `chatApi` for multi-conversation endpoints.
- Apply Configuration → posts JSON to backend ONOS proxy.
- Handles context limit error (`Start new chat` button).

**Why it matters:** This is your **core innovation**: natural language → intent JSON → apply.

---

#### 10) `frontend/src/components/pages/Devices.tsx`
**Purpose:** Manage friendly names for devices/hosts.

**Key flow:**
- Fetches `/devices/managed`.
- Lets user edit name + delete stale rows.
- Disabled when not logged in.

**Why it matters:** This makes topology readable and stable even after resets.

---

#### 11) `frontend/src/components/pages/Tests.tsx`
**Purpose:** Ping + iperf3 verification UI.

**Key flow:**
- Loads namespaces from backend.
- Ping: select src namespace + dst IP.
- iperf: choose src/dst namespace, protocol, duration, bandwidth.
- Shows structured summary + raw output.

**Why it matters:** Confirms **data plane** behavior after intents.

---

#### 12) `frontend/src/components/pages/ConfigLibrary.tsx`
**Purpose:** Config samples library (RAG dataset).

**Key flow:**
- List latest 20 samples (search/filter).
- Inspect JSON and metadata.
- Create new sample (manual input or JSON upload).
- Delete sample (auth required).

**Why it matters:** Provides grounding data for LLM and supports evaluation.

---

#### 13) `frontend/src/components/pages/docs/DocsLayout.tsx`
**Purpose:** Docs “shell” with **left sidebar navigation**.

**Key flow:**
- Defines the sidebar nav list.
- Uses `<Outlet />` to render selected docs page.

**Why it matters:** Gives the documentation a professional, multi‑page structure (NetBox‑style).

---

#### 14) Docs pages (`frontend/src/components/pages/docs/*`)
Each page is small and focused:

- **`DocsHome.tsx`**  
  Overview + quick links into sections.

- **`DocsIntroduction.tsx`**  
  System summary + architecture diagram (image loaded from backend `/docs-assets/...`).

- **`DocsFeatures.tsx`**  
  Walkthrough of each product feature (chat, devices, samples, tests).

- **`DocsGettingStarted.tsx`**  
  Step‑by‑step run instructions + env variables.

- **`DocsTopology.tsx`**  
  Explains read‑only topology + how to switch profiles via scripts or change ONOS endpoint.

- **`DocsTroubleshooting.tsx`**  
  Common issues (CORS, sudoers for tests, ARP behavior, auth errors).

- **`DocsEvaluation.tsx`**  
  Shows evaluation charts (accuracy/latency) via backend asset routes.

**Why it matters:** Helps viva reviewers and new users quickly understand your system.

---

#### 15) `frontend/src/utils/onosApi.ts`
**Purpose:** Frontend client for backend ONOS proxy.

**Key flow:**
- GET `/onos/*` for topology/metrics.
- POST `/onos/intents` and DELETE `/onos/intents/*` include **JWT auth header**.
- Returns structured errors from backend.

**Why it matters:** Keeps ONOS credentials server‑side and enforces auth for write operations.

---

#### 16) `frontend/src/utils/chatApi.ts`
**Purpose:** Client for multi‑chat endpoints.

**Key flow:**
- `listConversations`, `createConversation`, `listMessages`, `sendMessage`
- Adds auth header automatically.

**Why it matters:** Drives the left chat list + history.

---

#### 17) `frontend/src/utils/testsApi.ts`
**Purpose:** Client for ping/iperf endpoints.

**Key flow:**
- `listNamespaces()`, `pingTest()`, `iperfTest()`
- Uses auth header for protected endpoints.

---

#### 18) `frontend/src/utils/devicesApi.ts`
**Purpose:** Client for device/host name management.

**Key flow:**
- `getDevices`, `getHosts`, `getManagedDevices`
- `setDeviceFriendlyName`, `deleteManagedDevice` (auth required)

---

#### 19) `frontend/src/utils/configSamplesApi.ts`
**Purpose:** Client for config samples library.

**Key flow:**
- `listConfigSamples`, `createConfigSample`, `deleteConfigSample`
- Create/delete require auth.

---


### Database

#### 1) `database/database.py`
**Purpose:** Central DB engine + session factory + FastAPI dependency.

**Key flow:**
- Loads DB creds from `.env` (`DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`, `DB_NAME`)
- Builds `DATABASE_URL`
- Creates `engine` and `SessionLocal`
- Exposes `get_db()` for FastAPI dependency injection

**Why it matters:** All backend DB access goes through this file.

---

#### 2) `database/__init__.py`
**Purpose:** Convenience exports.

**Exports:**
- `Base`, `SessionLocal`, `engine`, `get_db`

**Why it matters:** Keeps imports clean across backend.

---

#### 3) `database/init_db.py`
**Purpose:** One‑time **full table creation**.

**Key flow:**
- Imports models
- `Base.metadata.create_all(bind=engine)`

**Why it matters:** First‑time bootstrap.

---

#### 4) `database/create_missing_tables.py`
**Purpose:** Safe table creation **without dropping existing data**.

**Key flow:**
- Imports models
- Creates any missing tables only

**Why it matters:** Lightweight alternative to Alembic for small projects.

---

#### 5) `database/models.py`
**Purpose:** ORM models (all database tables).

**Key models:**
- **User**: `users` table
- **ChatHistory** (legacy)
- **Conversation** + **Message** (multi‑chat)
- **ConfigurationHistory** (saved intents)
- **Device** (devices + hosts with friendly names)
- **ConfigSample** (RAG examples + embedding)
- **Vector** custom type (pgvector)

**Why it matters:** Defines your persistent data model.

---

#### 6) `database/migrate_chat_history_to_conversations.py`
**Purpose:** One‑time migration from legacy `chat_history` to `conversations/messages`.

**Key flow:**
- For each user: create a conversation
- Convert each legacy row into user + assistant messages
- Updates timestamps

**Why it matters:** Preserves old data when switching to multi‑chat.

---

#### 7) `database/seed_data.py`
**Purpose:** Seed fixtures from `database/data/*.json`.

**Key flow:**
- Seeds users, devices, config samples
- Hashes plaintext passwords if needed
- Embeds samples using `embed_text`

**Why it matters:** Quick data bootstrap for demo/testing.

---

#### 8) `database/rag/embedded_server.py`
**Purpose:** Loads SentenceTransformer model and exposes `embed_text()`.

**Key flow:**
- Loads `sentence-transformers/all-mpnet-base-v2`
- Returns 768‑dim vector list

**Why it matters:** All RAG embeddings come from here.

---

#### 9) `database/rag/embedded_client.py`
**Purpose:** Search for similar config samples using pgvector.

**Key flow:**
- Embeds query text
- Executes SQL with `embedding <-> query_vec`
- Returns top‑K matches + timing metrics

**Why it matters:** Provides retrieval layer for LLM grounding.

---

#### 10) `database/rag/model_test.py`
**Purpose:** Small sanity script to verify embeddings work.

**Key flow:**
- Encodes two example sentences
- Prints shape `(2,768)` and sample values

---

#### 11) `database/rag/__init__.py`
**Purpose:** Package marker for RAG utilities.

---

### onos-testbed 

#### 1) `onos-testbed/scripts/*.sh` (topology scripts)
**Purpose:** Create/reset the Mininet/OVS topology that ONOS controls.

**Key scripts:**
- `mesh-topo.sh` — deploys mesh topology  
- `tree-topo.sh` — deploys tree topology  
- `test-topo.sh` — quick test topology  
- `clean-topo.sh` — cleans up topology

**Why it matters:** These scripts are how you **change topology profiles** (since UI is read‑only by design).

---

#### 2) `onos-testbed/scripts/fyp-netns-test.sh`
**Purpose:** Allowlisted **test runner** for ping/iperf inside Linux namespaces.

**Key behavior:**
- Uses strict mode: `set -euo pipefail`
- Validates inputs: namespace name, IP, protocol, counts
- Returns **JSON** always
- Commands:
  - `list` → namespaces + IPs
  - `ping` → structured ping result
  - `iperf` → runs iperf3 server + client and returns summary + raw output
- `json_escape()` safely escapes tabs/newlines for JSON output

**Why it matters:** Backend uses this to run tests **without root shell access**.

---

#### 3) `onos-testbed/notes/test-runner-sudoers.md`
**Purpose:** Documentation for safe sudo allowlist setup.

**Key content:**
- Install runner to `/usr/local/bin/fyp-netns-test`
- Add sudoers rule:
  ```
  henry ALL=(root) NOPASSWD: /usr/local/bin/fyp-netns-test *
  ```
- Set env: `NETNS_TEST_RUNNER=/usr/local/bin/fyp-netns-test`

**Why it matters:** Without this, Tests feature hangs or fails (sudo prompt).

---

#### 4) `onos-testbed/notes/*`
**Purpose:** Knowledge base for SDN/Mininet/OVS/ONOS operations.

**Examples:**
- `onos.md`, `onos-intents.md`, `rest-api.md`
- `ovs.md`, `mininet.md`, `topology.md`
- `docker.md`, `netns-veth.md`

**Why it matters:** These are your **operational references** and justify design decisions.

---
