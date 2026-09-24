/**
 * Structural .env parser/serializer.
 *
 * Unlike the legacy CLI, which parsed `.env` into a flat object and rewrote the
 * whole file (destroying comments, blank lines and grouping), every assemble
 * step edits a list of typed lines so user-authored content is preserved.
 */

export type EnvLine =
  | { kind: "blank" }
  | { kind: "comment"; text: string }
  | { kind: "entry"; key: string; value: string };

const SINGLE_ENTRY_RE = /^\s*(?:export\s+)?([\w.-]+)\s*=\s*([\s\S]*?)\s*$/;
const SECTION_TITLE_RE = /^# ! (.+) variables\s*$/;
const DECORATION_RE = /^#\s*-{5,}\s*$/;

/**
 * Parse the textual content of a .env file into typed lines.
 * Quoted values keep their inner content verbatim (quotes stripped).
 */
export function parseEnv(content: string): EnvLine[] {
  const normalized = content.replace(/\r\n?/g, "\n");
  const rawLines = normalized.split("\n");

  // A trailing newline produces a spurious empty final element; drop only that one.
  if (rawLines.length > 0 && rawLines[rawLines.length - 1] === "") {
    rawLines.pop();
  }

  const lines: EnvLine[] = [];

  for (const raw of rawLines) {
    if (raw.trim() === "") {
      lines.push({ kind: "blank" });
      continue;
    }
    if (raw.trimStart().startsWith("#")) {
      lines.push({ kind: "comment", text: raw });
      continue;
    }

    const match = raw.match(SINGLE_ENTRY_RE);
    if (!match) {
      // Unrecognized non-empty, non-comment line: keep it verbatim as a comment
      // so the round-trip never destroys content.
      lines.push({ kind: "comment", text: raw });
      continue;
    }

    const [, key, rawValue] = match;
    lines.push({ kind: "entry", key, value: unquote(rawValue.trim()) });
  }

  return lines;
}

function unquote(value: string): string {
  const quote = value[0];
  if (quote === '"' || quote === "'" || quote === "`") {
    if (value[value.length - 1] === quote) {
      return value.slice(1, -1);
    }
  }
  return value;
}

/**
 * Serialize typed lines back to text. Values needing quoting are wrapped in
 * double quotes; ordinary values stay bare for maximum diff-compatibility.
 */
export function serializeEnv(lines: EnvLine[]): string {
  const text = lines
    .map((line) => {
      if (line.kind === "blank") return "";
      if (line.kind === "comment") return line.text;
      return `${line.key}=${formatValue(line.value)}`;
    })
    .join("\n");

  return text.length > 0 ? `${text}\n` : "";
}

function formatValue(value: string): string {
  if (
    value.includes("\n") ||
    /^[\s]|[\s]$/.test(value) ||
    value.includes("#")
  ) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return value;
}

/** Extract a flat key/value map from parsed lines. */
export function envValues(lines: EnvLine[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of lines) {
    if (line.kind === "entry") {
      result[line.key] = line.value;
    }
  }
  return result;
}

/** Remove entries whose key is in `keys`. Comments and blank lines are kept. */
export function removeEnvKeys(
  lines: EnvLine[],
  keys: ReadonlySet<string>,
): EnvLine[] {
  return lines.filter((line) => line.kind !== "entry" || !keys.has(line.key));
}

function findSectionRange(
  lines: EnvLine[],
  title: string,
): { start: number; end: number } | null {
  const titleIndex = lines.findIndex(
    (line) =>
      line.kind === "comment" &&
      line.text.match(SECTION_TITLE_RE)?.[1] === title,
  );
  if (titleIndex === -1) return null;

  let start = titleIndex;
  if (
    titleIndex - 2 >= 0 &&
    lines[titleIndex - 1].kind === "comment" &&
    DECORATION_RE.test((lines[titleIndex - 1] as { text: string }).text) &&
    lines[titleIndex - 2].kind === "comment" &&
    DECORATION_RE.test((lines[titleIndex - 2] as { text: string }).text)
  ) {
    start = titleIndex - 2;
  }

  let end = lines.length;
  for (let i = titleIndex + 1; i < lines.length; i++) {
    const candidate = lines[i];
    if (
      candidate.kind === "comment" &&
      DECORATION_RE.test(candidate.text) &&
      lines[i + 2]?.kind === "comment" &&
      SECTION_TITLE_RE.test((lines[i + 2] as { text: string }).text)
    ) {
      end = i;
      break;
    }
  }

  return { start, end };
}

