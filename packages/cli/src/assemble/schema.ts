import fs from "node:fs/promises";
import path from "node:path";

import {
  moduleSchemaNamespace,
  updateDatasourceSchemas,
} from "../core/prisma-schema";
import {
  PRISMA_SCHEMA_MAIN,
  PRISMA_SCHEMA_MODELS_DIR,
} from "../constants/paths";
import { ModuleMeta } from "../modules-catalog";
import { IssueBag, reportIssue } from "../lib/issues";
import { readModuleSchema } from "../lib/module-settings";
import { fileExists } from "../lib/release";
import { Sink } from "../lib/sink";

const DO_NOT_EDIT_HEADER = `// THIS FILE IS MANAGED BY @devbie/newbie-cli. DO NOT EDIT.
// Run 'newbie install' to regenerate this file.

`;

export async function assembleSchemaFiles(params: {
  cwd: string;
  sink: Sink;
  issues: IssueBag;
  added: ModuleMeta[];
  removed: ModuleMeta[];
  skipPrismaGenerate?: boolean;
}): Promise<void> {
  const { cwd, sink, issues, added, removed, skipPrismaGenerate } = params;

  // [step 1] Copy added module schemas into prisma/models/<key>.prisma
  for (const meta of added) {
    if (!meta.schemaFileName) continue;

    const schema = await readModuleSchema(cwd, meta);
    if (schema === null) {
      reportIssue(
        issues,
        sink,
        `Missing ${meta.key}.schema in ${path.posix.join(".newbie/.config", meta.key)}`,
      );
      continue;
    }

    await sink.writeText(
      path.posix.join(PRISMA_SCHEMA_MODELS_DIR, `${meta.key}.prisma`),
      `${DO_NOT_EDIT_HEADER}${schema}`,
    );
  }

  // [step 2] Remove module schema files.
  for (const meta of removed) {
    if (!meta.schemaFileName) continue;
    await sink.remove(
      path.posix.join(PRISMA_SCHEMA_MODELS_DIR, `${meta.key}.prisma`),
    );
  }

  // [step 3] Rewrite the datasource schemas array (nothing to do when neither side has schemas).
  const addedWithSchema = added.filter((meta) => meta.schemaFileName);
  const removedWithSchema = removed.filter((meta) => meta.schemaFileName);

  if (addedWithSchema.length > 0 || removedWithSchema.length > 0) {
    const mainSchemaPath = path.resolve(cwd, PRISMA_SCHEMA_MAIN);
    let content: string;
    try {
      content = await fs.readFile(mainSchemaPath, "utf8");
    } catch {
      reportIssue(
        issues,
        sink,
        `Missing ${PRISMA_SCHEMA_MAIN}; skipping datasource schemas update.`,
      );
      return;
    }

    const next = updateDatasourceSchemas(
      content,
      addedWithSchema.map((meta) => moduleSchemaNamespace(meta.key)),
      removedWithSchema.map((meta) => moduleSchemaNamespace(meta.key)),
    );
    if (next !== content) {
      await sink.writeText(PRISMA_SCHEMA_MAIN, next);
    }
  }

  // [step 4] Regenerate the prisma client. Failures are fatal (legacy CLI swallowed them).
  if (!skipPrismaGenerate && (await fileExists(cwd, PRISMA_SCHEMA_MAIN))) {
    await sink.run("npx", ["prisma", "generate"], "prisma generate");
  }
}
