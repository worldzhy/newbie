import { checkbox, select } from "@inquirer/prompts";
import { bold, cyan, green, inverse } from "colorette";

import { applyModuleKeys } from "../assemble/pipeline";
import { moduleKeys } from "../core/modules-state";
import { listRegistryKeys } from "../lib/registry";

import { createContext, GlobalOptions, printBanner } from "./shared";

export async function runInteractive(options: GlobalOptions): Promise<void> {
  const { ctx } = await createContext(options, {
    ensureConfig: true,
    fetch: true,
  });

  printBanner();
  console.info("What is Newbie?");
  console.info(" -----------------------------------------------------------");
  console.info("| Newbie is a backend development framework based on NestJS.|");
  console.info("| Reuse ready-made modules (account, workflow, ...) and     |");
  console.info("| flexibly add or remove them in your project.              |");
  console.info(
    " -----------------------------------------------------------\n",
  );

  const available = await listRegistryKeys(ctx.registry.root);
  const enabled = moduleKeys(ctx.state).filter((key) =>
    available.includes(key),
  );

  const chosen = await checkbox({
    message: "Which modules do you want to enable for your project:",
    choices: available.map((name) => {
      const checked = enabled.includes(name);
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
    chosen.length === enabled.length &&
    chosen.every((name) => enabled.includes(name))
  ) {
    console.info("\n[info] You did not make any changes to the modules.\n");
    return;
  }

  const added = chosen.filter((name) => !enabled.includes(name));
  const removed = enabled.filter((name) => !chosen.includes(name));

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

  await applyModuleKeys(ctx, chosen);
  ctx.issues.assertEmpty();
  console.info(bold(green("\n🍺 C O M P L E T E\n")));
}
