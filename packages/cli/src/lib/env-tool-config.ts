import fs from "node:fs/promises";
import path from "node:path";

import { ENV_TOOL_CONFIG_CANDIDATES } from "../constants/paths";
import { CliError } from "./errors";

export interface SecretConfig {
  name: string;
  description?: string;
  /** Only these keys are pulled/pushed. Empty means "all keys" (push prompts). */
  keys?: string[];
  /** Keys that must exist in the secret but whose value is never pulled/pushed. */
  keysOnly?: string[];
}

export interface EnvironmentConfig {
  region: string;
  secrets: SecretConfig[];
}

export interface EnvToolConfig {
  environments: Record<string, EnvironmentConfig>;
}

export async function readEnvToolConfig(
  cwd: string,
): Promise<{ config: EnvToolConfig; path: string }> {
  for (const candidate of ENV_TOOL_CONFIG_CANDIDATES) {
    const target = path.resolve(cwd, candidate);
    try {
      const raw = await fs.readFile(target, "utf8");
      const parsed = JSON.parse(raw) as EnvToolConfig;
      if (!parsed.environments || typeof parsed.environments !== "object") {
        throw new CliError(
          `Invalid env-tool config ${candidate}: missing "environments".`,
        );
      }
      return { config: parsed, path: candidate };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      if (error instanceof CliError) throw error;
      throw new CliError(
        `Cannot parse env-tool config ${candidate}: ${(error as Error).message}`,
      );
    }
  }

  throw new CliError(
    `Env tool config not found. Looked at: ${ENV_TOOL_CONFIG_CANDIDATES.join(", ")}`,
  );
}
