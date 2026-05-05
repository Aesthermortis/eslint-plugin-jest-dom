import { FlatCompatRuleTester as RuleTester } from "../rule-tester.js";
import * as rule from "../../src/rules/prefer-to-have-accessible-description.js";

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: "module" },
});

const error = {
  message: "Prefer toHaveAccessibleDescription() over asserting aria-description manually.",
};

ruleTester.run("prefer-to-have-accessible-description", rule, {
  valid: [
    `expect(element).toHaveAccessibleDescription("Help text")`,
    `expect(element).toHaveAttribute("aria-describedby", "description-id")`,
    `expect(element).toHaveAttribute("title", "Help text")`,
    `expect(element).toHaveAttribute("aria-description", description)`,
    `expect(element).toHaveAttribute("aria-description")`,
    `expect(element).toHaveAttribute("aria-description", "")`,
    `expect(element).toHaveAttribute("aria-description", "Help text", extra)`,
    `expect(element).not.toHaveAttribute("aria-description", "Help text")`,
    `expect(element).toHaveProperty("aria-description", "Help text")`,
    `expect(element.getAttribute("aria-description")).not.toBe("Help text")`,
    `expect(element.getAttribute("aria-description")).toContain("Help")`,
    `expect(element.getAttribute("aria-description")).toMatch(/Help/)`,
    `expect(element.getAttribute("aria-description")).toBe(description)`,
    `expect(element.getAttribute("aria-description")).toBe("")`,
    `expect(element.getAttribute("aria-description", extra)).toBe("Help text")`,
    `expect(element.getAttribute(attribute)).toBe("Help text")`,
    `expect(element.getAttribute("aria-describedby")).toBe("description-id")`,
    `expect(element["getAttribute"]("aria-description")).toBe("Help text")`,
    `expect(descriptionNode).toHaveTextContent("Help text")`,
    `expect(document.getElementById("description-id")).toHaveTextContent("Help text")`,
  ],
  invalid: [
    {
      code: `expect(element).toHaveAttribute("aria-description", "Help text")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(element.getAttribute("aria-description")).toBe("Help text")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(element.getAttribute("aria-description")).toEqual("Help text")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(element.getAttribute("aria-description")).toStrictEqual("Help text")`,
      errors: [error],
      output: null,
    },
  ],
});
