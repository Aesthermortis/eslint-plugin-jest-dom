import { RuleTester } from "eslint";
import * as rule from "../../src/rules/prefer-to-be-valid.js";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2015, sourceType: "module" },
});

const error = {
  message: "Prefer toBeValid() over manual validity assertions.",
};

ruleTester.run("prefer-to-be-valid", rule, {
  valid: [
    `expect(input).toBeValid()`,
    `expect(input).toBeInvalid()`,
    `expect(input).toHaveAttribute("aria-invalid")`,
    `expect(input).toHaveAttribute("aria-invalid", "false")`,
    `expect(input).toHaveAttribute("aria-invalid", "true")`,
    `expect(input).toHaveAttribute("aria-invalid", value)`,
    `expect(input).toHaveAttribute("aria-required", "false")`,
    `expect(input).not.toHaveAttribute("aria-invalid", "false")`,
    `expect(input).toHaveProperty("aria-invalid", "false")`,
    `expect(input.checkValidity()).not.toBe(true)`,
    `expect(input.checkValidity()).toBe(false)`,
    `expect(input.checkValidity()).toBeTruthy()`,
    `expect(input.checkValidity()).toBeFalsy()`,
    `expect(input.checkValidity()).toBe(validity)`,
    `expect(input.checkValidity()).toBe("true")`,
    `expect(input.checkValidity(extra)).toBe(true)`,
    `expect(!input.checkValidity()).toBe(false)`,
    `expect(input[checkValidity]()).toBe(true)`,
    `expect().toBe(true)`,
  ],
  invalid: [
    {
      code: `expect(input.checkValidity()).toBe(true)`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(input.checkValidity()).toEqual(true)`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(input.checkValidity()).toStrictEqual(true)`,
      errors: [error],
      output: null,
    },
  ],
});
