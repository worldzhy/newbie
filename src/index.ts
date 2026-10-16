#!/usr/bin/env node
import { Command } from "commander";
import { bold, red } from "colorette";

import { runInit } from "./commands/init";
import { runAdd } from "./commands/add";
import { runApits } from "./commands/apits";
import { doctorCommand } from "./commands/doctor";
import { runUpdate } from "./commands/update";

// Published package version, read at runtime (package.json sits one level
// above both src/ during development and dist/ in the published tarball).
export const VERSION = (require("../package.json") as { version: string }).version;

const program = new Command();

program
  .name("fewbie")
  .description(
    "Fewbie frontend framework CLI: scaffold Next.js projects and install business components from the fewbie registry",
  )
  .version(VERSION)
  .option("-C, --cwd <dir>", "project root directory", process.cwd())
  // Commander treats a bare invocation as an error (help + exit 1) when the
  // program has subcommands but no own action; register one so `fewbie` with
  // no arguments simply prints help and exits 0.
  .action(() => {
    program.outputHelp();
    console.log(`\n${bold("@devbie/fewbie-cli")} ${VERSION}`);
  });

// Create a project from the fewbie-starter template repository (cloned at its
// root) via the shared resolver chain: --template-path -> git clone --branch.
program
  .command("init <project-name>")
  .description("create a new project from the fewbie basic template")
  .option("--template-path <dir>", "use a local template directory instead of cloning fewbie-starter")
  .option("--template-ref <ref>", "git ref of fewbie-starter to clone the template from")
  .option("--no-git-init", "skip 'git init' in the new project", undefined)
  .action(async function (this: Command, projectName: string) {
    const flags = this.optsWithGlobals();
    await runInit({
      name: projectName,
      cwd: (flags.cwd as string) ?? process.cwd(),
      templatePath: flags.templatePath as string | undefined,
      templateRef: flags.templateRef as string | undefined,
      gitInit: flags.gitInit as boolean | undefined,
    });
  });

// M2: copy components/logic utils from the shadcn-compatible fewbie registry.
program
  .command("add <names...>")
  .description("add one or more components or logic utils from the fewbie registry")
  .option("-f, --force", "overwrite files that already exist", false)
  .option("--skip-install", "do not run npm install for missing dependencies", false)
  .option("--with-login-form", "also install the login-form block (e.g. `fewbie add auth --with-login-form`)", false)
  .action(async function (this: Command, names: string[]) {
    const flags = this.optsWithGlobals();
    await runAdd({
      names,
      cwd: (flags.cwd as string) ?? process.cwd(),
      force: Boolean(flags.force),
      skipInstall: Boolean(flags.skipInstall),
      withLoginForm: Boolean(flags.withLoginForm),
    });
  });

// Thin wrapper around the apits-gen OpenAPI -> TS request generator.
program
  .command("apits [input]")
  .description(
    "generate typed API request code from an OpenAPI document (URL or local JSON/YAML); the first run scaffolds apits.config.ts",
  )
  .option("-n, --name <name>", "only generate the config source with this name")
  .option("-w, --watch", "watch a local OpenAPI document and regenerate on change", false)
  .option("--skip-install", "do not install the generator dev dependency", false)
  .action(async function (this: Command, input: string) {
    const flags = this.optsWithGlobals();
    await runApits({
      input,
      name: flags.name as string | undefined,
      watch: Boolean(flags.watch),
      skipInstall: Boolean(flags.skipInstall),
      cwd: (flags.cwd as string) ?? process.cwd(),
    });
  });

// Health check: project structure, installed registry items, dependencies,
// design tokens, and AI-readability.
program
  .command("doctor")
  .description("check project health (structure, registry items, dependencies, tokens)")
  .option("--json", "emit machine-readable JSON", false)
  .action(async function (this: Command) {
    const flags = this.optsWithGlobals();
    await doctorCommand({
      cwd: (flags.cwd as string) ?? process.cwd(),
      json: Boolean(flags.json),
    });
  });

// Update installed registry items to the latest registry source. Prints a
// unified diff by default; --write applies the changes.
program
  .command("update [names...]")
  .description("show (or apply with --write) updates for installed registry items")
  .option("-w, --write", "apply the updates instead of only printing diffs", false)
  .action(async function (this: Command, names: string[]) {
    const flags = this.optsWithGlobals();
    await runUpdate({
      cwd: (flags.cwd as string) ?? process.cwd(),
      write: Boolean(flags.write),
      names: names.length > 0 ? names : undefined,
    });
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`${red("error")} ${message}`);
  process.exit(1);
});
