#!/usr/bin/env node
import { Command } from "commander";
import { red } from "colorette";

import { runAgent } from "./commands/agent";
import { runApply } from "./commands/apply";
import { runCheck } from "./commands/check";
import { runConfig } from "./commands/config";
import { runCreate } from "./commands/create";
import { runDoctor } from "./commands/doctor";
import { runEnvPull, runEnvPush } from "./commands/env";
import { runInstall } from "./commands/install";
import { runStatus } from "./commands/status";
import { runUpdate } from "./commands/update";
import { runUpdateTemplate } from "./commands/update-template";
import { runInteractive } from "./commands/default";
import { GlobalOptions } from "./commands/shared";
import { CliError, isUserCancellation } from "./lib/errors";
import { readCliVersion } from "./lib/version";

const program = new Command();

program
  .name("newbie")
  .description(
    "Newbie framework CLI: install modules from the newbie-modules registry and sync project files",
  )
  .version(readCliVersion())
  .option("-C, --cwd <dir>", "project root directory", process.cwd())
  .option(
    "--dry-run",
    "print planned changes without writing files or running mutating commands",
    false,
  )
  .option(
    "--skip-prisma-generate",
    "skip `npx prisma generate` after schema changes",
    false,
  );

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

async function run(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error) {
    if (isUserCancellation(error)) {
      console.info("\nOperation cancelled\n");
      process.exit(0);
    }
    if (error instanceof CliError) {
      console.error(red(`\n${error.message}\n`));
      process.exit(1);
    }
    console.error(red(`\n${(error as Error).message}\n`));
    if (process.env.NEWBIE_DEBUG && (error as Error).stack) {
      console.error((error as Error).stack);
    }
    process.exit(1);
  }
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
  .description(
    "View or edit the enabled-module list in modules.json without touching project files",
  )
  .option("--add <modules...>", "enable module(s), space or comma separated")
  .option(
    "--remove <modules...>",
    "disable module(s), space or comma separated",
  )
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
  .command("check")
  .description(
    "Check that every env variable required by enabled modules is present in .env",
  )
  .action(function (this: Command) {
    return run(() => runCheck(collectOptions(this)));
  });

program
  .command("update")
  .description(
    "Update enabled module copies to the registry HEAD commit (blocks on local drift unless --force)",
  )
  .option("--all", "select every module with an available update", false)
  .option("-y, --yes", "skip confirmation prompts", false)
  .option("--force", "overwrite locally drifted module copies", false)
  .action(function (this: Command) {
    const flags = this.opts();
    return run(() =>
      runUpdate({
        ...collectOptions(this),
        all: Boolean(flags.all),
        yes: Boolean(flags.yes),
        force: Boolean(flags.force),
      }),
    );
  });

program
  .command("apply")
  .description(
    'Non-interactively sync the module set declared in a JSON spec ({"modules": [...]})',
  )
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
  .description(
    "Audit the installation: registry pins, copied modules, drift, env and prisma wiring",
  )
  .action(function (this: Command) {
    return run(() => runDoctor(collectOptions(this)));
  });

program
  .command("status")
  .description("Print machine-readable project state as JSON")
  .option(
    "--drift",
    "include content drift against pinned pristine copies",
    false,
  )
  .action(function (this: Command) {
    const flags = this.opts();
    return run(() =>
      runStatus({ ...collectOptions(this), drift: Boolean(flags.drift) }),
    );
  });

program
  .command("create <name>")
  .description("Scaffold a new project from the basic template")
  .option(
    "--template-path <dir>",
    "use a local template directory instead of cloning the newbie repository",
  )
  .option(
    "--template-ref <ref>",
    "git ref of the newbie repository to clone the template from",
  )
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
  .option(
    "--template-path <dir>",
    "use a local template directory instead of cloning the newbie repository",
  )
  .option(
    "--template-ref <ref>",
    "git ref (e.g. a template tag) of the newbie repository to sync from",
  )
  .option(
    "--write",
    "apply the template version of differing skeleton files",
    false,
  )
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
  .description("Reserved entrypoint for the module-hub remote agent protocol")
  .action(function (this: Command) {
    return run(() => runAgent());
  });

const env = program
  .command("env")
  .description("Sync .env with AWS Secrets Manager");

env
  .command("pull")
  .description("Pull environment variables from AWS Secrets Manager into .env")
  .option(
    "-e, --environment <name>",
    "environment name from the env-tool config (skips the prompt)",
  )
  .option(
    "-y, --yes",
    "write .env without prompting (conflicting local values are kept)",
    false,
  )
  .action(function (this: Command) {
    const flags = this.opts();
    return run(() =>
      runEnvPull({
        ...collectOptions(this),
        environment: flags.environment as string | undefined,
        yes: Boolean(flags.yes),
      }),
    );
  });

env
  .command("push")
  .description("Push environment variables from .env to AWS Secrets Manager")
  .option(
    "-e, --environment <name>",
    "environment name from the env-tool config (skips the prompt)",
  )
  .option("-y, --yes", "create/update secrets without prompting", false)
  .action(function (this: Command) {
    const flags = this.opts();
    return run(() =>
      runEnvPush({
        ...collectOptions(this),
        environment: flags.environment as string | undefined,
        yes: Boolean(flags.yes),
      }),
    );
  });

program
  .command("interactive", { isDefault: true, hidden: true })
  .description("Interactive module enable/disable flow (default)")
  .action(function (this: Command) {
    return run(() => runInteractive(collectOptions(this)));
  });

program.parseAsync(process.argv);
