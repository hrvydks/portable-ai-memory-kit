"use client";

import { useEffect, useMemo, useState } from "react";
import { Canon, CurrentState, Delta, defaultCanon, defaultCurrent } from "@/lib/types";
import { getCanon, getCurrent, listDeltas } from "@/lib/storage";
import { buildContextPack, wrapForModel } from "@/lib/contextPack";

type Preset = "quick" | "normal" | "deep";

export default function HomePage() {
  const [canon, setCanon] = useState<Canon>(defaultCanon);
  const [current, setCurrent] = useState<CurrentState>(defaultCurrent);
  const [deltas, setDeltas] = useState<Delta[]>([]);
  const [preset, setPreset] = useState<Preset>("normal");
  const [toast, setToast] = useState(false);

  useEffect(() => {
    Promise.all([getCanon(), getCurrent(), listDeltas()]).then(([canonData, currentData, deltaData]) => {
      setCanon(canonData);
      setCurrent(currentData);
      setDeltas(deltaData);
    });
  }, []);

  const presetDeltas = useMemo(() => {
    if (preset === "quick") return [];
    const limit = preset === "deep" ? 10 : 5;
    return [...deltas].sort((a, b) => b.dateISO.localeCompare(a.dateISO)).slice(0, limit);
  }, [deltas, preset]);

  const packContent = buildContextPack(canon, current, presetDeltas, "plaintext");

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    setToast(true);
    window.setTimeout(() => setToast(false), 1400);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-ink">Copy for AI</h2>
        <p className="text-sm text-slate-600">
          Choose a preset, copy the context pack, and paste it into ChatGPT, Claude, or Gemini.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-ink">Preset</h3>
            <p className="text-sm text-slate-500">Quick = Canon + Current · Normal = +5 updates · Deep = +10</p>
          </div>
          <div className="flex rounded-full border border-slate-200 bg-white p-1">
            {(["quick", "normal", "deep"] as Preset[]).map((value) => (
              <button
                key={value}
                onClick={() => setPreset(value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  preset === value ? "bg-accent text-white" : "text-slate-600"
                }`}
              >
                {value[0].toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-ink">Copy buttons</h3>
        <p className="text-sm text-slate-500">These use the same context pack with model-specific wrappers.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <button
            onClick={() => handleCopy(wrapForModel("chatgpt", packContent))}
            className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white"
          >
            Copy for ChatGPT
          </button>
          <button
            onClick={() => handleCopy(wrapForModel("claude", packContent))}
            className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white"
          >
            Copy for Claude
          </button>
          <button
            onClick={() => handleCopy(wrapForModel("gemini", packContent))}
            className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white"
          >
            Copy for Gemini
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-ink">Preview</h3>
        <p className="text-sm text-slate-500">Plaintext preview of what gets copied.</p>
        <textarea
          readOnly
          value={packContent}
          rows={12}
          className="mt-3 w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-700"
        />
      </section>

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          Copied!
        </div>
      )}
    </div>
  );
}
