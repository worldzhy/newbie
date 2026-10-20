import fs from "node:fs/promises";
import path from "node:path";
import { bold, green, red, yellow } from "colorette";

import { CliError } from "../lib/errors";
import { loadItem, resolveRegistryRoot } from "../registry/store";

export interface DoctorOptions {
  /** Project root (global --cwd). */
  cwd?: string;
  /** Emit machine-readable JSON instead of a human report. */
  json?: boolean;
}

/** Severity of a single doctor finding. */
type Severity = "error" | "warn" | "info";

interface Finding {
  severity: Severity;
  category: string;
  message: string;
}

interface DoctorResult {
  projectRoot: string;
  findings: Finding[];
  /** Registry items whose files are present in the project. */
  installed: string[];
  /** Count of findings grouped by severity. */
  summary: { error: number; warn: number; info: number };
}

/** Critical CSS variables that every fewbie project must define. */
const REQUIRED_CSS_VARS = [
  "--background",
  "--foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--border",
  "--input",
  "--ring",
  "--radius",
];

/** Read a JSON file, returning null when it does not exist. */
async function readJsonSafe<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Extract the bare package name from an npm spec ("axios@^1" -> "axios"). */
function packageNameOf(spec: string): string {
  if (spec.startsWith("@")) {
    const at = spec.indexOf("@", 1);
    return at === -1 ? spec : spec.slice(0, at);
  }
  return spec.split("@")[0];
}

/** List every item name available in the registry. */
async function listRegistryItems(registryRoot: string): Promise<string[]> {
  const entries = await fs.readdir(registryRoot, { withFileTypes: true });
  const names: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const hasItem = await fs
      .access(path.join(registryRoot, entry.name, "item.json"))
      .then(() => true)
      .catch(() => false);
    if (hasItem) names.push(entry.name);
  }
  return names.sort();
}

/**
 * Run all checks and return the structured result. The function never throws
 * on project issues — those surface as `error`-severity findings. It only
 * throws for unrecoverable CLI failures (e.g. registry not found).
 */
