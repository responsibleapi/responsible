module.exports = {
  root: true,
  env: { node: true },
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  parserOptions: { project: "./tsconfig.json" },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  ignorePatterns: ["src/**/*.test.ts"],
  rules: {
    eqeqeq: "error",
    "no-throw-literal": "error",

    "no-shadow": "off",
    "@typescript-eslint/no-shadow": "error",

    "@typescript-eslint/no-inferrable-types": "off",

    "@typescript-eslint/no-for-in-array": "error",
    "@typescript-eslint/ban-ts-comment": [
      "error",
      {
        "ts-expect-error": true,
        "ts-ignore": "allow-with-description",
        "ts-nocheck": true,
        "ts-check": "allow-with-description",
        minimumDescriptionLength: 1,
      },
    ],
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-misused-promises": [
      "error",
      { checksVoidReturn: false },
    ],
    "@typescript-eslint/no-unsafe-assignment": "warn",
    "@typescript-eslint/no-unsafe-member-access": "warn",
    "@typescript-eslint/no-unsafe-return": "warn",
    "@typescript-eslint/no-unsafe-call": "warn",
    "@typescript-eslint/restrict-template-expressions": "warn",
    "@typescript-eslint/no-unsafe-argument": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "error",
  },
}
