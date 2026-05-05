import { FlatCompatRuleTester as RuleTester } from "../rule-tester.js";
import * as rule from "../../src/rules/prefer-to-have-display-value.js";

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: "module" },
});

const error = {
  message: "Prefer toHaveDisplayValue() over manual value assertions.",
};

ruleTester.run("prefer-to-have-display-value", rule, {
  valid: [
    `expect(input).toHaveDisplayValue("hello")`,
    `expect(input).toHaveValue("hello")`,
    `expect(input.value).not.toBe("hello")`,
    `expect(input.value).toBe(value)`,
    `expect(input.value).toEqual(value)`,
    `expect(input.value).toStrictEqual(value)`,
    `expect(input.value).toBe(/hello/)`,
    `expect(input.value).toMatch(/hello/)`,
    `expect(input.value).toContain("hello")`,
    `expect(input.value).toBe("hello", extra)`,
    `expect(input.value).toBe()`,
    `expect(input["value"]).toBe("hello")`,
    `expect(select.value).toBe("us")`,
    `expect(mySelect.value).toBe("us")`,
    `expect(countrySelect.value).toEqual("us")`,
    `expect(option.selected).toBe(true)`,
    `expect(screen.getByDisplayValue("hello")).toBeInTheDocument()`,
    `expect().toBe("hello")`,
  ],
  invalid: [
    {
      code: `expect(input.value).toBe("hello")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(input.value).toEqual("hello")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(input.value).toStrictEqual("hello")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(textarea.value).toBe("hello")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(element.value).toBe("")`,
      errors: [error],
      output: null,
    },
  ],
});
