import type { Linter } from "eslint";

// Baseline flat-config layer; compose first ([...base, ...nest] / [...base, ...next]).
declare const config: Linter.Config[];
export default config;
