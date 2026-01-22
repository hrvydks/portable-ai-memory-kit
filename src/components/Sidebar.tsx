import Link from "next/link";

const navItems = [
  { href: "/canon", label: "My Basics" },
  { href: "/current", label: "What’s going on now" },
  { href: "/deltas", label: "Updates" },
  { href: "/context-pack", label: "Copy for AI" },
  { href: "/settings", label: "Settings" },
  { href: "/quickstart", label: "Quickstart" }
];

export default function Sidebar() {
  return (
    <aside className="w-full border-b border-slate-200 bg-white px-4 py-4 md:h-screen md:w-60 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between md:block">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Portable</p>
          <h1 className="text-lg font-semibold text-ink">AI Memory Kit</h1>
        </div>
      </div>
      <nav className="mt-4 flex gap-2 overflow-x-auto md:flex-col md:gap-1 md:overflow-visible">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-accent hover:text-accent md:rounded-md md:px-3"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
