import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  moduleImportLine,
  normalizeModuleManifest,
} from "../src/core/module-manifest";

const valid = {
  key: "account",
  module: { file: "account.module", className: "AccountModule" },
  schema: "prisma/schema.prisma",
  env: { ACCOUNT_SECRET: "<PLEASE_SET_THIS_VALUE>" },
};

describe("normalizeModuleManifest", () => {
  it("accepts a well-formed manifest", () => {
    const manifest = normalizeModuleManifest(valid);
    assert.equal(manifest.key, "account");
    assert.equal(manifest.module.className, "AccountModule");
    assert.equal(manifest.schema, "prisma/schema.prisma");
  });

  it("rejects non-objects and missing keys", () => {
    assert.throws(() => normalizeModuleManifest(null), /object/);
    assert.throws(() => normalizeModuleManifest({ ...valid, key: "" }), /key/);
  });

  it("rejects incomplete module wiring", () => {
    assert.throws(
      () => normalizeModuleManifest({ key: "a", module: { file: "a" } }),
      /module\.file and module\.className/,
    );
  });

  it("enforces the expected directory key", () => {
    assert.throws(
      () => normalizeModuleManifest(valid, "workflow"),
      /does not match directory/,
    );
  });

  it("drops a non-string schema field", () => {
    const manifest = normalizeModuleManifest({ ...valid, schema: 42 });
    assert.equal(manifest.schema, undefined);
  });
});

describe("moduleImportLine", () => {
  it("points at the copied directory and manifest module file", () => {
    assert.equal(
      moduleImportLine("account", normalizeModuleManifest(valid)),
      "import {AccountModule} from './account/account.module';",
    );
  });
});
