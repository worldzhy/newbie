import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  moduleSchemaNamespace,
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
    const next = updateDatasourceSchemas(SCHEMA, ["microservice/account"], []);
    assert.match(
      next,
      /schemas\s*=\s*\["application", "microservice\/account"\]/,
    );
  });

  it("removes disabled namespaces and keeps others", () => {
    const withTwo = updateDatasourceSchemas(
      SCHEMA,
      ["microservice/account", "microservice/workflow"],
      [],
    );
    const removed = updateDatasourceSchemas(
      withTwo,
      [],
      ["microservice/account"],
    );
    assert.match(removed, /"microservice\/workflow"/);
    assert.doesNotMatch(removed, /"microservice\/account"/);
    assert.match(removed, /"application"/);
  });

  it("is idempotent", () => {
    const once = updateDatasourceSchemas(SCHEMA, ["microservice/account"], []);
    const twice = updateDatasourceSchemas(once, ["microservice/account"], []);
    assert.equal(once, twice);
  });

  it("leaves content without a schemas array untouched", () => {
    const content = 'datasource db {\n  provider = "postgresql"\n}\n';
    assert.equal(
      updateDatasourceSchemas(content, ["microservice/account"], []),
      content,
    );
  });

  it("throws on an unparsable schemas array", () => {
    const broken = "datasource db {\n  schemas = [,]\n}\n";
    assert.throws(() => updateDatasourceSchemas(broken, ["x"], []));
  });

  it("silently ignores a datasource block without any schemas array", () => {
    const broken =
      'datasource db {\n  provider = "postgresql"\n  schemas =\n}\n';
    assert.equal(updateDatasourceSchemas(broken, ["x"], []), broken);
  });
});

describe("moduleSchemaNamespace", () => {
  it("uses the microservice/ namespace convention", () => {
    assert.equal(moduleSchemaNamespace("aws-s3"), "microservice/aws-s3");
  });
});
