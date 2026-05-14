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

/**
 * The rule selector already narrows most AST shapes, so these defensive branches need direct listener invocation to
 * stay covered.
 *
 * @param {object} context - Minimal ESLint rule context.
 * @returns {(node: object) => void} Prefer-partially-checked assertion listener.
 */
function getPreferPartiallyCheckedListener(context) {
  const listeners = Object.values(rule.create(context));

  expect(listeners).toHaveLength(1);

  const [listener] = listeners;

  return listener;
}

describe("prefer-partially-checked defensive AST handling", () => {
  test("ignores assertions whose callee is not a static member expression", () => {
    let reportCalls = 0;
    const report = () => {
      reportCalls += 1;
    };
    const preferPartiallyCheckedListener = getPreferPartiallyCheckedListener({ report });

    preferPartiallyCheckedListener({
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
    const preferPartiallyCheckedListener = getPreferPartiallyCheckedListener({ report });

    preferPartiallyCheckedListener({
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
    const preferPartiallyCheckedListener = getPreferPartiallyCheckedListener({ report });

    preferPartiallyCheckedListener({
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
                  value: "checkbox",
                  raw: '"checkbox"',
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
          value: "aria-checked",
        },
        {
          type: "Literal",
          value: "mixed",
          raw: '"mixed"',
        },
      ],
      range: [0, 40],
    });

    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({
      message: 'Use toBePartiallyChecked() instead of toHaveAttribute(, "mixed")',
    });
  });
});
