"use client";

import { useState } from "react";
import { exportAll, mergeAll, replaceAll, resetAll } from "@/lib/storage";
import { buildContextPack } from "@/lib/contextPack";
import { normalizeData, validateData } from "@/lib/validation";
import { MemoryData } from "@/lib/types";

export default function SettingsPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");

  const handleExportJson = async () => {
    const data = await exportAll();
    downloadFile("portable-ai-memory-kit.json", JSON.stringify(data, null, 2));
    setStatus("Exported JSON");
  };

  const handleExportMarkdown = async () => {
    const data = await exportAll();
    const deltas = data.deltas.sort((a, b) => b.dateISO.localeCompare(a.dateISO)).slice(0, 5);
    const content = buildContextPack(data.canon, data.current, deltas, "markdown");
    downloadFile("portable-ai-memory-kit.md", content);
    setStatus("Exported Markdown bundle");
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const validation = validateData(payload);
      if (!validation.valid) {
        setStatus(`Import failed: ${validation.errors.join(", ")}`);
        return;
      }
      const normalized = normalizeData(payload as MemoryData);
      if (importMode === "merge") {
        await mergeAll(normalized);
        setStatus("Imported and merged data");
      } else {
        await replaceAll(normalized);
        setStatus("Imported and replaced data");
      }
    } catch (error) {
      setStatus("Import failed: invalid JSON file");
    }
  };

  const handleLoadSample = async () => {
    if (!window.confirm("Load sample data? This will overwrite current data.")) return;
    try {
      const response = await fetch("/sample.json");
      const data = (await response.json()) as MemoryData;
      await replaceAll(normalizeData(data));
      setStatus("Loaded sample data");
    } catch (error) {
      setStatus("Sample data failed to load");
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all data?")) return;
    if (!window.confirm("This is permanent. Confirm reset.")) return;
    await resetAll();
    setStatus("All data reset");
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-ink">Settings</h2>
        <p className="text-sm text-slate-600">Export, import, and manage your local data.</p>
      </header>

      {status && <p className="text-sm font-medium text-slate-600">{status}</p>}

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold text-ink">Export</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            onClick={handleExportJson}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Export JSON
          </button>
          <button
            onClick={handleExportMarkdown}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Export Markdown bundle
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold text-ink">Import</h3>
        <p className="text-sm text-slate-600">Validate shape + enums before saving.</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="import-mode"
              checked={importMode === "merge"}
              onChange={() => setImportMode("merge")}
            />
            Merge
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="import-mode"
              checked={importMode === "replace"}
              onChange={() => setImportMode("replace")}
            />
            Replace
          </label>
        </div>
        <div className="mt-4">
          <input
            type="file"
            accept="application/json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleImport(file);
            }}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold text-ink">Sample data</h3>
        <p className="text-sm text-slate-600">Load sample data to explore the workflow.</p>
        <button
          onClick={handleLoadSample}
          className="mt-3 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Load sample data
        </button>
      </section>

      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <h3 className="text-lg font-semibold text-rose-600">Danger zone</h3>
        <p className="text-sm text-rose-500">Reset everything stored in this browser.</p>
        <button
          onClick={handleReset}
          className="mt-3 rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600"
        >
          Reset all data
        </button>
      </section>
    </div>
  );
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
