/**
 * @file Lint Rules for use with jest-dom.
 * @author Ben Monro.
 */

import { createRequire } from "node:module";

import rules from "./rules/index.js";

const require = createRequire(import.meta.url);
const { name: packageName, version: packageVersion } = require("../package.json");

const allRules = Object.fromEntries(
  Object.keys(rules).map((name) => [`jest-dom/${name}`, "error"]),
);

const recommendedRules = allRules;

const plugin = {
  meta: {
    name: packageName,
    namespace: "jest-dom",
    version: packageVersion,
  },
  configs: {},
  rules,
};

Object.assign(plugin.configs, {
  recommended: {
    name: "jest-dom/recommended",
    plugins: { "jest-dom": plugin },
    rules: recommendedRules,
  },
  all: {
    name: "jest-dom/all",
    plugins: { "jest-dom": plugin },
    rules: allRules,
  },
});

export default plugin;
