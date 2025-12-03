"""
measure_similarity.py
---------------------
Utility script that benchmarks the embed+query pipeline by feeding the first
`N` intent texts from `database/data/eval.json` into the RAG client and
recording timing metrics.

Run from repo root:

    uv run python -m evaluation.measure_similarity
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from statistics import mean
from typing import Dict, List

from database.rag.embedded_client import get_similar_samples

EVAL_FILE = Path(__file__).resolve().parents[1] / "database/data/eval.json"


def load_intents(limit: int) -> List[str]:
    data = json.loads(EVAL_FILE.read_text())
    return [row["intent_text"] for row in data[:limit]]


def benchmark(limit: int, top_k: int) -> Dict[str, float]:
    rows: List[Dict[str, float]] = []

    for idx, intent in enumerate(load_intents(limit), start=1):
        result = get_similar_samples(intent, top_k=top_k)
        timings = result["timings"]
        embedding_sec = timings.get("embedding_seconds", 0.0)
        db_sec = timings.get("db_query_seconds", 0.0)

        rows.append(
            {
                "intent": intent,
                "embedding_seconds": embedding_sec,
                "db_query_seconds": db_sec,
                "match_count": len(result["matches"]),
            }
        )

        print(
            f"[{idx:02d}] emb={embedding_sec:.4f}s "
            f"db={db_sec:.4f}s matches={len(result['matches'])} :: {intent}"
        )

    avg_embed = mean(row["embedding_seconds"] for row in rows)
    avg_db = mean(row["db_query_seconds"] for row in rows)

    print("\nSummary")
    print("-" * 40)
    print(f"Samples          : {len(rows)}")
    print(f"Average embed    : {avg_embed:.4f} s")
    print(f"Average DB query : {avg_db:.4f} s")

    return {
        "samples": len(rows),
        "avg_embedding_seconds": avg_embed,
        "avg_db_seconds": avg_db,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Benchmark RAG timings.")
    parser.add_argument(
        "--limit",
        type=int,
        default=10,
        help="Number of intent_text entries to benchmark (default: 10).",
    )
    parser.add_argument(
        "--top-k",
        type=int,
        default=3,
        help="How many similar samples to fetch per query (default: 3).",
    )
    args = parser.parse_args()

    benchmark(limit=args.limit, top_k=args.top_k)


if __name__ == "__main__":
    main()


