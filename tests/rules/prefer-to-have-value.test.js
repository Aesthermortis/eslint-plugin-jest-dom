/**
 * @file Prefer ToBeEmptyDOMElement over checking innerHTML.
 * @author Ben Monro.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import { RuleTester } from "eslint";
import * as rule from "../../src/rules/prefer-to-have-value.js";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2020, sourceType: "module" },
});

const errors = [{ messageId: "use-to-have-value" }];
ruleTester.run("prefer-to-have-value", rule, {
  valid: [
    `expect().toBe(true)`,
    `expect(screen.getByRole("radio").value).toEqual("foo")`,
    `expect(screen.queryAllByRole("checkbox")[0].value).toStrictEqual("foo")`,
    `async function x() { expect((await screen.findByRole("button")).value).toBe("foo") }`,

    `expect(element).toHaveValue('foo')`,
    `expect(element.value).toBeGreaterThan(2);`,
    `expect(element.value).toBeLessThan(2);`,

    `const element = document.getElementById('asdfasf');
    expect(element.value).toEqual('foo');`,

    `let element;
    element = someOtherFunction();
    expect(element.value).toStrictEqual('foo');`,

    `const element = { value: 'foo' };
    expect(element.value).toBe('foo');`,

    `expect(screen.getByRole("radio").value).not.toEqual("foo")`,
    `expect(screen.queryAllByRole("checkbox")[0].value).not.toStrictEqual("foo")`,
    `async function x() { expect((await screen.findByRole("button")).value).not.toBe("foo") }`,

    `const element = document.getElementById('asdfasf');
    expect(element.value).not.toEqual('foo');`,

    `let element;
    element = someOtherFunction();
    expect(element.value).not.toStrictEqual('foo');`,

    `const element = { value: 'foo' };
    expect(element.value).not.toBe('foo');`,
    `
      const res = makePath()();
      expect(res.value).toEqual('/repositories/create');
    `,
  ],
  invalid: [
    {
      code: `expect(element).toHaveAttribute('value', 'foo')`,
      errors,
      output: `expect(element).toHaveValue('foo')`,
    },
    {
      code: `expect(element).toHaveProperty("value", "foo")`,
      errors,
      output: `expect(element).toHaveValue("foo")`,
    },
    {
      code: `expect(element).not.toHaveAttribute('value', 'foo')`,
      errors,
      output: `expect(element).not.toHaveValue('foo')`,
    },
    {
      code: `expect(element).not.toHaveProperty("value", "foo")`,
      errors,
      output: `expect(element).not.toHaveValue("foo")`,
    },
    //==========================================================================
    {
      code: `expect(screen.getByRole("textbox").value).toEqual("foo")`,
      errors,
      output: `expect(screen.getByRole("textbox")).toHaveValue("foo")`,
    },
    {
      code: `expect(screen.queryByRole("dropdown").value).toEqual("foo")`,
      errors,
      output: `expect(screen.queryByRole("dropdown")).toHaveValue("foo")`,
    },
    {
      code: `async function x() { expect((await screen.findByRole("textbox")).value).toEqual("foo") }`,
      errors,
      output: `async function x() { expect((await screen.findByRole("textbox"))).toHaveValue("foo") }`,
    },
    {
      code: `const element = screen.getByRole("textbox"); expect(element.value).toBe("foo");`,
      errors,
      output: `const element = screen.getByRole("textbox"); expect(element).toHaveValue("foo");`,
    },
    {
      code: `expect(screen.getByRole("textbox").value).not.toEqual("foo")`,
      errors,
      output: `expect(screen.getByRole("textbox")).not.toHaveValue("foo")`,
    },
    {
      code: `expect(screen.queryByRole("dropdown").value).not.toEqual("foo")`,
      errors,
      output: `expect(screen.queryByRole("dropdown")).not.toHaveValue("foo")`,
    },
    {
      code: `async function x() { expect((await screen.getByRole("textbox")).value).not.toEqual("foo") }`,
      errors,
      output: `async function x() { expect((await screen.getByRole("textbox"))).not.toHaveValue("foo") }`,
    },
    {
      code: `const element = screen.getByRole("textbox"); expect(element.value).not.toBe("foo");`,
      errors,
      output: `const element = screen.getByRole("textbox"); expect(element).not.toHaveValue("foo");`,
    },
  ],
});

/**
 * The rule selectors already narrow most AST shapes, so these defensive branches need direct listener invocation to
 * stay covered.
 *
 * @param {object} context - Minimal ESLint rule context.
 * @returns {Array.<(node: object) => void>} Prefer-to-have-value listeners.
 */
