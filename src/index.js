import packageJson from "../package.json" with { type: "json" };
import allRules from "./configs/all.js";
import recommendedRules from "./configs/recommended.js";
import rules from "./rules/index.js";

const namespace = "jest-dom";

const plugin = {
  meta: {
    name: "eslint-plugin-jest-dom",
    namespace,
    version: packageJson.version,
  },
  configs: {},
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
