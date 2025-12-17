"""Parse evaluation markdown into data, recompute averages, and plot charts.

Why this exists:
- Markdown is great for humans, but painful for calculators.
- This script treats your `eval-10-12.md` as the source of raw per-run data,
  then automatically:
  - exports a CSV (so you can use Excel / pandas / anything)
  - recomputes per-model averages (accuracy + response time)
  - writes those averages back into the markdown
  - generates matplotlib/seaborn charts

Run (with uv):
  uv run python evaluation/analyze_eval_markdown.py

You can point it at other markdown files too:
  uv run python evaluation/analyze_eval_markdown.py --input evaluation/eval-10-12.md
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

import pandas as pd
import seaborn as sns

# Matplotlib is used via seaborn; importing pyplot here keeps the script explicit.
import matplotlib.pyplot as plt


RAG_WITHOUT = "without_rag"
RAG_WITH = "with_rag"


def _rag_from_heading(line: str) -> str | None:
    s = line.strip().lower()
    if s.startswith("## without rag"):
        return RAG_WITHOUT
    if s.startswith("## with rag"):
        return RAG_WITH
    return None


def _is_table_header(line: str) -> bool:
    s = line.strip()
    # We only care about the evaluation tables with these three columns.
    return (
        s.startswith("|")
        and "No." in s
        and "Accuracy" in s
        and "Response Time" in s
    )


def _parse_table_row(line: str) -> dict[str, Any] | None:
    """Parse a markdown table row like: |1|100|2052|

    Returns None for separator rows or malformed rows.
    """

    s = line.strip()
    if not s.startswith("|"):
        return None

    # Skip separator rows like: |:---:|:---:|:---:|
    if s.lstrip().startswith("|:"):
        return None

    parts = [p.strip() for p in s.strip("|").split("|")]
    if len(parts) < 3:
        return None

    run_raw, acc_raw, rt_raw = parts[0], parts[1], parts[2]

    try:
        run_no = int(run_raw)
    except ValueError:
        return None

    def to_float(x: str) -> float | None:
        x = x.strip()
        if not x:
            return None
        try:
            return float(x)
        except ValueError:
            return None

    return {
        "run_no": run_no,
        "accuracy": to_float(acc_raw),
        "response_time_ms": to_float(rt_raw),
    }


def parse_eval_markdown(md_text: str) -> pd.DataFrame:
    """Extract per-run rows from the evaluation markdown into a DataFrame."""

    rag_mode: str | None = None
    model: str | None = None

    records: list[dict[str, Any]] = []
    lines = md_text.splitlines()

    i = 0
    while i < len(lines):
        line = lines[i]

        new_rag = _rag_from_heading(line)
        if new_rag is not None:
            rag_mode = new_rag
            i += 1
            continue

        if line.strip().startswith("### "):
            model = line.strip()[4:].strip()
            i += 1
            continue

        if _is_table_header(line):
            # Consume optional separator row then row lines.
            i += 1
            if i < len(lines) and lines[i].strip().startswith("|:"):
                i += 1

            while i < len(lines):
                row_line = lines[i]
                if not row_line.strip().startswith("|"):
                    break

                row = _parse_table_row(row_line)
                if row is not None and rag_mode is not None and model is not None:
                    records.append({"rag": rag_mode, "model": model, **row})

                i += 1

            continue

        i += 1

    return pd.DataFrame.from_records(records)


def _fmt_number(x: float | None, decimals: int = 1) -> str:
    if x is None or pd.isna(x):
        return ""
    s = f"{float(x):.{decimals}f}"
    return s[:-2] if s.endswith(".0") else s


def compute_averages(df: pd.DataFrame) -> pd.DataFrame:
    """Compute per-(rag, model) averages."""

    if df.empty:
        return pd.DataFrame(
            columns=[
                "rag",
                "model",
                "avg_accuracy",
                "avg_response_time_ms",
                "n_runs",
                "n_accuracy",
                "n_response_time",
            ]
        )

    agg = (
        df.groupby(["rag", "model"], dropna=False)
        .agg(
            avg_accuracy=("accuracy", "mean"),
            avg_response_time_ms=("response_time_ms", "mean"),
            n_runs=("run_no", "count"),
            n_accuracy=("accuracy", "count"),
            n_response_time=("response_time_ms", "count"),
        )
        .reset_index()
    )
    return agg


def update_markdown_averages(md_text: str, avg_df: pd.DataFrame) -> str:
    """Rewrite **Average ...** lines using computed values."""

    avg_map: dict[tuple[str, str], dict[str, float]] = {}
    for row in avg_df.to_dict(orient="records"):
        avg_map[(row["rag"], row["model"])] = row

    rag_mode: str | None = None
    model: str | None = None

    out_lines: list[str] = []
    for line in md_text.splitlines():
        new_rag = _rag_from_heading(line)
        if new_rag is not None:
            rag_mode = new_rag
            out_lines.append(line)
            continue

        if line.strip().startswith("### "):
            model = line.strip()[4:].strip()
            out_lines.append(line)
            continue

        key = (rag_mode, model) if rag_mode and model else None
        stats = avg_map.get(key) if key else None

        if line.strip().startswith("**Average accuracy:**"):
            if stats is None or pd.isna(stats.get("avg_accuracy")):
                out_lines.append("**Average accuracy:**")
            else:
                out_lines.append(f"**Average accuracy:** {_fmt_number(stats['avg_accuracy'], decimals=1)}")
            continue

        if line.strip().startswith("**Average response time:**"):
            if stats is None or pd.isna(stats.get("avg_response_time_ms")):
                out_lines.append("**Average response time:**")
            else:
                rt = _fmt_number(stats["avg_response_time_ms"], decimals=1)
                out_lines.append(f"**Average response time:** {rt} ms")
            continue

        out_lines.append(line)

    # Keep the original trailing newline behaviour stable.
    return "\n".join(out_lines) + ("\n" if md_text.endswith("\n") else "")


def write_csvs(df: pd.DataFrame, out_long_csv: Path, out_summary_csv: Path) -> None:
    out_long_csv.parent.mkdir(parents=True, exist_ok=True)
    df_sorted = df.sort_values(["rag", "model", "run_no"], kind="stable")
    df_sorted.to_csv(out_long_csv, index=False)

    if df.empty:
        # Still write an empty summary with headers.
        pd.DataFrame(
            columns=["model", "avg_accuracy_without_rag", "avg_accuracy_with_rag", "avg_rt_ms_without_rag", "avg_rt_ms_with_rag"]
        ).to_csv(out_summary_csv, index=False)
        return

    agg = compute_averages(df)

    pivot_acc = agg.pivot(index="model", columns="rag", values="avg_accuracy")
    pivot_rt = agg.pivot(index="model", columns="rag", values="avg_response_time_ms")

    summary = pd.DataFrame(
        {
            "avg_accuracy_without_rag": pivot_acc.get(RAG_WITHOUT),
            "avg_accuracy_with_rag": pivot_acc.get(RAG_WITH),
            "avg_rt_ms_without_rag": pivot_rt.get(RAG_WITHOUT),
            "avg_rt_ms_with_rag": pivot_rt.get(RAG_WITH),
        }
    ).reset_index()

    summary.to_csv(out_summary_csv, index=False)


def plot_charts(avg_df: pd.DataFrame, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)

    if avg_df.empty:
        return

    rag_label = {RAG_WITHOUT: "Without RAG", RAG_WITH: "With RAG"}
    plot_df = avg_df.copy()
    plot_df["rag_label"] = plot_df["rag"].map(rag_label)

    # Style: simple, report-friendly.
    sns.set_theme(style="whitegrid")

    # --- Accuracy chart ---
    plt.figure(figsize=(10, 4.5))
    ax = sns.barplot(
        data=plot_df,
        x="model",
        y="avg_accuracy",
        hue="rag_label",
        errorbar=None,
    )
    ax.set_title("Average accuracy by model")
    ax.set_xlabel("Model")
    ax.set_ylabel("Average accuracy")
    ax.set_ylim(0, 100)
    plt.xticks(rotation=20, ha="right")
    plt.tight_layout()
    plt.savefig(out_dir / "avg_accuracy_by_model.png", dpi=200)
    plt.close()

    # --- Response time chart (linear) ---
    plt.figure(figsize=(10, 4.5))
    ax = sns.barplot(
        data=plot_df,
        x="model",
        y="avg_response_time_ms",
        hue="rag_label",
        errorbar=None,
    )
    ax.set_title("Average response time by model")
    ax.set_xlabel("Model")
    ax.set_ylabel("Average response time (ms)")
    plt.xticks(rotation=20, ha="right")
    plt.tight_layout()
    plt.savefig(out_dir / "avg_response_time_by_model.png", dpi=200)
    plt.close()

    # --- Response time chart (log scale) ---
    # Helpful when one model is a big outlier (prevents squashing other bars).
    plt.figure(figsize=(10, 4.5))
    ax = sns.barplot(
        data=plot_df,
        x="model",
        y="avg_response_time_ms",
        hue="rag_label",
        errorbar=None,
    )
    ax.set_yscale("log")
    ax.set_title("Average response time by model (log scale)")
    ax.set_xlabel("Model")
    ax.set_ylabel("Average response time (ms, log)")
    plt.xticks(rotation=20, ha="right")
    plt.tight_layout()
    plt.savefig(out_dir / "avg_response_time_by_model_log.png", dpi=200)
    plt.close()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("evaluation/eval-10-12.md"),
        help="Markdown evaluation file to parse",
    )
    parser.add_argument(
        "--write-md",
        action="store_true",
        help="Write computed averages back into the markdown file",
    )
    parser.add_argument(
        "--csv-long",
        type=Path,
        default=Path("evaluation/eval-10-12.csv"),
        help="Output CSV with one row per run",
    )
    parser.add_argument(
        "--csv-summary",
        type=Path,
        default=Path("evaluation/eval-10-12-summary.csv"),
        help="Output CSV with per-model averages (with/without RAG)",
    )
    parser.add_argument(
        "--charts-dir",
        type=Path,
        default=Path("evaluation/charts"),
        help="Directory to save charts",
    )
    args = parser.parse_args()

    md_path: Path = args.input
    md_text = md_path.read_text(encoding="utf-8")

    df = parse_eval_markdown(md_text)
    avg_df = compute_averages(df)

    write_csvs(df, args.csv_long, args.csv_summary)
    plot_charts(avg_df, args.charts_dir)

    if args.write_md:
        updated = update_markdown_averages(md_text, avg_df)
        md_path.write_text(updated, encoding="utf-8")

    # Small, human-friendly output.
    print(f"Parsed {len(df)} run rows from {md_path}")
    print(f"Wrote: {args.csv_long}")
    print(f"Wrote: {args.csv_summary}")
    print(f"Charts in: {args.charts_dir}")
    if args.write_md:
        print(f"Updated averages in: {md_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
