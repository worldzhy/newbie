import type { Linter } from "eslint";

// Next.js framework layer; compose after base ([...base, ...next]).
declare const config: Linter.Config[];
export default config;
