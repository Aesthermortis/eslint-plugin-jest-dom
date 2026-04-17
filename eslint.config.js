// @ts-check

import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { importX } from "eslint-plugin-import-x";
import jest from "eslint-plugin-jest";
import jsdocPlugin from "eslint-plugin-jsdoc";
import nodePlugin from "eslint-plugin-n";
import * as regexpPlugin from "eslint-plugin-regexp";
import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig([
  {
    ignores: [
      "coverage/**",
      "dist/**",
      "eslint-remote-tester-results/**",
      "node_modules/**",
      "types/**",
    ],
  },
  comments.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [
      eslint.configs.recommended,
      importX.flatConfigs.recommended,
      nodePlugin.configs["flat/recommended-module"],
    ],
    languageOptions: {
      ecmaVersion: "latest",
      globals: { ...globals.es2021, ...globals.node },
      sourceType: "module",
    },
    rules: {
      "import-x/no-named-as-default-member": "off",
      "n/no-missing-import": "off",
      "n/no-unpublished-import": "off",
      "n/no-unsupported-features/node-builtins": "off",
    },
  },
  {
    files: ["src/**/*.js"],
    extends: [jsdocPlugin.configs["flat/recommended"], regexpPlugin.configs["flat/recommended"]],
    rules: {
      "jsdoc/require-jsdoc": "off",
      "jsdoc/tag-lines": "off",
    },
  },
  {
    files: ["**/*.cjs"],
    extends: [nodePlugin.configs["flat/recommended-script"]],
    languageOptions: {
      sourceType: "commonjs",
    },
  },
  {
    files: ["tests/**/*.test.js"],
    extends: [jest.configs["flat/recommended"], jest.configs["flat/style"]],
    languageOptions: {
      globals: { ...globals.jest },
    },
  },
  eslintConfigPrettier,
]);
