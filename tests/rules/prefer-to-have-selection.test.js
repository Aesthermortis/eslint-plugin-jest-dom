import { FlatCompatRuleTester as RuleTester } from "../rule-tester.js";
import * as rule from "../../src/rules/prefer-to-have-selection.js";

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: "module" },
});

const error = {
  message: "Prefer toHaveSelection() over asserting text selection manually.",
};

ruleTester.run("prefer-to-have-selection", rule, {
  valid: [
    `expect(input).toHaveSelection("hello")`,
    `expect(input.selectionStart).not.toBe(0)`,
    `expect(input.selectionEnd).not.toEqual(5)`,
    `expect(input.selectionDirection).toBe("forward")`,
    `expect(input.selectionStart).toBeGreaterThan(0)`,
    `expect(input[value]).toBe(0)`,
    `expect(input.selectionStart)[matcher](0)`,
    `expect(input.selectionStart).toBe(0, extra)`,
    `expect(input.value.slice(other.selectionStart, input.selectionEnd)).toBe("hello")`,
    `expect(input.value.slice(input.selectionStart, other.selectionEnd)).toBe("hello")`,
    `expect(input.value.slice(input.selectionEnd, input.selectionStart)).toBe("hello")`,
    `expect(input.value.slice(input.selectionStart, input.selectionEnd)).not.toBe("hello")`,
    `expect(input.value.substring(input.selectionStart, input.selectionEnd)).not.toEqual("hello")`,
    `expect(input.value.substring(input.selectionStart, input.selectionEnd)).not.toStrictEqual("hello")`,
    `expect(input.value.slice(input.selectionStart, input.selectionEnd)).toContain("hello")`,
    `expect(input.value.slice(input.selectionStart, input.selectionEnd)).toBe(expectedSelection)`,
    `expect(input.value.slice(input.selectionStart)).toBe("hello")`,
    `expect(input.value.slice(input.selectionStart, input.selectionEnd, extra)).toBe("hello")`,
    `expect(document.getSelection().toString()).toBe("hello")`,
    `expect(range.toString()).toBe("hello")`,
  ],
  invalid: [
    {
      code: `expect(input.selectionStart).toBe(0)`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(input.selectionEnd).toBe(5)`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(input.selectionStart).toEqual(0)`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(input.selectionEnd).toEqual(5)`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(input.value.slice(input.selectionStart, input.selectionEnd)).toBe("hello")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(input.value.slice(input.selectionStart, input.selectionEnd)).toEqual("hello")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(input.value.substring(input.selectionStart, input.selectionEnd)).toBe("hello")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(input.value.substring(input.selectionStart, input.selectionEnd)).toStrictEqual("hello")`,
      errors: [error],
      output: null,
    },
  ],
});
