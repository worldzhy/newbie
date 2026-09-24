import fs from "node:fs/promises";
import path from "node:path";

import { MODULES_JSON } from "../constants/paths";
import {
  createEmptyModulesState,
  ModulesState,
  normalizeModulesState,
} from "../core/modules-state";
import { CliError } from "./errors";
import { Sink } from "./sink";

export async function stateExists(cwd: string): Promise<boolean> {
  try {
    await fs.stat(path.resolve(cwd, MODULES_JSON));
    return true;
  } catch {
    return false;
  }
}

export async function readModulesState(cwd: string): Promise<ModulesState> {
  const target = path.resolve(cwd, MODULES_JSON);
  let content: string;
  try {
    content = await fs.readFile(target, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return createEmptyModulesState();
    }
    throw error;
  }

  try {
    return normalizeModulesState(JSON.parse(content));
  } catch (error) {
    throw new CliError(
      `Invalid JSON in ${MODULES_JSON}: ${(error as Error).message}`,
    );
  }
}

/** Create an empty modules.json on first use (config/interactive flows). */
export async function ensureModulesState(
  cwd: string,
  sink: Sink,
): Promise<void> {
  if (await stateExists(cwd)) return;
  await sink.writeJson(MODULES_JSON, createEmptyModulesState());
}

export async function writeModulesState(
  cwd: string,
  sink: Sink,
  state: ModulesState,
): Promise<void> {
  await sink.writeJson(MODULES_JSON, state);
}
