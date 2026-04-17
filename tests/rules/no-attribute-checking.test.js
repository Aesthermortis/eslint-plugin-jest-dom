/**
 * @file Prefer ToBeDisabled or toBeEnabled over attribute checks.
 * @author Ben Monro.
 */

import createBannedAttributeTestCases from "../fixtures/createBannedAttributeTestCases.js";
import { FlatCompatRuleTester as RuleTester } from "../rule-tester.js";
import rules from "../../src/rules/index.js";

const bannedAttributes = [
  {
    preferred: "toBeDisabled()",
    negatedPreferred: "toBeEnabled()",
    attributes: ["disabled"],
    ruleName: "prefer-enabled-disabled",
  },
  {
    preferred: "toBeRequired()",
    negatedPreferred: "not.toBeRequired()",
    attributes: ["required", "aria-required"],
    ruleName: "prefer-required",
  },
  {
    preferred: "toBeChecked()",
    negatedPreferred: "not.toBeChecked()",
    attributes: ["checked", "aria-checked"],
    ruleName: "prefer-checked",
  },
];

bannedAttributes.forEach(({ preferred, negatedPreferred, attributes, ruleName }) => {
  const rule = rules[ruleName];

  // const preferred = 'toBeDisabled()';
  // const negatedPreferred = 'toBeEnabled()';
  // const attributes = ['disabled'];
  const ruleTester = new RuleTester({
    parserOptions: { ecmaVersion: 2015, sourceType: "module" },
  });
  attributes.forEach((attribute) => {
    ruleTester.run(
      ruleName,
      rule,
      createBannedAttributeTestCases({
        preferred,
        negatedPreferred,
        attribute,
      }),
    );
  });
});

// Test that excludeValues ("mixed") are not flagged by prefer-checked
const excludeValuesCases = [
  {
    ruleName: "prefer-checked",
    attribute: "aria-checked",
  },
];

excludeValuesCases.forEach(({ ruleName, attribute }) => {
  const rule = rules[ruleName];
  const ruleTester = new RuleTester({
    parserOptions: { ecmaVersion: 2015, sourceType: "module" },
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
});