function sectionHeader(title: string): EnvLine[] {
  return [
    { kind: "blank" },
    {
      kind: "comment",
      text: "# ----------------------------------------------------------------------------------",
    },
    { kind: "comment", text: `# ! ${title} variables` },
    {
      kind: "comment",
      text: "# ----------------------------------------------------------------------------------",
    },
  ];
}

/**
 * Insert missing entries under a `# ! <title> variables` section.
 * Existing keys (in any section) are never duplicated or overwritten.
 * Idempotent across re-runs.
 */
export function upsertEnvSection(
  lines: EnvLine[],
  title: string,
  entries: Record<string, string>,
): EnvLine[] {
  const newKeys = Object.keys(entries);
  if (newKeys.length === 0) return lines;

  const existingKeys = new Set(Object.keys(envValues(lines)));
  const range = findSectionRange(lines, title);

  if (!range) {
    const next = [...lines];
    next.push(...sectionHeader(title));
    for (const key of newKeys) {
      next.push({ kind: "entry", key, value: entries[key] });
    }
    return next;
  }

  const next = [...lines];
  const insertAt: EnvLine[] = [];
  for (const key of newKeys) {
    if (!existingKeys.has(key)) {
      insertAt.push({ kind: "entry", key, value: entries[key] });
    }
  }
  next.splice(range.end, 0, ...insertAt);
  return next;
}

/**
 * Drop generated section blocks whose body contains no entry lines
 * (e.g. after all variables of a removed module were deleted).
 */
export function pruneEmptySections(lines: EnvLine[]): EnvLine[] {
  const titles: string[] = [];
  for (const line of lines) {
    if (line.kind === "comment") {
      const match = line.text.match(SECTION_TITLE_RE);
      if (match) titles.push(match[1]);
    }
  }

  let next = lines;
  for (const title of titles) {
    const range = findSectionRange(next, title);
    if (!range) continue;
    const body = next.slice(range.start, range.end);
    if (!body.some((line) => line.kind === "entry")) {
      next = [...next.slice(0, range.start), ...next.slice(range.end)];
      // Also swallow a single separating blank line directly after the block.
      if (next[range.start]?.kind === "blank") {
        next = [...next.slice(0, range.start), ...next.slice(range.start + 1)];
      }
    }
  }
  return next;
}

export const MODULES_MARKER_START = "# @@newbie-modules-start";
export const MODULES_MARKER_END = "# @@newbie-modules-end";

/**
 * Replace (or append) the CLI-managed block in `.env.example` delimited by
 * @@newbie-modules markers. Content outside the block is user/template-owned.
 */
export function replaceMarkedBlock(content: string, body: string): string {
  const startIndex = content.indexOf(MODULES_MARKER_START);
  const endIndex = content.indexOf(MODULES_MARKER_END);

  const block = `${MODULES_MARKER_START}\n${body}${MODULES_MARKER_END}\n`;

  if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    const lineStart = content.lastIndexOf("\n", startIndex);
    const blockStart = lineStart === -1 ? 0 : lineStart + 1;
    const afterEnd = endIndex + MODULES_MARKER_END.length;
    return `${content.slice(0, blockStart)}${block}${content[afterEnd] === "\n" ? content.slice(afterEnd + 1) : content.slice(afterEnd)}`;
  }

  const separator = content.length === 0 || content.endsWith("\n") ? "" : "\n";
  return `${content}${separator}\n${block}`;
}
