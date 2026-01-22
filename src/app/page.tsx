"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Canon, CurrentState, Delta, defaultCanon, defaultCurrent, deltaAreas, deltaTypes } from "@/lib/types";
import { getCanon, getCurrent, listDeltas, saveCanon, saveCurrent, saveDelta } from "@/lib/storage";
import { buildContextPack, wrapForModel } from "@/lib/contextPack";

type Preset = "quick" | "normal" | "deep";

const canonFields = [
  {
    key: "identityGoals",
    label: "Identity & Goals",
    helper: "Who you are, your mission, and what you want the AI to remember.",
    placeholder: "I lead a small product studio focused on calm, useful software."
  },
  {
    key: "rules",
    label: "Rules to Follow",
    helper: "Non-negotiables the assistant should follow every time.",
    placeholder: "Be concise. Flag unknowns explicitly. Ask before assuming."
  },
  {
    key: "preferences",
    label: "Preferences",
    helper: "Formatting, tone, or workflow preferences for responses.",
    placeholder: "Use bullet points. Offer 2 options when uncertain."
  },
  {
    key: "glossary",
    label: "Glossary",
    helper: "Define your terms so the model stays consistent.",
    placeholder: "MVP = minimum viable prototype. P0 = urgent today."
  }
] as const;

const currentFields = [
  {
    key: "now",
    label: "Now",
    helper: "Top priorities, constraints, and what’s active right now.",
    placeholder: "Wrapping the onboarding flow for Portable AI Memory Kit."
  },
  {
    key: "today",
    label: "Today",
    helper: "Session goal + the output you want right now.",
    placeholder: "Draft quickstart copy and polish context pack output."
  }
] as const;

export default function HomePage() {
  const [canon, setCanon] = useState<Canon>(defaultCanon);
  const [current, setCurrent] = useState<CurrentState>(defaultCurrent);
  const [deltas, setDeltas] = useState<Delta[]>([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<Preset>("normal");
  const [toast, setToast] = useState<boolean>(false);
  const [toastType, setToastType] = useState<"copy" | "update" | null>(null);
  const [quickUpdate, setQuickUpdate] = useState({
    summary: "",
    area: "Work" as Delta["area"],
    type: "Update" as Delta["type"],
    tags: "",
    details: "",
    showDetails: false
  });

  useEffect(() => {
    Promise.all([getCanon(), getCurrent(), listDeltas()]).then(([canonData, currentData, deltaData]) => {
      setCanon(canonData);
      setCurrent(currentData);
      setDeltas(deltaData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading) return;
    const handler = window.setTimeout(() => {
      saveCanon(canon);
    }, 600);
    return () => window.clearTimeout(handler);
  }, [canon, loading]);

  useEffect(() => {
    if (loading) return;
    const handler = window.setTimeout(() => {
      saveCurrent(current);
    }, 600);
    return () => window.clearTimeout(handler);
  }, [current, loading]);

  const recentDeltas = useMemo(
    () => [...deltas].sort((a, b) => b.dateISO.localeCompare(a.dateISO)).slice(0, 5),
    [deltas]
  );

  const presetDeltas = useMemo(() => {
    if (preset === "quick") return [];
    const limit = preset === "deep" ? 10 : 5;
    return [...deltas].sort((a, b) => b.dateISO.localeCompare(a.dateISO)).slice(0, limit);
  }, [deltas, preset]);

  const packContent = buildContextPack(canon, current, presetDeltas, "plaintext");

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    setToast(true);
    setToastType("copy");
    window.setTimeout(() => {
      setToast(false);
      setToastType(null);
    }, 1400);
  };

  const handleQuickAdd = async () => {
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
      tags: "",
      details: "",
      showDetails: false
    });
    setToast(true);
    setToastType("update");
    window.setTimeout(() => {
      setToast(false);
      setToastType(null);
    }, 1400);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Home</h2>
          <p className="text-sm text-slate-600">
            Build your portable context pack in one place, then copy for any model.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Preset</span>
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
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink">My Basics</h3>
            <p className="text-sm text-slate-500">Stable truths and preferences that rarely change.</p>
          </div>
          <Link href="/canon" className="text-xs font-semibold text-accent underline">
            Advanced
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {canonFields.map((field) => (
            <div key={field.key} className="rounded-xl border border-slate-200 p-4">
              <label className="text-sm font-semibold text-ink">{field.label}</label>
              <p className="mt-1 text-xs text-slate-500">{field.helper}</p>
              <textarea
                value={canon[field.key]}
                onChange={(event) => setCanon((prev) => ({ ...prev, [field.key]: event.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-700 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink">What’s going on now</h3>
            <p className="text-sm text-slate-500">Capture current focus so every session starts aligned.</p>
          </div>
          <Link href="/current" className="text-xs font-semibold text-accent underline">
            Advanced
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {currentFields.map((field) => (
            <div key={field.key} className="rounded-xl border border-slate-200 p-4">
              <label className="text-sm font-semibold text-ink">{field.label}</label>
              <p className="mt-1 text-xs text-slate-500">{field.helper}</p>
              <textarea
                value={current[field.key]}
                onChange={(event) => setCurrent((prev) => ({ ...prev, [field.key]: event.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-700 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink">Recent Updates</h3>
            <p className="text-sm text-slate-500">Last 5 deltas for a quick snapshot.</p>
          </div>
          <Link href="/deltas" className="text-xs font-semibold text-accent underline">
            View all updates
          </Link>
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 p-4">
          <h4 className="text-sm font-semibold text-ink">Quick Add Update</h4>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
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
                onClick={() =>
                  setQuickUpdate((prev) => ({
                    ...prev,
                    showDetails: !prev.showDetails
                  }))
                }
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
                onClick={handleQuickAdd}
                disabled={!quickUpdate.summary.trim()}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Save update
              </button>
            </div>
          </div>
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-ink">Copy for AI</h3>
            <p className="text-sm text-slate-500">Preset controls which sections are included.</p>
          </div>
          <Link href="/context-pack" className="text-xs font-semibold text-accent underline">
            Advanced
          </Link>
        </div>
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
        <div className="mt-4">
          <textarea
            readOnly
            value={packContent}
            rows={10}
            className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-700"
          />
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toastType === "update" ? "Update saved!" : "Copied!"}
        </div>
      )}
    </div>
  );
}
