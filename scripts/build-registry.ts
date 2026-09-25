/**
 * CLI build helper: compile registry/ source items into self-contained
 * shadcn-compatible manifests under dist/registry.
 *
 * Run via: node --import tsx scripts/build-registry.ts
 */
import path from "node:path";

import { buildRegistry } from "../src/registry/build";

const packageRoot = path.resolve(__dirname, "..");
const sourceRoot = path.join(packageRoot, "registry");
const outputRoot = path.join(packageRoot, "dist", "registry");

buildRegistry(sourceRoot, outputRoot)
  .then((names) => {
    console.info(`Registry built (${names.length}): ${names.join(", ")}`);
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
