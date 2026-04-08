"use client";
import { useState } from "react";
import QueryInput from "@/components/QueryInput";
import PresetChips from "@/components/PresetChips";
import RAGPanel from "@/components/RAGPanel";
import AgentPanel from "@/components/AgentPanel";
import MetricsBar from "@/components/MetricsBar";
import type { AgentResponse, RagResponse } from "@/lib/types";

const API = "http://localhost:8000";

export default function Page() {
  const [rag, setRag] = useState<RagResponse | null>(null);
  const [agent, setAgent] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(query: string) {
    setLoading(true);
    setRag(null);
    setAgent(null);
    try {
      const [r, a] = await Promise.all([
        fetch(`${API}/api/rag`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        }).then((x) => x.json()),
        fetch(`${API}/api/agent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        }).then((x) => x.json()),
      ]);
      setRag(r);
      setAgent(a);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">
      <header className="text-center flex flex-col gap-3 animate-fadeIn">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          RAG <span className="text-zinc-500">vs</span>{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            AI Agents
          </span>
        </h1>
        <p className="text-zinc-400 text-sm md:text-base">
          Why agents beat retrieval for structured data — live, on 10,000 customer rows.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <QueryInput onSubmit={run} loading={loading} />
        <PresetChips onPick={run} />
      </section>

      <section className="grid md:grid-cols-2 gap-5">
        <RAGPanel data={rag} loading={loading} />
        <AgentPanel data={agent} loading={loading} />
      </section>

      <MetricsBar rag={rag} agent={agent} />
    </main>
  );
}
