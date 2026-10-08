#!/usr/bin/env node
import { Command } from "commander";
import { red } from "colorette";

// Published package version (package.json sits one level above both src/
// during development and dist/ in the published tarball).
import pkg from "../package.json";

import { runAgent } from "./commands/agent";
import { runApply } from "./commands/apply";
import { runConfig } from "./commands/config";
import { runCreate } from "./commands/create";
import { runDevLint } from "./commands/dev/lint";
import { runDoctor } from "./commands/doctor";
import { runInstall } from "./commands/install";
import { runStatus } from "./commands/status";
import { parseKeysFlag, runUpdate } from "./commands/update";
import { runUpdateTemplate } from "./commands/update-template";
import { runWatch } from "./commands/watch";
import { runInteractive } from "./commands/default";
import { GlobalOptions } from "./commands/shared";
import { registerModuleCommands } from "./lib/module-cli";
import { run } from "./lib/cli-runner";

export const VERSION: string = pkg.version;

const program = new Command();

program
  .name("newbie")
  .description("Newbie framework CLI: install modules from the newbie-modules registry and sync project files")
  .version(VERSION)
  .option("-C, --cwd <dir>", "project root directory", process.cwd())
  .option("--dry-run", "print planned changes without writing files or running mutating commands", false)
  .option("--skip-prisma-generate", "skip `npx prisma generate` after schema changes", false);

function collectOptions(command: Command): GlobalOptions {
  // Merge values of options registered on the root program regardless of
  // whether the user placed them before or after the subcommand name.
  const globals = command.optsWithGlobals();
  return {
    cwd: (globals.cwd as string) ?? process.cwd(),
    dryRun: Boolean(globals.dryRun),
    skipPrismaGenerate: Boolean(globals.skipPrismaGenerate),
  };
}

/**
 * Inspect argv for the global `--cwd`/`-C` flag before commander parses the
 * full option set. The module-CLI loader needs the project root to discover
 * manifests, and it runs before `program.parseAsync`.
 */
function findCwdInArgv(): string {
  const argv = process.argv;
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--cwd" || arg === "-C") {
      const next = argv[i + 1];
      if (next && !next.startsWith("-")) return next;
    } else if (arg.startsWith("--cwd=")) {
      return arg.slice(6);
    } else if (arg.startsWith("-C") && arg.length > 2) {
      return arg.slice(2);
    } else if (!arg.startsWith("-")) {
      // First positional is the subcommand name; subsequent --cwd values
      // would belong to that subcommand, so we stop scanning here.
      break;
    }
  }
  return process.cwd();
}

program
  .command("install")
  .description(
    "Reconcile the project with modules.json (copy missing modules / remove extra ones and regenerate wiring)",
  )
  .option("-y, --yes", "skip confirmation prompts", false)
  .action(function (this: Command) {
    const options = { ...collectOptions(this), yes: Boolean(this.opts().yes) };
    return run(() => runInstall(options));
  });

program
  .command("config")
  .description("View or edit the enabled-module list in modules.json without touching project files")
  .option("--add <modules...>", "enable module(s), space or comma separated")
  .option("--remove <modules...>", "disable module(s), space or comma separated")
  .option("--list", "print current configuration", false)
  .action(function (this: Command) {
    const flags = this.opts();
    return run(() =>
      runConfig({
        ...collectOptions(this),
        add: flags.add as string[] | undefined,
        remove: flags.remove as string[] | undefined,
        list: Boolean(flags.list),
      }),
    );
  });

program
  .command("update")
  .description("Update enabled module copies to the registry HEAD commit (blocks on local drift unless --force)")
  .option("--all", "select every module with an available update", false)
  .option("-y, --yes", "skip confirmation prompts", false)
  .option("--force", "overwrite locally drifted module copies", false)
  .option("--keys <moduleKeys...>", "non-interactive module selector (comma or space separated)")
  .action(function (this: Command) {
    const flags = this.opts();
    return run(() =>
      runUpdate({
        ...collectOptions(this),
        all: Boolean(flags.all),
        yes: Boolean(flags.yes),
        force: Boolean(flags.force),
        keys: parseKeysFlag(flags.keys as string[] | undefined),
      }),
    );
  });

