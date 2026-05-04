import packageJson from "../package.json" with { type: "json" };
import allRules from "./configs/all.js";
import recommendedRules from "./configs/recommended.js";
import rules from "./rules/index.js";

const { name: packageName, version: packageVersion } = packageJson;
const namespace = "jest-dom";

/** @type {Record<string, import("eslint").Linter.Config>} */
const configs = {};

const plugin = {
  meta: {
    name: packageName,
    namespace,
    version: packageVersion,
  },
  configs,
  rules,
};

Object.assign(plugin.configs, {
  all: {
    name: `${namespace}/all`,
    plugins: { [namespace]: plugin },
    rules: allRules,
  },
  recommended: {
    name: `${namespace}/recommended`,
    plugins: { [namespace]: plugin },
    rules: recommendedRules,
  },
});

export default plugin;
