// Published package version, read once at module load. package.json sits one
// level above both src/ during development and dist/ in the published tarball.
export const VERSION = (require("../package.json") as { version: string }).version;
