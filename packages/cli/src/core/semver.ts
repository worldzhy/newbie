/** Semantic version tag helpers (vMAJOR.MINOR.PATCH). */

export interface SemverTag {
  tag: string;
  major: number;
  minor: number;
  patch: number;
}

export function parseSemverTag(tag: string): SemverTag | null {
  const match = tag.trim().match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;

  return {
    tag: match[0].startsWith("v") ? match[0] : match[0],
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

/** Ascending comparator: sort with it and take the last element for "latest". */
export function compareSemverTags(a: SemverTag, b: SemverTag): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

/** Pick the highest semver tag from an arbitrary list of tags. */
export function pickLatestSemverTag(tags: string[]): string | null {
  const parsed = tags
    .map((tag) => parseSemverTag(tag))
    .filter((tag): tag is SemverTag => tag !== null);
  if (parsed.length === 0) return null;
  return parsed.sort(compareSemverTags).pop()!.tag;
}
