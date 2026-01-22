"use client";

import { useEffect, useMemo, useState } from "react";
import { Delta, deltaAreas, deltaTypes } from "@/lib/types";
import { deleteDelta, listDeltas, saveDelta } from "@/lib/storage";

const emptyDelta = (): Delta => ({
  id: crypto.randomUUID(),
  dateISO: new Date().toISOString().slice(0, 10),
  area: "Work",
  type: "Update",
  summary: "",
  details: "",
  tags: []
});

export default function DeltasPage() {
  const [deltas, setDeltas] = useState<Delta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    area: "",
    type: "",
    tags: "",
    search: "",
    start: "",
    end: ""
  });
  const [editing, setEditing] = useState<Delta | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickDelta, setQuickDelta] = useState<Delta>(emptyDelta());

  useEffect(() => {
    listDeltas().then((data) => {
      setDeltas(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const searchLower = filters.search.toLowerCase();
    const tags = filters.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    return deltas
      .filter((delta) => (!filters.area ? true : delta.area === filters.area))
      .filter((delta) => (!filters.type ? true : delta.type === filters.type))
      .filter((delta) => {
        if (!filters.start && !filters.end) return true;
        const date = delta.dateISO;
        if (filters.start && date < filters.start) return false;
        if (filters.end && date > filters.end) return false;
        return true;
      })
      .filter((delta) => {
        if (!tags.length) return true;
        return tags.every((tag) => delta.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase()));
      })
      .filter((delta) => {
        if (!searchLower) return true;
        return (
          delta.summary.toLowerCase().includes(searchLower) ||
          delta.details.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  }, [deltas, filters]);

  const saveEntry = async (delta: Delta) => {
    await saveDelta(delta);
    setDeltas((prev) => {
      const next = prev.filter((item) => item.id !== delta.id).concat(delta);
      return next;
    });
  };

  const handleSave = async (delta: Delta) => {
    await saveEntry(delta);
    setEditing(null);
  };

  const handleAutoSave = async (delta: Delta) => {
    await saveEntry(delta);
  };

  const handleDelete = async (deltaId: string) => {
    if (!window.confirm("Delete this delta? This cannot be undone.")) return;
    await deleteDelta(deltaId);
    setDeltas((prev) => prev.filter((item) => item.id !== deltaId));
  };

  const startQuickAdd = () => {
    setQuickDelta(emptyDelta());
    setQuickAddOpen(true);
  };

  const saveQuickAdd = async () => {
    if (!quickDelta.summary.trim()) return;
    await handleSave({ ...quickDelta, tags: quickDelta.tags.filter(Boolean) });
    setQuickAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Deltas</h2>
          <p className="text-sm text-slate-600">Track changes, decisions, and insights over time.</p>
        </div>
        <button
          onClick={startQuickAdd}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          Quick add
        </button>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-6">
          <input
            className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Search summary + details"
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={filters.area}
            onChange={(event) => setFilters((prev) => ({ ...prev, area: event.target.value }))}
          >
            <option value="">All areas</option>
            {deltaAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={filters.type}
            onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
          >
            <option value="">All types</option>
            {deltaTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Tags (comma)"
            value={filters.tags}
            onChange={(event) => setFilters((prev) => ({ ...prev, tags: event.target.value }))}
          />
          <div className="flex gap-2">
            <input
              type="date"
              className="w-full rounded-lg border border-slate-200 px-2 py-2 text-xs"
              value={filters.start}
              onChange={(event) => setFilters((prev) => ({ ...prev, start: event.target.value }))}
            />
            <input
              type="date"
              className="w-full rounded-lg border border-slate-200 px-2 py-2 text-xs"
              value={filters.end}
              onChange={(event) => setFilters((prev) => ({ ...prev, end: event.target.value }))}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {loading && <p className="text-sm text-slate-500">Loading deltas...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-slate-500">No deltas yet. Use Quick add to start.</p>
        )}
        {filtered.map((delta) => (
          <div key={delta.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            {editing?.id === delta.id ? (
              <DeltaEditor
                delta={editing}
                onCancel={() => setEditing(null)}
                onSave={handleSave}
                onAutoSave={handleAutoSave}
                saveLabel="Done"
              />
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {delta.dateISO} · {delta.area} · {delta.type}
                    </p>
                    <h3 className="text-lg font-semibold text-ink">{delta.summary}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(delta)}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(delta.id)}
                      className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{delta.details || "No extra details."}</p>
                <div className="flex flex-wrap gap-2">
                  {delta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      {quickAddOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-ink">Quick add delta</h3>
            <div className="mt-4">
              <DeltaEditor
                delta={quickDelta}
                onChange={setQuickDelta}
                onSave={saveQuickAdd}
                onCancel={() => setQuickAddOpen(false)}
                saveLabel="Add"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DeltaEditor({
  delta,
  onSave,
  onCancel,
  onChange,
  onAutoSave,
  saveLabel = "Save"
}: {
  delta: Delta;
  onSave: (delta: Delta) => void | Promise<void>;
  onCancel: () => void;
  onChange?: (delta: Delta) => void;
  onAutoSave?: (delta: Delta) => void | Promise<void>;
  saveLabel?: string;
}) {
  const [draft, setDraft] = useState<Delta>(delta);
  const [autoStatus, setAutoStatus] = useState<string | null>(null);

  useEffect(() => {
    setDraft(delta);
  }, [delta]);

  useEffect(() => {
    if (!onAutoSave) return;
    if (!draft.summary.trim()) return;
    setAutoStatus("Saving...");
    const handler = window.setTimeout(() => {
      Promise.resolve(onAutoSave({ ...draft, tags: draft.tags.filter(Boolean) })).then(() => {
        setAutoStatus("Saved");
      });
    }, 800);
    return () => window.clearTimeout(handler);
  }, [draft, onAutoSave]);

  const update = (changes: Partial<Delta>) => {
    setDraft((prev) => {
      const next = { ...prev, ...changes };
      onChange?.(next);
      return next;
    });
  };

  const tagString = draft.tags.join(", ");

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <input
          type="date"
          value={draft.dateISO}
          onChange={(event) => update({ dateISO: event.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <select
          value={draft.area}
          onChange={(event) => update({ area: event.target.value as Delta["area"] })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {deltaAreas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
        <select
          value={draft.type}
          onChange={(event) => update({ type: event.target.value as Delta["type"] })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {deltaTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <input
        value={draft.summary}
        onChange={(event) => update({ summary: event.target.value })}
        placeholder="Summary"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <textarea
        value={draft.details}
        onChange={(event) => update({ details: event.target.value })}
        placeholder="Details"
        rows={4}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <input
        value={tagString}
        onChange={(event) => update({ tags: event.target.value.split(",").map((tag) => tag.trim()) })}
        placeholder="Tags (comma separated)"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSave({ ...draft, tags: draft.tags.filter(Boolean) })}
          disabled={!draft.summary.trim()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saveLabel}
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
        >
          Cancel
        </button>
        {onAutoSave && <span className="self-center text-xs text-slate-400">{autoStatus}</span>}
      </div>
    </div>
  );
}
