import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadModuleCliEntry } from "../src/lib/module-cli";
import { ModuleManifest } from "../src/core/module-manifest";

const manifestWithoutCli = {
  key: "account",
  module: { file: "account.module", className: "AccountModule" },
} as unknown as ModuleManifest;

const manifestWithCli = {
  key: "secrets",
  module: { file: "secrets.module", className: "SecretsModule" },
  cli: "secrets",
} as unknown as ModuleManifest;

describe("loadModuleCliEntry", () => {
  it("returns null when the manifest does not declare a cli namespace", async () => {
    const loaded = await loadModuleCliEntry("/tmp", "account", manifestWithoutCli);
    assert.equal(loaded, null);
  });

  it("throws a CliError when the entry file is missing", async () => {
    await assert.rejects(
      () => loadModuleCliEntry("/tmp", "missing", manifestWithCli),
      /declares cli='secrets' but entry.*is missing/,
    );
  });
});

describe("registerModuleCommands", () => {
  it("is a no-op when the project has no modules.json", async () => {
    const { registerModuleCommands } = await import("../src/lib/module-cli");
    const { Command } = await import("commander");
    const program = new Command();
    // /nonexistent/path has no modules.json; the loader must skip silently.
    await registerModuleCommands(program, { cwd: "/nonexistent/path", dryRun: false, skipPrismaGenerate: false });
    assert.equal(program.commands.length, 0);
  });
});
