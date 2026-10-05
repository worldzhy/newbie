import { checkbox } from "@inquirer/prompts";
import { cyan, green } from "colorette";

import { describeMissingDependencies, expandRegistryClosure } from "../assemble/module-graph";
import { directDependents, expandModuleClosure, findRemovalBlocks } from "../core/module-closure";
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
    throw new CliError(`Unknown module(s): ${unknown.join(", ")}. Available modules: ${known.join(", ")}`);
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
      const version = record.version ?? (record.sourceCommit ? record.sourceCommit.slice(0, 7) : "(not installed)");
      console.info(`  - ${record.key} (${version})`);
    }
    return;
  }

  const addNames = parseModuleList(options.add);
  const removeNames = parseModuleList(options.remove);

  if (addNames.length > 0 || removeNames.length > 0) {
    assertKnown(addNames, known);
    assertKnown(removeNames, known);

    const current = moduleKeys(ctx.state);
    // Traverse the graph including modules marked for removal, so removal
    // guards can see dependencies declared from either side of the change.
    const rootsWithAdds = [...new Set([...current, ...addNames])];
    const preClosure = await expandRegistryClosure(ctx.registry.root, rootsWithAdds);
    const missing = describeMissingDependencies(preClosure);
    if (missing.length > 0) {
      throw new CliError(`Cannot resolve module dependencies:\n  - ${missing.join("\n  - ")}`);
    }

    const keptRoots = rootsWithAdds.filter((name) => !removeNames.includes(name));
    const blocks = findRemovalBlocks(removeNames, keptRoots, preClosure.graph);
    if (blocks.length > 0) {
      const lines = blocks.map(
        (block) => `cannot remove '${block.key}': still required by ${block.requiredBy.join(", ")}`,
      );
      throw new CliError(`${lines.join("\n")}. Remove the dependent modules first.`);
    }

    const next = expandModuleClosure(keptRoots, preClosure.graph).keys;
    const nextSet = new Set(next);
    const currentSet = new Set(current);

    await writeModulesState(cwd, sink, withModuleKeys(ctx.state, next));
    for (const name of next.filter((key) => !currentSet.has(key))) {
      const requiredBy = directDependents(name, preClosure.graph, nextSet);
      console.info(cyan(`+ ${name}${requiredBy.length ? ` (required by: ${requiredBy.join(", ")})` : ""}`));
    }
    for (const name of current.filter((key) => !nextSet.has(key))) console.info(cyan(`- ${name}`));
    console.info(green(`[info] enabled modules: ${next.join(", ") || "(none)"}`));
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

  const closure = await expandRegistryClosure(ctx.registry.root, chosen);
  const missing = describeMissingDependencies(closure);
  if (missing.length > 0) {
    throw new CliError(`Cannot resolve module dependencies:\n  - ${missing.join("\n  - ")}`);
  }
  const next = closure.keys;
  const currentSet = new Set(current);
  const nextSet = new Set(next);

  if (next.length === current.length && next.every((name) => current.includes(name))) {
    console.info("\n[info] You did not make any changes to the configuration.\n");
    return;
  }

  // Modules the user unchecked but a kept module still depends on stay enabled.
  for (const name of closure.added.filter((key) => currentSet.has(key))) {
    const requiredBy = directDependents(name, closure.graph, nextSet);
    console.info(cyan(`= ${name} kept enabled (required by: ${requiredBy.join(", ") || "?"})`));
  }

  await writeModulesState(cwd, sink, withModuleKeys(ctx.state, next));
  for (const name of next.filter((n) => !currentSet.has(n))) console.info(cyan(`+ ${name}`));
  for (const name of current.filter((n) => !nextSet.has(n))) console.info(cyan(`- ${name}`));
}
