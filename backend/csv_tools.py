"""CSV tools used by the agent. Operates on a pandas DataFrame in memory."""
from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd

CSV_PATH = Path(__file__).parent / "data" / "customers.csv"

# Loaded once at startup
DF: pd.DataFrame = pd.read_csv(CSV_PATH) if CSV_PATH.exists() else pd.DataFrame()

# Per-request working set (set by agent_handler before each run)
_working: dict[str, pd.DataFrame] = {"df": DF}


def reset_working_set() -> None:
    _working["df"] = DF


def _current() -> pd.DataFrame:
    return _working["df"]


def get_column_info() -> dict[str, Any]:
    df = DF
    cols = []
    for c in df.columns:
        sample = df[c].dropna().head(3).tolist()
        cols.append({"name": c, "dtype": str(df[c].dtype), "samples": sample})
    return {"total_rows": int(len(df)), "columns": cols}


def get_unique_values(field: str) -> dict[str, Any]:
    if field not in DF.columns:
        return {"error": f"Unknown field '{field}'"}
    vals = sorted(map(str, DF[field].dropna().unique().tolist()))
    return {"field": field, "count": len(vals), "values": vals[:200]}


_OPS = {"equals", "not_equals", "greater_than", "less_than", "contains", "in"}


def filter_customers(filters: list[dict]) -> dict[str, Any]:
    df = DF.copy()
    applied = []
    for f in filters:
        field = f.get("field")
        op = f.get("operator")
        value = f.get("value")
        if field not in df.columns or op not in _OPS:
            return {"error": f"Bad filter {f}"}
        col = df[field]
        if op == "equals":
            df = df[col.astype(str).str.lower() == str(value).lower()]
        elif op == "not_equals":
            df = df[col.astype(str).str.lower() != str(value).lower()]
        elif op == "greater_than":
            df = df[pd.to_numeric(col, errors="coerce") > float(value)]
        elif op == "less_than":
            df = df[pd.to_numeric(col, errors="coerce") < float(value)]
        elif op == "contains":
            df = df[col.astype(str).str.contains(str(value), case=False, na=False)]
        elif op == "in":
            vals = [str(v).lower() for v in (value if isinstance(value, list) else [value])]
            df = df[col.astype(str).str.lower().isin(vals)]
        applied.append(f)
    _working["df"] = df
    return {
        "applied_filters": applied,
        "matching_rows": int(len(df)),
        "preview": df.head(3).to_dict(orient="records"),
    }


def calculate_aggregate(field: str, operation: str) -> dict[str, Any]:
    df = _current()
    if field not in df.columns:
        return {"error": f"Unknown field '{field}'"}
    if operation == "count":
        return {"field": field, "operation": "count", "result": int(df[field].count())}
    series = pd.to_numeric(df[field], errors="coerce").dropna()
    if series.empty:
        return {"field": field, "operation": operation, "result": None, "rows": 0}
    ops = {
        "average": series.mean,
        "sum": series.sum,
        "min": series.min,
        "max": series.max,
    }
    if operation not in ops:
        return {"error": f"Unknown operation '{operation}'"}
    return {
        "field": field,
        "operation": operation,
        "result": round(float(ops[operation]()), 2),
        "rows": int(len(series)),
    }


def group_by_aggregate(
    group_field: str,
    agg_field: str,
    operation: str,
    top_n: int | None = None,
    sort_order: str = "desc",
) -> dict[str, Any]:
    df = _current()
    if group_field not in df.columns or agg_field not in df.columns:
        return {"error": "Unknown field"}
    grouped = df.groupby(group_field)[agg_field]
    op_map = {
        "average": grouped.mean,
        "sum": grouped.sum,
        "count": grouped.count,
        "min": grouped.min,
        "max": grouped.max,
    }
    if operation not in op_map:
        return {"error": f"Unknown operation '{operation}'"}
    result = op_map[operation]().sort_values(ascending=(sort_order != "desc"))
    if top_n:
        result = result.head(int(top_n))
    return {
        "group_field": group_field,
        "agg_field": agg_field,
        "operation": operation,
        "results": [
            {"group": str(k), "value": round(float(v), 2)} for k, v in result.items()
        ],
    }


# Tool schemas for OpenAI function calling
TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "get_column_info",
            "description": "Returns the schema of the customer dataset: column names, dtypes, and 3 sample values.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_unique_values",
            "description": "Returns the distinct values of a column. Useful for discovering valid city/country names.",
            "parameters": {
                "type": "object",
                "properties": {"field": {"type": "string"}},
                "required": ["field"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "filter_customers",
            "description": "Filter the customer DataFrame. Stores the filtered subset for subsequent aggregate calls.",
            "parameters": {
                "type": "object",
                "properties": {
                    "filters": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "field": {"type": "string"},
                                "operator": {
                                    "type": "string",
                                    "enum": list(_OPS),
                                },
                                "value": {},
                            },
                            "required": ["field", "operator", "value"],
                        },
                    }
                },
                "required": ["filters"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_aggregate",
            "description": "Compute an aggregate (average/sum/count/min/max) on a column of the current filtered DataFrame.",
            "parameters": {
                "type": "object",
                "properties": {
                    "field": {"type": "string"},
                    "operation": {
                        "type": "string",
                        "enum": ["average", "sum", "count", "min", "max"],
                    },
                },
                "required": ["field", "operation"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "group_by_aggregate",
            "description": "Group by a field, aggregate another field, optionally take top N. Great for 'top 5 cities by purchase amount'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "group_field": {"type": "string"},
                    "agg_field": {"type": "string"},
                    "operation": {
                        "type": "string",
                        "enum": ["average", "sum", "count", "min", "max"],
                    },
                    "top_n": {"type": "integer"},
                    "sort_order": {"type": "string", "enum": ["asc", "desc"]},
                },
                "required": ["group_field", "agg_field", "operation"],
            },
        },
    },
]

TOOL_FUNCTIONS = {
    "get_column_info": get_column_info,
    "get_unique_values": get_unique_values,
    "filter_customers": filter_customers,
    "calculate_aggregate": calculate_aggregate,
    "group_by_aggregate": group_by_aggregate,
}
