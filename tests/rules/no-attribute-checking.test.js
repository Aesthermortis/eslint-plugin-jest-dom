/**
 * @file Prefer ToBeDisabled or toBeEnabled over attribute checks.
 * @author Ben Monro.
 */

import createBannedAttributeTestCases from "../helpers/createBannedAttributeTestCases.js";
import { FlatCompatRuleTester as RuleTester } from "../rule-tester.js";
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
    parserOptions: { ecmaVersion: 2015, sourceType: "module" },
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
}
