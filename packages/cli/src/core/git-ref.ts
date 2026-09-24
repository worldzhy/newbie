/**
 * Validate a Git ref coming from config/env before interpolating it into any
 * git invocation. Mirrors Git's own ref safety rules in a conservative way.
 */

const SAFE_GIT_REF_PATTERN = /^[A-Za-z0-9._/-]+$/;

export function assertSafeGitRef(ref: unknown): string {
  if (typeof ref !== "string" || ref.length === 0) {
    throw new Error(
      "[Error] Invalid Git release ref: expected a non-empty string",
    );
  }

  if (
    !SAFE_GIT_REF_PATTERN.test(ref) ||
    ref.includes("..") ||
    ref.includes("//") ||
    ref.includes("@{") ||
    ref.startsWith("/") ||
    ref.endsWith("/") ||
    ref.endsWith(".")
  ) {
    throw new Error(`[Error] Invalid Git release ref: ${ref}`);
  }

  return ref;
}
