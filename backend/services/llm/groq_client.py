from __future__ import annotations

import json
import os
import time
from typing import Any, Dict, List

from dotenv import load_dotenv
from groq import Groq

from backend.services.llm.chat_history import add_message, get_history
from backend.services.onos.onos_client import get_network_info
from sqlalchemy.orm import Session

from backend.services.devices.service import (
    enrich_onos_devices_with_friendly_names,
    enrich_onos_hosts_with_friendly_names,
    sync_devices_from_onos,
    sync_hosts_from_onos,
)
from database.rag.embedded_client import get_similar_samples

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DEFAULT_MODEL = "openai/gpt-oss-20b"


def send_prompt(
    user_prompt: str,
    *,
    db: Session | None = None,
    model: str | None = None,
    use_rag: bool = True,
) -> Dict[str, Any]:
    """
    Build a grounded prompt with network state and nearby config examples,
    then send it to the Groq chat completion API.
    """
    timings: Dict[str, float] = {}
    t_start = time.perf_counter()

    if use_rag:
        t_rag = time.perf_counter()
        samples = get_samples_json(user_prompt, top_k=3)
        timings["rag_seconds"] = time.perf_counter() - t_rag
    else:
        samples = {
            "summary": [],
            "raw_samples": [],
            "note": "RAG disabled by request.",
            "timings": {},
        }

    t_network = time.perf_counter()
    if db is not None:
        # Keep DB rows fresh so host MAC-based IDs match current topology.
        try:
            sync_devices_from_onos(db)
        except Exception:
            pass
        try:
            sync_hosts_from_onos(db)
        except Exception:
            pass

    network_info = get_network_info()
    if db is not None:
        devices = (network_info or {}).get("devices") or []
        hosts = (network_info or {}).get("hosts") or []
        if isinstance(devices, dict):
            devices = devices.get("devices") or []
        if isinstance(hosts, dict):
            hosts = hosts.get("hosts") or []
        if isinstance(devices, list):
            enrich_onos_devices_with_friendly_names(db, devices)
        if isinstance(hosts, list):
            enrich_onos_hosts_with_friendly_names(db, hosts)
    timings["network_fetch_seconds"] = time.perf_counter() - t_network

    samples_summary = json.dumps(samples.get("summary", []), indent=2)
    samples_raw = json.dumps(samples.get("raw_samples", []), indent=2)
    samples_note = str(samples.get("note", "Use these samples as guidance."))
    rag_timings = samples.get("timings") or {}

    full_prompt = (
        "Here are the current network state:\n"
        f"{json.dumps(network_info, indent=2)}\n\n"
        f"Here are similar intents and configs retrieved from the library ({'enabled' if use_rag else 'disabled'}):\n"
        "Summary:\n"
        f"{samples_summary}\n"
        "Raw samples:\n"
        f"{samples_raw}\n"
        f"Note: {samples_note}\n"
        "Now process this user request and output ONOS Intent config JSON:\n"
        f"{user_prompt}\n"
    )

    add_message("user", full_prompt)

    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set in environment")

    client = Groq(api_key=GROQ_API_KEY)
    selected_model = model or DEFAULT_MODEL

    t_llm = time.perf_counter()
    chat_completion = client.chat.completions.create(
        messages=get_history(),
        model=selected_model,
    )
    timings["llm_seconds"] = time.perf_counter() - t_llm
    timings["total_seconds"] = time.perf_counter() - t_start

    reply = chat_completion.choices[0].message.content
    add_message("assistant", reply)

    return {
        "content": reply,
        "model": selected_model,
        "use_rag": use_rag,
        "timings": {**rag_timings, **timings},
    }


def get_samples_json(user_prompt: str, *, top_k: int = 3) -> Dict[str, Any]:
    """
    Query pgvector for the closest config samples to the given intent and
    return both a human-readable summary and the raw configs.
    """
    try:
        result = get_similar_samples(user_prompt, top_k=top_k)
    except Exception as exc:  # pragma: no cover - defensive path
        return {
            "summary": [],
            "raw_samples": [],
            "note": f"RAG lookup failed: {exc}",
        }

    matches: List[Dict[str, Any]] = result.get("matches", []) or []
    summary: List[Dict[str, Any]] = []
    raw_samples: List[Dict[str, Any]] = []

    for match in matches:
        summary.append(
            {
                "sample_id": match.get("sample_id"),
                "category": match.get("category"),
                "intent_text": match.get("intent_text"),
            }
        )
        raw_samples.append(
            {
                "intent_text": match.get("intent_text"),
                "config_json": match.get("config_json"),
                "extra_metadata": match.get("extra_metadata"),
            }
        )

    note = (
        "Retrieved similar samples from config_samples."
        if summary
        else "No similar samples found; proceed with general knowledge."
    )

    return {
        "summary": summary,
        "raw_samples": raw_samples,
        "note": note,
        "timings": result.get("timings"),
    }


# __all__ is a module-level variable that specifies the names can be exported when someone imports this module.
__all__ = ["send_prompt"]

