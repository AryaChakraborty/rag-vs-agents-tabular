"use client";
import { useEffect, useState } from "react";
import type { AgentResponse, AgentStep } from "@/lib/types";

export default function AgentPanel({
  data,
  loading,
}: {
  data: AgentResponse | null;
  loading: boolean;
}) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (!data) {
      setVisible(0);
      return;
    }
    setVisible(0);
    const id = setInterval(() => {
      setVisible((v) => {
        if (v >= data.steps.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, 250);
    return () => clearInterval(id);
  }, [data]);

  return (
    <div className="rounded-2xl border border-[#1f2733] bg-[#0a0e15] p-5 flex flex-col gap-4 min-h-[520px]">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-emerald-400/80">Agent approach</div>
          <h2 className="text-lg font-semibold">LLM picks the right tool</h2>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
          ✓ Exact
        </span>
      </header>

      {loading && (
        <div className="text-sm text-emerald-400/80 animate-pulseSlow">⚙ Agent is thinking…</div>
      )}

      {data && (
        <>
          <div className="flex flex-col gap-2">
            {data.steps.slice(0, visible).map((s, i) => (
              <StepCard key={i} step={s} index={i + 1} />
            ))}
          </div>

          {visible >= data.steps.length && (
            <div className="rounded-lg bg-[#05080d] border border-emerald-500/30 p-4 animate-fadeIn">
              <div className="text-[10px] uppercase tracking-wider text-emerald-400/80 mb-2">
                Final answer
              </div>
              <p className="text-sm whitespace-pre-wrap">{data.answer}</p>
            </div>
          )}

          <footer className="mt-auto flex gap-4 text-xs text-zinc-500 pt-2 border-t border-[#1f2733]">
            <span>🪙 {data.tokens_used.toLocaleString()} tokens</span>
            <span>⏱ {data.latency_ms} ms</span>
            <span>🔧 {data.steps.length} tool calls</span>
          </footer>
        </>
      )}
    </div>
  );
}

function StepCard({ step, index }: { step: AgentStep; index: number }) {
  return (
    <div className="rounded-lg border border-[#1f2733] bg-[#05080d] p-3 animate-fadeIn">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-zinc-500">#{index}</span>
        <span className="text-emerald-300 font-mono">{step.tool_name}</span>
      </div>
      <pre className="mt-2 text-[11px] font-mono text-zinc-400 whitespace-pre-wrap break-words">
        args: {JSON.stringify(step.arguments)}
      </pre>
      <pre className="mt-1 text-[11px] font-mono text-zinc-500 whitespace-pre-wrap break-words max-h-32 overflow-auto scroll-thin">
        → {JSON.stringify(step.result)}
      </pre>
    </div>
  );
}
