import { checkbox, select } from "@inquirer/prompts";
import { bold, cyan, green, inverse } from "colorette";

import { applyModuleChanges } from "../assemble/pipeline";
import { ApplicationMode, DeveloperMode } from "../constants/modes";
import { selectableModules } from "../core/module-plan";
import { ProjectConfig } from "../core/project-config";
import { ALL_MODULE_NAMES } from "../modules-catalog";
import { CONFIG_JSON } from "../constants/paths";

import { createContext, GlobalOptions, printBanner } from "./shared";

async function ensureApplicationMode(
  config: ProjectConfig,
  sink: { writeJson(file: string, value: unknown): Promise<void> },
): Promise<string> {
  if (
    config.applicationMode === ApplicationMode.SAAS_APPLICATION ||
    config.applicationMode === ApplicationMode.NON_SAAS_APPLICATION
  ) {
    return config.applicationMode;
  }

  const mode = await select({
    message: "Which application mode do you want to enable for your project:",
    choices: [
      {
        name: "Non-SaaS Application",
        value: ApplicationMode.NON_SAAS_APPLICATION,
      },
      { name: "SaaS Application", value: ApplicationMode.SAAS_APPLICATION },
    ],
  });

  config.applicationMode = mode;
  await sink.writeJson(CONFIG_JSON, config);
  return mode;
}

export async function runInteractive(options: GlobalOptions): Promise<void> {
  const { ctx, config, isNewbieDeveloper, sink } = await createContext(
    options,
    { ensureConfig: true },
  );

  printBanner(
    isNewbieDeveloper
      ? DeveloperMode.NEWBIE_DEVELOPER
      : DeveloperMode.APPLICATION_DEVELOPER,
  );
  console.info("What is Newbie?");
  console.info(" -----------------------------------------------------------");
  console.info("| Newbie is a backend development framework based on NestJS.|");
  console.info("| Reuse ready-made modules (account, workflow, ...) and     |");
  console.info("| flexibly add or remove them in your project.              |");
  console.info(
    " -----------------------------------------------------------\n",
  );

  const applicationMode = await ensureApplicationMode(config, sink);
  const choices = selectableModules(
    ALL_MODULE_NAMES,
    applicationMode,
    applicationMode === ApplicationMode.SAAS_APPLICATION,
  );

  const chosen = await checkbox({
    message: "Which modules do you want to enable for your project:",
    choices: choices.map((name) => {
      const checked = config.enabled.includes(name);
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
    chosen.length === config.enabled.length &&
    chosen.every((name) => config.enabled.includes(name))
  ) {
    console.info("\n[info] You did not make any changes to the modules.\n");
    return;
  }

  const added = chosen.filter((name) => !config.enabled.includes(name));
  const removed = config.enabled.filter((name) => !chosen.includes(name));

  let message: string;
  if (!removed.length && added.length) {
    message = `Do you want to ENABLE ${cyan(added.join(", "))}?`;
  } else if (removed.length && !added.length) {
    message = `Do you want to DISABLE ${inverse(removed.join(", "))}?`;
  } else {
    message = `Do you want to DISABLE ${inverse(removed.join(", "))} and ENABLE ${cyan(added.join(", "))}?`;
  }

  const confirmed = await select({
    message,
    choices: [
      { name: "Yes", value: "yes" },
      { name: "No", value: "no" },
    ],
  });

  if (confirmed !== "yes") {
    console.info("\n[info] No changes applied.\n");
    return;
  }

  await applyModuleChanges(ctx, chosen);
  ctx.issues.assertEmpty();
  console.info(bold(green("\n🍺 C O M P L E T E\n")));
}
