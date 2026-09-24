import fs from "node:fs/promises";
import path from "node:path";

import { CONFIG_JSON } from "../constants/paths";
import {
  ProjectConfig,
  createEmptyProjectConfig,
  normalizeProjectConfig,
} from "../core/project-config";
import { CliError } from "./errors";
import { Sink } from "./sink";

export async function configExists(cwd: string): Promise<boolean> {
  try {
    await fs.stat(path.resolve(cwd, CONFIG_JSON));
    return true;
  } catch {
    return false;
  }
}

export async function readProjectConfig(cwd: string): Promise<ProjectConfig> {
  const target = path.resolve(cwd, CONFIG_JSON);
  let content: string;
  try {
    content = await fs.readFile(target, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return createEmptyProjectConfig();
    }
    throw error;
  }

  try {
    return normalizeProjectConfig(JSON.parse(content));
  } catch (error) {
    throw new CliError(
      `Invalid JSON in ${CONFIG_JSON}: ${(error as Error).message}`,
    );
  }
}

/** Create an empty config file (legacy CLI created it lazily on first use). */
export async function ensureProjectConfig(
  cwd: string,
  sink: Sink,
): Promise<void> {
  if (await configExists(cwd)) return;
  await sink.writeJson(CONFIG_JSON, createEmptyProjectConfig());
}

export async function writeProjectConfig(
  cwd: string,
  sink: Sink,
  config: ProjectConfig,
): Promise<void> {
  await sink.writeJson(CONFIG_JSON, config);
}
