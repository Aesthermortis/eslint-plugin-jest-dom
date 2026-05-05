import { FlatCompatRuleTester as RuleTester } from "../rule-tester.js";
import * as rule from "../../src/rules/prefer-to-have-accessible-error-message.js";

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: "module" },
});

const error = {
  message: "Prefer toHaveAccessibleErrorMessage() over asserting aria-errormessage manually.",
};

ruleTester.run("prefer-to-have-accessible-error-message", rule, {
  valid: [
    `expect(input).toHaveAccessibleErrorMessage("This field is invalid")`,
    `expect(input).toHaveAttribute("aria-invalid", "true")`,
    `expect(input).toHaveAttribute("aria-describedby", "error-message")`,
    `expect(input).toHaveAttribute("aria-errormessage")`,
    `expect(input).toHaveAttribute("aria-errormessage", errorId)`,
    `expect(input).toHaveAttribute("aria-errormessage", "")`,
    `expect(input).toHaveAttribute("aria-errormessage", " ")`,
    `expect(input).toHaveAttribute("aria-errormessage", "error-id id2")`,
    `expect(input).not.toHaveAttribute("aria-errormessage", "error-id")`,
    `expect(input).toHaveProperty("aria-errormessage", "error-id")`,
    `expect(input.getAttribute("aria-errormessage")).not.toBe("error-id")`,
    `expect(input.getAttribute("aria-errormessage")).toContain("error-id")`,
    `expect(input.getAttribute("aria-errormessage")).toBe(errorId)`,
    `expect(input.getAttribute("aria-errormessage")).toBe("")`,
    `expect(input.getAttribute("aria-errormessage")).toBe(" ")`,
    `expect(input.getAttribute("aria-errormessage")).toBe("error-id id2")`,
    `expect(input.getAttribute("aria-errormessage", extra)).toBe("error-id")`,
    `expect(input.getAttribute(attribute)).toBe("error-id")`,
    `expect(input.getAttribute("aria-describedby")).toBe("error-id")`,
    `expect(getErrorNode()).toHaveTextContent("This field is invalid")`,
  ],
  invalid: [
    {
      code: `expect(input).toHaveAttribute("aria-errormessage", "error-id")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(input.getAttribute("aria-errormessage")).toBe("error-id")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(input.getAttribute("aria-errormessage")).toEqual("error-id")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(input.getAttribute("aria-errormessage")).toStrictEqual("error-id")`,
      errors: [error],
      output: null,
    },
  ],
});
