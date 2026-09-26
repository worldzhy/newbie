import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  MODULES_MARKER_END,
  MODULES_MARKER_START,
  envValues,
  parseEnv,
  pruneEmptySections,
  removeEnvKeys,
  replaceMarkedBlock,
  serializeEnv,
  upsertEnvSection,
} from "../src/core/env-file";

describe("parseEnv / serializeEnv", () => {
  it("parses blank lines, comments and entries", () => {
    const lines = parseEnv("# header\n\nFOO=bar\n# trailing comment\n");
    assert.deepEqual(lines, [
      { kind: "comment", text: "# header" },
      { kind: "blank" },
      { kind: "entry", key: "FOO", value: "bar" },
      { kind: "comment", text: "# trailing comment" },
    ]);
  });

  it("strips quotes and handles export prefix", () => {
    const values = envValues(parseEnv("export A=\"x y\"\nexport B='z'\nC=`t`"));
    assert.deepEqual(values, { A: "x y", B: "z", C: "t" });
  });

  it("round-trips user content without dropping comments", () => {
    const content = "# my comment\nFOO=bar\n\nBAR=baz\n";
    assert.equal(serializeEnv(parseEnv(content)), content);
  });

  it("quotes values containing inline comments", () => {
    const out = serializeEnv([{ kind: "entry", key: "A", value: "x # y" }]);
    assert.equal(out, 'A="x # y"\n');
    assert.deepEqual(envValues(parseEnv(out)), { A: "x # y" });
  });
});

describe("removeEnvKeys", () => {
  it("removes only matched entries, keeping comments", () => {
    const lines = parseEnv("# h\nA=1\nB=2\nC=3\n");
    const next = removeEnvKeys(lines, new Set(["A", "C"]));
    assert.deepEqual(envValues(next), { B: "2" });
    assert.ok(
      next.some((line) => line.kind === "comment" && line.text === "# h"),
    );
  });
});

describe("upsertEnvSection", () => {
  it("appends a new titled section", () => {
    const lines = upsertEnvSection(parseEnv("APP_NAME=Newbie\n"), "Account", {
      ACCOUNT_REDIS_HOST: "",
    });
    const text = serializeEnv(lines);
    assert.ok(text.includes("# ! Account variables"));
    assert.ok(text.includes("ACCOUNT_REDIS_HOST="));
  });

  it("is idempotent and never overwrites existing keys", () => {
    const once = upsertEnvSection(parseEnv(""), "Account", { A: "1" });
    const twice = upsertEnvSection(once, "Account", { A: "2", B: "3" });
    const values = envValues(twice);
    assert.equal(values.A, "1");
    assert.equal(values.B, "3");
    assert.equal(serializeEnv(twice).match(/A=/g)?.length, 1);
  });
});

describe("pruneEmptySections", () => {
  it("removes section blocks left without entries", () => {
    const lines = pruneEmptySections(
      upsertEnvSection(parseEnv(""), "Account", { A: "1" }).filter(
        (line) => line.kind !== "entry" || line.key !== "A",
      ),
    );
    assert.ok(!serializeEnv(lines).includes("Account variables"));
  });
});

describe("replaceMarkedBlock", () => {
  it("appends the block when markers are absent", () => {
    const out = replaceMarkedBlock("APP_NAME=Newbie\n", "BODY=1\n");
    assert.ok(out.includes("APP_NAME=Newbie\n"));
    assert.ok(out.includes(MODULES_MARKER_START));
    assert.ok(out.includes("BODY=1"));
    assert.ok(out.includes(MODULES_MARKER_END));
  });

  it("replaces only the marked block on subsequent runs", () => {
    const first = replaceMarkedBlock("APP_NAME=Newbie\n", "A=1\n");
    const second = replaceMarkedBlock(first, "B=2\n");
    assert.ok(!second.includes("A=1"));
    assert.ok(second.includes("B=2"));
    assert.ok(second.includes("APP_NAME=Newbie"));
    assert.equal(
      second.match(new RegExp(MODULES_MARKER_START, "g"))?.length,
      1,
    );
  });
});
