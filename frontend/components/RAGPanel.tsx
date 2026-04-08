"use client";
import { useState } from "react";
import type { RagResponse } from "@/lib/types";

export default function RAGPanel({
  data,
  loading,
}: {
  data: RagResponse | null;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-[#1f2733] bg-[#0a0e15] p-5 flex flex-col gap-4 min-h-[520px]">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-400/80">RAG approach</div>
          <h2 className="text-lg font-semibold">Stuff CSV rows into the prompt</h2>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
          ⚠ Approximate
        </span>
      </header>

      {loading && <Skeleton />}

      {data && (data as any).detail && (
        <pre className="text-xs text-red-400 whitespace-pre-wrap">Backend error: {(data as any).detail}</pre>
      )}

      {data && !(data as any).detail && (
        <>
          <div className="text-xs text-zinc-400">
            Rows sent: <span className="text-amber-300 font-mono">{data.total_rows_sent ?? 0}</span> of{" "}
            <span className="font-mono">{(data.total_rows_available ?? 0).toLocaleString()}</span>
          </div>

          <div className="rounded-lg bg-[#05080d] border border-[#1f2733] overflow-hidden">
            <button
              onClick={() => setOpen((o) => !o)}
              className="w-full px-3 py-2 text-left text-xs text-zinc-400 hover:bg-[#0d121a]"
            >
              {open ? "▾" : "▸"} Context preview
            </button>
            {open && (
              <pre className="px-3 pb-3 text-[11px] leading-relaxed font-mono text-zinc-400 max-h-56 overflow-auto scroll-thin">
                {(data.context_preview ?? []).join("\n")}
                {"\n…"}
              </pre>
            )}
          </div>

          <div className="rounded-lg bg-[#05080d] border border-[#1f2733] p-4 animate-fadeIn">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Answer</div>
            <p className="text-sm whitespace-pre-wrap">{data.answer}</p>
          </div>

          <footer className="mt-auto flex gap-4 text-xs text-zinc-500 pt-2 border-t border-[#1f2733]">
            <span>🪙 {(data.tokens_used ?? 0).toLocaleString()} tokens</span>
            <span>⏱ {data.latency_ms ?? 0} ms</span>
          </footer>
        </>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="h-3 w-32 bg-[#1f2733] rounded" />
      <div className="h-20 bg-[#1f2733] rounded" />
      <div className="h-16 bg-[#1f2733] rounded" />
    </div>
  );
}
