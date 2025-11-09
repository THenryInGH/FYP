# FYP (For Your Ping)

> An LLM-powered agent that intelligently manage network resources based on your intents in natural language in a software-defined networking (SDN) environment.


## What it does
- Natural-language intents to concrete SDN changes (QoS, routing, ACLs, bandwidth allocation).
- Validates intents for safety and feasibility before execution.
- Human-in-the-loop approval flows.
- Extensible skills (functions/tools) for new SDN controllers and domains.

## Scope
1. Host-to-Host connectivity
2. Bandwidth/QoS constraint on flows
3. Multi-ingress/ multi-egress flows (load balancing)
4. Blocking/ security flows (simple ACLs)
5. Topology awareness and status retrieval
### Future planning
6. Dynamic rerouting based on congestion/failures (IMR)
7. Automate documentation process 
8. Agent install flow rules itself 

Example intents:
- “Throttle bulk backups after 1 a.m. to keep latency low for production.”
- “Give the ‘VideoConf’ app higher priority on VLAN 20 until 6 p.m.”
- “Block SSH to servers outside the bastion for interns group.”




## Architecture
<!--Architecture diagram here-->



---

## Repository layout 
```
FYP/
├─ database/ 
├─ diagram/
├─ evaluation/
├─ frontend/
├─ llm-engine/
├─ onos-testbed/
```

---

## Tech stack
- SDN Testbed
- Frontend
  - Vite + React + TypeScript
  - SWC React plugin
  - Tailwind CSS (via @tailwindcss/vite)
  - ESLint (TS + React Hooks)
- LLM Engine
  - Llama-server (chat completions / responses with tool calling)

---

## Getting started

### Prerequisites
- Node.js 18+ (LTS recommended)
- Package manager: npm, pnpm, or yarn

### Ports using
#### Host A
1. 
2. `5173`: React frontend
3. `6653`: ONOS Listening OpenFlow
4. `8181`: ONOS GUI 
#### Host B
1. `0.0.0.0:5000`: agent endpoint (FastAPI)
2. `localhost:8080`: llama-server end point
### Hosts Specification
#### Host A
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

2. start FastAPI server
```bash
cd FYP/llm-engine
uvicorn agent:app --host 0.0.0.0 --port 5000
``` 