"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOnboardingSeen, setOnboardingSeen } from "@/lib/storage";

const bodyCopy = `Step 1 — Fill Canon (2 minutes)
- Add the stable facts, rules, and preferences you want your AI to follow.
Step 2 — Update Current State (30 seconds)
- Set what’s happening now + what you want to do today.
Step 3 — Copy a Context Pack (10 seconds)
- Paste it into ChatGPT, Claude, or Gemini to load your context.
Step 4 — Add Deltas as you go (30 seconds each)
- Every meaningful change becomes a Delta so you don’t have to re-explain later.

Why this works:
- Your Canon is the source of truth.
- Deltas track change over time.
- The AI becomes the “thinking layer,” not the memory vault.`;

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getOnboardingSeen().then((seen) => {
      if (!seen) setOpen(true);
    });
  }, []);

  const close = async () => {
    await setOnboardingSeen(true);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">60-second setup</h2>
            <pre className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{bodyCopy}</pre>
          </div>
          <button
            onClick={close}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:border-accent hover:text-accent"
          >
            Close
          </button>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Link href="/quickstart" className="text-sm font-medium text-accent underline">
            Open Quickstart
          </Link>
          <button
            onClick={close}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            Let’s go
          </button>
        </div>
      </div>
    </div>
  );
}
