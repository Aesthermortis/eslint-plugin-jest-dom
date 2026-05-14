/**
 * @file Prefer ToHaveAttribute over checking getAttribute/hasAttribute.
 * @author Ben Monro.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import { RuleTester } from "eslint";
import * as rule from "../../src/rules/prefer-to-have-attribute.js";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2015, sourceType: "module" },
});
ruleTester.run("prefer-to-have-attribute", rule, {
  valid: [
    "expect().toBe(true)",
    "expect(element.foo).toBeTruthy()",
    "expect(element.getAttributeNode()).toBeNull()",
    `expect(element.getAttribute('foo')).toBeGreaterThan(2)`,
    `expect(element.getAttribute('foo')).toBeLessThan(2)`,
    `expect(element.getAttribute('foo')).toContain()`,
    `expect(element.getAttribute('foo')).toBe()`,
  ],

  invalid: [
    {
      code: `expect(element.getAttribute('foo')).toMatch(/bar/);`,
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on getAttribute",
        },
      ],
      output: `expect(element).toHaveAttribute('foo', expect.stringMatching(/bar/));`,
    },
    {
      code: `expect(element.getAttribute('foo')).toContain('bar');`,
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on getAttribute",
        },
      ],
      output: `expect(element).toHaveAttribute('foo', expect.stringContaining('bar'));`,
    },
    {
      code: "expect(element.getAttribute('foo')).toContain(`bar=${encodeURIComponent(baz.id)}`);",
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on getAttribute",
        },
      ],
      output:
        "expect(element).toHaveAttribute('foo', expect.stringContaining(`bar=${encodeURIComponent(baz.id)}`));",
    },
    {
      code: 'expect(element.getAttribute("foo")).toBe("bar")',
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on getAttribute",
        },
      ],
      output: 'expect(element).toHaveAttribute("foo", "bar")',
    },
    {
      code: `expect(getByText("yes").getAttribute("data-blah")).toBe(expect.stringMatching(/foo/))`,
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on getAttribute",
        },
      ],
      output: `expect(getByText("yes")).toHaveAttribute("data-blah", expect.stringMatching(/foo/))`,
    },
    {
      code: `expect(getByText("yes").getAttribute("data-blah")).toBe("")`,
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on getAttribute",
        },
      ],
      output: `expect(getByText("yes")).toHaveAttribute("data-blah", "")`,
    },
    {
      code: `expect(getByText("yes").getAttribute("data-blah")).toBe('')`,
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on getAttribute",
        },
      ],
      output: `expect(getByText("yes")).toHaveAttribute("data-blah", '')`,
    },
    {
      code: `expect(getByText('foo').hasAttribute('foo')).toBe(null)`,
      errors: [
        {
          message: "Invalid matcher for hasAttribute",
        },
      ],
      output: null,
    },
    {
      code: `expect(getByText('foo').hasAttribute('foo')).toBeNull()`,
      errors: [
        {
          message: "Invalid matcher for hasAttribute",
        },
      ],
      output: null,
    },
    {
      code: `expect(getByText('foo').getAttribute('foo')).toBeDefined()`,
      errors: [
        {
          message: "Invalid matcher for getAttribute",
        },
      ],
      output: null,
    },
    {
      code: `expect(getByText('foo').getAttribute('foo')).toBeUndefined()`,
      errors: [
        {
          message: "Invalid matcher for getAttribute",
        },
      ],
      output: null,
    },
    {
      code: `expect(getByText('foo').hasAttribute('foo')).toBeUndefined()`,
      errors: [
        {
          message: "Invalid matcher for hasAttribute",
        },
      ],
      output: null,
    },
    {
      code: 'expect(element.hasAttribute("foo")).toBeTruthy()',
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on hasAttribute",
        },
      ],
      output: 'expect(element).toHaveAttribute("foo")',
    },
    {
      code: 'expect(element.hasAttribute("foo")).toBeFalsy()',
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on hasAttribute",
        },
      ],
      output: 'expect(element).not.toHaveAttribute("foo")',
    },
    {
      code: 'expect(element.hasAttribute("foo")).toBe(true)',
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on hasAttribute",
        },
      ],
      output: 'expect(element).toHaveAttribute("foo")',
    },
    {
      code: 'expect(element.hasAttribute("foo")).toBe(false)',
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on hasAttribute",
        },
      ],
      output: 'expect(element).not.toHaveAttribute("foo")',
    },
    {
      code: 'expect(element.hasAttribute("foo")).toEqual(false)',
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on hasAttribute",
        },
      ],
      output: 'expect(element).not.toHaveAttribute("foo")',
    },
    {
      code: 'expect(element.getAttribute("foo")).toEqual("bar")',
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on getAttribute",
        },
      ],
      output: 'expect(element).toHaveAttribute("foo", "bar")',
    },
    {
      code: `expect(getByText("yes").getAttribute("data-blah")).toEqual("")`,
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on getAttribute",
        },
      ],
      output: `expect(getByText("yes")).toHaveAttribute("data-blah", "")`,
    },
    {
      code: `expect(getByText("yes").getAttribute("data-blah")).toEqual('')`,
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on getAttribute",
        },
      ],
      output: `expect(getByText("yes")).toHaveAttribute("data-blah", '')`,
    },
    {
      code: 'expect(element.getAttribute("foo")).toStrictEqual("bar")',
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on getAttribute",
        },
      ],
      output: 'expect(element).toHaveAttribute("foo", "bar")',
    },
    {
      code: `expect(getByText("yes").getAttribute("data-blah")).toStrictEqual("")`,
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on getAttribute",
        },
      ],
      output: `expect(getByText("yes")).toHaveAttribute("data-blah", "")`,
    },
    {
      code: `expect(getByText("yes").getAttribute("data-blah")).toStrictEqual('')`,
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on getAttribute",
        },
      ],
      output: `expect(getByText("yes")).toHaveAttribute("data-blah", '')`,
    },
    {
      code: 'expect(element.getAttribute("foo")).toBe(null)',
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on getAttribute",
        },
      ],
      output: 'expect(element).not.toHaveAttribute("foo")',
    },
    {
      code: 'expect(element.getAttribute("foo")).toBeNull()',
      errors: [
        {
          message: "Use toHaveAttribute instead of asserting on getAttribute",
        },
      ],
      output: 'expect(element).not.toHaveAttribute("foo")',
    },
  ],
});

/**
 * The rule selectors already narrow most AST shapes, so these defensive branches need direct listener invocation to
 * stay covered.
 *
 * @param {object} context - Minimal ESLint rule context.
 * @returns {Array.<(node: object) => void>} Prefer-to-have-attribute listeners.
 */
