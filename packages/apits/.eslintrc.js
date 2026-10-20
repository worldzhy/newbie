module.exports = {
  root: true,
  extends: [
    "airbnb-base/legacy",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/extensions": [".ts", ".tsx"],
  },
  rules: {
    "max-classes-per-file": 0,
    "prettier/prettier": "error",
    "no-var": "error",
    "no-shadow": 0,
    "object-curly-newline": [
      "error",
      {
        ImportDeclaration: { multiline: true },
        ExportDeclaration: { multiline: true },
      },
    ],
    "linebreak-style": [0, "error", "windows"],
    "@typescript-eslint/member-delimiter-style": [
      "error",
      {
        multiline: {
          delimiter: "semi",
          requireLast: true,
        },
        singleline: {
          delimiter: "semi",
          requireLast: false,
        },
      },
    ],
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/no-empty-function": 0,
    "max-len": 0,
    "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
    camelcase: 1,
    "func-names": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "no-console": 0,
    "@typescript-eslint/explicit-module-boundary-types": 0,
    "@typescript-eslint/no-shadow": 0,
    "no-underscore-dangle": 0,
  },
};
