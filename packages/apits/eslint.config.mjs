import backend from "@devbie/style-guide/eslint/backend";

export default [
  ...backend,
  {
    ignores: ["dist/**"],
  },
];
