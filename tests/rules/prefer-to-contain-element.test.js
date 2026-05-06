import { RuleTester } from "eslint";
import * as rule from "../../src/rules/prefer-to-contain-element.js";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2015, sourceType: "module" },
});

const error = {
  message: "Prefer toContainElement() over manual contains assertions.",
};

ruleTester.run("prefer-to-contain-element", rule, {
  valid: [
    `expect(parent).toContainElement(child)`,
    `expect(parent).not.toContainElement(child)`,
    `expect(parent.contains(child)).not.toBe(true)`,
    `expect(parent.contains(child)).toBe(false)`,
    `expect(parent.contains(child)).toEqual(false)`,
    `expect(parent.contains(child)).toStrictEqual(false)`,
    `expect(parent.contains(child)).toBeTruthy()`,
    `expect(parent.contains(child)).toBeFalsy()`,
    `expect(parent.contains(child)).toBe(value)`,
    `expect(parent.contains(child)).toEqual(value)`,
    `expect(parent.contains(child)).toStrictEqual(value)`,
    `expect(parent.contains(child)).toBe("true")`,
    `expect(parent.contains()).toBe(true)`,
    `expect(parent.contains(child, extra)).toBe(true)`,
    `expect(parent[contains](child)).toBe(true)`,
    `expect(parent["contains"](child)).toBe(true)`,
    `expect(parent.matches(child)).toBe(true)`,
    `expect(parent.contains(child)).toContain(true)`,
    `expect().toBe(true)`,
  ],
  invalid: [
    {
      code: `expect(parent.contains(child)).toBe(true)`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(parent.contains(child)).toEqual(true)`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(parent.contains(child)).toStrictEqual(true)`,
      errors: [error],
      output: null,
    },
  ],
});
