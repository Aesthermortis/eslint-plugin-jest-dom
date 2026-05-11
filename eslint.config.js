// @ts-check

import eslintComments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import eslint from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintPlugin from "eslint-plugin-eslint-plugin";
import { importX } from "eslint-plugin-import-x";
import jest from "eslint-plugin-jest";
import jsdocPlugin from "eslint-plugin-jsdoc";
import nodePlugin from "eslint-plugin-n";
import promise from "eslint-plugin-promise";
import * as regexpPlugin from "eslint-plugin-regexp";
import security from "eslint-plugin-security";
import * as sonarjs from "eslint-plugin-sonarjs";
import unicornPlugin from "eslint-plugin-unicorn";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(
    [
      "**/.cache/",
      "**/coverage/",
      "**/dist/",
      "**/build/",
      "**/temp/",
      "**/tmp/",
      "**/*.tsbuildinfo",
      "package-lock.json",
    ],
    "Global Ignores",
  ),

  {
    name: "ESLint core (JS/TS)",
    files: ["**/*.{js,jsx,cjs,mjs,ts,tsx,cts,mts}"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      eslintPlugin.configs.recommended,
      regexpPlugin.configs["flat/recommended"],
      sonarjs.configs.recommended,
      unicornPlugin.configs.recommended,
      nodePlugin.configs["flat/recommended-module"],
      jsdocPlugin.configs["flat/recommended-mixed"],
      security.configs.recommended,
      importX.flatConfigs.recommended,
      promise.configs.recommended,
      eslintComments.recommended,
    ],
    languageOptions: {
      ecmaVersion: "latest",
      globals: { ...globals.es2025, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      sourceType: "module",
    },
    rules: {
      "eslint-plugin/require-meta-docs-description": [
        "error",
        { pattern: "^(Enforce|Require|Disallow|Suggest|Prefer)" },
      ],
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            camelCase: true,
            kebabCase: true,
            pascalCase: true,
          },
        },
      ],
      "unicorn/no-null": "off",
      "unicorn/prevent-abbreviations": "off",
      // JSDoc tag spacing aligned with Prettier
      "jsdoc/tag-lines": [
        "error",
        "never",
        { endLines: 0, startLines: 1, tags: { typedef: { lines: "any" } } },
      ],
    },
  },

  {
    name: "Tests",
    files: ["tests/**/*.js"],
    extends: [jest.configs["flat/recommended"], jest.configs["flat/style"]],
    languageOptions: {
      globals: { ...globals.jest },
    },
    rules: {
      "n/no-unpublished-import": "off",
    },
  },

  {
    name: "Disallow tests in src",
    files: [
      "src/**/*.{test,spec}.{js,jsx,cjs,mjs,ts,tsx,cts,mts}",
      "src/**/__tests__/**/*.{js,jsx,cjs,mjs,ts,tsx,cts,mts}",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          message: "Tests are not allowed inside src/. Use the top-level tests/ folder.",
          selector: "Program",
        },
      ],
    },
  },

  {
    name: "JSON",
    files: ["**/*.json"],
    ignores: ["package-lock.json"],
    plugins: { json },
    extends: ["json/recommended"],
    language: "json/json",
  },

  {
    name: "Markdown",
    files: ["**/*.md"],
    plugins: { markdown },
    extends: ["markdown/recommended"],
    language: "markdown/gfm",
    languageOptions: {
      frontmatter: "yaml",
    },
    rules: {
      // GitHub alerts such as > [!NOTE] are parsed as missing label refs.
      "markdown/no-missing-label-refs": "off",
    },
  },

  // Prettier
  eslintConfigPrettier,
]);
