#!/usr/bin/env node
import { Command } from "commander";
import { bold, red, yellow } from "colorette";

// Published package version, read at runtime (package.json sits one level
// above both src/ during development and dist/ in the published tarball).
export const VERSION = (require("../package.json") as { version: string })
  .version;

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

// Report a milestone placeholder invocation. Commands are registered from M1
// onwards; until then they exist so the command surface is discoverable.
function notImplemented(command: string, milestone: string): void {
  console.error(
    `${red("error")} \`fewbie ${command}\` is not implemented yet (planned in ${yellow(milestone)}).`,
  );
  process.exitCode = 1;
}

// M1: create a project from templates/basic via the same resolver chain as
// `newbie create` (--template-path -> monorepo template -> git clone --branch).
program
  .command("init <project-name>")
  .description("create a new project from the fewbie basic template")
  .option("--template-path <dir>", "use a local template directory")
  .option("--template-ref <ref>", "git ref (tag/branch/commit) of the template")
  .action(() => notImplemented("init", "M1"));

// M2: copy a component/logic util from the shadcn-compatible fewbie registry.
program
  .command("add <name>")
  .description("add a component or logic util from the fewbie registry")
  .action(() => notImplemented("add", "M2"));

// M3: thin wrapper around the apits OpenAPI -> TS request generator.
const gen = program.command("gen").description("code generation");
gen
  .command("api")
  .description("generate typed API request code from an OpenAPI schema")
  .action(() => notImplemented("gen api", "M3"));

// v1 surface intentionally stops here. `doctor` and `update` are planned
// after the 0.1.0 release.

program.parse(process.argv);
