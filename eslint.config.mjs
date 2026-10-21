import base from "@devbie/style-guide/eslint/base";

export default [
  ...base,
  {
    ignores: ["**/dist/**", "**/coverage/**"],
  },
];
