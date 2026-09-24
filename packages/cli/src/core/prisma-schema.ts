/**
 * Update the `schemas = [...]` array inside the prisma datasource block.
 * Non-module entries (e.g. "application") are preserved; module entries are
 * addressed by their PostgreSQL namespace name (`module/<key>`).
 */

const DATASOURCE_SCHEMAS_RE =
  /(datasource\s+db\s*\{(?:.|\n|\r)*schemas\s*=\s*)(\[.*?\])/;

export function updateDatasourceSchemas(
  content: string,
  addedPaths: string[],
  removedPaths: string[],
): string {
  return content.replace(
    DATASOURCE_SCHEMAS_RE,
    (_whole, prefix: string, arrayLiteral: string) => {
      let current: string[] = [];
      try {
        current = JSON.parse(`{"val": ${arrayLiteral}}`).val as string[];
      } catch {
        throw new Error(
          "[Error] Cannot parse schemas array in prisma/schema.prisma",
        );
      }

      const removed = new Set(removedPaths);
      const next = Array.from(
        new Set([
          ...current.filter((entry) => !removed.has(entry)),
          ...addedPaths,
        ]),
      );
      return `${prefix}${JSON.stringify(next).replace(/,/g, ", ")}`;
    },
  );
}

/** Namespace name used inside the datasource schemas array for a module key. */
export function moduleSchemaNamespace(key: string): string {
  return `module/${key}`;
}

/** Read the current datasource schemas list; null when absent/unparseable. */
export function readDatasourceSchemas(content: string): string[] | null {
  const match = content.match(DATASOURCE_SCHEMAS_RE);
  if (!match) return null;
  try {
    return JSON.parse(`{"val": ${match[2]}}`).val as string[];
  } catch {
    return null;
  }
}
