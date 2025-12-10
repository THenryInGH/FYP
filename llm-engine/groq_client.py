from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List

from dotenv import load_dotenv
from groq import Groq

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import onos_client  # noqa: E402
from chat_history import add_message, get_history  # noqa: E402
from database.rag.embedded_client import get_similar_samples  # noqa: E402

load_dotenv()  # Load environment variables from .env file

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DEFAULT_MODEL = "openai/gpt-oss-20b"


def send_prompt(
    user_prompt: str,
    *,
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
    network_info = onos_client.get_network_info()
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

def get_prompt(user_prompt: str, *, use_rag: bool = True) -> str:
    """
    Mirror function of send_prompt but return the prompt instead of sending it to the API.
    """
    samples = (
        get_samples_json(user_prompt, top_k=3)
        if use_rag
        else {
            "summary": [],
            "raw_samples": [],
            "note": "RAG disabled by request.",
            "timings": {},
        }
    )
    network_info = onos_client.get_network_info()

    samples_summary = json.dumps(samples.get("summary", []), indent=2)
    samples_raw = json.dumps(samples.get("raw_samples", []), indent=2)
    samples_note = str(samples.get("note", "Use these samples as guidance."))

    full_prompt = (
        "Here are the current network state:\n"
        f"{json.dumps(network_info, indent=2)}\n\n"
        "Here are similar intents and configs retrieved from the library:\n"
        "Summary:\n"
        f"{samples_summary}\n"
        "Raw samples:\n"
        f"{samples_raw}\n"
        f"Note: {samples_note}\n"
        "Now process this user request and output ONOS Intent config JSON:\n"
        f"{user_prompt}\n"
    )

    return full_prompt


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


if __name__ == "__main__":
    print(get_prompt("Make sure h1 can communicate with h3 but not h2."))