import fs from "node:fs/promises";
import path from "node:path";

import {
  NestAsset,
  addAssets,
  dedupeAssets,
  removeAssets,
} from "../core/assets";
import { NEST_CLI_JSON } from "../constants/paths";
import { IssueBag, reportIssue } from "../lib/issues";
import { readInstalledManifest } from "../lib/module-install";
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
  added: string[];
  removed: string[];
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

  for (const key of added) {
    const manifest = await readInstalledManifest(cwd, key);
    if (manifest === null) {
      reportIssue(
        issues,
        sink,
        `Missing newbie.module.json for '${key}'; its assets were not added.`,
      );
      continue;
    }
    assets = addAssets(assets, manifest.assets ?? []);
  }

  for (const key of removed) {
    const manifest = await readInstalledManifest(cwd, key);
    if (manifest === null) continue; // already gone; nothing to remove
    assets = removeAssets(assets, manifest.assets ?? []);
  }

  nestCli.compilerOptions.assets = dedupeAssets(assets);
  await sink.writeText(NEST_CLI_JSON, JSON.stringify(nestCli, null, 2));
}
