import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";

import { runUpdateTemplate } from "../src/commands/update-template";
import { CliError } from "../src/lib/errors";

/**
 * Exercises runUpdateTemplate against a local template directory
 * (--template-path), so no git clone happens.
 */
describe("runUpdateTemplate --check", () => {
  let project: string;
  let template: string;

  before(async () => {
    project = await fs.mkdtemp(path.join(os.tmpdir(), "newbie-ut-project-"));
    template = await fs.mkdtemp(path.join(os.tmpdir(), "newbie-ut-template-"));
    // resolveTemplate requires a package.json at the template root.
    await fs.writeFile(path.join(template, "package.json"), "{}", "utf8");
  });

  after(async () => {
    await fs.rm(project, { recursive: true, force: true });
    await fs.rm(template, { recursive: true, force: true });
  });

  it("passes when nothing drifts", async () => {
    await runUpdateTemplate({ cwd: project, templatePath: template, check: true, dryRun: false });
  });

  it("rejects with CliError when a skeleton file drifts", async () => {
    await fs.mkdir(path.join(template, "deploy/scripts"), { recursive: true });
    await fs.writeFile(path.join(template, "deploy/scripts/lib.sh"), "# template\n", "utf8");
    await assert.rejects(
      runUpdateTemplate({ cwd: project, templatePath: template, check: true, dryRun: false }),
      (error: unknown) => {
        assert.ok(error instanceof CliError);
        assert.match(error.message, /drift from the template/);
        return true;
      },
    );
  });

  it("passes again once the drift is applied with --write", async () => {
    await runUpdateTemplate({ cwd: project, templatePath: template, write: true, dryRun: false });
    assert.equal(await fs.readFile(path.join(project, "deploy/scripts/lib.sh"), "utf8"), "# template\n");
    await runUpdateTemplate({ cwd: project, templatePath: template, check: true, dryRun: false });
  });

  it("rejects --check combined with --write", async () => {
    await assert.rejects(
      runUpdateTemplate({ cwd: project, templatePath: template, check: true, write: true, dryRun: false }),
      (error: unknown) => {
        assert.ok(error instanceof CliError);
        assert.match(error.message, /mutually exclusive/);
        return true;
      },
    );
  });
});

describe("runUpdateTemplate path filter", () => {
  let project: string;
  let template: string;

  before(async () => {
    project = await fs.mkdtemp(path.join(os.tmpdir(), "newbie-utf-project-"));
    template = await fs.mkdtemp(path.join(os.tmpdir(), "newbie-utf-template-"));
    await fs.writeFile(path.join(template, "package.json"), "{}", "utf8");
    // Drift outside any deploy/ scope: tsconfig differs.
    await fs.writeFile(path.join(template, "tsconfig.json"), '{ "from": "template" }\n', "utf8");
    await fs.writeFile(path.join(project, "tsconfig.json"), '{ "from": "project" }\n', "utf8");
    // In-sync deploy file so the deploy/ scope itself is green.
    await fs.mkdir(path.join(template, "deploy/scripts"), { recursive: true });
    await fs.mkdir(path.join(project, "deploy/scripts"), { recursive: true });
    await fs.writeFile(path.join(template, "deploy/scripts/lib.sh"), "# same\n", "utf8");
    await fs.writeFile(path.join(project, "deploy/scripts/lib.sh"), "# same\n", "utf8");
  });

  after(async () => {
    await fs.rm(project, { recursive: true, force: true });
    await fs.rm(template, { recursive: true, force: true });
  });

  it("passes with a deploy/ filter when the drift lives outside the scope", async () => {
    await runUpdateTemplate({ cwd: project, templatePath: template, check: true, dryRun: false, paths: ["deploy/"] });
  });

  it("accepts a directory prefix without a trailing slash", async () => {
    await runUpdateTemplate({ cwd: project, templatePath: template, check: true, dryRun: false, paths: ["deploy"] });
  });

  it("rejects when the drift is inside the filtered scope", async () => {
    await assert.rejects(
      runUpdateTemplate({ cwd: project, templatePath: template, check: true, dryRun: false, paths: ["tsconfig.json"] }),
      (error: unknown) => {
        assert.ok(error instanceof CliError);
        assert.match(error.message, /drift from the template/);
        return true;
      },
    );
  });

  it("rejects a filter matching no skeleton files (fail fast on CI typos)", async () => {
    await assert.rejects(
      runUpdateTemplate({ cwd: project, templatePath: template, check: true, dryRun: false, paths: ["nonexistent/"] }),
      (error: unknown) => {
        assert.ok(error instanceof CliError);
        assert.match(error.message, /No skeleton files match/);
        return true;
      },
    );
  });
});
