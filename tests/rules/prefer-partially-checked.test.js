import { RuleTester } from "eslint";
import * as rule from "../../src/rules/prefer-partially-checked.js";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2015, sourceType: "module" },
});

ruleTester.run("prefer-partially-checked", rule, {
  valid: [
    `const el = screen.getByRole("checkbox"); expect(el).toBePartiallyChecked()`,
    `const el = screen.getByRole("checkbox"); expect(el).toHaveAttribute("aria-checked")`,
    `const el = screen.getByRole("checkbox"); expect(el).toHaveAttribute("aria-checked", "true")`,
    `const el = screen.getByRole("checkbox"); expect(el).toHaveAttribute("aria-checked", "false")`,
    `const el = screen.getByRole("checkbox"); expect(el).toHaveAttribute("aria-checked", mixed)`,
    `const el = screen.getByRole("checkbox"); expect(el).toHaveAttribute("aria-checked", \`mixed\`)`,
    `const el = screen.getByRole("checkbox"); expect(el).not.toHaveAttribute("aria-checked", "mixed")`,
    `const el = screen.getByRole("checkbox"); expect(el).not.toHaveProperty("aria-checked", "mixed")`,
    `const el = getFoo(); expect(el).toHaveAttribute("aria-checked", "mixed")`,
    `expect().toHaveAttribute("aria-checked", "mixed")`,
    `const el = screen.getByRole("checkbox"); expect(el).toHaveAttribute("aria-checked", "mixed", "extra")`,
  ],
  invalid: [
    {
      code: `const el = screen.getByRole("checkbox"); expect(el).toHaveAttribute("aria-checked", "mixed")`,
      errors: [
        {
          message: `Use toBePartiallyChecked() instead of toHaveAttribute("aria-checked", "mixed")`,
        },
      ],
      output: `const el = screen.getByRole("checkbox"); expect(el).toBePartiallyChecked()`,
    },
    {
      code: `const el = screen.getByRole("checkbox"); expect(el).toHaveProperty("aria-checked", "mixed")`,
      errors: [
        {
          message: `Use toBePartiallyChecked() instead of toHaveProperty("aria-checked", "mixed")`,
        },
      ],
      output: `const el = screen.getByRole("checkbox"); expect(el).toBePartiallyChecked()`,
    },
    {
      code: `expect(getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed")`,
      errors: [
        {
          message: `Use toBePartiallyChecked() instead of toHaveAttribute("aria-checked", "mixed")`,
        },
      ],
      output: `expect(getByRole("checkbox")).toBePartiallyChecked()`,
    },
  ],
});
