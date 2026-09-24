import { select } from "@inquirer/prompts";
import { bold, cyan, green, inverse } from "colorette";

import { applyPlanned, planReconcile } from "../assemble/pipeline";

import { createContext, GlobalOptions } from "./shared";

export async function runInstall(
  options: GlobalOptions & { yes?: boolean },
): Promise<void> {
  const { ctx } = await createContext(options, { fetch: true });

  const plan = await planReconcile(ctx);
  const { installed, uninstalled } = plan;

  // No copy/delete needed: still converge the generated wiring (idempotent),
  // which also repairs a previous install interrupted mid-pipeline.
  if (installed.length === 0 && uninstalled.length === 0) {
    await applyPlanned(ctx, plan);
    ctx.issues.assertEmpty();
    console.info(
      green("[info] Project is in sync with modules.json; wiring refreshed."),
    );
    return;
  }

  let message: string;
  if (!uninstalled.length && installed.length) {
    message = `Do you want to INSTALL ${cyan(installed.join(", "))}?`;
  } else if (uninstalled.length && !installed.length) {
    message = `Do you want to UNINSTALL ${inverse(uninstalled.join(", "))}?`;
  } else {
    message = `Do you want to UNINSTALL ${inverse(uninstalled.join(", "))} and INSTALL ${cyan(installed.join(", "))}?`;
  }

  if (!options.yes && !options.dryRun) {
    const confirmed = await select({
      message,
      choices: [
        { name: "Yes", value: "yes" },
        { name: "No", value: "no" },
      ],
    });
    if (confirmed !== "yes") {
      console.info("[info] Cancelled.");
      return;
    }
  }

  await applyPlanned(ctx, plan);
  ctx.issues.assertEmpty();
  console.info(bold(green("\n🍺 C O M P L E T E\n")));
}
