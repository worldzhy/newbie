import fs from "node:fs/promises";
import path from "node:path";
import figlet from "figlet";
import { cyan } from "colorette";

import {
  decideDeveloperMode,
  isNewbieDeveloperEnabled,
} from "../core/dev-mode";
import { envValues, parseEnv } from "../core/env-file";
import { DeveloperMode, NEWBIE_DEVELOPER_ENV } from "../constants/modes";
import { ENV_PATH } from "../constants/paths";
import { ProjectConfig } from "../core/project-config";
import { PipelineContext } from "../assemble/pipeline";
import { CliError } from "../lib/errors";
import { IssueBag } from "../lib/issues";
import { ensureProjectConfig, readProjectConfig } from "../lib/project-config";
import { createSink, Sink } from "../lib/sink";

export interface GlobalOptions {
  cwd: string;
  dryRun: boolean;
  skipPrismaGenerate?: boolean;
}

export async function readEnvMap(cwd: string): Promise<Record<string, string>> {
  try {
    const raw = await fs.readFile(path.resolve(cwd, ENV_PATH), "utf8");
    return envValues(parseEnv(raw));
  } catch {
    return {};
  }
}

export function printBanner(mode: string | null): void {
  console.info(
    cyan(
      figlet.textSync("Newbie", {
        font: "Standard",
        width: 120,
        whitespaceBreak: true,
      }),
    ),
  );
  if (mode) console.info(cyan(`                               [${mode}]\n`));
}

/**
 * Build the shared pipeline context and enforce the developer-mode migration
 * guard. Unlike the legacy CLI (which exited 0), a blocked mode switch is a
 * non-zero failure with the migration instructions.
 */
export async function createContext(
  options: GlobalOptions,
  opts: { ensureConfig?: boolean } = {},
): Promise<{
  ctx: PipelineContext;
  config: ProjectConfig;
  isNewbieDeveloper: boolean;
  sink: Sink;
}> {
  const cwd = path.resolve(options.cwd);
  const sink = createSink(cwd, options.dryRun);
  const issues = new IssueBag();

  if (opts.ensureConfig) {
    await ensureProjectConfig(cwd, sink);
  }

  const config = await readProjectConfig(cwd);
  const envMap = await readEnvMap(cwd);
  const isNewbieDeveloper = isNewbieDeveloperEnabled(envMap);

  const decision = decideDeveloperMode(
    config.developerMode ?? null,
    isNewbieDeveloper,
    config.enabled,
  );
  if (decision.persist) {
    config.developerMode = decision.persist;
    await sink.writeJson(".newbie/.config/config.json", config);
  }

  if (!decision.allowed) {
    const fromMode = isNewbieDeveloper
      ? DeveloperMode.APPLICATION_DEVELOPER
      : DeveloperMode.NEWBIE_DEVELOPER;
    const toMode = isNewbieDeveloper
      ? DeveloperMode.NEWBIE_DEVELOPER
      : DeveloperMode.APPLICATION_DEVELOPER;
    throw new CliError(
      `Changing developer mode (${fromMode} -> ${toMode}) is blocked while modules are enabled.

      Please follow the steps below:

      1. Set ${NEWBIE_DEVELOPER_ENV}=${!isNewbieDeveloper} in .env
      2. Run 'newbie' and disable all modules
      3. Set ${NEWBIE_DEVELOPER_ENV}=${isNewbieDeveloper} in .env

      Then the mode will be changed.`,
    );
  }

  const ctx: PipelineContext = {
    cwd,
    sink,
    issues,
    config,
    isNewbieDeveloper,
    skipPrismaGenerate: options.skipPrismaGenerate,
  };

  return { ctx, config, isNewbieDeveloper, sink };
}
