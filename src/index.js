import packageJson from "../package.json" with { type: "json" };
import allRules from "./configs/all.js";
import recommendedRules from "./configs/recommended.js";
import rules from "./rules/index.js";

const namespace = "jest-dom";

/** @type {import("../index.d.ts").JestDomPlugin} */
const plugin = {
  meta: {
    name: "eslint-plugin-jest-dom",
    namespace,
    version: packageJson.version,
  },
  get configs() {
    return configs;
  },
  rules,
};

/** @type {import("../index.d.ts").JestDomPlugin["configs"]} */
const configs = {
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
};

export default plugin;
