import figlet from "figlet";
import { green, red, yellow } from "colorette";

import { collectMissingEnv } from "../lib/check";
import { readProjectConfig } from "../lib/project-config";
import { CliError } from "../lib/errors";

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

  const config = await readProjectConfig(options.cwd);
  const missing = await collectMissingEnv(options.cwd, config.enabled);

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
