/**
 * Cross-repo consistency gate: a registry item whose target path also ships in
 * the starter template must be byte-identical to that template copy.
 *
 * `fewbie create` copies the whole fewbie-starter repository, so any file present
 * in both places is one artifact with two delivery channels:
 *   - the template copy — what a scaffolded project starts with;
 *   - the registry item — what `fewbie add <item>` writes into a project.
 * Editing one without the other silently forks them and the two channels then
 * disagree. This script asserts equality for every overlapping path.
 *
 * Template resolution mirrors create: FEWBIE_TEMPLATE_PATH (a local checkout,
 * offline-friendly) wins, otherwise a shallow clone of TEMPLATE_REPOSITORY_URL
 * on its default branch — the same source `fewbie create` uses when no
 * --template-ref is passed.
 *
 * Run via: node --import tsx scripts/check-template-sync.ts
 */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { TEMPLATE_PATH_ENV, TEMPLATE_REPOSITORY_URL } from "../src/commands/create";
import { execCapture } from "../src/lib/exec";

const packageRoot = path.resolve(__dirname, "..");
const registryRoot = path.join(packageRoot, "registry");

interface ResolvedTemplate {
  root: string;
  source: string;
  cleanup?: () => Promise<void>;
}

interface RegistryItemEntry {
  name: string;
  files: string[];
}

async function resolveTemplateRoot(): Promise<ResolvedTemplate> {
  const explicit = process.env[TEMPLATE_PATH_ENV];
  if (explicit) {
    const root = path.resolve(explicit);
    const isCheckout = await fs
      .access(path.join(root, "package.json"))
      .then(() => true)
      .catch(() => false);
    if (!isCheckout) {
      throw new Error(`${TEMPLATE_PATH_ENV} does not point at a template checkout (no package.json in ${root}).`);
    }
    return { root, source: root };
  }

  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "fewbie-template-sync-"));
  try {
    await execCapture("git", ["clone", "--quiet", "--depth", "1", TEMPLATE_REPOSITORY_URL, temp]);
  } catch (error) {
    await fs.rm(temp, { recursive: true, force: true });
    throw error;
  }
  return {
    root: temp,
    source: `${TEMPLATE_REPOSITORY_URL}#HEAD`,
    cleanup: () => fs.rm(temp, { recursive: true, force: true }),
  };
}

/** Authored registry items (registry/<name>/item.json) and their declared files. */
async function readRegistryItems(): Promise<RegistryItemEntry[]> {
  const entries = await fs.readdir(registryRoot, { withFileTypes: true });
  const items: RegistryItemEntry[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const raw = await fs.readFile(path.join(registryRoot, entry.name, "item.json"), "utf8").catch(() => undefined);
    if (raw === undefined) continue;
    const manifest = JSON.parse(raw) as { name?: unknown; files?: unknown };
    const files = Array.isArray(manifest.files)
      ? manifest.files.filter((file): file is string => typeof file === "string")
      : [];
    items.push({ name: typeof manifest.name === "string" ? manifest.name : entry.name, files });
  }

  return items.sort((a, b) => a.name.localeCompare(b.name));
}

async function main(): Promise<void> {
  const template = await resolveTemplateRoot();
  try {
    const items = await readRegistryItems();
    const compared: string[] = [];
    const mismatches: string[] = [];

    for (const item of items) {
      for (const file of item.files) {
        const registryFile = path.join(registryRoot, item.name, file);
        const registryContent = await fs.readFile(registryFile, "utf8").catch(() => undefined);
        if (registryContent === undefined) {
          mismatches.push(`${item.name}: declared file '${file}' is missing from the registry item`);
          continue;
        }

        const templateContent = await fs.readFile(path.join(template.root, file), "utf8").catch(() => undefined);
        // A registry-only item (one the template does not ship) has no
        // counterpart to compare against; only overlapping paths are gated.
        if (templateContent === undefined) continue;

        compared.push(`${item.name} -> ${file}`);
        if (templateContent !== registryContent) {
          mismatches.push(`${item.name}: '${file}' differs from the template copy`);
        }
      }
    }

    console.info(`Template source: ${template.source}`);
    console.info(`Compared ${compared.length} overlapping file(s):`);
    for (const pair of compared) console.info(`  ${pair}`);

    if (mismatches.length > 0) {
      console.error(`\nTemplate/registry drift detected (${mismatches.length}):`);
      for (const mismatch of mismatches) console.error(`  ${mismatch}`);
      console.error(
        "\nThe template copy is what `fewbie create` hands out; the registry copy is what `fewbie add` installs.",
      );
      console.error("Edit both, or the two delivery channels fork.");
      process.exitCode = 1;
      return;
    }

    console.info("\nNo drift: every overlapping registry item file matches its template copy.");
  } finally {
    await template.cleanup?.();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
