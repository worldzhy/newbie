/**
 * Minimal assertion-based entry point for `npm test`.
 *
 * The pre-existing test files (gen.ts / requestTest.ts / json-schema-to-typescript.ts
 * / to-json-schema.ts) are demo drivers that fetch a live spec and run the
 * generator without any assertions, so regressions pass silently. This file
 * pins the P0 generator fixes (G-1 nullable, G-2 path-param literal,
 * G-3 degenerate body, G-4 multipart form-data) so future edits cannot
 * quietly reintroduce them.
 *
 * Run with: `npm test` (tsx watch test/index.ts).
 */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { processJsonSchema, jsonSchemaToTsCode, getRequestDataJsonSchema } from "../src/utils/utils";
import { openApiToInterfaces } from "../src/utils/openApiToInterfaces";
import { Generator } from "../src/core/generator";
import { defineConfig } from "../src/utils/helpers";
import { RequestBodyType, Required } from "../src/types";

async function main(): Promise<void> {
  // ---------------------------------------------------------------------------
  // G-1: OpenAPI `nullable: true` must normalize to JSON Schema `type: [..., 'null']`
  // so json-schema-to-typescript emits `T | null`. Before the fix,
  // `processJsonSchema` returned early and `nullable` was silently dropped.
  // ---------------------------------------------------------------------------

  // Scalar string + nullable -> type array with 'null', nullable removed.
  const nullableString = processJsonSchema({ type: "string", nullable: true } as any);
  assert.ok(Array.isArray(nullableString.type), "G-1: type should become an array");
  assert.deepStrictEqual(nullableString.type, ["string", "null"]);
  assert.strictEqual(nullableString.nullable, undefined, "G-1: nullable flag must be removed");

  // Nested property nullable is normalized by the recursive walker.
  const nested = processJsonSchema({
    type: "object",
    properties: { middleName: { type: "string", nullable: true } },
  } as any);
  assert.deepStrictEqual(
    nested.properties!.middleName.type,
    ["string", "null"],
    "G-1: nested nullable property should normalize",
  );

  // Enum schema + nullable -> null literal appended to the enum array.
  const enumNullable = processJsonSchema({ enum: ["active", "archived"], nullable: true } as any);
  assert.ok(enumNullable.enum.includes(null), "G-1: enum should include null");
  assert.strictEqual(enumNullable.nullable, undefined);

  // ---------------------------------------------------------------------------
  // G-3: A degenerate request body (bare primitive like `{type:'string'}`,
  // produced when Nest cannot reflect a DTO schema) must be coerced to an
  // object-less schema so path/query params merge cleanly instead of
  // producing `{id: number} & string`.
  // ---------------------------------------------------------------------------

  const interfaceInfo = {
    req_body_type: RequestBodyType.json,
    req_body_other: JSON.stringify({ type: "string" }),
    req_body_is_json_schema: true,
    req_query: [],
    req_params: [{ name: "id", type: "integer", required: Required.true, desc: "path id" }],
  } as any;

  const requestSchema = getRequestDataJsonSchema(interfaceInfo);
  assert.strictEqual(requestSchema.type, undefined, "G-3: degenerate body type should be stripped before merge");
  assert.ok(
    requestSchema.properties && requestSchema.properties.id,
    "G-3: path param should attach to the coerced schema",
  );

  // ---------------------------------------------------------------------------
  // G-2: Merging path params onto a `$ref` body must emit `Ref & { id: number }`
  // and never serialize type names as string literals (`{id: "integer"}` ->
  // `id: "integer"` is a string-literal type, not a number).
  // G-3 (end-to-end): the compiled type must not contain `& string`.
  // ---------------------------------------------------------------------------

  const refSchema = {
    $ref: "#/components/schemas/UpdateUserDto",
    properties: { id: { type: "integer" } },
    required: ["id"],
  };
  const refCode = await jsonSchemaToTsCode(refSchema as any, "PatchUserRequest");
  assert.ok(refCode.includes("UpdateUserDto"), `G-2: should reference UpdateUserDto. Got: ${refCode}`);
  assert.ok(/id:\s*number/.test(refCode), `G-2: should map integer path param to number. Got: ${refCode}`);
  assert.ok(
    !/["']string["']/.test(refCode) && !/["']integer["']/.test(refCode),
    `G-2: must not serialize type names as string literals. Got: ${refCode}`,
  );
  assert.ok(!/&\s*string/.test(refCode), `G-3: must not contain '& string'. Got: ${refCode}`);

  // Degenerate-body path: compile the G-3 schema and assert no `& string`.
  const degenerateCode = await jsonSchemaToTsCode(requestSchema, "PatchXxxRequest");
  assert.ok(!/&\s*string/.test(degenerateCode), `G-3: no '& string' in compiled type. Got: ${degenerateCode}`);

  console.log("\n  ✓ all generator regression tests passed (G-1, G-2, G-3)\n");

  // ---------------------------------------------------------------------------
  // G-4: OAS3 multipart/form-data endpoints must be converted end-to-end:
  //   1. handleRequestBody reads requestBody.content directly and sets
  //      req_body_type='form' + req_body_multipart=true.
  //   2. Binary arrays (type:'array', items:{format:'binary'}) are detected
  //      and marked with isArray so the type renders as File[] not File.
  //   3. The generated request function builds FormData at runtime instead
  //      of passing a raw object that the client would JSON-stringify.
  // ---------------------------------------------------------------------------

  const multipartSpec = {
    openapi: "3.0.0",
    info: { title: "G-4 Test", version: "1.0.0" },
    paths: {
      "/upload": {
        post: {
          summary: "Upload files",
          tags: ["upload"],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    file: { type: "string", format: "binary", description: "single file" },
                    files: {
                      type: "array",
                      items: { type: "string", format: "binary" },
                      description: "multi-file array",
                    },
                    name: { type: "string", description: "label" },
                  },
                  required: ["file"],
                },
              },
            },
          },
          responses: { "200": { description: "ok" } },
        },
      },
      "/profile": {
        post: {
          summary: "Update profile",
          tags: ["profile"],
          requestBody: {
            content: {
              "application/x-www-form-urlencoded": {
                schema: {
                  type: "object",
                  properties: {
                    nickname: { type: "string" },
                    kind: { type: "string", enum: ["admin", "user"] },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "ok" } },
        },
      },
    },
  };

  // --- G-4.1: openApiToInterfaces produces correct interface metadata ---
  const { interfaces: g4Interfaces } = await openApiToInterfaces(multipartSpec);
  const uploadIface = g4Interfaces.find((i) => i.path === "/upload")!;
  assert.ok(uploadIface, "G-4: upload interface should exist");
  assert.strictEqual(uploadIface.req_body_type, "form", "G-4: req_body_type should be form");
  assert.strictEqual(uploadIface.req_body_multipart, true, "G-4: req_body_multipart should be true");

  const fileField = uploadIface.req_body_form.find((f) => f.name === "file");
  assert.ok(fileField, "G-4: file field should exist");
  assert.strictEqual(fileField.type, "file", "G-4: single binary field -> type file");
  assert.strictEqual(fileField.isArray, undefined, "G-4: single file should not have isArray");

  const filesField = uploadIface.req_body_form.find((f) => f.name === "files");
  assert.ok(filesField, "G-4: files field should exist");
  assert.strictEqual(filesField.type, "file", "G-4: binary array field -> type file");
  assert.strictEqual(filesField.isArray, true, "G-4: multi-file array should have isArray=true");

  const nameField = uploadIface.req_body_form.find((f) => f.name === "name");
  assert.ok(nameField, "G-4: name field should exist");
  assert.strictEqual(nameField.type, "text", "G-4: string field -> type text");

  // Required flags: only fields listed in the OAS3 schema.required are '1';
  // everything else must be '0' (optional). Regression guard: a truthy '0'
  // string would mark optional form fields as required in generated types.
  assert.strictEqual(fileField.required, "1", 'G-4: required field -> req_body_form required "1"');
  assert.strictEqual(filesField.required, "0", 'G-4: optional field -> req_body_form required "0"');
  assert.strictEqual(nameField.required, "0", 'G-4: optional field -> req_body_form required "0"');

  // --- G-4.2: url-encoded endpoint sets req_body_type=form, multipart=false ---

  const profileIface = g4Interfaces.find((i) => i.path === "/profile")!;
  assert.strictEqual(profileIface.req_body_type, "form", "G-4: urlencoded -> req_body_type form");
  assert.strictEqual(profileIface.req_body_multipart, false, "G-4: urlencoded -> multipart false");

  // --- G-4.3: getRequestDataJsonSchema emits File / File[] tsType ---

  const uploadSchema = getRequestDataJsonSchema(uploadIface);
  assert.ok(uploadSchema.properties, "G-4: schema should have properties");
  assert.strictEqual(uploadSchema.properties!.file.tsType, "File", "G-4: single file -> tsType File");
  assert.strictEqual(uploadSchema.properties!.files.tsType, "File[]", "G-4: multi-file array -> tsType File[]");

  // --- G-4.4: compiled type contains `file: File` and `files: File[]` ---

  const uploadTypeCode = await jsonSchemaToTsCode(uploadSchema, "UploadRequest");
  assert.match(uploadTypeCode, /file:\s*File/, `G-4: type should contain file: File. Got: ${uploadTypeCode}`);
  assert.match(
    uploadTypeCode,
    /files\?:\s*File\[\]/,
    `G-4: optional multi-file field should render as files?: File[]. Got: ${uploadTypeCode}`,
  );
  assert.match(
    uploadTypeCode,
    /name\?:\s*string/,
    `G-4: optional form field should render as name?: string. Got: ${uploadTypeCode}`,
  );
  assert.doesNotMatch(
    uploadTypeCode,
    /(?<!\?)name:\s*string/,
    `G-4: optional form field must not render as required name: string. Got: ${uploadTypeCode}`,
  );

  // --- G-4.5: enum form fields render as literal unions ---

  const profileSchema = getRequestDataJsonSchema(profileIface);
  const profileTypeCode = await jsonSchemaToTsCode(profileSchema, "UpdateProfileRequest");
  assert.match(
    profileTypeCode,
    /["']admin["']\s*\|\s*["']user["']/,
    `G-4: enum form field should render as literal union. Got: ${profileTypeCode}`,
  );

  // --- G-4.6: generated function body builds FormData for multipart ---

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "apits-g4-"));
  const specPath = path.join(tmpDir, "spec.json");
  await fs.writeFile(specPath, JSON.stringify(multipartSpec));

  const generator = new Generator({
    input: specPath,
    output: path.join(tmpDir, "out"),
    name: "g4test",
    client: false,
  });
  const output = await generator.generate();
  const allContent = Object.values(output)
    .map((f) => f.content.join("\n"))
    .join("\n");

  assert.match(allContent, /new FormData\(\)/, "G-4: multipart endpoint should build FormData");
  assert.match(allContent, /data:\s*form/, "G-4: multipart endpoint should pass form as data");
  assert.match(allContent, /new URLSearchParams\(\)/, "G-4: urlencoded endpoint should build URLSearchParams");
  // Ensure non-form content was not broken: the form builder line should
  // not appear for endpoints without a form body (there are none in this
  // spec, so just verify the FormData line exists exactly once).
  assert.strictEqual(
    (allContent.match(/new FormData\(\)/g) || []).length,
    1,
    "G-4: exactly one FormData constructor for one multipart endpoint",
  );

  // Clean up temp files.
  await fs.rm(tmpDir, { recursive: true, force: true });

  console.log("\n  ✓ all generator regression tests passed (G-1, G-2, G-3, G-4)\n");

  // ---------------------------------------------------------------------------
  // P-1: defineConfig client inference rules.
  //   - No client + no template => client defaults to true.
  //   - No client + template => client defaults to false (avoid dead request.ts).
  //   - Explicit client value always wins.
  // ---------------------------------------------------------------------------

  const cfgNoTemplate = defineConfig({ input: "http://localhost/api-json" })[0];
  assert.strictEqual(cfgNoTemplate.client, true, "P-1: client should default to true without template");

  const cfgWithTemplate = defineConfig({
    input: "http://localhost/api-json",
    clientImportTemplate: () => "import {request} from '../fetch'",
  })[0];
  assert.strictEqual(cfgWithTemplate.client, false, "P-1: client should default to false with template");

  const cfgExplicitTrue = defineConfig({
    input: "http://localhost/api-json",
    clientImportTemplate: () => "import {request} from '../fetch'",
    client: true,
  })[0];
  assert.strictEqual(cfgExplicitTrue.client, true, "P-1: explicit client=true wins over template default");

  const cfgExplicitFalse = defineConfig({
    input: "http://localhost/api-json",
    client: false,
  })[0];
  assert.strictEqual(cfgExplicitFalse.client, false, "P-1: explicit client=false wins");

  console.log("\n  ✓ defineConfig client inference tests passed (P-1)\n");

  // ---------------------------------------------------------------------------
  // P-2: Response type detection must be schema-based, not JSON.parse probing.
  //   A response with a `schema` must be classified as JSON schema.
  //   A response with only a description (even if it looks like JSON) must
  //   be classified as `raw`, not `json`.
  // ---------------------------------------------------------------------------

  const specWithDescriptionResponse = {
    openapi: "3.0.0",
    info: { title: "P-2 Test", version: "1.0.0" },
    paths: {
      "/text": {
        get: {
          summary: "Text endpoint",
          tags: ["test"],
          responses: {
            "200": {
              description: '"hello world"',
            },
          },
        },
      },
      "/json": {
        get: {
          summary: "JSON endpoint",
          tags: ["test"],
          responses: {
            "200": {
              description: "Success",
              content: {
                "application/json": {
                  schema: { type: "object", properties: { name: { type: "string" } } },
                },
              },
            },
          },
        },
      },
    },
  };

  const { interfaces: p2Interfaces } = await openApiToInterfaces(specWithDescriptionResponse);
  const textIface = p2Interfaces.find((i) => i.path === "/text")!;
  assert.ok(textIface, "P-2: text interface should exist");
  assert.strictEqual(textIface.res_body_type, "raw", "P-2: description-only response should be raw, not json");

  const jsonIface = p2Interfaces.find((i) => i.path === "/json")!;
  assert.ok(jsonIface, "P-2: json interface should exist");
  assert.strictEqual(jsonIface.res_body_type, "json", "P-2: schema response should be json");
  assert.strictEqual(jsonIface.res_body_is_json_schema, true, "P-2: schema response should be json schema");

  console.log("\n  ✓ response type detection tests passed (P-2)\n");

  // ---------------------------------------------------------------------------
  // P-3: writeRequestClient scaffold — verify the generated template returns
  // res.data (not the full AxiosResponse) and post/put/patch pass data correctly.
  // ---------------------------------------------------------------------------

  const tmpDirP3 = await fs.mkdtemp(path.join(os.tmpdir(), "apits-p3-"));
  const p3SpecPath = path.join(tmpDirP3, "spec.json");
  await fs.writeFile(p3SpecPath, JSON.stringify(multipartSpec));
  const outDirP3 = path.join(tmpDirP3, "out");
  const generatorP3 = new Generator({
    input: p3SpecPath,
    output: outDirP3,
    name: "p3test",
    client: true,
  });
  await generatorP3.generate().then((output) => generatorP3.write(output));

  const requestPath = path.join(outDirP3, "request.ts");
  const requestContent = await fs.readFile(requestPath, "utf-8");
  assert.match(requestContent, /return res\.data/, "P-3: interceptor should return res.data");
  assert.match(
    requestContent,
    /instance\.post<RP>\(url, undefined, config\)/,
    "P-3: post should pass undefined as data",
  );
  assert.doesNotMatch(requestContent, /process\.env\.BASE_URL/, "P-3: should not hardcode process.env.BASE_URL");

  await fs.rm(tmpDirP3, { recursive: true, force: true });
  console.log("\n  ✓ writeRequestClient scaffold tests passed (P-3)\n");

  // ---------------------------------------------------------------------------
  // P-4: The per-request `extra` argument must not degrade to
  // `Record<string, any>`. It defaults to AxiosRequestConfig (with a
  // matching type-only import), and follows `clientConfigType` for
  // custom clients (whose own import template must bring the type).
  // ---------------------------------------------------------------------------

  // Default client: axios type import + AxiosRequestConfig extra.
  const tmpDirP4a = await fs.mkdtemp(path.join(os.tmpdir(), "apits-p4a-"));
  const specPathP4a = path.join(tmpDirP4a, "spec.json");
  await fs.writeFile(specPathP4a, JSON.stringify(multipartSpec));
  const outDirP4a = path.join(tmpDirP4a, "out");
  const generatorP4a = new Generator({
    input: specPathP4a,
    output: outDirP4a,
    name: "p4test",
    client: false,
  });
  const outP4a = await generatorP4a.generate();
  await generatorP4a.write(outP4a);
  const apiP4a = await fs.readFile(path.join(outDirP4a, "p4test.ts"), "utf-8");
  assert.match(
    apiP4a,
    /import type \{AxiosRequestConfig\} from 'axios'/,
    "P-4: default config type imports AxiosRequestConfig",
  );
  assert.match(apiP4a, /extra\?: AxiosRequestConfig/, "P-4: generated functions type extra as AxiosRequestConfig");
  assert.doesNotMatch(apiP4a, /Record<string,\s*any>/, "P-4: must not emit Record<string, any>");
  await fs.rm(tmpDirP4a, { recursive: true, force: true });

  // Custom client: project-supplied config type, no axios import added.
  const tmpDirP4b = await fs.mkdtemp(path.join(os.tmpdir(), "apits-p4b-"));
  const specPathP4b = path.join(tmpDirP4b, "spec.json");
  await fs.writeFile(specPathP4b, JSON.stringify(multipartSpec));
  const outDirP4b = path.join(tmpDirP4b, "out");
  const generatorP4b = new Generator({
    input: specPathP4b,
    output: outDirP4b,
    name: "p4custom",
    client: false,
    clientImportTemplate: () => "import {request, type RequestConfig} from '../fetch'",
    clientConfigType: "RequestConfig",
  });
  const outP4b = await generatorP4b.generate();
  await generatorP4b.write(outP4b);
  const apiP4b = await fs.readFile(path.join(outDirP4b, "p4custom.ts"), "utf-8");
  assert.match(
    apiP4b,
    /import \{request, type RequestConfig\} from '\.\.\/fetch'/,
    "P-4: custom client import preserved",
  );
  assert.match(apiP4b, /extra\?: RequestConfig/, "P-4: custom clientConfigType applied to extra");
  assert.doesNotMatch(apiP4b, /AxiosRequestConfig/, "P-4: no axios config type with a custom client config type");
  await fs.rm(tmpDirP4b, { recursive: true, force: true });

  console.log("\n  ✓ extra-arg typing tests passed (P-4)\n");
}

main().catch((err) => {
  console.error("\n  ✗ test failed:", err.message);
  console.error(err.stack);
  process.exit(1);
});
