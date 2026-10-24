/** Splits long content into bounded chunks so a single row stays compressible. */
const MAX_CHUNK_CHARS = 4_000;

export function chunkContent(content: string): string[] {
  if (!content) return [""];
  if (content.length <= MAX_CHUNK_CHARS) return [content];
  const chunks: string[] = [];
  for (let index = 0; index < content.length; index += MAX_CHUNK_CHARS) {
    chunks.push(content.slice(index, index + MAX_CHUNK_CHARS));
  }
  return chunks;
}

/** Reads a non-empty string field from an untyped IDE record. */
export function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Reads a string-array field from an untyped IDE record. */
export function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}
