import plugin, { configs, rules } from "../src/index.js";

it("includes the configs and rules on the plugin", () => {
  expect(plugin).toHaveProperty("configs", configs);
  expect(plugin).toHaveProperty("rules", rules);
});

it("should have all the rules", () => {
  expect(Object.keys(rules)).toHaveLength(11);
});

it.each(Object.entries(rules))("%s should export required fields", (name, rule) => {
  expect(rule).toHaveProperty("create", expect.any(Function));
  expect(rule.meta.docs.url).not.toBe("");
  expect(rule.meta.docs.category).toBe("Best Practices");
  expect(rule.meta.docs.description).not.toBe("");
});

it("has the expected recommended config", () => {
  expect(configs.recommended.plugins["jest-dom"]).toBe(plugin);
  expect(configs.recommended.rules).toStrictEqual({
    "jest-dom/prefer-checked": "error",
    "jest-dom/prefer-empty": "error",
    "jest-dom/prefer-enabled-disabled": "error",
    "jest-dom/prefer-focus": "error",
    "jest-dom/prefer-in-document": "error",
    "jest-dom/prefer-required": "error",
    "jest-dom/prefer-to-have-attribute": "error",
    "jest-dom/prefer-to-have-class": "error",
    "jest-dom/prefer-to-have-style": "error",
    "jest-dom/prefer-to-have-text-content": "error",
    "jest-dom/prefer-to-have-value": "error",
  });
});

it("has the expected all config", () => {
  expect(configs.all.plugins["jest-dom"]).toBe(plugin);
  expect(configs.all.rules).toStrictEqual(configs.recommended.rules);
});
