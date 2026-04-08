"use client";
import { PRESETS } from "@/lib/types";

export default function PresetChips({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((p) => (
        <button
          key={p}
          onClick={() => onPick(p)}
          className="text-xs px-3 py-1.5 rounded-full border border-[#1f2733] bg-[#0d121a] hover:border-blue-500 hover:text-blue-300 transition"
        >
          {p}
        </button>
      ))}
    </div>
  );
}
