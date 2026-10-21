// Published package version, read once at module load. package.json sits one
// level above both src/ during development and dist/ in the published tarball.
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const VERSION = (require("../package.json") as { version: string }).version;
