import { FlatCompatRuleTester as RuleTester } from "../rule-tester.js";
import * as rule from "../../src/rules/prefer-pressed.js";

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: "module" },
});

ruleTester.run("prefer-pressed", rule, {
  valid: [
    `const el = screen.getByRole("button"); expect(el).toBePressed()`,
    `const el = screen.getByRole("button"); expect(el).not.toBePressed()`,
    `const el = screen.getByRole("button"); expect(el).toHaveAttribute("aria-pressed")`,
    `const el = screen.getByRole("button"); expect(el).toHaveAttribute("aria-pressed", "mixed")`,
    `const el = screen.getByRole("button"); expect(el).toHaveAttribute("aria-pressed", state)`,
    `const el = screen.getByRole("button"); expect(el).toHaveAttribute("aria-pressed", \`true\`)`,
    `const el = screen.getByRole("button"); expect(el).not.toHaveAttribute("aria-pressed", "true")`,
    `const el = screen.getByRole("button"); expect(el).not.toHaveProperty("aria-pressed", "false")`,
    `const el = screen.getByRole("button"); expect(el).toHaveAttribute("aria-checked", "true")`,
    `const el = getFoo(); expect(el).toHaveAttribute("aria-pressed", "true")`,
    `expect().toHaveAttribute("aria-pressed", "true")`,
    `const el = screen.getByRole("button"); expect(el).toHaveAttribute("aria-pressed", "true", "extra")`,
  ],
  invalid: [
    {
      code: `const el = screen.getByRole("button"); expect(el).toHaveAttribute("aria-pressed", "true")`,
      errors: [
        {
          message: `Use toBePressed() instead of toHaveAttribute("aria-pressed", "true")`,
        },
      ],
      output: `const el = screen.getByRole("button"); expect(el).toBePressed()`,
    },
    {
      code: `const el = screen.getByRole("button"); expect(el).toHaveAttribute("aria-pressed", "false")`,
      errors: [
        {
          message: `Use not.toBePressed() instead of toHaveAttribute("aria-pressed", "false")`,
        },
      ],
      output: `const el = screen.getByRole("button"); expect(el).not.toBePressed()`,
    },
    {
      code: `const el = screen.getByRole("button"); expect(el).toHaveProperty("aria-pressed", "true")`,
      errors: [
        {
          message: `Use toBePressed() instead of toHaveProperty("aria-pressed", "true")`,
        },
      ],
      output: `const el = screen.getByRole("button"); expect(el).toBePressed()`,
    },
    {
      code: `const el = screen.getByRole("button"); expect(el).toHaveProperty("aria-pressed", "false")`,
      errors: [
        {
          message: `Use not.toBePressed() instead of toHaveProperty("aria-pressed", "false")`,
        },
      ],
      output: `const el = screen.getByRole("button"); expect(el).not.toBePressed()`,
    },
    {
      code: `expect(getByRole("button")).toHaveAttribute("aria-pressed", "true")`,
      errors: [
        {
          message: `Use toBePressed() instead of toHaveAttribute("aria-pressed", "true")`,
        },
      ],
      output: `expect(getByRole("button")).toBePressed()`,
    },
    {
      code: `expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true")`,
      errors: [
        {
          message: `Use toBePressed() instead of toHaveAttribute("aria-pressed", "true")`,
        },
      ],
      output: `expect(screen.getByRole("button")).toBePressed()`,
    },
    {
      code: `expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false")`,
      errors: [
        {
          message: `Use not.toBePressed() instead of toHaveAttribute("aria-pressed", "false")`,
        },
      ],
      output: `expect(screen.getByRole("button")).not.toBePressed()`,
    },
  ],
});
