import fs from "node:fs/promises";
import path from "node:path";
import { bold, green } from "colorette";

import { applyModuleKeys } from "../assemble/pipeline";
import { CliError } from "../lib/errors";
import { listRegistryKeys } from "../lib/registry";

import { createContext, GlobalOptions } from "./shared";

export interface ApplyOptions extends GlobalOptions {
  config: string;
  /** Accepted for CI invocations; apply is always non-interactive. */
  ci?: boolean;
}

interface ApplySpec {
  modules?: unknown;
}

/**
 * Parse the declarative spec. Only `modules` is supported in Stage 3b:
 * { "modules": ["account", "workflow"] }.
 */
async function readSpec(file: string): Promise<string[]> {
  const absolute = path.resolve(file);
  let raw: string;
  try {
    raw = await fs.readFile(absolute, "utf8");
  } catch (error) {
    throw new CliError(
      `Cannot read apply spec ${file}: ${(error as Error).message}`,
    );
  }

  let spec: ApplySpec;
  try {
    spec = JSON.parse(raw) as ApplySpec;
  } catch (error) {
    throw new CliError(
      `Invalid JSON in apply spec ${file}: ${(error as Error).message}`,
    );
  }

  if (!Array.isArray(spec.modules) || !spec.modules.every((key) => typeof key === "string")) {
    throw new CliError(
      `Apply spec ${file} must contain a string array "modules".`,
    );
  }
  return spec.modules as string[];
}

export async function runApply(options: ApplyOptions): Promise<void> {
  const wanted = await readSpec(options.config);
  const { ctx } = await createContext(options, {
    ensureConfig: true,
    fetch: true,
  });

  const known = new Set(await listRegistryKeys(ctx.registry.root));
  const deduped = new Set(wanted);
  const unknown = [...deduped].filter((key) => !known.has(key));
  if (unknown.length > 0) {
    throw new CliError(
      `Unknown module(s) in ${options.config}: ${unknown.join(", ")}. Available modules: ${[...known].join(", ")}`,
    );
  }
  const nextKeys = [...deduped];

  await applyModuleKeys(ctx, nextKeys);
  ctx.issues.assertEmpty();
  console.info(bold(green("\n🍺 A P P L I E D\n")));
}
