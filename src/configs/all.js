import rules from "../rules/index.js";

const namespace = "jest-dom";

/** @type {import("eslint").Linter.RulesRecord} */
const allRules = Object.fromEntries(
  Object.keys(rules).map((ruleName) => [`${namespace}/${ruleName}`, "error"]),
);

export default allRules;
