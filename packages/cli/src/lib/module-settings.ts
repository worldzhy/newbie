import fs from "node:fs/promises";
import path from "node:path";

import { NestAsset } from "../core/assets";
import { CONFIG_DIR } from "../constants/paths";
import { ModuleMeta } from "../modules-catalog";

export interface ModuleSettings {
  "config-service"?: Record<string, unknown>;
  env?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  assets?: NestAsset[];
}

export function settingsFilePath(meta: ModuleMeta): string | null {
  if (!meta.settingsFileName) return null;
  return path.posix.join(CONFIG_DIR, meta.key, meta.settingsFileName);
}

export function schemaFilePath(meta: ModuleMeta): string | null {
  if (!meta.schemaFileName) return null;
  return path.posix.join(CONFIG_DIR, meta.key, meta.schemaFileName);
}

async function readJsonFile(
  cwd: string,
  relativePath: string,
): Promise<{ exists: boolean; value?: unknown }> {
  try {
    const content = await fs.readFile(path.resolve(cwd, relativePath), "utf8");
    return { exists: true, value: JSON.parse(content) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return { exists: false };
    throw error;
  }
}

export async function readModuleSettings(
  cwd: string,
  meta: ModuleMeta,
): Promise<ModuleSettings | null> {
  const file = settingsFilePath(meta);
  if (!file) return {};
  const result = await readJsonFile(cwd, file);
  return result.exists ? (result.value as ModuleSettings) : null;
}

export async function readModuleSchema(
  cwd: string,
  meta: ModuleMeta,
): Promise<string | null> {
  const file = schemaFilePath(meta);
  if (!file) return null;
  try {
    return await fs.readFile(path.resolve(cwd, file), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
