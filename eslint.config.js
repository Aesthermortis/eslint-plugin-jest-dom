// @ts-check

import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import eslint from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintPlugin from "eslint-plugin-eslint-plugin";
import { importX } from "eslint-plugin-import-x";
import jest from "eslint-plugin-jest";
import jsdocPlugin from "eslint-plugin-jsdoc";
import nodePlugin from "eslint-plugin-n";
import * as regexp from "eslint-plugin-regexp";
import security from "eslint-plugin-security";
import * as sonarjs from "eslint-plugin-sonarjs";
import unicornPlugin from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig([
  {
    name: "Global Ignores",
    ignores: [
      ".cache/**",
      ".github/**",
      "coverage/**",
      "dist/**",
      "docs/**",
      "**/*.d.ts",
      "node_modules/**",
      "package-lock.json",
      "types/**",
    ],
  },

  {
    name: "JavaScript",
    files: ["**/*.js"],
    extends: [
      eslint.configs.recommended,
      nodePlugin.configs["flat/recommended-module"],
      regexp.configs["flat/recommended"],
      sonarjs.configs.recommended,
      unicornPlugin.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.es2025,
        ...globals.node,
      },
      sourceType: "module",
    },
    rules: {
      "n/no-unpublished-import": "off",
      "n/no-unsupported-features/node-builtins": "off",
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
    },
  },

  jsdocPlugin.configs["flat/recommended-mixed"],
  security.configs.recommended,
  importX.flatConfigs.recommended,
  comments.recommended,

  {
    name: "JSDoc style handled by Prettier",
    files: ["**/*.{js,jsx,cjs,mjs,ts,tsx,cts,mts}"],
    rules: {
      "jsdoc/tag-lines": [
        "error",
        "never",
        { endLines: 0, startLines: 1, tags: { typedef: { lines: "any" } } },
      ],
    },
  },

  {
    name: "Plugin Development",
    files: ["src/index.js", "src/rules/**/*.js", "__tests__/**/*.js"],
    extends: [eslintPlugin.configs.recommended],
  },

  {
    name: "CommonJS Configs",
    files: ["**/*.cjs"],
    extends: [nodePlugin.configs["flat/recommended-script"]],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.node,
      },
      sourceType: "commonjs",
    },
    rules: {
      "n/no-unpublished-require": "off",
    },
  },

  {
    name: "Tests",
    files: ["__tests__/**/*.js"],
    extends: [jest.configs["flat/recommended"], jest.configs["flat/style"]],
    languageOptions: {
      globals: {
        ...globals.es2025,
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      "n/no-unpublished-import": "off",
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
  },

  // Prettier
  eslintConfigPrettier,
]);