function getPreferToHaveValueListeners(context) {
  const listeners = Object.values(rule.create(context));

  expect(listeners).toHaveLength(3);

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

/** @returns {object} Testing Library query call node. */
function createTextboxQueryCall() {
  return {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: "getByRole",
    },
    arguments: [
      {
        type: "Literal",
        value: "textbox",
      },
    ],
  };
}

/**
 * @param {object} valueAccess - Element value access node.
 * @returns {object} Positive matcher call node.
 */
function createPositiveValueMatcherCall(valueAccess) {
  return {
    type: "CallExpression",
    callee: createStaticMemberExpression(
      {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: "expect",
        },
        arguments: [valueAccess],
      },
      "toBe",
    ),
    arguments: [
      {
        type: "Literal",
        value: "hello",
      },
    ],
  };
}

/**
 * @param {object} valueAccess - Element value access node.
 * @returns {object} Negated matcher call node.
 */
function createNegatedValueMatcherCall(valueAccess) {
  return {
    type: "CallExpression",
    callee: createStaticMemberExpression(
      createStaticMemberExpression(
        {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: "expect",
          },
          arguments: [valueAccess],
        },
        "not",
      ),
      "toBe",
    ),
    arguments: [
      {
        type: "Literal",
        value: "hello",
      },
    ],
  };
}

describe("prefer-to-have-value defensive AST handling", () => {
  test("ignores malformed value assertions", () => {
    let reportCalls = 0;
    const report = () => {
      reportCalls += 1;
    };
    const [positiveValueListener, negatedValueListener, valueAttributeListener] =
      getPreferToHaveValueListeners({ report });

    positiveValueListener({
      callee: {
        type: "Identifier",
        name: "toBe",
      },
    });
    positiveValueListener({
      callee: createStaticMemberExpression(
        {
          type: "Identifier",
          name: "expectResult",
        },
        "toBe",
      ),
    });
    negatedValueListener({
      callee: {
        type: "Identifier",
        name: "toBe",
      },
    });
    negatedValueListener({
      callee: createStaticMemberExpression(
        createStaticMemberExpression(
          {
            type: "Identifier",
            name: "expectResult",
          },
          "not",
        ),
        "toBe",
      ),
    });
    valueAttributeListener({
      callee: {
        type: "Identifier",
        name: "toHaveAttribute",
      },
      arguments: [],
    });
    valueAttributeListener({
      callee: createStaticMemberExpression(
        {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: "expect",
          },
          arguments: [],
        },
        "toHaveAttribute",
      ),
      arguments: [
        {
          type: "Literal",
          value: "value",
        },
      ],
    });

    expect(reportCalls).toBe(0);
  });

  test("returns null fixes when the value property token is unavailable", () => {
    /** @type {Array.<{ fix: (fixer: object) => null }>} */
    const reports = [];
    /** @param {{ fix: (fixer: object) => null }} descriptor - Report descriptor captured from context.report(). */
    const report = (descriptor) => {
      reports.push(descriptor);
    };
    const [positiveValueListener, negatedValueListener] = getPreferToHaveValueListeners({
      report,
      sourceCode: {
        getTokenBefore: () => null,
      },
    });
    const positiveValueAccess = createStaticMemberExpression(createTextboxQueryCall(), "value");
    const negatedValueAccess = createStaticMemberExpression(createTextboxQueryCall(), "value");
    const fixer = {};

    positiveValueListener(createPositiveValueMatcherCall(positiveValueAccess));
    negatedValueListener(createNegatedValueMatcherCall(negatedValueAccess));

    expect(reports).toHaveLength(2);
    expect(reports.map((descriptor) => descriptor.fix(fixer))).toStrictEqual([null, null]);
  });
});
