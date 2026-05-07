import { defineConfig } from "oxlint"

const maintainedTypeScriptFiles = [
  "packages/ts/src/**/*.ts",
  "packages/ts/scripts/**/*.ts",
  "packages/hono/src/**/*.ts",
  "src/**/*.ts",
  "scripts/**/*.ts",
]

export default defineConfig({
  plugins: ["typescript", "jsdoc"],
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
  settings: {
    jsdoc: {
      tagNamePreference: {
        /** Core DSL stuff */
        dsl: "dsl",
        /** Core compiler stuff */
        compiler: "compiler",
      },
    },
  },
  // jsPlugins: ["./packages/ts/scripts/oxlint-prefer-schema-examples.ts"],
  overrides: [
    {
      files: maintainedTypeScriptFiles,
      rules: {
        // "local/prefer-schema-examples": "warn",
        "typescript/consistent-type-imports": [
          "error",
          {
            fixStyle: "separate-type-imports",
            prefer: "type-imports",
          },
        ],
        "typescript/no-deprecated": "error",
        "typescript/no-restricted-types": [
          "error",
          {
            types: {
              any: "Use a specific type instead.",
            },
          },
        ],
        "typescript/no-unsafe-type-assertion": "error",
        "typescript/no-unused-vars": [
          "error",
          {
            argsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
            destructuredArrayIgnorePattern: "^_",
            ignoreRestSiblings: true,
            varsIgnorePattern: "^_",
          },
        ],
        eqeqeq: ["error", "always"],
        "no-console": "error",
      },
    },
    {
      files: ["packages/ts/scripts/**/*.ts", "scripts/**/*.ts"],
      rules: {
        "no-console": "off",
      },
    },
    {
      files: ["packages/ts/src/**/*.test.ts", "src/**/*.test.ts"],
      rules: {
        /**
         * `no-unsafe-type-assertion` has no Oxlint options (cannot allow only
         * `as unknown as`). Tests compare JSON module values to OpenAPI shapes
         * with explicit assertions.
         */
        "typescript/no-unsafe-type-assertion": "off",
      },
    },
  ],
})
