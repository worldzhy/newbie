import fs from "node:fs/promises";
import path from "node:path";

import { CliError } from "../lib/errors";
import type { BuiltRegistryItem, RegistryManifest } from "./types";

/** A loaded item plus the absolute paths its files should be copied from. */
export interface LoadedItem {
  manifest: RegistryManifest;
  /** Target path (project-relative) -> absolute source path / inline content. */
  files: Array<{ target: string; source?: string; content?: string }>;
}

/**
 * Locate the registry root.
 *
 * - Published package: built manifests live in dist/registry.
 * - Monorepo checkout / tsx runs: fall back to the authored registry/ folder.
 */
export async function resolveRegistryRoot(): Promise<string> {
  const candidates = [
    path.resolve(__dirname, "..", "registry"), // dist/registry
    path.resolve(__dirname, "..", "..", "registry"), // packages/fewbie-cli/registry
  ];
  for (const candidate of candidates) {
    if (
      await fs
        .access(candidate)
        .then(() => true)
        .catch(() => false)
    ) {
      return candidate;
    }
  }
  throw new CliError(
    "Registry not found (expected dist/registry or registry/).",
  );
}

async function readItemFile(
  root: string,
  name: string,
): Promise<RegistryManifest | BuiltRegistryItem> {
  const raw = await fs.readFile(path.join(root, name, "item.json"), "utf8");
  return JSON.parse(raw) as RegistryManifest | BuiltRegistryItem;
}

function isBuilt(
  item: RegistryManifest | BuiltRegistryItem,
): item is BuiltRegistryItem {
  return (
    Array.isArray(item.files) &&
    item.files.length > 0 &&
    typeof item.files[0] === "object"
  );
}

/** Load one registry item, normalizing authored and built forms. */
export async function loadItem(
  root: string,
  name: string,
): Promise<LoadedItem> {
  const item = await readItemFile(root, name);

  if (isBuilt(item)) {
    return {
      manifest: {
        name: item.name,
        type: item.type,
        title: item.title,
        description: item.description,
        dependencies: item.dependencies,
        registryDependencies: item.registryDependencies,
        postInstall: item.postInstall,
        files: item.files.map((f) => f.path),
      },
      files: item.files.map((f) => ({
        target: f.path,
        content: f.content,
      })),
    };
  }

  const manifest = item;
  const files = manifest.files.map((relative) => ({
    target: relative,
    source: path.join(root, name, relative),
  }));
  return { manifest, files };
}

/**
 * Resolve requested items plus their registryDependencies into a
 * deduplicated install order (dependencies first).
 */
export async function resolveInstallSet(
  root: string,
  names: string[],
): Promise<LoadedItem[]> {
  const ordered: LoadedItem[] = [];
  const seen = new Set<string>();
  const visiting = new Set<string>();

  async function visit(name: string): Promise<void> {
    if (seen.has(name)) return;
    if (visiting.has(name)) {
      throw new CliError(`Circular registry dependency involving '${name}'.`);
    }
    visiting.add(name);
    const loaded = await loadItem(root, name).catch(() => {
      throw new CliError(
        `Registry item '${name}' not found. Run 'fewbie add' with a valid item name.`,
      );
    });
    for (const dep of loaded.manifest.registryDependencies ?? []) {
      await visit(dep);
    }
    visiting.delete(name);
    seen.add(name);
    ordered.push(loaded);
  }

  for (const name of names) {
    await visit(name);
  }
  return ordered;
}
