"use client";

import { useEffect, useState } from "react";
import { Canon, defaultCanon } from "@/lib/types";
import { getCanon, saveCanon } from "@/lib/storage";

const fields = [
  { key: "identityGoals", label: "Identity & Goals" },
  { key: "rules", label: "Rules" },
  { key: "preferences", label: "Preferences" },
  { key: "glossary", label: "Glossary" }
] as const;

export default function CanonPage() {
  const [canon, setCanon] = useState<Canon>(defaultCanon);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCanon().then((data) => {
      setCanon(data);
      setSavedAt(data.updatedAt);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading) return;
    const handler = window.setTimeout(() => {
      saveCanon(canon).then((updated) => {
        setSavedAt(updated.updatedAt);
      });
    }, 600);
    return () => window.clearTimeout(handler);
  }, [canon, loading]);

  const handleChange = (key: keyof Canon, value: string) => {
    setCanon((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Canon</h2>
          <p className="text-sm text-slate-600">Stable truths and preferences for any assistant.</p>
        </div>
        <div className="text-xs text-slate-500">
          {savedAt ? `Saved ${new Date(savedAt).toLocaleString()}` : "Saving..."}
        </div>
      </header>

      <div className="grid gap-4">
        {fields.map((field) => (
          <section key={field.key} className="rounded-2xl border border-slate-200 bg-white p-4">
            <label className="text-sm font-semibold text-ink">{field.label}</label>
            <textarea
              value={canon[field.key]}
              onChange={(event) => handleChange(field.key, event.target.value)}
              rows={6}
              className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-700 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder={`Add ${field.label.toLowerCase()}...`}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
