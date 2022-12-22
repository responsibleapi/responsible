module.exports = {
  root: true,
  env: { node: true },
  plugins: ["ban"],
  parser: "@typescript-eslint/parser",
  parserOptions: { project: "./tsconfig.json" },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  ignorePatterns: ["**/*.test.ts", "**/build.js", "**/dist/*"],
  rules: {
    "ban/ban": [
      "error",
      {
        name: "parseInt",
        message: "Use Number() constructor",
      },
    ],

    eqeqeq: "error",
    "no-throw-literal": "error",
    "no-console": "error",

    "no-shadow": "off",
    "@typescript-eslint/no-shadow": "error",

    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/switch-exhaustiveness-check": "error",

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

    "@typescript-eslint/consistent-type-imports": "warn",
  },
}
