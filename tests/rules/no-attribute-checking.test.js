/**
 * @file Prefer ToBeDisabled or toBeEnabled over attribute checks.
 * @author Ben Monro.
 */

import createBannedAttributeTestCases from "../helpers/createBannedAttributeTestCases.js";
import { RuleTester } from "eslint";
import * as preferChecked from "../../src/rules/prefer-checked.js";
import * as preferEnabledDisabled from "../../src/rules/prefer-enabled-disabled.js";
import * as preferRequired from "../../src/rules/prefer-required.js";

const bannedAttributes = [
  {
    preferred: "toBeDisabled()",
    negatedPreferred: "toBeEnabled()",
    attributes: ["disabled"],
    rule: preferEnabledDisabled,
    ruleName: "prefer-enabled-disabled",
  },
  {
    preferred: "toBeRequired()",
    negatedPreferred: "not.toBeRequired()",
    attributes: ["required", "aria-required"],
    rule: preferRequired,
    ruleName: "prefer-required",
  },
  {
    preferred: "toBeChecked()",
    negatedPreferred: "not.toBeChecked()",
    attributes: ["checked", "aria-checked"],
    rule: preferChecked,
    ruleName: "prefer-checked",
  },
];

for (const { preferred, negatedPreferred, attributes, rule, ruleName } of bannedAttributes) {
  // const preferred = 'toBeDisabled()';
  // const negatedPreferred = 'toBeEnabled()';
  // const attributes = ['disabled'];
  const ruleTester = new RuleTester({
    languageOptions: { ecmaVersion: 2015, sourceType: "module" },
  });
  for (const attribute of attributes) {
    ruleTester.run(
      ruleName,
      rule,
      createBannedAttributeTestCases({
        preferred,
        negatedPreferred,
        attribute,
      }),
    );
  }
}

// Test that excludeValues ("mixed") are not flagged by prefer-checked
const excludeValuesCases = [
  {
    ruleName: "prefer-checked",
    rule: preferChecked,
    attribute: "aria-checked",
  },
];

for (const { ruleName, rule, attribute } of excludeValuesCases) {
  const ruleTester = new RuleTester({
    languageOptions: { ecmaVersion: 2015, sourceType: "module" },
  });
  ruleTester.run(`${ruleName} (excludeValues: mixed)`, rule, {
    valid: [
      `const el = screen.getByText("foo"); expect(el).toHaveAttribute("${attribute}", "mixed")`,
      `const el = screen.getByText("foo"); expect(el).toHaveProperty("${attribute}", "mixed")`,
      `const el = screen.getByText("foo"); expect(el).not.toHaveAttribute("${attribute}", "mixed")`,
      `const el = screen.getByText("foo"); expect(el).not.toHaveProperty("${attribute}", "mixed")`,
      `expect(getByText("foo")).toHaveAttribute("${attribute}", "mixed")`,
      `expect(getByText("foo")).not.toHaveAttribute("${attribute}", "mixed")`,
    ],
    invalid: [],
  });
}

/**
 * The rule selectors already narrow most AST shapes, so these defensive branches need direct listener invocation to
 * stay covered.
 *
 * @param {object} context - Minimal ESLint rule context.
 * @returns {Array.<(node: object) => void>} Prefer-enabled-disabled listeners.
 */
function getPreferEnabledDisabledListeners(context) {
  const listeners = Object.values(preferEnabledDisabled.create(context));

  expect(listeners).toHaveLength(4);

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

/**
 * @param {string} value - Literal value.
 * @returns {object} String literal node.
 */
function createStringLiteral(value) {
  return {
    type: "Literal",
    value,
    raw: `'${value}'`,
  };
}

/**
 * @param {object} callee - Callee node.
 * @param {object[]} args - Call arguments.
 * @returns {object} Call expression node.
 */
function createCallExpression(callee, args = []) {
  return {
    type: "CallExpression",
    callee,
    arguments: args,
    range: [0, 30],
  };
}

describe("createBannedAttributeRule defensive AST handling", () => {
  test("ignores malformed banned attribute assertions", () => {
    let reportCalls = 0;
    const report = () => {
      reportCalls += 1;
    };
    const [
      negatedPreferredListener,
      directAttributeListener,
      negatedAttributeMatcherListener,
      attributeMatcherListener,
    ] = getPreferEnabledDisabledListeners({ report });
    const malformedMatcherCall = createCallExpression(
      {
        type: "Identifier",
        name: "toBeDisabled",
      },
      [createStringLiteral("disabled")],
    );
    const matcherCallWithIdentifierObject = createCallExpression(
      createStaticMemberExpression(
        {
          type: "Identifier",
          name: "expectResult",
        },
        "toBeDisabled",
      ),
    );
    const directAttributeMatcherCall = createCallExpression(
      createStaticMemberExpression(
        createCallExpression(
          {
            type: "Identifier",
            name: "expect",
          },
          [
            createStaticMemberExpression(
              {
                type: "Identifier",
                name: "element",
                range: [0, 7],
              },
              "value",
            ),
          ],
        ),
        "toBeTruthy",
      ),
    );
    const negatedAttributeMatcherCallWithIdentifierArg = createCallExpression(
      createStaticMemberExpression(
        createStaticMemberExpression(
          createCallExpression(
            {
              type: "Identifier",
              name: "expect",
            },
            [
              {
                type: "Identifier",
                name: "element",
              },
            ],
          ),
          "not",
        ),
        "toHaveAttribute",
      ),
      [
        {
          type: "Identifier",
          name: "disabled",
        },
      ],
    );

    negatedPreferredListener(malformedMatcherCall);
    negatedPreferredListener(matcherCallWithIdentifierObject);
    directAttributeListener(malformedMatcherCall);
    directAttributeListener(directAttributeMatcherCall);
    negatedAttributeMatcherListener(malformedMatcherCall);
    negatedAttributeMatcherListener(matcherCallWithIdentifierObject);
    negatedAttributeMatcherListener(negatedAttributeMatcherCallWithIdentifierArg);
    attributeMatcherListener(malformedMatcherCall);

    expect(reportCalls).toBe(0);
  });
});
