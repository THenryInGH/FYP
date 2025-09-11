# FYP (For Your Ping)

> An LLM-powered agent that intelligently manage network resources based on your intents in natural language in a software-defined networking (SDN) environment.


## What it does
- Natural-language intents to concrete SDN changes (QoS, routing, ACLs, bandwidth allocation).
- Validates intents for safety and feasibility before execution.
- Simulates/what-if previews and change logs for accountability.
- Human-in-the-loop approval flows.
- Extensible skills (functions/tools) for new SDN controllers and domains.

Example intents:
- “Throttle bulk backups after 1 a.m. to keep latency low for production.”
- “Give the ‘VideoConf’ app higher priority on VLAN 20 until 6 p.m.”
- “Block SSH to servers outside the bastion for interns group.”

## How it uses OpenAI
- LLM models: GPT-OSS-20B
- Techniques:
  - Function calling / tool use to invoke SDN controller APIs.
  - Structured outputs (JSON) for deterministic policy objects.
  - System prompts with policy/compliance guardrails.
  - Retrieval-augmented context (topology, devices, historical changes)
- Safety:
  - Dry-run simulation and diff preview before apply.
  - Role-based approvals for sensitive intents.
  - Strict schema validation and bounded tool arguments.

  ---

## Architecture
High-level flow:

```
User → Web UI (Vite + React + Tailwind)
   → Backend API <!-- TODO: language/framework -->
      → OpenAI API (intent parsing, planning, validation)
      → SDN Controller(s) <!-- TODO: ONOS / ODL / vendor -->
   ← Results, preview, and execution logs
```

Key components:
- Frontend: Vite + React + TypeScript + Tailwind CSS (SWC for fast JSX/TS transforms).
- Backend: <!-- TODO: e.g., Node/Express, Python/FastAPI, Go/Fiber -->
- SDN: <!-- TODO: e.g., ONOS, OpenDaylight, Faucet, vendor APIs -->
- Persistence/telemetry: <!-- TODO: DB/metrics if used -->

---

## Repository layout
```
FYP/
├─ frontend/
│  ├─ index.html
│  ├─ src/
│  │  ├─ main.tsx
│  │  ├─ index.css  (imports Tailwind)
│  │  └─ vite-env.d.ts
│  ├─ vite.config.ts
│  ├─ tsconfig.app.json
│  ├─ tsconfig.node.json
│  ├─ tsconfig.json
│  ├─ eslint.config.js
│  └─ public/
│     └─ fyp-logo.png (favicon)
└─ backend/  <!-- TODO: add or link -->
```

---

## Tech stack
- Frontend
  - Vite + React + TypeScript
  - SWC React plugin
  - Tailwind CSS (via @tailwindcss/vite)
  - ESLint (TS + React Hooks)
- LLM platform
  - OpenAI API (chat completions / responses with tool calling) <!-- TODO -->
- Backend & SDN
  - <!-- TODO: framework + SDN controller(s) -->

---

## Getting started

### Prerequisites
- Node.js 18+ (LTS recommended)
- Package manager: npm, pnpm, or yarn
- OpenAI API Key (https://platform.openai.com/)
