import { RuleTester } from "eslint";
import * as rule from "../../src/rules/prefer-to-have-accessible-name.js";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2015, sourceType: "module" },
});

const error = {
  message: "Prefer toHaveAccessibleName() over asserting aria-label manually.",
};

ruleTester.run("prefer-to-have-accessible-name", rule, {
  valid: [
    `expect(element).toHaveAccessibleName("Save")`,
    `expect(element).toHaveAttribute("aria-labelledby", "label-id")`,
    `expect(element).toHaveAttribute("alt", "Save")`,
    `expect(element).toHaveAttribute("title", "Save")`,
    `expect(element).toHaveAttribute("aria-label", label)`,
    `expect(element).toHaveAttribute("aria-label")`,
    `expect(element).toHaveAttribute("aria-label", "")`,
    `expect(element).toHaveAttribute("aria-label", "Save", extra)`,
    `expect(element).not.toHaveAttribute("aria-label", "Save")`,
    `expect(element).toHaveProperty("aria-label", "Save")`,
    `expect(element.getAttribute("aria-label")).not.toBe("Save")`,
    `expect(element.getAttribute("aria-label")).toContain("Save")`,
    `expect(element.getAttribute("aria-label")).toMatch(/Save/)`,
    `expect(element.getAttribute("aria-label")).toBe(label)`,
    `expect(element.getAttribute("aria-label")).toBe("")`,
    `expect(element.getAttribute("aria-label", extra)).toBe("Save")`,
    `expect(element.getAttribute(attribute)).toBe("Save")`,
    `expect(element.getAttribute("aria-labelledby")).toBe("label-id")`,
    `expect(element["getAttribute"]("aria-label")).toBe("Save")`,
    `expect(element.textContent).toBe("Save")`,
    `expect(label).toHaveTextContent("Save")`,
  ],
  invalid: [
    {
      code: `expect(element).toHaveAttribute("aria-label", "Save")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(element.getAttribute("aria-label")).toBe("Save")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(element.getAttribute("aria-label")).toEqual("Save")`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(element.getAttribute("aria-label")).toStrictEqual("Save")`,
      errors: [error],
      output: null,
    },
  ],
});
