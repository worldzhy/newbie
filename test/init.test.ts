import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, describe, it } from "node:test";

import { resolveTemplate, runInit } from "../src/commands/init";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

describe("resolveTemplate", () => {
  it("uses an explicit template path when given", async () => {
    const templateDir = await makeTempDir("fewbie-test-template-");
    after(async () => fs.rm(templateDir, { recursive: true, force: true }));
    await fs.writeFile(path.join(templateDir, "package.json"), "{}");

    const resolved = await resolveTemplate({ templatePath: templateDir });
    assert.equal(resolved.root, path.resolve(templateDir));
  });

  it("falls back to the monorepo checkout inside the fewbie repository", async () => {
    const resolved = await resolveTemplate({});
    assert.ok(resolved.source.startsWith("monorepo checkout"));
    await assert.doesNotReject(() => fs.access(path.join(resolved.root, "package.json")));
  });
});

describe("runInit", () => {
  it("rejects invalid project names without touching the filesystem", async () => {
    await assert.rejects(runInit({ name: "Bad Name" }), /Invalid project name/);
    await assert.rejects(runInit({ name: "" }), /Invalid project name/);
  });

  it("rejects a non-empty target directory", async () => {
    const parent = await makeTempDir("fewbie-test-init-");
    after(async () => fs.rm(parent, { recursive: true, force: true }));
    await fs.mkdir(path.join(parent, "proj"));
    await fs.writeFile(path.join(parent, "proj", "keep.txt"), "x");

    await assert.rejects(runInit({ name: "proj", cwd: parent }), /not empty/);
  });

  it("copies the template and rewrites the package name", async () => {
    const parent = await makeTempDir("fewbie-test-init-");
    after(async () => fs.rm(parent, { recursive: true, force: true }));

    await runInit({ name: "my-app", cwd: parent, gitInit: false });

    const target = path.join(parent, "my-app");
    const pkg = JSON.parse(await fs.readFile(path.join(target, "package.json"), "utf8")) as { name?: string };
    assert.equal(pkg.name, "my-app");
    await assert.doesNotReject(() => fs.access(path.join(target, "src", "app", "page.tsx")));
    await assert.doesNotReject(() => fs.access(path.join(target, ".env.example")));
    await assert.rejects(() => fs.access(path.join(target, "node_modules")));
  });
});
