"""RAG approach: stuff a sample of CSV rows into the prompt as text."""
from __future__ import annotations

import os
import time
from typing import Any

from openai import OpenAI

import csv_tools

MODEL = "gpt-4o"
SAMPLE_MIN, SAMPLE_MAX = 300, 500


def _row_to_text(i: int, row: dict) -> str:
    return (
        f"Row {i}: {row['first_name']} {row['last_name']}, age {row['age']}, "
        f"city: {row['city']}, country: {row['country']}, signup: {row['signup_date']}, "
        f"purchases: {row['total_purchases']}, amount: ${row['purchase_amount']}"
    )


def run_rag(query: str) -> dict[str, Any]:
    df = csv_tools.DF
    total = len(df)
    n = min(SAMPLE_MAX, max(SAMPLE_MIN, total // 25))
    sample = df.sample(n=min(n, total), random_state=None)

    chunks = [_row_to_text(i + 1, r) for i, r in enumerate(sample.to_dict("records"))]
    context = "\n".join(chunks)

    system = (
        "You are a data analyst. Answer the user's question using ONLY the customer "
        "rows provided below. If the data is insufficient, say so."
    )
    user = f"CUSTOMER DATA:\n{context}\n\nQUESTION: {query}"

    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    t0 = time.time()
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )
    latency_ms = int((time.time() - t0) * 1000)

    return {
        "answer": resp.choices[0].message.content,
        "tokens_used": resp.usage.total_tokens if resp.usage else 0,
        "latency_ms": latency_ms,
        "context_preview": chunks[:18],
        "total_rows_sent": len(chunks),
        "total_rows_available": total,
    }
