import { Canon, CurrentState, Delta } from "@/lib/types";

export type PackFormat = "plaintext" | "markdown";

const truncate = (value: string, max = 240) => {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
};

const formatDeltaLine = (delta: Delta) => {
  const details = delta.details.trim();
  const detailText = details ? ` — ${truncate(details)}` : "";
  return `- ${delta.dateISO} ${delta.area} ${delta.type} ${delta.summary}${detailText}`;
};

export function buildContextPack(
  canon: Canon | null,
  current: CurrentState | null,
  deltas: Delta[],
  format: PackFormat
) {
  const lines: string[] = [];

  const heading = (text: string) => (format === "markdown" ? `## ${text}` : `${text}`);

  lines.push(format === "markdown" ? "# CONTEXT PACK" : "CONTEXT PACK");

  lines.push(heading("Canon:"));
  lines.push(`- Identity & Goals: ${canon?.identityGoals?.trim() || ""}`);
  lines.push(`- Rules: ${canon?.rules?.trim() || ""}`);
  lines.push(`- Preferences: ${canon?.preferences?.trim() || ""}`);
  lines.push(`- Glossary: ${canon?.glossary?.trim() || ""}`);

  lines.push("");
  lines.push(heading("Current State:"));
  lines.push(`- Now: ${current?.now?.trim() || ""}`);
  lines.push(`- Today: ${current?.today?.trim() || ""}`);

  lines.push("");
  lines.push(heading("Deltas (selected):"));
  if (deltas.length === 0) {
    lines.push("- (none)");
  } else {
    deltas.forEach((delta) => lines.push(formatDeltaLine(delta)));
  }

  lines.push("");
  lines.push(heading("REQUEST:"));
  lines.push("- [Paste what you want help with here]");

  return lines.join("\n");
}

export const modelWrappers = {
  chatgpt: `CHATGPT INSTRUCTIONS:\n- Treat Canon as the source of truth.\n- If a detail is not in Canon/Current/Deltas, treat it as unknown (ask or offer options).\n- Ask at most 1–3 clarifying questions only if necessary; otherwise propose a plan and proceed.\n- Keep outputs structured with headings and bullets. Avoid fluff.\n`,
  claude: `CLAUDE INSTRUCTIONS:\n- Be strict: do not invent details.\n- Use Canon/Current/Deltas as the only facts.\n- Provide a short answer first, then an optional “Deeper” section.\n- Keep tone calm, direct, and practical.\n`,
  gemini: `GEMINI INSTRUCTIONS:\n- Use headings and checklists.\n- Avoid long narrative.\n- If there are multiple approaches, give 2 options with pros/cons, then a recommendation.\n- Don’t assume missing facts—ask concise questions if needed.\n`
};

export function wrapForModel(wrapper: keyof typeof modelWrappers, content: string) {
  return `${modelWrappers[wrapper]}\n${content}`.trim();
}
