# FYP (For Your Ping)

> An LLM-powered agent that intelligently manage network  based on your intents in natural language in a software-defined networking (SDN) environment.


## Problem statement
- **Rigid and manual workflows**: Administrators must translate high-level business goals into complex, vendor-specific flow rules. This is slow and prone to human error.
- **Context-blindness and hallucination**: General LLMs lack real-time topology and network state, so they can produce incorrect or unsafe configurations.
- **Messy management and static knowledge**: There is no unified interface for monitoring and control, and no feedback-driven knowledge base to improve the model over time.

## Objective
- **Integrated dashboard and knowledge base**: Provide a real-time dashboard with a feedback-driven knowledge base (vector DB) that stores and retrieves successful configuration samples.
- **Context-aware RAG pipeline**: Inject live topology and similar configuration samples into the LLM prompt to improve technical accuracy.
- **User intent translation**: Build a natural language interface that converts high-level intents into ONOS-compatible JSON configurations.

## Scope
1. Connectivity：   
    - HostToHost Intent 


2. QoS control:
    - HostToHost Intent with specific traffic types selector and priority
    - Plan to further extend onos intent framework that allows OpenFLow meter injection

3. Load-balancing
    - HostToHost Intent with specific traffic types selector and path
    - Plan to develop a load balancer to be extended in onos intent framework

4. Access control
    - FlowObjective intent with selector and treatment

5. Topology awareness and status retrieval
    - A respontive UI developed using React

## Future planning
1. Dynamic intent conflict resolution
2. Rely on openflow flow rules instead of onos intent framework to expand scope
3. Fine-tune LLM with more data collection
4. Multi-controller, multi language support

Example intents:
- “Throttle bulk backups after 1 a.m. to keep latency low for production.”
- “Give the ‘VideoConf’ app higher priority on VLAN 20 until 6 p.m.”
- “Block SSH to servers outside the bastion for interns group.”

## Evaluation
- refer [here](/evaluation/README.md)


## Architecture
![System architecture](<diagram/system architecture.png>)



---

## Repository layout 
- Significant components in this project
```
FYP/
├─ backend/ 
  ├─ main.py (FastAPI entrypoint)
  ├─ api/ (auth, chat, conversations, devices, hosts, config samples, tests, ONOS proxy)
  ├─ schemas/ (Pydantic request/response models)
  ├─ services/ (auth, chat, devices, config samples, llm, onos, rag, testbed, users)
├─ database/ 
  ├─ models.py (SQLAlchemy models)
  ├─ database.py (engine/session)
  ├─ seed_data.py (seed scripts)
  ├─ rag/ (embeddings + similarity search)
  ├─ data/ (seed JSON files)
├─ diagram/
├─ evaluation/ 
├─ frontend/
  ├─ src
    ├─ auth/ (Auth context)
    ├─ components/ (dashboard, chat, pages, layout)
    ├─ hooks/ (topology data)
    ├─ utils/ (API clients)
├─ llm-engine/ (legacy local LLM experiments)
├─ onos-testbed/
  ├─ scripts/ (topology + test runner)
  ├─ notes/ (testbed docs)
├─ main.py
```

---

## Tech stack
- SDN Testbed
  - ONOS Controller + Intent Framework
  - Open vSwitch
  - Linux namespaces (Mininet-based testbed)
- Frontend
  - Vite + React + TypeScript
  - Tailwind CSS
  - D3-force + Chart.js
- Backend
  - FastAPI + Pydantic
  - Groq API client (LLM inference)
  - RAG with SentenceTransformers
- Database
  - PostgreSQL + pgvector
  - SQLAlchemy
---

## Getting started

### Prerequisites
- Node.js 18+ (LTS recommended)
- Package manager: npm, pnpm, or yarn

### Ports using
1. `8000`: Backend API 
2. `5173`: React frontend
3. `6653`: ONOS Listening OpenFlow
4. `8181`: ONOS GUI 

### Host Specification
- CPU: Intel(R) Xeon(R) CPU D-1528 @ 1.90GHz
- Memory: 32 GB
- OS: Ubuntu 24.04.3 LTS
- No. of threads: 12

### Setup steps
1. Set required environment variables
```bash
export GROQ_API_KEY=your_key
export ONOS_API_URL=http://127.0.0.1:8181/onos/v1
export ONOS_USER=onos
export ONOS_PASS=rocks
```

2. Start backend FastAPI server
```bash
cd FYP
uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

3. Start frontend (separate terminal)
```bash
cd FYP/frontend
npm install
npm run dev
```

> Note: `llm-engine/agent.py` and `llm-engine/` are legacy local-LLM experiments.
> The current backend uses the Groq API by default.