function getPreferToHaveAttributeListeners(context) {
  const listeners = Object.values(rule.create(context));

  expect(listeners).toHaveLength(7);

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

/** @returns {object} Attribute name argument node. */
function createAttributeNameArgument() {
  return {
    type: "Literal",
    value: "foo",
  };
}

/**
 * @param {string} methodName - Attribute accessor method name.
 * @returns {object} Attribute accessor call node without assertion parents.
 */
function createUnparentedAttributeCall(methodName) {
  return {
    type: "CallExpression",
    callee: createStaticMemberExpression(
      {
        type: "Identifier",
        name: "element",
        range: [0, 7],
      },
      methodName,
    ),
    arguments: [createAttributeNameArgument()],
  };
}

describe("prefer-to-have-attribute defensive AST handling", () => {
  test("ignores malformed attribute assertions", () => {
    let reportCalls = 0;
    const report = () => {
      reportCalls += 1;
    };
    const [
      getAttributeToBeNullListener,
      getAttributeContainOrMatchListener,
      getAttributeEqualityListener,
      invalidHasAttributeMatcherListener,
      invalidGetAttributeMatcherListener,
      hasAttributeEqualityListener,
      hasAttributeTruthyOrFalsyListener,
    ] = getPreferToHaveAttributeListeners({ report });

    getAttributeToBeNullListener({
      type: "CallExpression",
      callee: {
        type: "Identifier",
        name: "getAttribute",
      },
      arguments: [createAttributeNameArgument()],
    });
    getAttributeToBeNullListener({
      type: "CallExpression",
      callee: createStaticMemberExpression(
        {
          type: "Identifier",
          name: "element",
        },
        "getAttribute",
      ),
      arguments: [],
    });

    getAttributeToBeNullListener(createUnparentedAttributeCall("getAttribute"));
    getAttributeContainOrMatchListener(createUnparentedAttributeCall("getAttribute"));
    getAttributeEqualityListener(createUnparentedAttributeCall("getAttribute"));
    invalidHasAttributeMatcherListener(createUnparentedAttributeCall("hasAttribute"));
    invalidGetAttributeMatcherListener(createUnparentedAttributeCall("getAttribute"));
    hasAttributeEqualityListener(createUnparentedAttributeCall("hasAttribute"));
    hasAttributeTruthyOrFalsyListener(createUnparentedAttributeCall("hasAttribute"));

    expect(reportCalls).toBe(0);
  });
});
