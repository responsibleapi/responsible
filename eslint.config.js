import js from "@eslint/js"
import tsPlugin from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import ban from "eslint-plugin-ban"
import { defineConfig } from "eslint/config"
import globals from "globals"

const packageProjects = [
  "./packages/cli/tsconfig.json",
  "./packages/generator/tsconfig.json",
  "./packages/hono/tsconfig.json",
  "./packages/http-jsonschema/tsconfig.json",
  "./packages/polka/tsconfig.json",
  "./packages/ts/tsconfig.json",
  "./packages/website/tsconfig.json",
]

export default defineConfig([
  {
    ignores: [
      "**/*.test.ts",
      "**/build.js",
      "**/dist/*",
      "packages/website/src/kdl.js",
    ],
  },
  js.configs.recommended,
  ...tsPlugin.configs["flat/strict-type-checked"],
  {
    files: ["packages/**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: packageProjects,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      ban,
    },
    rules: {
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
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-for-in-array": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/restrict-template-expressions": "warn",
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        {
          considerDefaultExhaustiveForUnions: true,
        },
      ],
      "ban/ban": [
        "error",
        {
          name: "parseInt",
          message: "Use Number() constructor",
        },
      ],
      eqeqeq: "error",
      "no-console": "error",
      "no-throw-literal": "error",
    },
  },
  {
    files: ["packages/cli/**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "no-console": "off",
    },
  },
])
