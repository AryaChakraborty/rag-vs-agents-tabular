"""FastAPI entrypoint for rag-vs-agents-demo."""
from __future__ import annotations

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

import agent_handler  # noqa: E402
import rag_handler  # noqa: E402

app = FastAPI(title="RAG vs Agents Demo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryIn(BaseModel):
    query: str


@app.get("/")
def root():
    return {"ok": True, "service": "rag-vs-agents-demo"}


@app.post("/api/rag")
def rag(body: QueryIn):
    try:
        return rag_handler.run_rag(body.query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/agent")
def agent(body: QueryIn):
    try:
        return agent_handler.run_agent(body.query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
