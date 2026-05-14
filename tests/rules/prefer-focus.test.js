/**
 * @file Prefer ToHaveFocus over checking document.activeElement.
 * @author Ben Monro.
 */

import { RuleTester } from "eslint";
import * as rule from "../../src/rules/prefer-focus.js";

const ruleTester = new RuleTester({
  languageOptions: { sourceType: "module" },
});
ruleTester.run("prefer-focus", rule, {
  valid: [
    `expect().toBe(true)`,
    `expect(input).not.toHaveFocus();`,
    `expect(input).toHaveFocus();`,
    `expect(document.activeElement).toBeNull()`,
    `expect(document.activeElement).not.toBeNull()`,
    `expect(document.activeElement).toBe()`,
    `expect(document.activeElement).not.toBe()`,
  ],

  invalid: [
    {
      code: "expect(document.activeElement).toBe(foo)",
      errors: [
        {
          message: "Use toHaveFocus instead of checking activeElement",
        },
      ],
      output: "expect(foo).toHaveFocus()",
    },
    {
      code: `expect(document.activeElement).toBe(getByText('Foo'))`,
      errors: [
        {
          message: "Use toHaveFocus instead of checking activeElement",
        },
      ],
      output: `expect(getByText('Foo')).toHaveFocus()`,
    },
    {
      code: `expect(document.activeElement).not.toBe(getByText('Foo'))`,
      errors: [
        {
          message: "Use toHaveFocus instead of checking activeElement",
        },
      ],
      output: `expect(getByText('Foo')).not.toHaveFocus()`,
    },
    {
      code: "expect(document.activeElement).not.toBe(foo)",
      errors: [
        {
          message: "Use toHaveFocus instead of checking activeElement",
        },
      ],
      output: "expect(foo).not.toHaveFocus()",
    },
    {
      code: "expect(foo).not.toBe(document.activeElement)",
      errors: [
        {
          message: "Use toHaveFocus instead of checking activeElement",
        },
      ],
      output: "expect(foo).not.toHaveFocus()",
    },
    {
      code: "expect(window.document.activeElement).toBe(foo)",
      errors: [
        {
          message: "Use toHaveFocus instead of checking activeElement",
        },
      ],
      output: "expect(foo).toHaveFocus()",
    },
    {
      code: "expect(global.window.document.activeElement).toBe(foo)",
      errors: [
        {
          message: "Use toHaveFocus instead of checking activeElement",
        },
      ],
      output: "expect(foo).toHaveFocus()",
    },
    {
      code: "expect(global.document.activeElement).toBe(foo)",
      errors: [
        {
          message: "Use toHaveFocus instead of checking activeElement",
        },
      ],
      output: "expect(foo).toHaveFocus()",
    },
    {
      code: "expect(foo).toBe(global.document.activeElement)",
      errors: [
        {
          message: "Use toHaveFocus instead of checking activeElement",
        },
      ],
      output: "expect(foo).toHaveFocus()",
    },
    {
      code: "expect(foo).toBe(window.document.activeElement)",
      errors: [
        {
          message: "Use toHaveFocus instead of checking activeElement",
        },
      ],
      output: "expect(foo).toHaveFocus()",
    },

    {
      code: "expect(foo).toBe(global.window.document.activeElement)",
      errors: [
        {
          message: "Use toHaveFocus instead of checking activeElement",
        },
      ],
      output: "expect(foo).toHaveFocus()",
    },
    {
      code: "expect(foo).toBe(document.activeElement)",
      errors: [
        {
          message: "Use toHaveFocus instead of checking activeElement",
        },
      ],
      output: "expect(foo).toHaveFocus()",
    },

    {
      code: "expect(foo).toEqual(document.activeElement)",
      errors: [
        {
          message: "Use toHaveFocus instead of checking activeElement",
        },
      ],
      output: "expect(foo).toHaveFocus()",
    },
  ],
});

/**
 * The compared-active-element selectors already narrow most AST shapes, so these defensive branches need direct
 * listener invocation to stay covered.
 *
 * @param {object} context - Minimal ESLint rule context.
 * @returns {Array.<(node: object) => void>} Prefer-focus listeners.
 */
function getPreferFocusListeners(context) {
  const listeners = Object.values(rule.create(context));

  expect(listeners).toHaveLength(4);

  return listeners;
}

describe("prefer-focus defensive AST handling", () => {
  test("ignores compared activeElement assertions without matcher calls", () => {
    let reportCalls = 0;
    const report = () => {
      reportCalls += 1;
    };
    const [, comparedActiveElementWithNegatedExpectListener, , comparedActiveElementListener] =
      getPreferFocusListeners({ report });
    const activeElementNode = {
      parent: {
        type: "Identifier",
        name: "matcherCall",
      },
    };

    comparedActiveElementWithNegatedExpectListener(activeElementNode);
    comparedActiveElementListener(activeElementNode);

    expect(reportCalls).toBe(0);
  });
});
