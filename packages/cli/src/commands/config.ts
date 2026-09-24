import { checkbox } from "@inquirer/prompts";
import { cyan, green } from "colorette";

import { moduleKeys, withModuleKeys } from "../core/modules-state";
import { listRegistryKeys } from "../lib/registry";
import { writeModulesState } from "../lib/modules-state";
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

function assertKnown(names: string[], known: string[]): void {
  const knownSet = new Set(known);
  const unknown = names.filter((name) => !knownSet.has(name));
  if (unknown.length > 0) {
    throw new CliError(
      `Unknown module(s): ${unknown.join(", ")}. Available modules: ${known.join(", ")}`,
    );
  }
}

export async function runConfig(options: ConfigOptions): Promise<void> {
  const { ctx } = await createContext(options, {
    ensureConfig: true,
    fetch: false,
  });
  const { cwd, sink } = ctx;

  const known = await listRegistryKeys(ctx.registry.root);

  if (options.list) {
    console.info(green("enabled modules:"));
    for (const record of ctx.state.modules) {
      const version =
        record.version ?? (record.sourceCommit ? record.sourceCommit.slice(0, 7) : "(not installed)");
      console.info(`  - ${record.key} (${version})`);
    }
    return;
  }

  const addNames = parseModuleList(options.add);
  const removeNames = parseModuleList(options.remove);

  if (addNames.length > 0 || removeNames.length > 0) {
    assertKnown(addNames, known);
    assertKnown(removeNames, known);

    const next = [...moduleKeys(ctx.state)];
    for (const name of addNames) if (!next.includes(name)) next.push(name);
    for (const name of removeNames) {
      const index = next.indexOf(name);
      if (index !== -1) next.splice(index, 1);
    }

    await writeModulesState(cwd, sink, withModuleKeys(ctx.state, next));
    console.info(
      green(`[info] enabled modules: ${next.join(", ") || "(none)"}`),
    );
    return;
  }

  // Interactive: edit modules.json only (no assembly).
  const current = moduleKeys(ctx.state).filter((key) => known.includes(key));

  const chosen = await checkbox({
    message: "Config modules:",
    choices: known.map((name) => {
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

  await writeModulesState(cwd, sink, withModuleKeys(ctx.state, chosen));
  for (const name of chosen.filter((n) => !current.includes(n)))
    console.info(cyan(`+ ${name}`));
  for (const name of current.filter((n) => !chosen.includes(n)))
    console.info(cyan(`- ${name}`));
}
