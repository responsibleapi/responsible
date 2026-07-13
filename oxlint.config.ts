import { defineConfig } from "oxlint"

export default defineConfig({
  plugins: ["typescript"],
  categories: {
    correctness: "error",
    nursery: "off",
    pedantic: "off",
    perf: "warn",
    restriction: "off",
    style: "off",
    suspicious: "warn",
  },
  options: {
    reportUnusedDisableDirectives: "error",
    typeAware: true,
  },
  overrides: [
    {
      files: ["packages/**/*.{ts,tsx,mts,cts}"],
      rules: {
        "typescript/ban-ts-comment": [
          "error",
          {
            "ts-check": "allow-with-description",
            "ts-expect-error": "allow-with-description",
            "ts-ignore": "allow-with-description",
            "ts-nocheck": true,
            minimumDescriptionLength: 1,
          },
        ],
        "typescript/consistent-type-imports": [
          "error",
          {
            fixStyle: "inline-type-imports",
            prefer: "type-imports",
          },
        ],
        "typescript/explicit-module-boundary-types": "error",
        "typescript/no-for-in-array": "error",
        "typescript/no-misused-promises": [
          "error",
          {
            checksVoidReturn: false,
          },
        ],
        "typescript/no-non-null-assertion": "warn",
        "typescript/no-shadow": "error",
        "typescript/no-unsafe-argument": "warn",
        "typescript/no-unsafe-assignment": "warn",
        "typescript/no-unsafe-call": "warn",
        "typescript/no-unsafe-member-access": "warn",
        "typescript/no-unsafe-return": "warn",
        "typescript/no-unused-vars": [
          "error",
          {
            argsIgnorePattern: "^_",
          },
        ],
        "typescript/restrict-template-expressions": "warn",
        "typescript/switch-exhaustiveness-check": [
          "error",
          {
            considerDefaultExhaustiveForUnions: true,
          },
        ],
        eqeqeq: "error",
        "no-console": "error",
        "no-throw-literal": "error",
      },
    },
  ],
})
