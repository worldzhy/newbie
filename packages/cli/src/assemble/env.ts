import fs from "node:fs/promises";
import path from "node:path";

import {
  EnvLine,
  parseEnv,
  pruneEmptySections,
  removeEnvKeys,
  replaceMarkedBlock,
  serializeEnv,
  upsertEnvSection,
} from "../core/env-file";
import { ENV_EXAMPLE_PATH, ENV_PATH } from "../constants/paths";
import { IssueBag, reportIssue } from "../lib/issues";
import { readInstalledManifest } from "../lib/module-install";
import { Sink } from "../lib/sink";

function sectionTitle(key: string): string {
  return key.length === 0 ? key : key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * Structurally edit .env: add missing variables under per-module sections
 * (comments/blank lines survive), delete variables of removed modules.
 */
export async function assembleEnv(params: {
  cwd: string;
  sink: Sink;
  issues: IssueBag;
  added: string[];
  removed: string[];
}): Promise<void> {
  const { cwd, sink, issues, added, removed } = params;

  let raw = "";
  try {
    raw = await fs.readFile(path.resolve(cwd, ENV_PATH), "utf8");
  } catch {
    // Missing .env: start empty and let the sections be appended.
  }

  let lines: EnvLine[] = parseEnv(raw);

  for (const key of added) {
    const manifest = await readInstalledManifest(cwd, key);
    if (manifest === null) {
      reportIssue(
        issues,
        sink,
        `Missing newbie.module.json for '${key}'; its env variables were not added.`,
      );
      continue;
    }
    lines = upsertEnvSection(lines, sectionTitle(key), manifest.env ?? {});
  }

  const removedKeys = new Set<string>();
  for (const key of removed) {
    const manifest = await readInstalledManifest(cwd, key);
    if (manifest === null) continue;
    for (const envKey of Object.keys(manifest.env ?? {}))
      removedKeys.add(envKey);
  }
  if (removedKeys.size > 0) {
    lines = pruneEmptySections(removeEnvKeys(lines, removedKeys));
  }

  const serialized = serializeEnv(lines);
  if (serialized !== raw) {
    await sink.writeText(ENV_PATH, serialized);
  }
}

/**
 * Regenerate the CLI-managed block inside .env.example. All enabled modules
 * contribute their full variable list; hand-written content outside the
 * @@newbie-modules markers is preserved.
 */
export async function assembleEnvExample(params: {
  cwd: string;
  sink: Sink;
  issues: IssueBag;
  enabled: string[];
}): Promise<void> {
  const { cwd, sink, issues, enabled } = params;

  const decoration =
    "# ----------------------------------------------------------------------------------";
  const sectionLines: string[] = [];
  for (const key of enabled) {
    const manifest = await readInstalledManifest(cwd, key);
    if (manifest === null) {
      reportIssue(
        issues,
        sink,
        `Missing newbie.module.json for '${key}'; excluded from ${ENV_EXAMPLE_PATH}.`,
      );
      continue;
    }
    sectionLines.push(
      decoration,
      `# ! ${sectionTitle(key)} variables`,
      decoration,
    );
    for (const [envKey, value] of Object.entries(manifest.env ?? {})) {
      sectionLines.push(`${envKey}=${value}`);
    }
  }

  const body =
    sectionLines.length > 0
      ? `# Variables below are managed by @devbie/newbie-cli. Do not edit between the markers.\n${sectionLines.join("\n")}\n`
      : "";

  let raw = "";
  try {
    raw = await fs.readFile(path.resolve(cwd, ENV_EXAMPLE_PATH), "utf8");
  } catch {
    // Missing .env.example: create with markers only.
  }

  const next = replaceMarkedBlock(raw, body);
  if (next !== raw) {
    await sink.writeText(ENV_EXAMPLE_PATH, next);
  }
}