export async function runDoctor(options: DoctorOptions): Promise<DoctorResult> {
  const projectRoot = path.resolve(options.cwd ?? process.cwd());
  const findings: Finding[] = [];

  // --- 1. Project structure ---
  const hasPackageJson = await fs
    .access(path.join(projectRoot, "package.json"))
    .then(() => true)
    .catch(() => false);
  if (!hasPackageJson) {
    findings.push({
      severity: "error",
      category: "structure",
      message: "No package.json found — not a Node.js project.",
    });
    return finalize(projectRoot, findings, []);
  }

  const hasComponentsJson = await fs
    .access(path.join(projectRoot, "components.json"))
    .then(() => true)
    .catch(() => false);
  if (!hasComponentsJson) {
    findings.push({
      severity: "error",
      category: "structure",
      message: "No components.json found — run 'fewbie create' or add shadcn/ui to this project first.",
    });
    return finalize(projectRoot, findings, []);
  }

  const globalsCssPath = path.join(projectRoot, "src", "app", "globals.css");
  const hasGlobalsCss = await fs
    .access(globalsCssPath)
    .then(() => true)
    .catch(() => false);

  // --- 2. Installed registry items ---
  const registryRoot = await resolveRegistryRoot();
  const allItems = await listRegistryItems(registryRoot);
  const installed: string[] = [];

  for (const name of allItems) {
    const item = await loadItem(registryRoot, name);
    const targets = item.files.map((f) => f.target);
    const present = await Promise.all(
      targets.map((t) =>
        fs
          .access(path.join(projectRoot, t))
          .then(() => true)
          .catch(() => false),
      ),
    );
    const allPresent = present.every(Boolean);
    const somePresent = present.some(Boolean);

    if (allPresent) {
      installed.push(name);
    } else if (somePresent) {
      findings.push({
        severity: "warn",
        category: "registry",
        message: `Item '${name}' is partially installed — some files are missing: ${targets
          .filter((_, i) => !present[i])
          .join(", ")}. Re-run 'fewbie add ${name}' to repair.`,
      });
    }
  }

  // --- 3. Dependency completeness for installed items ---
  const pkg = (await readJsonSafe<{
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }>(path.join(projectRoot, "package.json")))!;
  const declared = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})]);

  for (const name of installed) {
    const item = await loadItem(registryRoot, name);
    const missing = (item.manifest.dependencies ?? []).filter((spec) => !declared.has(packageNameOf(spec)));
    if (missing.length > 0) {
      findings.push({
        severity: "warn",
        category: "dependencies",
        message: `Item '${name}' is missing dependencies: ${missing.join(", ")}. Run 'npm install ${missing.join(" ")}'.`,
      });
    }
  }

  // --- 4. CSS variables ---
  if (hasGlobalsCss) {
    const css = await fs.readFile(globalsCssPath, "utf8");
    const missingVars = REQUIRED_CSS_VARS.filter((v) => !css.includes(v));
    if (missingVars.length > 0) {
      findings.push({
        severity: "warn",
        category: "tokens",
        message: `globals.css is missing design tokens: ${missingVars.join(", ")}. Re-run shadcn init or restore the token block.`,
      });
    } else {
      findings.push({
        severity: "info",
        category: "tokens",
        message: `All ${REQUIRED_CSS_VARS.length} required design tokens present in globals.css.`,
      });
    }
  } else {
    findings.push({
      severity: "warn",
      category: "tokens",
      message: "src/app/globals.css not found — cannot verify design tokens.",
    });
  }

  // --- 5. v0 readability ---
  // Installed items live as source in the project (shadcn philosophy), so AI
  // tools can read them directly. If any installed item is actually an npm
  // dependency instead of source, flag it.
  for (const name of installed) {
    const item = await loadItem(registryRoot, name);
    for (const file of item.files) {
      const exists = await fs
        .access(path.join(projectRoot, file.target))
        .then(() => true)
        .catch(() => false);
      if (!exists) {
        findings.push({
          severity: "warn",
          category: "ai-readability",
          message: `Installed item '${name}' source file missing: ${file.target}. AI tools cannot read it.`,
        });
      }
    }
  }

  return finalize(projectRoot, findings, installed);
}

function finalize(projectRoot: string, findings: Finding[], installed: string[]): DoctorResult {
  const summary = { error: 0, warn: 0, info: 0 };
  for (const f of findings) summary[f.severity]++;
  return { projectRoot, findings, installed, summary };
}

/** Format the doctor result for human consumption. */
export function formatDoctorReport(result: DoctorResult): string {
  const lines: string[] = [];
  lines.push(bold(`fewbie doctor — ${result.projectRoot}`));
  lines.push("");

  if (result.installed.length > 0) {
    lines.push(`${green("Installed items")}: ${result.installed.join(", ")}`);
  } else {
    lines.push(yellow("No fewbie registry items installed yet."));
  }
  lines.push("");

  if (result.findings.length === 0) {
    lines.push(green("All checks passed."));
    return lines.join("\n");
  }

  const icon = (s: Severity) => (s === "error" ? red("✗") : s === "warn" ? yellow("!") : green("✓"));

  for (const f of result.findings) {
    lines.push(`${icon(f.severity)} [${f.category}] ${f.message}`);
  }

  lines.push("");
  lines.push(`${result.summary.error} error(s), ${result.summary.warn} warning(s), ${result.summary.info} info`);

  return lines.join("\n");
}

export async function doctorCommand(options: DoctorOptions): Promise<void> {
  const result = await runDoctor(options);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatDoctorReport(result));
  }

  // Exit non-zero when there are errors so CI can gate on doctor.
  if (result.summary.error > 0) {
    throw new CliError("Doctor found errors.");
  }
}
