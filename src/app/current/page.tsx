"use client";

import { useEffect, useState } from "react";
import { CurrentState, defaultCurrent } from "@/lib/types";
import { getCurrent, saveCurrent } from "@/lib/storage";

export default function CurrentPage() {
  const [current, setCurrent] = useState<CurrentState>(defaultCurrent);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrent().then((data) => {
      setCurrent(data);
      setSavedAt(data.updatedAt);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading) return;
    const handler = window.setTimeout(() => {
      saveCurrent(current).then((updated) => {
        setSavedAt(updated.updatedAt);
      });
    }, 600);
    return () => window.clearTimeout(handler);
  }, [current, loading]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Current State</h2>
          <p className="text-sm text-slate-600">What’s active right now and today’s target.</p>
        </div>
        <div className="text-xs text-slate-500">
          {savedAt ? `Saved ${new Date(savedAt).toLocaleString()}` : "Saving..."}
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <label className="text-sm font-semibold text-ink">Now</label>
        <textarea
          value={current.now}
          onChange={(event) => setCurrent((prev) => ({ ...prev, now: event.target.value }))}
          rows={6}
          className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-700 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="Top projects, priorities, constraints..."
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <label className="text-sm font-semibold text-ink">Today</label>
        <textarea
          value={current.today}
          onChange={(event) => setCurrent((prev) => ({ ...prev, today: event.target.value }))}
          rows={4}
          className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-700 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="Session goal and desired output..."
        />
      </section>
    </div>
  );
}
