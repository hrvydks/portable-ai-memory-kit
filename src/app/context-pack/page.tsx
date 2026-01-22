"use client";

import { useEffect, useMemo, useState } from "react";
import { Canon, CurrentState, Delta } from "@/lib/types";
import { buildContextPack, wrapForModel } from "@/lib/contextPack";
import { getCanon, getCurrent, listDeltas } from "@/lib/storage";

export default function ContextPackPage() {
  const [canon, setCanon] = useState<Canon | null>(null);
  const [current, setCurrent] = useState<CurrentState | null>(null);
  const [deltas, setDeltas] = useState<Delta[]>([]);
  const [includeCanon, setIncludeCanon] = useState(true);
  const [includeCurrent, setIncludeCurrent] = useState(true);
  const [includeDeltas, setIncludeDeltas] = useState(true);
  const [format, setFormat] = useState<"plaintext" | "markdown">("plaintext");
  const [lastN, setLastN] = useState(5);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([getCanon(), getCurrent(), listDeltas()]).then(([canonData, currentData, deltaData]) => {
      setCanon(canonData);
      setCurrent(currentData);
      setDeltas(deltaData);
    });
  }, []);

  const sortedDeltas = useMemo(
    () => [...deltas].sort((a, b) => b.dateISO.localeCompare(a.dateISO)),
    [deltas]
  );

  const selectedDeltas = useMemo(() => {
    if (!includeDeltas) return [];
    if (selectedIds.length > 0) {
      return sortedDeltas.filter((delta) => selectedIds.includes(delta.id));
    }
    return sortedDeltas.slice(0, lastN);
  }, [includeDeltas, selectedIds, sortedDeltas, lastN]);

  const packContent = buildContextPack(
    includeCanon ? canon : null,
    includeCurrent ? current : null,
    selectedDeltas,
    format
  );

  const packForFormat = (targetFormat: "plaintext" | "markdown") =>
    buildContextPack(
      includeCanon ? canon : null,
      includeCurrent ? current : null,
      selectedDeltas,
      targetFormat
    );

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  const handleDownload = (ext: "txt" | "md") => {
    const content = ext === "md" ? packForFormat("markdown") : packForFormat("plaintext");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `context-pack.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Context Pack</h2>
          <p className="text-sm text-slate-600">
            Generate a portable block that loads your Canon, Current State, and Deltas into any AI.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCopy(wrapForModel("chatgpt", packContent))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
          >
            Copy for ChatGPT
          </button>
          <button
            onClick={() => handleCopy(wrapForModel("claude", packContent))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
          >
            Copy for Claude
          </button>
          <button
            onClick={() => handleCopy(wrapForModel("gemini", packContent))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
          >
            Copy for Gemini
          </button>
          <button
            onClick={() => handleDownload("txt")}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
          >
            Export .txt
          </button>
          <button
            onClick={() => handleDownload("md")}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
          >
            Export .md
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_360px]">
        <details className="rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold text-ink">Advanced options</summary>
          <div className="mt-4 space-y-6">
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeCanon} onChange={() => setIncludeCanon(!includeCanon)} />
                Include Canon
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeCurrent}
                  onChange={() => setIncludeCurrent(!includeCurrent)}
                />
                Include Current
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeDeltas}
                  onChange={() => setIncludeDeltas(!includeDeltas)}
                />
                Include Deltas
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="text-sm">Format</label>
              <select
                value={format}
                onChange={(event) => setFormat(event.target.value as "plaintext" | "markdown")}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="plaintext">Plaintext</option>
                <option value="markdown">Markdown</option>
              </select>
              <label className="text-sm">Last N Deltas</label>
              <input
                type="number"
                min={1}
                max={20}
                value={lastN}
                onChange={(event) => setLastN(Number(event.target.value))}
                className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Select specific deltas (optional)</h3>
              <p className="text-xs text-slate-500">
                Choose deltas to override “last N”. Leave empty to use the latest {lastN} entries.
              </p>
              <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-2">
                {sortedDeltas.length === 0 && <p className="text-xs text-slate-500">No deltas yet.</p>}
                {sortedDeltas.map((delta) => (
                  <label key={delta.id} className="flex items-start gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(delta.id)}
                      onChange={() => {
                        setSelectedIds((prev) =>
                          prev.includes(delta.id) ? prev.filter((id) => id !== delta.id) : prev.concat(delta.id)
                        );
                      }}
                    />
                    <span>
                      {delta.dateISO} · {delta.area} · {delta.type} — {delta.summary}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </details>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-ink">Output</h3>
          <textarea
            readOnly
            value={packContent}
            rows={18}
            className="mt-3 w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-700"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => handleCopy(packContent)}
              className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white"
            >
              Copy
            </button>
            <button
              onClick={() => handleDownload("txt")}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
            >
              Download .txt
            </button>
            <button
              onClick={() => handleDownload("md")}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
            >
              Download .md
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
