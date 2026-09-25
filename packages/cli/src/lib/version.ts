import fs from "node:fs";
import path from "node:path";

/**
 * Reads the CLI version from package.json at runtime so it can never
 * drift from the published package metadata. This module lives in lib/,
 * i.e. src/lib (tsx) or dist/lib (published build), so it resolves two
 * levels up to the package root. Falls back to "0.0.0" only if
 * package.json is unreadable.
 */
export function readCliVersion(): string {
  try {
    const pkgPath = path.join(__dirname, "..", "..", "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as {
      version?: unknown;
    };
    return typeof pkg.version === "string" ? pkg.version : "0.0.0";
  } catch {
    return "0.0.0";
  }
}
