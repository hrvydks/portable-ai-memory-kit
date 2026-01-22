"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Canon, CurrentState, Delta, defaultCanon, defaultCurrent, deltaAreas, deltaTypes } from "@/lib/types";
import { getCanon, getCurrent, listDeltas, saveDelta } from "@/lib/storage";
import { buildContextPack, wrapForModel } from "@/lib/contextPack";

type Preset = "quick" | "normal" | "deep";

export default function HomePage() {
  const [canon, setCanon] = useState<Canon>(defaultCanon);
  const [current, setCurrent] = useState<CurrentState>(defaultCurrent);
  const [deltas, setDeltas] = useState<Delta[]>([]);
  const [preset, setPreset] = useState<Preset>("normal");
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [quickUpdate, setQuickUpdate] = useState({
    summary: "",
    area: "Work" as Delta["area"],
    type: "Update" as Delta["type"],
    details: "",
    tags: "",
    showDetails: false
  });

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
    setToastMessage("Copied!");
    window.setTimeout(() => {
      setToast(false);
      setToastMessage(null);
    }, 1400);
  };

  const handleQuickUpdate = async () => {
    if (!quickUpdate.summary.trim()) return;
    const nowISO = new Date().toISOString().slice(0, 10);
    const delta: Delta = {
      id: crypto.randomUUID(),
      dateISO: nowISO,
      area: quickUpdate.area,
      type: quickUpdate.type,
      summary: quickUpdate.summary.trim(),
      details: quickUpdate.details.trim(),
      tags: quickUpdate.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    };
    await saveDelta(delta);
    setDeltas((prev) => [delta, ...prev]);
    setQuickUpdate({
      summary: "",
      area: "Work",
      type: "Update",
      details: "",
      tags: "",
      showDetails: false
    });
    setToast(true);
    setToastMessage("Update saved");
    window.setTimeout(() => {
      setToast(false);
      setToastMessage(null);
    }, 1400);
  };

  const recentDeltas = useMemo(
    () => [...deltas].sort((a, b) => b.dateISO.localeCompare(a.dateISO)).slice(0, 5),
    [deltas]
  );

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
        <h3 className="text-lg font-semibold text-ink">Quick update</h3>
        <p className="text-sm text-slate-500">Capture a new update in under 10 seconds.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500">Summary</label>
            <input
              value={quickUpdate.summary}
              onChange={(event) => setQuickUpdate((prev) => ({ ...prev, summary: event.target.value }))}
              placeholder="What changed?"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Area</label>
            <select
              value={quickUpdate.area}
              onChange={(event) =>
                setQuickUpdate((prev) => ({ ...prev, area: event.target.value as Delta["area"] }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {deltaAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Type</label>
            <select
              value={quickUpdate.type}
              onChange={(event) =>
                setQuickUpdate((prev) => ({ ...prev, type: event.target.value as Delta["type"] }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {deltaTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500">Tags</label>
            <input
              value={quickUpdate.tags}
              onChange={(event) => setQuickUpdate((prev) => ({ ...prev, tags: event.target.value }))}
              placeholder="comma-separated"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <button
              onClick={() => setQuickUpdate((prev) => ({ ...prev, showDetails: !prev.showDetails }))}
              className="text-xs font-semibold text-accent underline"
            >
              {quickUpdate.showDetails ? "Hide details" : "Add details (optional)"}
            </button>
            {quickUpdate.showDetails && (
              <textarea
                value={quickUpdate.details}
                onChange={(event) => setQuickUpdate((prev) => ({ ...prev, details: event.target.value }))}
                placeholder="Extra detail (optional)"
                rows={3}
                className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm"
              />
            )}
          </div>
          <div className="md:col-span-2">
            <button
              onClick={handleQuickUpdate}
              disabled={!quickUpdate.summary.trim()}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Save update
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-ink">Recent updates</h3>
            <p className="text-sm text-slate-500">Last 5 updates from your timeline.</p>
          </div>
          <Link href="/deltas" className="text-xs font-semibold text-accent underline">
            View all updates
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {recentDeltas.length === 0 && <p className="text-sm text-slate-500">No updates yet.</p>}
          {recentDeltas.map((delta) => (
            <div key={delta.id} className="rounded-lg border border-slate-200 px-3 py-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {delta.dateISO} · {delta.area} · {delta.type}
              </p>
              <p className="text-sm font-medium text-slate-700">{delta.summary}</p>
            </div>
          ))}
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
          {toastMessage ?? "Copied!"}
        </div>
      )}
    </div>
  );
}
