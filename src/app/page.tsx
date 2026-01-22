import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-ink">Portable AI Memory Kit</h2>
        <p className="mt-2 text-slate-600">
          Keep a portable memory pack you can load into ChatGPT, Claude, or Gemini without relying on
          platform memory.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/canon" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
            Start with Canon
          </Link>
          <Link
            href="/context-pack"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Generate Context Pack
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Canon", text: "Stable truth, rules, preferences, glossary." },
          { title: "Current", text: "What is active now + today’s session target." },
          { title: "Deltas", text: "Track change over time to avoid re-explaining." }
        ].map((card) => (
          <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-semibold text-ink">{card.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{card.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
