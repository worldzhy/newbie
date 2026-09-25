/**
 * Skeleton-file sync between a consuming project and the newbie template.
 *
 * Only the framework-managed skeleton files listed in SKELETON_FILES are
 * compared; business files (src/application, src/modules, prisma/models,
 * .env, package.json, ...) are never touched. prisma/schema.prisma is
 * compared — and updated — only inside the framework marker block so project
 * models stay untouched.
 */

export const MARKER_START = "// @@newbie-framework-start";
export const MARKER_END = "// @@newbie-framework-end";

export type SkeletonStrategy = "whole-file" | "marker-block";

export interface SkeletonFile {
  /** POSIX-style path relative to the project / template root. */
  path: string;
  strategy: SkeletonStrategy;
}

/** Framework-managed skeleton files; everything else is business code. */
export const SKELETON_FILES: readonly SkeletonFile[] = [
  { path: "src/main.ts", strategy: "whole-file" },
  { path: "src/heartbeat.ts", strategy: "whole-file" },
  { path: "tsconfig.json", strategy: "whole-file" },
  { path: "tsconfig.build.json", strategy: "whole-file" },
  { path: "nest-cli.json", strategy: "whole-file" },
  { path: "prisma.config.ts", strategy: "whole-file" },
  { path: "prisma/schema.prisma", strategy: "marker-block" },
];

/** Extract the framework marker block (markers included); null when absent. */
export function extractMarkerBlock(content: string): string | null {
  const start = content.indexOf(MARKER_START);
  const end = content.indexOf(MARKER_END);
  if (start === -1 || end === -1 || end < start) return null;
  return content.slice(start, end + MARKER_END.length);
}

/**
 * Replace the framework marker block inside `content` with `block`.
 * Returns null when `content` has no complete marker block.
 */
export function replaceMarkerBlock(
  content: string,
  block: string,
): string | null {
  const current = extractMarkerBlock(content);
  if (current === null) return null;
  return content.replace(current, block);
}

export type SkeletonChangeKind = "create" | "update" | "missing-markers";

export interface SkeletonChange {
  file: SkeletonFile;
  kind: SkeletonChangeKind;
  /**
   * Content the project file should have after applying the change.
   * Null for "missing-markers" (nothing can be applied automatically).
   */
  nextContent: string | null;
  /** "Current" side of the diff (marker block only for schema.prisma). */
  currentComparable: string | null;
  /** "Template" side of the diff (marker block only for schema.prisma). */
  templateComparable: string | null;
}

/**
 * Compute the sync plan. `projectFiles` / `templateFiles` map each
 * SKELETON_FILES path to its content, or null when the file does not exist.
 *
 * Throws when the template itself is missing the framework marker block —
 * that is a template defect, not a project state.
 */
export function planTemplateSync(
  projectFiles: ReadonlyMap<string, string | null>,
  templateFiles: ReadonlyMap<string, string | null>,
): SkeletonChange[] {
  const changes: SkeletonChange[] = [];

  for (const file of SKELETON_FILES) {
    const templateContent = templateFiles.get(file.path);
    // The template dropped this file; nothing to sync.
    if (templateContent == null) continue;
    const projectContent = projectFiles.get(file.path);

    if (file.strategy === "whole-file") {
      if (projectContent == null) {
        changes.push({
          file,
          kind: "create",
          nextContent: templateContent,
          currentComparable: null,
          templateComparable: templateContent,
        });
      } else if (projectContent !== templateContent) {
        changes.push({
          file,
          kind: "update",
          nextContent: templateContent,
          currentComparable: projectContent,
          templateComparable: templateContent,
        });
      }
      continue;
    }

    // marker-block strategy
    const templateBlock = extractMarkerBlock(templateContent);
    if (templateBlock === null) {
      throw new Error(
        `Template ${file.path} is missing the framework block ` +
          `(${MARKER_START} / ${MARKER_END}).`,
      );
    }

    if (projectContent == null) {
      changes.push({
        file,
        kind: "create",
        nextContent: templateContent,
        currentComparable: null,
        templateComparable: templateBlock,
      });
      continue;
    }

    const projectBlock = extractMarkerBlock(projectContent);
    if (projectBlock === null) {
      changes.push({
        file,
        kind: "missing-markers",
        nextContent: null,
        currentComparable: null,
        templateComparable: templateBlock,
      });
      continue;
    }

    if (projectBlock !== templateBlock) {
      const nextContent = replaceMarkerBlock(projectContent, templateBlock);
      changes.push({
        file,
        kind: "update",
        nextContent,
        currentComparable: projectBlock,
        templateComparable: templateBlock,
      });
    }
  }

  return changes;
}
