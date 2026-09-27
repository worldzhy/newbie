/**
 * Registry manifest types.
 *
 * The authored form (registry/<name>/item.json) keeps files as repo-relative
 * path strings so the source tree stays the single source of truth. The
 * build step emits the shadcn-compatible form, where each file carries its
 * inlined content for `npx shadcn add <url>` consumption.
 */

/** shadcn registry item kinds fewbie uses. */
export type RegistryItemType = "registry:lib" | "registry:component" | "registry:block";

/** File entry in the authored manifest: path relative to the item folder. */
export interface RegistryFileRef {
  path: string;
}

/** File entry in the built shadcn-compatible manifest. */
export interface RegistryFileEntry {
  /** Project-relative target path, e.g. src/lib/api-client.ts. */
  path: string;
  /** Inlined file content. */
  content: string;
  type: RegistryItemType;
}

/** Authored item.json (files are plain path strings). */
export interface RegistryManifest {
  name: string;
  type: RegistryItemType;
  title: string;
  description?: string;
  /** npm packages the item needs installed in the consuming project. */
  dependencies?: string[];
  /** Other fewbie registry items this item depends on. */
  registryDependencies?: string[];
  files: string[];
  /** Hint printed after installation (manual wiring steps). */
  postInstall?: string;
}

/** Built shadcn-compatible registry-item.json. */
export interface BuiltRegistryItem {
  $schema: string;
  name: string;
  type: RegistryItemType;
  title: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFileEntry[];
  /** fewbie-specific hint (ignored by the official shadcn CLI). */
  postInstall?: string;
}
