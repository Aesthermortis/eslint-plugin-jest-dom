import plugin from "../src/index.js";
import allRules from "../src/configs/all.js";
import recommendedRules from "../src/configs/recommended.js";

const { configs, rules } = plugin;
const expectedRuleTypes = new Map([
  ["prefer-checked", "suggestion"],
  ["prefer-empty", "suggestion"],
  ["prefer-enabled-disabled", "suggestion"],
  ["prefer-focus", "suggestion"],
  ["prefer-in-document", "problem"],
  ["prefer-partially-checked", "suggestion"],
  ["prefer-partially-pressed", "suggestion"],
  ["prefer-pressed", "suggestion"],
  ["prefer-required", "suggestion"],
  ["prefer-to-be-invalid", "suggestion"],
  ["prefer-to-be-valid", "suggestion"],
  ["prefer-to-contain-element", "suggestion"],
  ["prefer-to-appear-after", "suggestion"],
  ["prefer-to-appear-before", "suggestion"],
  ["prefer-to-have-accessible-description", "suggestion"],
  ["prefer-to-have-accessible-error-message", "suggestion"],
  ["prefer-to-have-accessible-name", "suggestion"],
  ["prefer-to-have-attribute", "problem"],
  ["prefer-to-have-class", "suggestion"],
  ["prefer-to-have-display-value", "suggestion"],
  ["prefer-to-have-role", "suggestion"],
  ["prefer-to-have-selection", "suggestion"],
  ["prefer-to-have-style", "suggestion"],
  ["prefer-to-have-text-content", "suggestion"],
  ["prefer-to-have-value", "suggestion"],
]);

it("includes the configs and rules on the plugin", () => {
  expect(plugin.configs).toBe(configs);
  expect(plugin.rules).toBe(rules);
});

it("only exposes a default export from the root entrypoint", async () => {
  const moduleExports = await import("../src/index.js");

  expect(Object.keys(moduleExports)).toStrictEqual(["default"]);
});

it("includes the expected plugin metadata", () => {
  expect(plugin.meta).toMatchObject({
    name: "eslint-plugin-jest-dom",
    namespace: "jest-dom",
  });
  expect(plugin.meta.version).not.toBe("");
});

it("should have all the rules", () => {
  expect(Object.keys(rules).toSorted((a, b) => a.localeCompare(b))).toStrictEqual(
    [...expectedRuleTypes.keys()].toSorted((a, b) => a.localeCompare(b)),
  );
});

it.each(Object.entries(rules))("%s should export required fields", (name, rule) => {
  expect(rule).toHaveProperty("meta");
  expect(rule).toHaveProperty("create", expect.any(Function));
  expect(rule.meta.type).toBe(expectedRuleTypes.get(name));
  expect(rule.meta).toHaveProperty("schema");
  expect(Array.isArray(rule.meta.schema)).toBe(true);
  expect(rule.meta.schema).toStrictEqual([]);
  expect(rule.meta.docs.url).not.toBe("");
  expect(rule.meta.docs.description).not.toBe("");
});

it("has the expected recommended config", () => {
  expect(configs.recommended.name).toBe("jest-dom/recommended");
  expect(configs.recommended.plugins["jest-dom"]).toBe(plugin);
  expect(configs.recommended.rules).toBe(recommendedRules);
});

it("has the expected all config", () => {
  expect(configs.all.name).toBe("jest-dom/all");
  expect(configs.all.plugins["jest-dom"]).toBe(plugin);
  expect(configs.all.rules).toBe(allRules);
});
