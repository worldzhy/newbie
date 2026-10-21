import { bold, green } from "colorette";

import { applyDeployRenders, planDeployRenders } from "../assemble/deploy";
import { moduleKeys } from "../core/modules-state";
import { unifiedDiff } from "../core/unified-diff";
import { CliError } from "../lib/errors";
import { createContext, GlobalOptions } from "./shared";

export interface AssembleOptions extends GlobalOptions {
  /** CI gate: print the drift diff and exit non-zero instead of writing. */
  check?: boolean;
}

/**
 * Converge the module-derived deploy assets (deploy/compose.modules.yml and
 * the Caddyfile module route block) with the installed module set. The same
 * renders run as a step of install/apply/update; this command is the
 * standalone regeneration entry point and the CI drift gate (ADR-008
 * verification chain #2).
 */
export async function runAssemble(options: AssembleOptions): Promise<void> {
  const { ctx, sink } = await createContext(options, { fetch: false });
  const enabledKeys = moduleKeys(ctx.state);

  const plans = await planDeployRenders({ cwd: ctx.cwd, sink, issues: ctx.issues, enabledKeys });

  if (plans.length === 0) {
    console.info(green(bold("✓ Deploy assets are up to date with the installed module set.")));
    return;
  }

  if (options.check) {
    for (const plan of plans) {
      console.info(bold(`\n# ${plan.path} (${plan.current === null ? "missing in project" : "drifts from render"})`));
      const aLabel = plan.current === null ? "/dev/null" : `a/${plan.path}`;
      process.stdout.write(unifiedDiff(plan.current ?? "", plan.next, aLabel, `b/${plan.path}`));
    }
    throw new CliError(
      `${plans.length} deploy asset(s) drift from the installed module set. ` + "Run `newbie assemble` to regenerate.",
    );
  }

  for (const plan of plans) {
    console.info(`  ${plan.path}`);
  }
  await applyDeployRenders(sink, plans);
  if (options.dryRun) {
    console.info("[dry-run] no files were modified");
  } else {
    console.info(green(bold("\n✓ Deploy assets updated.")));
  }
}
