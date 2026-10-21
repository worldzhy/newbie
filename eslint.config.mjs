import nest from "@devbie/style-guide/eslint/nest";

export default [
  ...nest,
  {
    ignores: ["**/dist/**", "**/coverage/**"],
  },
];