program
  .command("apply")
  .description('Non-interactively sync the module set declared in a JSON spec ({"modules": [...]})')
  .requiredOption("--config <file>", "path to the declarative apply spec JSON")
  .option("--ci", "CI mode marker (apply is always non-interactive)", false)
  .action(function (this: Command) {
    const flags = this.opts();
    return run(() =>
      runApply({
        ...collectOptions(this),
        config: flags.config as string,
        ci: Boolean(flags.ci),
      }),
    );
  });

program
  .command("doctor")
  .description("Audit the installation: registry pins, copied modules, drift, env and prisma wiring")
  .action(function (this: Command) {
    return run(() => runDoctor(collectOptions(this)));
  });

program
  .command("status")
  .description("Print machine-readable project state as JSON")
  .option("--drift", "include content drift against pinned pristine copies", false)
  .action(function (this: Command) {
    const flags = this.opts();
    return run(() => runStatus({ ...collectOptions(this), drift: Boolean(flags.drift) }));
  });

program
  .command("create <name>")
  .description("Scaffold a new project from the basic template")
  .option("--template-path <dir>", "use a local template directory instead of cloning the newbie repository")
  .option("--template-ref <ref>", "git ref of the newbie repository to clone the template from")
  .option("--no-git-init", "skip 'git init' in the new project", undefined)
  .action(function (this: Command, name: string) {
    const flags = this.opts();
    return run(() =>
      runCreate({
        ...collectOptions(this),
        name,
        templatePath: flags.templatePath as string | undefined,
        templateRef: flags.templateRef as string | undefined,
        gitInit: flags.gitInit as boolean | undefined,
      }),
    );
  });

program
  .command("update-template")
  .description(
    "Diff framework-managed skeleton files (main.ts, tsconfig*, prisma framework block) against the template; business files are skipped",
  )
  .option("--template-path <dir>", "use a local template directory instead of cloning the newbie repository")
  .option("--template-ref <ref>", "git ref (e.g. a template tag) of the newbie repository to sync from")
  .option("--write", "apply the template version of differing skeleton files", false)
  .action(function (this: Command) {
    const flags = this.opts();
    return run(() =>
      runUpdateTemplate({
        ...collectOptions(this),
        templatePath: flags.templatePath as string | undefined,
        templateRef: flags.templateRef as string | undefined,
        write: Boolean(flags.write),
      }),
    );
  });

program
  .command("agent")
  .description(
    "Run the module-hub agent: poll the hub with `newbie status`, execute dispatched changes (apply/update), report receipts",
  )
  .option("--once", "single pass: drain pending changes, deliver receipts, then exit (CI/cron friendly)", false)
  .action(function (this: Command) {
    const flags = this.opts();
    return run(() => runAgent({ ...collectOptions(this), once: Boolean(flags.once) }));
  });

program
  .command("watch [keys...]")
  .description("Watch the local newbie-modules registry and sync installed module sources into the project on change")
  .option("--all", "watch every registry module instead of only installed ones", false)
  .action(function (this: Command, keys: string[]) {
    const flags = this.opts();
    return run(() =>
      runWatch({
        ...collectOptions(this),
        all: Boolean(flags.all),
      }),
    );
  });

const dev = program
  .command("dev")
  .description("Registry development commands (run inside the newbie-modules repo, not a consuming project)");

dev
  .command("lint")
  .description("Enforce the module layering rules (domain -> capability -> foundation) across registry sources")
  .action(function (this: Command) {
    return run(() => runDevLint(collectOptions(this)));
  });

program
  .command("interactive", { isDefault: true, hidden: true })
  .description("Interactive module enable/disable flow (default)")
  .action(function (this: Command) {
    return run(() => runInteractive(collectOptions(this)));
  });

void (async () => {
  try {
    await registerModuleCommands(program, {
      cwd: findCwdInArgv(),
      dryRun: false,
      skipPrismaGenerate: false,
    });
  } catch (error) {
    console.error(red(`\nFailed to load module CLIs: ${(error as Error).message}\n`));
    if (process.env.NEWBIE_DEBUG && (error as Error).stack) {
      console.error((error as Error).stack);
    }
    process.exit(1);
  }
  await program.parseAsync(process.argv);
})();
