/**
 * Minimal unified-diff generator (LCS-backed) for small text files.
 * No external dependencies; works on any Node version >= 20.
 */

type Op = { type: "same" | "del" | "add"; line: string };

function lcsDiff(a: string[], b: string[]): Op[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const ops: Op[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.unshift({ type: "same", line: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.unshift({ type: "add", line: b[j - 1] });
      j--;
    } else {
      ops.unshift({ type: "del", line: a[i - 1] });
      i--;
    }
  }
  return ops;
}

interface HunkLine {
  type: "same" | "del" | "add";
  text: string;
}

interface Hunk {
  aStart: number;
  bStart: number;
  lines: HunkLine[];
}

/** Group changed regions into hunks with `context` unchanged lines around them. */
function buildHunks(ops: Op[], context: number): Hunk[] {
  const changed = ops.map((op) => op.type !== "same");

  // 1-based positions of each op in the a/b sequences.
  const aPos: number[] = [];
  const bPos: number[] = [];
  let a = 1;
  let b = 1;
  for (const op of ops) {
    aPos.push(a);
    bPos.push(b);
    if (op.type !== "add") a++;
    if (op.type !== "del") b++;
  }

  const hunks: Hunk[] = [];
  let i = 0;
  while (i < ops.length) {
    if (!changed[i]) {
      i++;
      continue;
    }
    const start = Math.max(0, i - context);
    let end = Math.min(ops.length - 1, i + context);
    // Merge the next change into this hunk when it sits within reach.
    for (;;) {
      const next = changed.indexOf(true, end + 1);
      if (next === -1 || next - end > context * 2 + 1) break;
      end = Math.min(ops.length - 1, next + context);
    }

    const hunk: Hunk = { aStart: aPos[start], bStart: bPos[start], lines: [] };
    for (let k = start; k <= end; k++) {
      hunk.lines.push({ type: ops[k].type, text: ops[k].line });
    }
    hunks.push(hunk);
    i = end + 1;
  }
  return hunks;
}

function hunkHeader(hunk: Hunk): string {
  const aCount = hunk.lines.filter((l) => l.type !== "add").length;
  const bCount = hunk.lines.filter((l) => l.type !== "del").length;
  // Unified-diff convention: an empty side starts at the line before the hunk.
  const aStart = aCount === 0 ? hunk.aStart - 1 : hunk.aStart;
  const bStart = bCount === 0 ? hunk.bStart - 1 : hunk.bStart;
  const aPart = aCount === 1 ? `${aStart}` : `${aStart},${aCount}`;
  const bPart = bCount === 1 ? `${bStart}` : `${bStart},${bCount}`;
  return `@@ -${aPart} +${bPart} @@`;
}

/**
 * Generate a unified diff. Returns an empty string when the inputs are
 * identical. Labels typically look like `a/tsconfig.json` / `b/tsconfig.json`
 * so the output stays reviewable (and pipeable into `git apply`).
 */
export function unifiedDiff(
  aText: string,
  bText: string,
  aLabel: string,
  bLabel: string,
  context = 3,
): string {
  const a = aText.split("\n");
  const b = bText.split("\n");
  // Ignore the empty element produced by a trailing newline.
  if (a.length > 0 && a[a.length - 1] === "") a.pop();
  if (b.length > 0 && b[b.length - 1] === "") b.pop();

  const ops = lcsDiff(a, b);
  if (ops.every((op) => op.type === "same")) return "";

  const out: string[] = [`--- ${aLabel}`, `+++ ${bLabel}`];
  for (const hunk of buildHunks(ops, context)) {
    out.push(hunkHeader(hunk));
    for (const line of hunk.lines) {
      const prefix =
        line.type === "same" ? " " : line.type === "del" ? "-" : "+";
      out.push(`${prefix}${line.text}`);
    }
  }
  return `${out.join("\n")}\n`;
}
