# FYP (For Your Ping)

> An LLM-powered agent that intelligently manage network  based on your intents in natural language in a software-defined networking (SDN) environment.


## Problem statement
| **Problem Topic**                     | **Problem Statement (Clear & Concise)**                                                        | **Why It Matters (Improved Explanation)**                                                                                               |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Manual Configuration**              | Network administrators must configure ONOS intents and rules manually.                         | Similar to legacy networks, manual configuration slows workflow, introduces human error, and becomes impractical as the network scales. |
| **Low-Level Complexity**              | Users without SDN expertise struggle to express configurations at the low-level policy format. | High technical requirement limits SDN accessibility and increases deployment difficulty for non-specialist users.                       |
| **Non-Automated Resource Allocation** | Bandwidth control, QoS rules, and routing decisions are not intent-driven or automated.        | This results in congestion, suboptimal utilisation, and poor performance guarantees for traffic flows.                                  |
| **Lack of Integrated Monitoring**     | Monitoring, intent execution, and feedback are separated into multiple workflows.              | Without real-time visibility and feedback loops, administrators cannot verify policy enforcement or respond to changes quickly.         |

## Objective
| Problem Topic                         | SMART Objective                                                                                                                                                                                                                                                                        |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Manual Configuration**              | Develop an intent-driven configuration module that converts natural-language requests into ONOS policies with at least **90% correct translation accuracy**, evaluated using a predefined intent dataset by Week 10 of development.                                                    |
| **Low-Level Complexity**              | Build a user-friendly web interface that allows non-expert users to input high-level intents and deploy configurations, achieving a **≥ 30% reduction in configuration time** compared to CLI-based deployment during usability testing.                                               |
| **Non-Automated Resource Allocation** | Implement an automated resource allocation mechanism (QoS, bandwidth, multipath routing) that maintains **stable throughput with ≤ 10% packet loss under synthetic load**, and demonstrates **≥ 20% better flow distribution** compared to unmanaged routing, before final evaluation. |
| **Lack of Integrated Monitoring**     | Integrate real-time network monitoring that visualises topology state, link utilisation, and flow status with **data refresh intervals ≤ 3 seconds**, enabling administrators to verify intent enforcement live by final deployment phase.                                             |

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

### Future planning
6. Dynamic rerouting based on congestion/failures (IMR)
7. Automate documentation process 
8. Agent install flow rules itself
9. Seek for a next version of FYP, escape from the limitation of intent framework 

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
- significant components in this project
```
FYP/
├─ backend/ 
  ├─ main.py (FastAPI entrypoint; replaces llm-engine/agent.py)
  ├─ api/
    ├─ auth.py (login/me) [planned]
    ├─ chat.py (generate endpoint)
    ├─ onos.py (proxy ONOS endpoints)
  ├─ services/
    ├─ llm/ (groq_client.py, prompt building)
    ├─ onos/ (onos_client.py, caching)
    ├─ rag/ (embedded client/server helpers)
  ├─ db/
    ├─ models.py (move from database/models.py) [planned]
    ├─ session.py / database.py (DB engine/session) [planned]
    ├─ seed.py [planned]
├─ database/ 
  ├─ data/
├─ diagram/
├─ evaluation/ 
├─ frontend/
  ├─ src
    ├─ assets
    ├─ components/
    ├─ utils/
    ├─ hooks/
├─ llm-engine/
  ├─ models/
  ├─ agent.py
├─ onos-testbed/
  ├─ scripts
├─ main.py
```

---

## Tech stack
- SDN Testbed
  - ONOS Controller
  - ONOS Intent Framework
  - Linux namespaces
  - OpenVSwitch
- Frontend
  - Vite + React + TypeScript
  - SWC React plugin
  - Tailwind CSS (via @tailwindcss/vite)
  - ESLint (TS + React Hooks)
- LLM Engine
  - Llama-server (chat completions / responses with tool calling)
  - FastAPI
- Database
  - PostgreSQL
  - pgvector
  - SQLAlchemy
---

## Getting started

### Prerequisites
- Node.js 18+ (LTS recommended)
- Package manager: npm, pnpm, or yarn

### Ports using
#### Host A
1. `5000`: Backend API 
2. `5173`: React frontend
3. `6653`: ONOS Listening OpenFlow
4. `8181`: ONOS GUI 
#### Host B
1. `0.0.0.0:5000`: backend API endpoint (FastAPI)
2. `localhost:8080`: llama-server end point
### Hosts Specification
#### Host A (Supermicro)
- CPU: Intel(R) Xeon(R) CPU D-1528 @ 1.90GHz
- Memory: 32 GB
- OS: Ubuntu 24.04.3 LTS
- No. of threads: 12
#### Host B (GPU)
- CPU: 
- GPU: Nvdia RTX 3080 Ti (12 GB VRAM)
- Memory: 64 GB
- OS: Ubuntu 24
- No. of threads: 16

### Setup steps
#### Host B
1. Running model using llama-server
```bash
cd FYP
llama-server -m ./llm-engine/models/gpt-oss/gpt-oss-20b-mxfp4.gguf --n-cpu-moe 36 --n-gpu-layers 999 -c 0 --port 8080 
```

2. start Backend FastAPI server (new structure)
```bash
cd FYP
uv run uvicorn backend.main:app --host 0.0.0.0 --port 5000
``` 

> Note: `llm-engine/agent.py` is the older entrypoint. We keep it during migration,
> but the backend should now be started from `backend/main.py`.

