/**
 * nest-cli.json compilerOptions.assets merging.
 * An asset entry is either a glob string or {include, outDir?}.
 */

export type NestAsset = string | { include: string; outDir?: string };

export function isSameAsset(a: NestAsset, b: NestAsset): boolean {
  if (typeof a === "string" || typeof b === "string") {
    return a === b;
  }
  return a.include === b.include && (a.outDir ?? null) === (b.outDir ?? null);
}

/** Append assets that are not already declared. Idempotent. */
export function addAssets(
  existing: NestAsset[],
  additions: NestAsset[],
): NestAsset[] {
  const next = [...existing];
  for (const asset of additions) {
    if (!next.some((candidate) => isSameAsset(candidate, asset))) {
      next.push(asset);
    }
  }
  return next;
}

/** Remove every existing asset matching one of `removals`. */
export function removeAssets(
  existing: NestAsset[],
  removals: NestAsset[],
): NestAsset[] {
  return existing.filter(
    (asset) => !removals.some((removal) => isSameAsset(asset, removal)),
  );
}

/** Drop falsy entries and deduplicate by value. */
export function dedupeAssets(assets: NestAsset[]): NestAsset[] {
  return assets
    .filter(Boolean)
    .filter(
      (asset, index, all) =>
        all.findIndex((item) => isSameAsset(item, asset)) === index,
    );
}
