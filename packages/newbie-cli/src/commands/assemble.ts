import { bold, green } from "colorette";

import { applyDeployRenders, planDeployRenders } from "../assemble/deploy";
import { ModuleSourceDrift, planModuleSourceDrift } from "../assemble/module-sources";
import { moduleKeys } from "../core/modules-state";
import { unifiedDiff } from "../core/unified-diff";
import { CliError } from "../lib/errors";
import { createContext, GlobalOptions } from "./shared";

export interface AssembleOptions extends GlobalOptions {
  /** CI gate: print the drift diff and exit non-zero instead of writing. */
  check?: boolean;
}

/** Print one installed module whose sources diverge from the registry checkout. */
function printSourceDrift(drift: ModuleSourceDrift): void {
  const verdict = drift.report === null ? "absent from" : "differs from";
  console.info(bold(`\n# ${drift.installedPath} (${verdict} ${drift.registryPath})`));
  if (drift.report === null) return;
  for (const file of drift.report.added) console.info(`  added: ${file}`);
  for (const file of drift.report.changed) console.info(`  changed: ${file}`);
  for (const file of drift.report.removed) console.info(`  removed: ${file}`);
}

/**
 * Converge the module-derived deploy assets (deploy/compose.modules.yml and
 * the Caddyfile module route block) with the installed module set. The same
 * renders run as a step of install/apply/update; this command is the
 * standalone regeneration entry point.
 *
 * With `--check` the command also proves that every installed module still
 * matches the registry checkout it must stay byte-identical to (ADR-019,
 * ADR-021), which is the CI gate for the diff-empty back-port rule.
 */
export async function runAssemble(options: AssembleOptions): Promise<void> {
  const { ctx, sink } = await createContext(options, { fetch: false });
  const enabledKeys = moduleKeys(ctx.state);

  const plans = await planDeployRenders({ cwd: ctx.cwd, sink, issues: ctx.issues, enabledKeys });
  const sourceDrifts = options.check
    ? await planModuleSourceDrift({ cwd: ctx.cwd, registryRoot: ctx.registry.root, enabledKeys })
    : [];

  if (plans.length === 0 && sourceDrifts.length === 0) {
    console.info(
      green(
        bold(
          options.check
            ? "✓ Deploy assets are up to date and module sources match the registry checkout."
            : "✓ Deploy assets are up to date with the installed module set.",
        ),
      ),
    );
    return;
  }

  if (options.check) {
    for (const plan of plans) {
      console.info(bold(`\n# ${plan.path} (${plan.current === null ? "missing in project" : "drifts from render"})`));
      const aLabel = plan.current === null ? "/dev/null" : `a/${plan.path}`;
      process.stdout.write(unifiedDiff(plan.current ?? "", plan.next, aLabel, `b/${plan.path}`));
    }
    for (const drift of sourceDrifts) printSourceDrift(drift);

    const problems: string[] = [];
    if (plans.length > 0) {
      problems.push(
        `${plans.length} deploy asset(s) drift from the installed module set; run \`newbie assemble\` to regenerate.`,
      );
    }
    if (sourceDrifts.length > 0) {
      const keys = sourceDrifts.map((drift) => drift.key).join(", ");
      problems.push(
        `${sourceDrifts.length} installed module(s) differ from the registry checkout (${keys}); ` +
          "back-port the host changes to newbie-modules, or run `newbie update` to adopt the registry version.",
      );
    }
    throw new CliError(problems.join("\n"));
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
