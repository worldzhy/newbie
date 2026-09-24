import fs from "node:fs/promises";
import path from "node:path";

import { envValues, parseEnv } from "../core/env-file";
import { ENV_PATH } from "../constants/paths";
import { MODULES } from "../modules-catalog";
import { readModuleSettings } from "./module-settings";

/**
 * Collect missing .env variables per enabled module.
 * Returns a map moduleKey -> missing keys. Empty map means everything is set.
 */
export async function collectMissingEnv(
  cwd: string,
  enabledNames: string[],
): Promise<Record<string, string[]>> {
  let raw = "";
  try {
    raw = await fs.readFile(path.resolve(cwd, ENV_PATH), "utf8");
  } catch {
    // Missing .env: every required variable is missing.
  }
  const present = new Set(Object.keys(envValues(parseEnv(raw))));

  const missing: Record<string, string[]> = {};

  for (const name of enabledNames) {
    const meta = MODULES[name];
    if (!meta) continue;
    const settings = await readModuleSettings(cwd, meta);
    if (!settings?.env) continue;

    const absent = Object.keys(settings.env).filter((key) => !present.has(key));
    if (absent.length > 0) missing[name] = absent;
  }

  return missing;
}
