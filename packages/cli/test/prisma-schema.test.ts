import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  moduleSchemaNamespace,
  readDatasourceSchemas,
  reconcileDatasourceSchemas,
  updateDatasourceSchemas,
} from "../src/core/prisma-schema";

const SCHEMA = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["application"]
}

generator client {
  provider = "prisma-client-js"
}
`;

describe("updateDatasourceSchemas", () => {
  it("appends module namespaces while preserving application", () => {
    const next = updateDatasourceSchemas(SCHEMA, ["module/account"], []);
    assert.match(next, /schemas\s*=\s*\["application", "module\/account"\]/);
  });

  it("removes disabled namespaces and keeps others", () => {
    const withTwo = updateDatasourceSchemas(SCHEMA, ["module/account", "module/workflow"], []);
    const removed = updateDatasourceSchemas(withTwo, [], ["module/account"]);
    assert.match(removed, /"module\/workflow"/);
    assert.doesNotMatch(removed, /"module\/account"/);
    assert.match(removed, /"application"/);
  });

  it("is idempotent", () => {
    const once = updateDatasourceSchemas(SCHEMA, ["module/account"], []);
    const twice = updateDatasourceSchemas(once, ["module/account"], []);
    assert.equal(once, twice);
  });

  it("leaves content without a schemas array untouched", () => {
    const content = 'datasource db {\n  provider = "postgresql"\n}\n';
    assert.equal(updateDatasourceSchemas(content, ["module/account"], []), content);
  });

  it("throws on an unparsable schemas array", () => {
    const broken = "datasource db {\n  schemas = [,]\n}\n";
    assert.throws(() => updateDatasourceSchemas(broken, ["x"], []));
  });

  it("silently ignores a datasource block without any schemas array", () => {
    const broken = 'datasource db {\n  provider = "postgresql"\n  schemas =\n}\n';
    assert.equal(updateDatasourceSchemas(broken, ["x"], []), broken);
  });
});

describe("reconcileDatasourceSchemas", () => {
  it("sets module entries to exactly the supplied namespaces", () => {
    const withOrphans = updateDatasourceSchemas(
      SCHEMA,
      ["module/account", "module/llm-agent", "module/workflow"],
      [],
    );
    const next = reconcileDatasourceSchemas(withOrphans, ["module/account", "module/copilot"]);
    const schemas = readDatasourceSchemas(next);
    assert.deepEqual(schemas, ["application", "module/account", "module/copilot"]);
  });

  it("preserves non-module entries when clearing all modules", () => {
    const withModules = updateDatasourceSchemas(SCHEMA, ["module/account", "module/workflow"], []);
    const next = reconcileDatasourceSchemas(withModules, []);
    assert.deepEqual(readDatasourceSchemas(next), ["application"]);
  });

  it("is idempotent", () => {
    const once = reconcileDatasourceSchemas(SCHEMA, ["module/account"]);
    const twice = reconcileDatasourceSchemas(once, ["module/account"]);
    assert.equal(once, twice);
  });

  it("deduplicates entries", () => {
    const next = reconcileDatasourceSchemas(SCHEMA, ["module/account", "module/account"]);
    assert.deepEqual(readDatasourceSchemas(next), ["application", "module/account"]);
  });

  it("leaves content without a schemas array untouched", () => {
    const content = 'datasource db {\n  provider = "postgresql"\n}\n';
    assert.equal(reconcileDatasourceSchemas(content, ["module/account"]), content);
  });
});

describe("moduleSchemaNamespace", () => {
  it("uses the module/ namespace convention", () => {
    assert.equal(moduleSchemaNamespace("aws-s3"), "module/aws-s3");
  });
});

describe("readDatasourceSchemas", () => {
  it("parses the current schemas list", () => {
    assert.deepEqual(readDatasourceSchemas(SCHEMA), ["application"]);
  });

  it("returns null when the array is absent", () => {
    assert.equal(readDatasourceSchemas('datasource db {\n provider = "postgresql"\n}\n'), null);
  });
});
