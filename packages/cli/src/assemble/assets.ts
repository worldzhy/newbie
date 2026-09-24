import fs from "node:fs/promises";
import path from "node:path";

import {
  NestAsset,
  addAssets,
  dedupeAssets,
  removeAssets,
} from "../core/assets";
import { NEST_CLI_JSON } from "../constants/paths";
import { ModuleMeta } from "../modules-catalog";
import { IssueBag, reportIssue } from "../lib/issues";
import { readModuleSettings } from "../lib/module-settings";
import { Sink } from "../lib/sink";

interface NestCliConfig {
  compilerOptions?: {
    assets?: NestAsset[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

async function readNestCli(cwd: string): Promise<NestCliConfig | null> {
  try {
    return JSON.parse(
      await fs.readFile(path.resolve(cwd, NEST_CLI_JSON), "utf8"),
    ) as NestCliConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function assembleNestJsAssets(params: {
  cwd: string;
  sink: Sink;
  issues: IssueBag;
  added: ModuleMeta[];
  removed: ModuleMeta[];
}): Promise<void> {
  const { cwd, sink, issues, added, removed } = params;

  const nestCli = await readNestCli(cwd);
  if (!nestCli) {
    reportIssue(
      issues,
      sink,
      `Missing ${NEST_CLI_JSON}; skipping nestjs assets update.`,
    );
    return;
  }

  nestCli.compilerOptions = nestCli.compilerOptions ?? {};
  let assets: NestAsset[] = nestCli.compilerOptions.assets ?? [];

  for (const meta of added) {
    const settings = await readModuleSettings(cwd, meta);
    if (settings === null) {
      reportIssue(
        issues,
        sink,
        `Missing ${meta.key}.settings.json; its assets were not added.`,
      );
      continue;
    }
    assets = addAssets(assets, settings.assets ?? []);
  }

  for (const meta of removed) {
    const settings = await readModuleSettings(cwd, meta);
    if (settings === null) continue; // already gone; nothing to remove
    assets = removeAssets(assets, settings.assets ?? []);
  }

  nestCli.compilerOptions.assets = dedupeAssets(assets);
  await sink.writeText(NEST_CLI_JSON, JSON.stringify(nestCli, null, 2));
}
