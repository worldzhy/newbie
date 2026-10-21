/**
 * Pure renderer/splicer for the module-owned route block of
 * deploy/Caddyfile.tmpl (ADR-008 D4).
 *
 * A module whose manifest declares `publicNamespace: true` claims the public
 * URL space /<key>/* on the site domain; assemble renders one Caddy handle
 * block per claim between the @@newbie-modules markers. The renderer is a
 * mechanism, not a source of truth — the manifests are (same relationship as
 * render-env.sh to .env).
 */

import { compareStrings, MODULES_MARKER_END, MODULES_MARKER_START } from "./env-file";

/**
 * Render the marker-block body: one `handle /<key>/*` pass-through block per
 * key, sorted, separated by a blank line; empty string when no module claims
 * a namespace. Each block ends with a newline.
 */
export function renderPublicNamespaceBody(keys: string[]): string {
  return [...keys]
    .sort(compareStrings)
    .map((key) => `\thandle /${key}/* {\n\t\treverse_proxy backend:3000\n\t}\n`)
    .join("\n");
}

/**
 * Replace the content between the @@newbie-modules markers with `body`.
 * Returns null when the markers are absent or out of order — unlike
 * replaceMarkedBlock (.env.example) this never appends a block: a Caddyfile
 * template without markers is a template defect to report, not a file to
 * grow. The marker lines themselves are emitted at column 0 (comments are
 * valid anywhere in a Caddyfile, including inside a site block).
 */
export function spliceModulesBlock(content: string, body: string): string | null {
  const startIndex = content.indexOf(MODULES_MARKER_START);
  const endIndex = content.indexOf(MODULES_MARKER_END);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) return null;

  const lineStart = content.lastIndexOf("\n", startIndex);
  const blockStart = lineStart === -1 ? 0 : lineStart + 1;
  const afterEnd = endIndex + MODULES_MARKER_END.length;
  const block = `${MODULES_MARKER_START}\n${body}${MODULES_MARKER_END}\n`;
  return `${content.slice(0, blockStart)}${block}${
    content[afterEnd] === "\n" ? content.slice(afterEnd + 1) : content.slice(afterEnd)
  }`;
}
