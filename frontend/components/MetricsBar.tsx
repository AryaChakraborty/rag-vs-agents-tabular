"use client";
import type { AgentResponse, RagResponse } from "@/lib/types";

export default function MetricsBar({
  rag,
  agent,
}: {
  rag: RagResponse | null;
  agent: AgentResponse | null;
}) {
  if (!rag || !agent) return null;
  const maxTokens = Math.max(rag.tokens_used, agent.tokens_used, 1);
  const maxLatency = Math.max(rag.latency_ms, agent.latency_ms, 1);

  return (
    <div className="rounded-2xl border border-[#1f2733] bg-[#0a0e15] p-5 grid md:grid-cols-2 gap-6">
      <Metric
        title="Token usage"
        ragLabel={`${rag.tokens_used.toLocaleString()} tokens`}
        agentLabel={`${agent.tokens_used.toLocaleString()} tokens`}
        ragPct={(rag.tokens_used / maxTokens) * 100}
        agentPct={(agent.tokens_used / maxTokens) * 100}
      />
      <Metric
        title="Latency"
        ragLabel={`${rag.latency_ms} ms`}
        agentLabel={`${agent.latency_ms} ms`}
        ragPct={(rag.latency_ms / maxLatency) * 100}
        agentPct={(agent.latency_ms / maxLatency) * 100}
      />
      <div className="md:col-span-2 flex flex-wrap gap-3 text-xs">
        <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
          ⚠ RAG: Approximate (sampled {rag.total_rows_sent}/{rag.total_rows_available.toLocaleString()} rows)
        </span>
        <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
          ✓ Agent: Exact (processed all {rag.total_rows_available.toLocaleString()} rows)
        </span>
      </div>
    </div>
  );
}

function Metric({
  title,
  ragLabel,
  agentLabel,
  ragPct,
  agentPct,
}: {
  title: string;
  ragLabel: string;
  agentLabel: string;
  ragPct: number;
  agentPct: number;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">{title}</div>
      <Bar color="bg-amber-500" label={`RAG · ${ragLabel}`} pct={ragPct} />
      <div className="h-2" />
      <Bar color="bg-emerald-500" label={`Agent · ${agentLabel}`} pct={agentPct} />
    </div>
  );
}

function Bar({ color, label, pct }: { color: string; label: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
        <span>{label}</span>
      </div>
      <div className="h-2 rounded-full bg-[#1f2733] overflow-hidden">
        <div
          className={`${color} h-full transition-all duration-700`}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
    </div>
  );
}
