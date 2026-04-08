"use client";
import { useState } from "react";

export default function QueryInput({
  onSubmit,
  loading,
}: {
  onSubmit: (q: string) => void;
  loading: boolean;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSubmit(value.trim());
      }}
      className="flex gap-2 w-full"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask something about 10,000 customers…"
        className="flex-1 bg-[#0d121a] border border-[#1f2733] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-medium"
      >
        {loading ? "Running…" : "Run both"}
      </button>
    </form>
  );
}
