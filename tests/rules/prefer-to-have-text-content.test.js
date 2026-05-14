/**
 * @file Prefer ToHaveTextContent over checking element.textContent.
 * @author Ben Monro.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import { RuleTester } from "eslint";
import * as rule from "../../src/rules/prefer-to-have-text-content.js";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2015, sourceType: "module" },
});
ruleTester.run("prefer-to-have-text-content", rule, {
  valid: [
    `expect().toBe(true)`,
    `expect(string).toBe("foo")`,
    `expect(element).toHaveTextContent("foo")`,
    `expect(container.lastNode).toBe("foo")`,
    `expect(element.textContent).toEqualThing("foo")`,
    `expect(element.textContent).not.toStrictEqualThing("foo")`,
    `expect(element.textContent).toContain()`,
    `expect(element.textContent).not.toContain()`,
  ],

  invalid: [
    {
      code: 'expect(element.textContent).toBe("foo")',
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: `expect(element).toHaveTextContent(/^foo$/)`,
    },
    {
      code: `expect(screen.getByTestId("location").textContent).toBe("/")`,
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: String.raw`expect(screen.getByTestId("location")).toHaveTextContent(/^\/$/)`,
    },
    {
      code: 'expect(element.textContent).toBe("a.b [x] / y?")',
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: String.raw`expect(element).toHaveTextContent(/^a\.b \[x\] \/ y\?$/)`,
    },
    {
      code: "expect(element.textContent).toBe(`foo`)",
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: `expect(element).toHaveTextContent(/^foo$/)`,
    },
    {
      code: "expect(element.textContent).toBe(`hello ${name}`)",
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: null,
    },
    {
      code: "expect(element.textContent).toBe(text)",
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: null,
    },
    {
      code: "expect(element.textContent).toBe()",
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: null,
    },
    {
      code: 'expect(element.textContent).not.toBe("foo")',
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: `expect(element).not.toHaveTextContent(/^foo$/)`,
    },
    {
      code: 'expect(screen.getByText("foo").textContent).toBe("foo")',
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: `expect(screen.getByText("foo")).toHaveTextContent(/^foo$/)`,
    },
    {
      code: 'expect(container.firstChild.textContent).toBe("foo")',
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: `expect(container.firstChild).toHaveTextContent(/^foo$/)`,
    },
    {
      code: 'expect(element.textContent).toEqual("foo")',
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: `expect(element).toHaveTextContent(/^foo$/)`,
    },
    {
      code: 'expect(element.textContent).toStrictEqual("foo")',
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: `expect(element).toHaveTextContent(/^foo$/)`,
    },
    {
      code: 'expect(element.textContent).toContain("foo")',
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: `expect(element).toHaveTextContent(/foo/)`,
    },
    {
      code: 'expect(element.textContent).toContain("$42/month?")',
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: String.raw`expect(element).toHaveTextContent(/\$42\/month\?/)`,
    },
    {
      code: "expect(element.textContent).toContain(100)",
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: `expect(element).toHaveTextContent(/100/)`,
    },
    {
      code: 'expect(container.firstChild.textContent).toContain("foo")',
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: `expect(container.firstChild).toHaveTextContent(/foo/)`,
    },
    {
      code: `expect(container.textContent).toContain(FOO.bar)`,
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: `expect(container).toHaveTextContent(new RegExp(FOO.bar))`,
    },
    {
      code: `expect(container.textContent).not.toContain(FOO.bar)`,
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: `expect(container).not.toHaveTextContent(new RegExp(FOO.bar))`,
    },
    {
      code: "expect(container.textContent).toContain(`${FOO.bar} baz`)",
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: "expect(container).toHaveTextContent(new RegExp(`${FOO.bar} baz`))",
    },
    {
      code: `expect(container.textContent).toContain(bazify(FOO.bar))`,
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: `expect(container).toHaveTextContent(new RegExp(bazify(FOO.bar)))`,
    },
    {
      code: 'expect(element.textContent).toMatch("foo")',
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: `expect(element).toHaveTextContent(/foo/)`,
    },
    {
      code: "expect(element.textContent).toMatch(/foo bar/)",
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: "expect(element).toHaveTextContent(/foo bar/)",
    },
    {
      code: "expect(element.textContent).not.toMatch(/foo bar/)",
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: "expect(element).not.toHaveTextContent(/foo bar/)",
    },
    {
      code: 'expect(element.textContent).not.toMatch("foo")',
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: `expect(element).not.toHaveTextContent(/foo/)`,
    },
    {
      code: 'expect(element.textContent).not.toMatch("$42/month?")',
      errors: [
        {
          message: "Use toHaveTextContent instead of asserting on DOM node attributes",
        },
      ],
      output: String.raw`expect(element).not.toHaveTextContent(/\$42\/month\?/)`,
    },
  ],
});

/**
 * The rule selectors already narrow most AST shapes, so these defensive branches need direct listener invocation to
 * stay covered.
 *
 * @param {object} context - Minimal ESLint rule context.
 * @returns {Array.<(node: object) => void>} Prefer-to-have-text-content listeners.
 */
