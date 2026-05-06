import { RuleTester } from "eslint";
import * as rule from "../../src/rules/prefer-to-be-invalid.js";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2015, sourceType: "module" },
});

const error = {
  message: "Prefer toBeInvalid() over manual validity assertions.",
};

ruleTester.run("prefer-to-be-invalid", rule, {
  valid: [
    `expect(input).toBeInvalid()`,
    `expect(input).toBeValid()`,
    `expect(input).toHaveAttribute("aria-invalid")`,
    `expect(input).toHaveAttribute("aria-invalid", "false")`,
    `expect(input).toHaveAttribute("aria-invalid", value)`,
    `expect(input).toHaveAttribute("aria-required", "true")`,
    `expect(input).not.toHaveAttribute("aria-invalid", "true")`,
    `expect(input).toHaveProperty("aria-invalid", "true")`,
    `expect(input.checkValidity()).not.toBe(false)`,
    `expect(input.checkValidity()).toBe(true)`,
    `expect(input.checkValidity()).toBeTruthy()`,
    `expect(input.checkValidity()).toBeFalsy()`,
    `expect(input.checkValidity()).toBe(validity)`,
    `expect(input.checkValidity()).toBe("false")`,
    `expect(input.checkValidity(extra)).toBe(false)`,
    `expect(!input.checkValidity()).toBe(true)`,
    `expect(input[checkValidity]()).toBe(false)`,
    `expect().toBe(false)`,
  ],
  invalid: [
    {
      code: `expect(input).toHaveAttribute("aria-invalid", "true")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(input.checkValidity()).toBe(false)`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(input.checkValidity()).toEqual(false)`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(input.checkValidity()).toStrictEqual(false)`,
      errors: [error],
      output: null,
    },
  ],
});
