import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";

import { readSpec } from "../src/commands/apply";
import { parseKeysFlag } from "../src/commands/update";
import { CliError } from "../src/lib/errors";

describe("parseKeysFlag", () => {
  it("returns undefined for a missing flag", () => {
    assert.equal(parseKeysFlag(undefined), undefined);
  });

  it("splits comma and space separated chunks and dedupes", () => {
    assert.deepEqual(parseKeysFlag(["a,b", " c ", "d,e", "a"]), ["a", "b", "c", "d", "e"]);
  });

  it("drops empty chunks", () => {
    assert.deepEqual(parseKeysFlag(["", ",", " a ,,"]), ["a"]);
  });
});

describe("readSpec", () => {
  let dir: string;

  before(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "newbie-apply-spec-"));
  });

  after(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  async function writeSpec(name: string, content: string): Promise<string> {
    const file = path.join(dir, name);
    await fs.writeFile(file, content, "utf8");
    return file;
  }

  it("reads a valid spec", async () => {
    const file = await writeSpec("valid.json", JSON.stringify({ modules: ["account", "workflow"] }));
    assert.deepEqual(await readSpec(file), ["account", "workflow"]);
  });

  it("rejects a missing spec file", async () => {
    await assert.rejects(readSpec(path.join(dir, "missing.json")), (error: unknown) => {
      assert.ok(error instanceof CliError);
      assert.match(error.message, /Cannot read apply spec/);
      return true;
    });
  });

  it("rejects invalid JSON", async () => {
    const file = await writeSpec("broken.json", "{ not json");
    await assert.rejects(readSpec(file), (error: unknown) => {
      assert.ok(error instanceof CliError);
      assert.match(error.message, /Invalid JSON in apply spec/);
      return true;
    });
  });

  it("rejects a spec whose modules field is not a string array", async () => {
    const file = await writeSpec("wrong-type.json", JSON.stringify({ modules: "account" }));
    await assert.rejects(readSpec(file), (error: unknown) => {
      assert.ok(error instanceof CliError);
      assert.match(error.message, /must contain a string array "modules"/);
      return true;
    });
  });

  it("rejects a spec without a modules field", async () => {
    const file = await writeSpec("no-modules.json", JSON.stringify({ other: [] }));
    await assert.rejects(readSpec(file), (error: unknown) => {
      assert.ok(error instanceof CliError);
      assert.match(error.message, /must contain a string array "modules"/);
      return true;
    });
  });
});
