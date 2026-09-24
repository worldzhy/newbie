import { checkbox } from "@inquirer/prompts";
import { cyan, green } from "colorette";

import { ApplicationMode } from "../constants/modes";
import { selectableModules, sanitizeModuleNames } from "../core/module-plan";
import { withEnabledModules } from "../core/project-config";
import { ALL_MODULE_NAMES } from "../modules-catalog";
import { writeProjectConfig } from "../lib/project-config";
import { CliError } from "../lib/errors";

import { createContext, GlobalOptions } from "./shared";

export interface ConfigOptions extends GlobalOptions {
  add?: string[];
  remove?: string[];
  list?: boolean;
}

/** Accept both "--add a b c" and "--add a,b,c". */
function parseModuleList(values: string[] | undefined): string[] {
  return (values ?? [])
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

function assertKnown(names: string[]): void {
  const known = new Set(ALL_MODULE_NAMES);
  const unknown = names.filter((name) => !known.has(name));
  if (unknown.length > 0) {
    throw new CliError(
      `Unknown module(s): ${unknown.join(", ")}. Known modules: ${ALL_MODULE_NAMES.join(", ")}`,
    );
  }
}

export async function runConfig(options: ConfigOptions): Promise<void> {
  const { ctx, config, sink } = await createContext(options, {
    ensureConfig: true,
  });

  if (options.list) {
    console.info(green(`developerMode: ${config.developerMode ?? "(unset)"}`));
    console.info(
      green(`applicationMode: ${config.applicationMode ?? "(unset)"}`),
    );
    console.info(green("enabled modules:"));
    for (const name of config.enabled) console.info(`  - ${name}`);
    return;
  }

  const addNames = parseModuleList(options.add);
  const removeNames = parseModuleList(options.remove);

  if (addNames.length > 0 || removeNames.length > 0) {
    assertKnown(addNames);
    assertKnown(removeNames);

    const next = [...config.enabled];
    for (const name of addNames) if (!next.includes(name)) next.push(name);
    for (const name of removeNames) {
      const index = next.indexOf(name);
      if (index !== -1) next.splice(index, 1);
    }

    await writeProjectConfig(ctx.cwd, sink, withEnabledModules(config, next));
    console.info(
      green(`[info] enabled modules: ${next.join(", ") || "(none)"}`),
    );
    return;
  }

  // Interactive: edit config.json only (no assembly).
  const isSaas = config.applicationMode === ApplicationMode.SAAS_APPLICATION;
  const choices = selectableModules(
    ALL_MODULE_NAMES,
    config.applicationMode ?? null,
    isSaas,
  );
  const known = new Set(ALL_MODULE_NAMES);
  const current = sanitizeModuleNames(config.enabled, known);

  const chosen = await checkbox({
    message: "Config modules:",
    choices: choices.map((name) => {
      const checked = current.includes(name);
      return {
        value: name,
        name: `${name}${checked ? " (enabled)" : ""}`,
        checked,
      };
    }),
    pageSize: 100,
    loop: true,
  });

  if (
    chosen.length === current.length &&
    chosen.every((name) => current.includes(name))
  ) {
    console.info(
      "\n[info] You did not make any changes to the configuration.\n",
    );
    return;
  }

  await writeProjectConfig(ctx.cwd, sink, withEnabledModules(config, chosen));
  for (const name of chosen.filter((n) => !current.includes(n)))
    console.info(cyan(`+ ${name}`));
  for (const name of current.filter((n) => !chosen.includes(n)))
    console.info(cyan(`- ${name}`));
}
