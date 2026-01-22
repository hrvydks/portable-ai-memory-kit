export default function QuickstartPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-ink">Quickstart</h2>
        <p className="text-sm text-slate-600">How to get set up in under a minute.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold text-ink">60-second setup</h3>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          <div>
            <p className="font-semibold">Step 1 — Fill Canon (2 minutes)</p>
            <p>- Add the stable facts, rules, and preferences you want your AI to follow.</p>
          </div>
          <div>
            <p className="font-semibold">Step 2 — Update Current State (30 seconds)</p>
            <p>- Set what’s happening now + what you want to do today.</p>
          </div>
          <div>
            <p className="font-semibold">Step 3 — Copy a Context Pack (10 seconds)</p>
            <p>- Paste it into ChatGPT, Claude, or Gemini to load your context.</p>
          </div>
          <div>
            <p className="font-semibold">Step 4 — Add Deltas as you go (30 seconds each)</p>
            <p>- Every meaningful change becomes a Delta so you don’t have to re-explain later.</p>
          </div>
          <div className="pt-2">
            <p className="font-semibold">Why this works:</p>
            <p>- Your Canon is the source of truth.</p>
            <p>- Deltas track change over time.</p>
            <p>- The AI becomes the “thinking layer,” not the memory vault.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold text-ink">Switching models mid-project</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Copy your Context Pack</li>
          <li>In the new model, paste it and add:</li>
          <li>
            “Continue from this point. Here’s what we’ve already done:” + 2–5 bullet recap
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold text-ink">Weekly compression (10 minutes)</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Review your Deltas for the week</li>
          <li>Add one Delta called “Weekly summary”</li>
          <li>Only update Canon if something became a stable rule or preference</li>
        </ul>
      </section>
    </div>
  );
}
