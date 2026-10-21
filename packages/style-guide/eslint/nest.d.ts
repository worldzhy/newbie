import type { Linter } from "eslint";

// Nest framework layer; compose after base ([...base, ...nest]).
declare const config: Linter.Config[];
export default config;
