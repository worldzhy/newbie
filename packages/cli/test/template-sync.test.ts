import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  extractMarkerBlock,
  MARKER_END,
  MARKER_START,
  planTemplateSync,
  replaceMarkerBlock,
  SKELETON_FILES,
} from "../src/core/template-sync";

const TEMPLATE_BLOCK = `${MARKER_START}
generator client {
  provider = "prisma-client"
}
${MARKER_END}`;

const OLD_BLOCK = `${MARKER_START}
generator client {
  provider = "prisma-client-js"
}
${MARKER_END}`;

function schemaWith(block: string, tail = ""): string {
  return `// header comment\n${block}\n${tail}`;
}

/** Full-content maps where project and template are identical. */
function identicalMaps(): {
  project: Map<string, string | null>;
  template: Map<string, string | null>;
} {
  const project = new Map<string, string | null>();
  const template = new Map<string, string | null>();
  for (const file of SKELETON_FILES) {
    const content =
      file.strategy === "marker-block"
        ? schemaWith(TEMPLATE_BLOCK, 'model User {\n  id Int @id\n}\n')
        : `// ${file.path}\n`;
    project.set(file.path, content);
    template.set(file.path, content);
  }
  return { project, template };
}

describe("extractMarkerBlock", () => {
  it("returns the block including both markers", () => {
    const content = schemaWith(TEMPLATE_BLOCK, "model User {}\n");
    assert.equal(extractMarkerBlock(content), TEMPLATE_BLOCK);
  });

  it("returns null when a marker is missing or inverted", () => {
    assert.equal(extractMarkerBlock("no markers here"), null);
    assert.equal(extractMarkerBlock(`${MARKER_END}\n${MARKER_START}`), null);
  });
});

describe("replaceMarkerBlock", () => {
  it("replaces only the block and preserves business content", () => {
    const content = schemaWith(OLD_BLOCK, "model User {\n  id Int @id\n}\n");
    const next = replaceMarkerBlock(content, TEMPLATE_BLOCK);
    assert.ok(next !== null);
    assert.match(next, /provider = "prisma-client"/);
    assert.match(next, /model User \{/);
    assert.doesNotMatch(next, /prisma-client-js/);
  });

  it("returns null when the project file has no markers", () => {
    assert.equal(replaceMarkerBlock("model User {}", TEMPLATE_BLOCK), null);
  });
});

describe("planTemplateSync", () => {
  it("is empty when project matches the template", () => {
    const { project, template } = identicalMaps();
    assert.deepEqual(planTemplateSync(project, template), []);
  });

  it("flags differing whole-file skeletons as update", () => {
    const { project, template } = identicalMaps();
    project.set("tsconfig.json", '{ "old": true }\n');
    const changes = planTemplateSync(project, template);
    assert.equal(changes.length, 1);
    assert.equal(changes[0].file.path, "tsconfig.json");
    assert.equal(changes[0].kind, "update");
    assert.equal(changes[0].nextContent, template.get("tsconfig.json"));
  });

  it("flags skeleton files missing from the project as create", () => {
    const { project, template } = identicalMaps();
    project.set("nest-cli.json", null);
    const changes = planTemplateSync(project, template);
    assert.equal(changes.length, 1);
    assert.equal(changes[0].kind, "create");
    assert.equal(changes[0].currentComparable, null);
  });

  it("skips files the template no longer ships", () => {
    const { project, template } = identicalMaps();
    template.set("tsconfig.build.json", null);
    assert.deepEqual(planTemplateSync(project, template), []);
  });

  it("compares only the marker block of prisma/schema.prisma", () => {
    const { project, template } = identicalMaps();
    // Business part differs, framework block identical -> no change.
    project.set(
      "prisma/schema.prisma",
      schemaWith(TEMPLATE_BLOCK, "model Order {\n  id Int @id\n}\n"),
    );
    assert.deepEqual(planTemplateSync(project, template), []);

    // Framework block differs -> update preserving the business tail.
    project.set(
      "prisma/schema.prisma",
      schemaWith(OLD_BLOCK, "model Order {\n  id Int @id\n}\n"),
    );
    const changes = planTemplateSync(project, template);
    assert.equal(changes.length, 1);
    assert.equal(changes[0].kind, "update");
    assert.match(changes[0].nextContent ?? "", /model Order \{/);
    assert.match(changes[0].nextContent ?? "", /provider = "prisma-client"/);
  });

  it("reports missing-markers when the project schema lost its markers", () => {
    const { project, template } = identicalMaps();
    project.set("prisma/schema.prisma", "model User {\n  id Int @id\n}\n");
    const changes = planTemplateSync(project, template);
    assert.equal(changes.length, 1);
    assert.equal(changes[0].kind, "missing-markers");
    assert.equal(changes[0].nextContent, null);
  });

  it("throws when the template schema lost its markers", () => {
    const { project, template } = identicalMaps();
    template.set("prisma/schema.prisma", "generator client {}\n");
    assert.throws(() => planTemplateSync(project, template), /marker|block/i);
  });

  it("is idempotent: applying the plan yields an empty follow-up plan", () => {
    const { project, template } = identicalMaps();
    project.set("src/main.ts", "// stale main\n");
    project.set("tsconfig.json", null);
    project.set(
      "prisma/schema.prisma",
      schemaWith(OLD_BLOCK, "model Order {\n  id Int @id\n}\n"),
    );
    const changes = planTemplateSync(project, template);
    assert.equal(changes.length, 3);
    for (const change of changes) {
      assert.ok(change.nextContent !== null);
      project.set(change.file.path, change.nextContent);
    }
    assert.deepEqual(planTemplateSync(project, template), []);
  });
});
