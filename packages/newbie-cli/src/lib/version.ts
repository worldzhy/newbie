/**
 * Published CLI version, read at runtime. Lives in lib/ so both src/lib and
 * dist/lib sit two levels below the package root, keeping the relative path
 * valid in development and in the published tarball.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const CLI_VERSION = (require("../../package.json") as { version: string }).version;
