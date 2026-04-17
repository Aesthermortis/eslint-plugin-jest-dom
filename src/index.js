/**
 * @file Lint Rules for use with jest-dom.
 * @author Ben Monro.
 */

import { createRequire } from "node:module";

import rules from "./rules/index.js";

const require = createRequire(import.meta.url);
const { name: packageName, version: packageVersion } = require("../package.json");

export { rules };

const allRules = Object.fromEntries(
  Object.keys(rules).map((name) => [`jest-dom/${name}`, "error"]),
);

const recommendedRules = allRules;

const plugin = {
  meta: {
    name: packageName,
    version: packageVersion,
  },
  configs: {
    recommended: {
      plugins: ["jest-dom"],
      rules: recommendedRules,
    },
    all: {
      plugins: ["jest-dom"],
      rules: allRules,
    },
  },
  rules,
};

plugin.configs.recommended = {
  plugins: { "jest-dom": plugin },
  rules: recommendedRules,
};
plugin.configs.all = {
  plugins: { "jest-dom": plugin },
  rules: allRules,
};

export default plugin;
export const configs = plugin.configs;
