/**
 * @file Prefer ToBeEmptyDOMElement over checking innerHTML.
 * @author Ben Monro.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import { RuleTester } from "eslint";
import * as rule from "../../src/rules/prefer-empty.js";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2015, sourceType: "module" },
});
ruleTester.run("prefer-empty", rule, {
  valid: [
    `expect().toBe(true)`,
    `expect(element.innerHTML).toBe('foo')`,
    `expect(element.innerHTML).toBe(foo)`,
    `expect(element.innerHTML).toBe(foo + bar)`,
    `expect(element.innerHTML).toBe(foo())`,
    `expect(element.innerHTML).toBe(foo().bar)`,
    `expect(element.innerHTML).toBe(foo.bar)`,
    `expect(element.innerHTML).not.toBe(foo + bar)`,
    `expect(element.innerHTML).not.toBe(foo())`,
    `expect(element.innerHTML).not.toBe(foo().bar)`,
    `expect(element.innerHTML).not.toBe(foo.bar)`,
    `expect(element.innerHTML).not.toBe('foo')`,
    `expect(element.innerHTML).not.toBe(foo)`,
    "expect(statusText.innerHTML).toBe(`${value}%`)",
    "expect(statusText.innerHTML).not.toBe(`${value}%`)",
    "expect(statusText.innerHTML).toBe(`value`)",
    "expect(statusText.innerHTML).not.toBe(`value`)",
    "expect(statusText.innerHTML).toBe(` `)",
    "expect(statusText.innerHTML).not.toBe(` `)",
    `expect(element.firstChild).toBe('foo')`,
    `expect(element.firstChild).not.toBe('foo')`,
    "expect(element.firstChild).toBe(`foo`)",
    'expect(screen.getByText("foo").innerHTML).toBe(`foo ${bar}`)',
    `expect(getByText("foo").innerHTML).toBe('foo')`,
    `expect(getByText("foo").innerHTML).not.toBe('foo')`,
    `expect(getByText("foo").firstChild).toBe('foo')`,
    `expect(getByText("foo").firstChild).not.toBe('foo')`,
    `expect(element.innerHTML === 'foo').toBe(true)`,
    `expect(element.innerHTML !== 'foo').toBe(true)`,
  ],

  invalid: [
    {
      code: `expect(element.innerHTML === '').toBe(true)`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(element).toBeEmptyDOMElement()`,
    },
    {
      code: `expect(element.innerHTML !== '').toBe(true)`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(element).not.toBeEmptyDOMElement()`,
    },
    {
      code: `expect(element.innerHTML === '').toBe(false)`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(element).not.toBeEmptyDOMElement()`,
    },
    {
      code: `expect(element.innerHTML !== '').toBe(false)`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(element).toBeEmptyDOMElement()`,
    },
    {
      code: `expect(element.firstChild === null).toBe(true)`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(element).toBeEmptyDOMElement()`,
    },
    {
      code: `expect(element.firstChild !== null).toBe(false)`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(element).toBeEmptyDOMElement()`,
    },
    {
      code: `expect(element.firstChild === null).toBe(false)`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(element).not.toBeEmptyDOMElement()`,
    },
    {
      code: `expect(element.innerHTML).toBe('')`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(element).toBeEmptyDOMElement()`,
    },
    {
      code: "expect(element.innerHTML).toBe(``)",
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(element).toBeEmptyDOMElement()`,
    },

    {
      code: `expect(element.innerHTML).toBe(null)`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(element).toBeEmptyDOMElement()`,
    },
    {
      code: `expect(element.innerHTML).not.toBe(null)`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(element).not.toBeEmptyDOMElement()`,
    },

    {
      code: `expect(element.innerHTML).not.toBe('')`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(element).not.toBeEmptyDOMElement()`,
    },
    {
      code: "expect(element.innerHTML).not.toBe(``)",
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(element).not.toBeEmptyDOMElement()`,
    },

    {
      code: `expect(element.firstChild).toBeNull()`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(element).toBeEmptyDOMElement()`,
    },
    {
      code: `expect(element.firstChild).toBe(null)`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(element).toBeEmptyDOMElement()`,
    },
    {
      code: `expect(element.firstChild).not.toBe(null)`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(element).not.toBeEmptyDOMElement()`,
    },

    {
      code: `expect(element.firstChild).not.toBeNull()`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(element).not.toBeEmptyDOMElement()`,
    },
    {
      code: `expect(getByText('foo').innerHTML).toBe('')`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(getByText('foo')).toBeEmptyDOMElement()`,
    },

    {
      code: `expect(getByText('foo').innerHTML).toStrictEqual('')`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(getByText('foo')).toBeEmptyDOMElement()`,
    },

    {
      code: `expect(getByText('foo').innerHTML).toStrictEqual(null)`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(getByText('foo')).toBeEmptyDOMElement()`,
    },

    {
      code: `expect(getByText('foo').firstChild).toBe(null)`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(getByText('foo')).toBeEmptyDOMElement()`,
    },
    {
      code: `expect(getByText('foo').firstChild).not.toBe(null)`,
      errors: [
        {
          message: "Use toBeEmptyDOMElement instead of checking inner html.",
        },
      ],
      output: `expect(getByText('foo')).not.toBeEmptyDOMElement()`,
    },
  ],
});

/**
 * The rule selectors already narrow most AST shapes, so these defensive branches need direct listener invocation to
 * stay covered.
 *
 * @param {object} context - Minimal ESLint rule context.
 * @returns {Array.<(node: object) => void>} Prefer-empty listeners.
 */
function getPreferEmptyListeners(context) {
  const listeners = Object.values(rule.create(context));

  expect(listeners).toHaveLength(8);

  return listeners;
}

/**
 * @param {object} object - Member object node.
 * @param {string} propertyName - Member property name.
 * @returns {object} Static member expression node.
 */
function createStaticMemberExpression(object, propertyName) {
  return {
    type: "MemberExpression",
    computed: false,
    object,
    property: {
      type: "Identifier",
      name: propertyName,
      range: [10, 15],
    },
  };
}

describe("prefer-empty defensive AST handling", () => {
  test("ignores malformed empty assertions", () => {
    let reportCalls = 0;
    const report = () => {
      reportCalls += 1;
    };
    const [
      emptyInnerHtmlBinaryListener,
      emptyFirstChildBinaryListener,
      positiveInnerHtmlListener,
      negativeInnerHtmlListener,
      positiveFirstChildNullListener,
      ,
      negativeFirstChildNullListener,
    ] = getPreferEmptyListeners({
      report,
      sourceCode: {
        getText: () => "null",
      },
    });
    const malformedNode = {
      type: "Identifier",
      name: "innerHTML",
    };
    const staticInnerHtmlNode = createStaticMemberExpression(
      {
        type: "Identifier",
        name: "element",
        range: [0, 7],
      },
      "innerHTML",
    );
    const staticFirstChildNode = createStaticMemberExpression(
      {
        type: "Identifier",
        name: "element",
        range: [0, 7],
      },
      "firstChild",
    );

    emptyInnerHtmlBinaryListener({
      left: malformedNode,
    });
    emptyFirstChildBinaryListener({
      left: staticFirstChildNode,
    });
    positiveInnerHtmlListener(malformedNode);
    positiveInnerHtmlListener(staticInnerHtmlNode);
    negativeInnerHtmlListener(malformedNode);
    negativeInnerHtmlListener(staticInnerHtmlNode);
    positiveFirstChildNullListener(malformedNode);
    negativeFirstChildNullListener(staticFirstChildNode);

    expect(reportCalls).toBe(0);
  });
});
