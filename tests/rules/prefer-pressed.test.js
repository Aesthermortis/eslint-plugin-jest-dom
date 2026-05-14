import { RuleTester } from "eslint";
import * as rule from "../../src/rules/prefer-pressed.js";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2015, sourceType: "module" },
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

/**
 * The rule selector already narrows most AST shapes, so these defensive branches need direct listener invocation to
 * stay covered.
 *
 * @param {object} context - Minimal ESLint rule context.
 * @returns {(node: object) => void} Prefer-pressed assertion listener.
 */
function getPreferPressedListener(context) {
  const listeners = Object.values(rule.create(context));

  expect(listeners).toHaveLength(1);

  const [listener] = listeners;

  return listener;
}

describe("prefer-pressed defensive AST handling", () => {
  test("ignores assertions whose callee is not a static member expression", () => {
    let reportCalls = 0;
    const report = () => {
      reportCalls += 1;
    };
    const preferPressedListener = getPreferPressedListener({ report });

    preferPressedListener({
      callee: {
        type: "Identifier",
        name: "toHaveAttribute",
      },
      arguments: [],
    });

    expect(reportCalls).toBe(0);
  });

  test("ignores assertions whose expect target is not a call expression", () => {
    let reportCalls = 0;
    const report = () => {
      reportCalls += 1;
    };
    const preferPressedListener = getPreferPressedListener({ report });

    preferPressedListener({
      callee: {
        type: "MemberExpression",
        computed: false,
        object: {
          type: "Identifier",
          name: "expectResult",
        },
        property: {
          type: "Identifier",
          name: "toHaveAttribute",
        },
      },
      arguments: [],
    });

    expect(reportCalls).toBe(0);
  });

  test("reports when a matcher argument has no raw source text", () => {
    /** @type {object[]} */
    const reports = [];
    /** @param {object} descriptor - Report descriptor captured from context.report(). */
    const report = (descriptor) => {
      reports.push(descriptor);
    };
    const preferPressedListener = getPreferPressedListener({ report });

    preferPressedListener({
      callee: {
        type: "MemberExpression",
        computed: false,
        object: {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: "expect",
          },
          arguments: [
            {
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: "getByRole",
              },
              arguments: [
                {
                  type: "Literal",
                  value: "button",
                  raw: '"button"',
                },
              ],
            },
          ],
        },
        property: {
          type: "Identifier",
          name: "toHaveAttribute",
          range: [0, 15],
        },
      },
      arguments: [
        {
          type: "Literal",
          value: "aria-pressed",
        },
        {
          type: "Literal",
          value: "true",
          raw: '"true"',
        },
      ],
      range: [0, 40],
    });

    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({
      messageId: "preferPressed",
      data: {
        preferred: "toBePressed",
        incorrectFunction: "toHaveAttribute",
        matcherArguments: ', "true"',
      },
    });
  });
});