function getPreferToHaveTextContentListeners(context) {
  const listeners = Object.values(rule.create(context));

  expect(listeners).toHaveLength(4);

  return listeners;
}

/**
 * @param {object} object - Member object node.
 * @param {string} propertyName - Member property name.
 * @returns {object} Static member expression node.
 */
function createStaticMemberExpression(object, propertyName) {
  const property = {
    type: "Identifier",
    name: propertyName,
    range: [20, 30],
  };
  const member = {
    type: "MemberExpression",
    computed: false,
    object,
    property,
  };

  property.parent = member;

  return member;
}

/**
 * @param {object | undefined} expectedArg - Matcher argument.
 * @returns {object} Positive textContent matcher call node.
 */
function createPositiveMatcherCall(expectedArg) {
  const textContentAccess = createStaticMemberExpression(
    {
      type: "Identifier",
      name: "element",
      range: [0, 7],
    },
    "textContent",
  );
  const expectCall = {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: "expect",
    },
    arguments: [textContentAccess],
  };
  const matcherMember = createStaticMemberExpression(expectCall, "toBe");
  const matcherCall = {
    type: "CallExpression",
    callee: matcherMember,
    arguments: expectedArg ? [expectedArg] : [],
  };

  textContentAccess.parent = expectCall;
  expectCall.parent = matcherMember;
  matcherMember.parent = matcherCall;

  return textContentAccess;
}

/**
 * @param {object | undefined} expectedArg - Matcher argument.
 * @returns {object} Negated textContent matcher call node.
 */
function createNegatedMatcherCall(expectedArg) {
  const textContentAccess = createStaticMemberExpression(
    {
      type: "Identifier",
      name: "element",
      range: [0, 7],
    },
    "textContent",
  );
  const expectCall = {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: "expect",
    },
    arguments: [textContentAccess],
  };
  const notMember = createStaticMemberExpression(expectCall, "not");
  const matcherMember = createStaticMemberExpression(notMember, "toBe");
  const matcherCall = {
    type: "CallExpression",
    callee: matcherMember,
    arguments: expectedArg ? [expectedArg] : [],
  };

  textContentAccess.parent = expectCall;
  expectCall.parent = notMember;
  notMember.parent = matcherMember;
  matcherMember.parent = matcherCall;

  return textContentAccess;
}

describe("prefer-to-have-text-content defensive AST handling", () => {
  test("ignores malformed textContent assertions", () => {
    let reportCalls = 0;
    const report = () => {
      reportCalls += 1;
    };
    const [
      containingTextContentListener,
      exactTextContentListener,
      negatedExactTextContentListener,
      negatedContainingTextContentListener,
    ] = getPreferToHaveTextContentListeners({ report });
    const malformedNode = {
      type: "Identifier",
      name: "textContent",
    };

    containingTextContentListener(malformedNode);
    exactTextContentListener(malformedNode);
    negatedExactTextContentListener(malformedNode);
    negatedContainingTextContentListener(malformedNode);

    expect(reportCalls).toBe(0);
  });

  test("returns null fixes for template literals without cooked text", () => {
    /** @type {Array.<{ fix: (fixer: object) => null }>} */
    const reports = [];
    /** @param {{ fix: (fixer: object) => null }} descriptor - Report descriptor captured from context.report(). */
    const report = (descriptor) => {
      reports.push(descriptor);
    };
    const [, exactTextContentListener, negatedExactTextContentListener] =
      getPreferToHaveTextContentListeners({ report });
    const templateLiteralWithoutCookedText = {
      type: "TemplateLiteral",
      expressions: [],
      quasis: [
        {
          value: {},
        },
      ],
    };

    exactTextContentListener(createPositiveMatcherCall(templateLiteralWithoutCookedText));
    negatedExactTextContentListener(createNegatedMatcherCall(templateLiteralWithoutCookedText));

    expect(reports).toHaveLength(2);
    expect(reports.map((descriptor) => descriptor.fix({}))).toStrictEqual([null, null]);
  });
});
