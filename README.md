# RAG vs AI Agents — a side-by-side demo

A live, side-by-side comparison showing **why AI agents with tools beat RAG for structured / tabular data**. Ask the same natural-language question to both approaches and watch the difference in accuracy, tokens, and latency on a 10,000-row customer dataset.

| | RAG | Agent |
|---|---|---|
| **Approach** | Stuffs a sample of CSV rows into the LLM prompt as text | LLM picks Python tools (filter / aggregate / group-by) and runs them on the full DataFrame |
| **Accuracy** | ⚠ Approximate — only sees ~3-5% of rows | ✓ Exact — operates on all 10,000 rows |
| **Tokens** | High (raw text dump) | Low (tool calls + small results) |
| **Aggregations** | Hallucinates / wrong | Deterministic |

Built for a LinkedIn demo video — polished UI, dark mode, animated agent reasoning trace.

## Stack

- **Backend** — FastAPI, pandas, OpenAI SDK (GPT-4o function calling), `uv` for env management
- **Frontend** — Next.js 14 (App Router), Tailwind CSS, TypeScript

## Project layout

```
.
├── backend/
│   ├── main.py             # FastAPI app + CORS
│   ├── rag_handler.py      # RAG: sample rows → stuff into prompt
│   ├── agent_handler.py    # Agent: GPT-4o tool loop
│   ├── csv_tools.py        # pandas tools exposed to the LLM
│   ├── seed_data.py        # Faker → 10k customers.csv
│   ├── pyproject.toml      # uv-managed
│   └── requirements.txt    # pip fallback
├── frontend/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # QueryInput, RAGPanel, AgentPanel, MetricsBar, PresetChips
│   └── lib/types.ts
├── .env.example
└── README.md
```

## Setup

### 1. Clone & configure

```bash
git clone https://github.com/AryaChakraborty/rag-vs-agents-tabular.git
cd rag-vs-agents-tabular
cp .env.example .env
# edit .env and set OPENAI_API_KEY=sk-...   (no spaces around =)
```

### 2. Backend (terminal 1)

Using **uv** (recommended):

```bash
cd backend
uv sync
uv run python seed_data.py        # generates data/customers.csv (10k rows)
uv run uvicorn main:app --reload  # http://localhost:8000
```

Or with plain pip:

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python seed_data.py
uvicorn main:app --reload
```

### 3. Frontend (terminal 2)

```bash
cd frontend
npm install
npm run dev                       # http://localhost:3000
```

Open <http://localhost:3000>, click a preset chip, and watch both approaches race.

## Try these queries

- "What is the average age of customers in Mumbai?"
- "Top 5 cities by total purchase amount"
- "How many customers signed up in 2024?"
- "Average purchase amount for customers over 40 in Tokyo"
- "Which country has the most customers?"
- "Who is the youngest customer in New York?"

## API

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| POST | `/api/rag` | `{ "query": str }` | `answer, tokens_used, latency_ms, context_preview, total_rows_sent, total_rows_available` |
| POST | `/api/agent` | `{ "query": str }` | `answer, tokens_used, latency_ms, steps[]` |

The agent's `steps[]` is the money shot — each entry is `{ tool_name, arguments, result }`, surfaced one-by-one in the UI so the viewer sees the LLM "reason."

## Agent tools

Defined in `backend/csv_tools.py` and exposed to GPT-4o via function calling:

1. `get_column_info()` — schema + sample values
2. `get_unique_values(field)` — distinct values for a column
3. `filter_customers(filters)` — multi-condition filter; stores result as the working set
4. `calculate_aggregate(field, operation)` — average / sum / count / min / max
5. `group_by_aggregate(group_field, agg_field, operation, top_n, sort_order)` — the killer tool for "top N by X"

The agent loop runs up to 10 iterations, accumulating token usage and step traces.

## Notes

- The CSV is generated locally and **not committed** — run `seed_data.py` after cloning.
- `.env` is gitignored. Never commit your API key.
- The RAG sample size (300–500 rows of 10k) is intentionally small to make the accuracy gap obvious.

## License

MIT
