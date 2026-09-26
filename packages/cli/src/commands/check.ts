import path from "node:path";
import figlet from "figlet";
import { green, red, yellow } from "colorette";

import { collectMissingEnv } from "../lib/check";
import { CliError } from "../lib/errors";
import { readModulesState } from "../lib/modules-state";
import { moduleKeys } from "../core/modules-state";

import { GlobalOptions } from "./shared";

export async function runCheck(options: GlobalOptions): Promise<void> {
  console.info(
    figlet.textSync("Newbie", {
      font: "Epic",
      width: 80,
      whitespaceBreak: true,
    }),
  );
  console.info("Checking environment variables...\n");

  const cwd = path.resolve(options.cwd);
  const state = await readModulesState(cwd);
  const missing = await collectMissingEnv(cwd, moduleKeys(state));

  const groups = Object.keys(missing);
  if (groups.length === 0) {
    console.info(green("[info] All environment variables are set."));
    return;
  }

  for (const moduleName of groups) {
    console.info(yellow(`Module ${moduleName} missing:`));
    for (const key of missing[moduleName]) console.info(red(`  ${key}`));
    console.info("");
  }

  throw new CliError(
    `${groups.length} module(s) have missing environment variables.`,
  );
}
