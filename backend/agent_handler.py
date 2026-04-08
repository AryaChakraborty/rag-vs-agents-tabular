"""Agent approach: GPT-4o with tool calling over the full DataFrame."""
from __future__ import annotations

import json
import os
import time
from typing import Any

from openai import OpenAI

import csv_tools

MODEL = "gpt-4o"
MAX_ITERS = 10

SYSTEM = (
    "You are a precise data analyst with tools to query a 10,000-row customer dataset. "
    "Always use the tools to get exact answers — never guess. "
    "Start by inspecting the schema if you are unsure of column names or values. "
    "When filtering by city/country, prefer get_unique_values to confirm valid spellings. "
    "After computing a result, give a short, direct natural-language answer."
)


def run_agent(query: str) -> dict[str, Any]:
    csv_tools.reset_working_set()
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    messages: list[dict[str, Any]] = [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": query},
    ]
    steps: list[dict[str, Any]] = []
    total_tokens = 0
    t0 = time.time()

    for _ in range(MAX_ITERS):
        resp = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=csv_tools.TOOL_SCHEMAS,
            tool_choice="auto",
        )
        if resp.usage:
            total_tokens += resp.usage.total_tokens

        msg = resp.choices[0].message
        tool_calls = msg.tool_calls or []

        if not tool_calls:
            return {
                "answer": msg.content,
                "tokens_used": total_tokens,
                "latency_ms": int((time.time() - t0) * 1000),
                "steps": steps,
            }

        # Append assistant message with tool calls
        messages.append(
            {
                "role": "assistant",
                "content": msg.content,
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments,
                        },
                    }
                    for tc in tool_calls
                ],
            }
        )

        for tc in tool_calls:
            name = tc.function.name
            try:
                args = json.loads(tc.function.arguments or "{}")
            except json.JSONDecodeError:
                args = {}
            fn = csv_tools.TOOL_FUNCTIONS.get(name)
            result = fn(**args) if fn else {"error": f"Unknown tool {name}"}
            steps.append({"tool_name": name, "arguments": args, "result": result})
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": json.dumps(result, default=str),
                }
            )

    return {
        "answer": "Reached max iterations without a final answer.",
        "tokens_used": total_tokens,
        "latency_ms": int((time.time() - t0) * 1000),
        "steps": steps,
    }
