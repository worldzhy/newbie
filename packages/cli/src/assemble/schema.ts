import fs from "node:fs/promises";
import path from "node:path";

import { moduleSchemaNamespace, reconcileDatasourceSchemas } from "../core/prisma-schema";
import { MODULES_DIR, PRISMA_SCHEMA_MAIN, PRISMA_SCHEMA_MODELS_DIR } from "../constants/paths";
import { IssueBag, reportIssue } from "../lib/issues";
import { readInstalledManifest, readInstalledSchema } from "../lib/module-install";
import { fileExists } from "../lib/fs-util";
import { Sink } from "../lib/sink";

const DO_NOT_EDIT_HEADER = `// THIS FILE IS MANAGED BY @devbie/newbie-cli. DO NOT EDIT.
// Run 'newbie install' to regenerate this file.

`;

/** Keys of modules (among the given ones) that declare a Prisma fragment. */
async function keysWithSchema(cwd: string, keys: string[]): Promise<{ key: string; fragment: string | null }[]> {
  const result: { key: string; fragment: string | null }[] = [];
  for (const key of keys) {
    const manifest = await readInstalledManifest(cwd, key);
    if (!manifest) continue; // dry-run before copy: reported elsewhere
    if (!manifest.schema) continue;
    const fragment = await readInstalledSchema(cwd, key, manifest);
    result.push({ key, fragment });
  }
  return result;
}

export async function assembleSchemaFiles(params: {
  cwd: string;
  sink: Sink;
  issues: IssueBag;
  added: string[];
  enabledKeys: string[];
  skipPrismaGenerate?: boolean;
}): Promise<void> {
  const { cwd, sink, issues, added, enabledKeys, skipPrismaGenerate } = params;
  const enabledSet = new Set(enabledKeys);

  // [step 1] Copy added module fragments into prisma/models/<key>.prisma
  for (const { key, fragment } of await keysWithSchema(cwd, added)) {
    if (fragment === null) {
      reportIssue(issues, sink, `Declared Prisma fragment is missing inside ${path.posix.join(MODULES_DIR, key)}`);
      continue;
    }
    await sink.writeText(
      path.posix.join(PRISMA_SCHEMA_MODELS_DIR, `${key}.prisma`),
      `${DO_NOT_EDIT_HEADER}${fragment}`,
    );
  }

  // [step 2] Convergent removal: delete any prisma/models/<key>.prisma whose
  // key is no longer in the enabled set. The previous diff-based removal
  // relied on the src/modules/<key> manifest still being readable, which
  // missed modules whose directory was removed out-of-band.
  const modelsDir = path.resolve(cwd, PRISMA_SCHEMA_MODELS_DIR);
  let modelFiles: string[] = [];
  try {
    modelFiles = await fs.readdir(modelsDir);
  } catch {
    // prisma/models may not exist yet (fresh project); nothing to reconcile.
  }
  for (const file of modelFiles) {
    if (!file.endsWith(".prisma")) continue;
    const key = file.slice(0, -".prisma".length);
    if (!enabledSet.has(key)) {
      await sink.remove(path.posix.join(PRISMA_SCHEMA_MODELS_DIR, file));
    }
  }

  // [step 3] Convergent datasource schemas: rewrite the module entries to
  // exactly the enabled modules that declare a schema, preserving any
  // non-module entries (e.g. "application"). This drops orphan namespaces
  // left by out-of-band module removal.
  const mainSchemaPath = path.resolve(cwd, PRISMA_SCHEMA_MAIN);
  let content: string;
  try {
    content = await fs.readFile(mainSchemaPath, "utf8");
  } catch {
    reportIssue(issues, sink, `Missing ${PRISMA_SCHEMA_MAIN}; skipping datasource schemas update.`);
    content = "";
  }

  if (content) {
    const enabledWithSchema = (await keysWithSchema(cwd, enabledKeys)).filter(
      (entry) => entry.fragment !== null,
    );
    const moduleNamespaces = enabledWithSchema.map((entry) => moduleSchemaNamespace(entry.key));
    const next = reconcileDatasourceSchemas(content, moduleNamespaces);
    if (next !== content) {
      await sink.writeText(PRISMA_SCHEMA_MAIN, next);
    }
  }

  // [step 4] Regenerate the prisma client. Failures are fatal (legacy CLI swallowed them).
  if (!skipPrismaGenerate && (await fileExists(cwd, PRISMA_SCHEMA_MAIN))) {
    await sink.run("npx", ["prisma", "generate"], "prisma generate");
  }
}
