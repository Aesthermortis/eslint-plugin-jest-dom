import { FlatCompatRuleTester as RuleTester } from "../rule-tester.js";
import * as rule from "../../src/rules/prefer-partially-pressed.js";

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: "module" },
});

ruleTester.run("prefer-partially-pressed", rule, {
  valid: [
    `const el = screen.getByRole("button"); expect(el).toBePartiallyPressed()`,
    `const el = screen.getByRole("button"); expect(el).toHaveAttribute("aria-pressed")`,
    `const el = screen.getByRole("button"); expect(el).toHaveAttribute("aria-pressed", "true")`,
    `const el = screen.getByRole("button"); expect(el).toHaveAttribute("aria-pressed", "false")`,
    `const el = screen.getByRole("button"); expect(el).toHaveAttribute("aria-pressed", mixed)`,
    `const el = screen.getByRole("button"); expect(el).toHaveAttribute("aria-pressed", \`mixed\`)`,
    `const el = screen.getByRole("button"); expect(el).not.toHaveAttribute("aria-pressed", "mixed")`,
    `const el = screen.getByRole("button"); expect(el).not.toHaveProperty("aria-pressed", "mixed")`,
    `const el = getFoo(); expect(el).toHaveAttribute("aria-pressed", "mixed")`,
    `expect().toHaveAttribute("aria-pressed", "mixed")`,
    `const el = screen.getByRole("button"); expect(el).toHaveAttribute("aria-pressed", "mixed", "extra")`,
  ],
  invalid: [
    {
      code: `const el = screen.getByRole("button"); expect(el).toHaveAttribute("aria-pressed", "mixed")`,
      errors: [
        {
          message: `Use toBePartiallyPressed() instead of toHaveAttribute("aria-pressed", "mixed")`,
        },
      ],
      output: `const el = screen.getByRole("button"); expect(el).toBePartiallyPressed()`,
    },
    {
      code: `const el = screen.getByRole("button"); expect(el).toHaveProperty("aria-pressed", "mixed")`,
      errors: [
        {
          message: `Use toBePartiallyPressed() instead of toHaveProperty("aria-pressed", "mixed")`,
        },
      ],
      output: `const el = screen.getByRole("button"); expect(el).toBePartiallyPressed()`,
    },
    {
      code: `expect(getByRole("button")).toHaveAttribute("aria-pressed", "mixed")`,
      errors: [
        {
          message: `Use toBePartiallyPressed() instead of toHaveAttribute("aria-pressed", "mixed")`,
        },
      ],
      output: `expect(getByRole("button")).toBePartiallyPressed()`,
    },
  ],
});
