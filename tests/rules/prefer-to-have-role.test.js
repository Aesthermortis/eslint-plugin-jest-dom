import { FlatCompatRuleTester as RuleTester } from "../rule-tester.js";
import * as rule from "../../src/rules/prefer-to-have-role.js";

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: "module" },
});

const error = {
  message: "Prefer toHaveRole() over asserting role attributes manually.",
};

ruleTester.run("prefer-to-have-role", rule, {
  valid: [
    `expect(element).toHaveRole("button")`,
    `expect(element).toHaveAttribute("role")`,
    `expect(element).toHaveAttribute("role", role)`,
    `expect(element).toHaveAttribute("role", "button switch")`,
    `expect(element).toHaveAttribute("role", "")`,
    `expect(element).toHaveAttribute("role", " ")`,
    `expect(element).not.toHaveAttribute("role", "button")`,
    `expect(element).toHaveAttribute("aria-role", "button")`,
    `expect(element).toHaveProperty("role", "button")`,
    `expect(element.role).toBe("button")`,
    `expect(element.getAttribute("role")).not.toBe("button")`,
    `expect(element.getAttribute("role")).toContain("button")`,
    `expect(element.getAttribute("role")).toBe(role)`,
    `expect(element.getAttribute("role")).toBe("")`,
    `expect(element.getAttribute("role")).toBe("button switch")`,
    `expect(element.getAttribute("role", extra)).toBe("button")`,
    `expect(element.getAttribute(attribute)).toBe("button")`,
    `expect(element.getAttribute("aria-role")).toBe("button")`,
    `expect(screen.getByRole("button")).toHaveAttribute("role", "button")`,
    `expect(screen.getByRole("button").getAttribute("role")).toBe("button")`,
    `const element = screen.getByRole("button"); expect(element).toHaveAttribute("role", "button")`,
    `const element = screen.getByRole("button"); expect(element.getAttribute("role")).toBe("button")`,
  ],
  invalid: [
    {
      code: `expect(element).toHaveAttribute("role", "button")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(element).toHaveAttribute("role", "dialog")`,
      errors: [error],
      output: null,
    },
    {
      code: `const element = screen.getByText("Submit"); expect(element).toHaveAttribute("role", "button")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(element.getAttribute("role")).toBe("button")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(element.getAttribute("role")).toEqual("switch")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(element.getAttribute("role")).toStrictEqual("checkbox")`,
      errors: [error],
      output: null,
    },
    {
      code: `const element = screen.getByText("Submit"); expect(element.getAttribute("role")).toBe("button")`,
      errors: [error],
      output: null,
    },
  ],
});
