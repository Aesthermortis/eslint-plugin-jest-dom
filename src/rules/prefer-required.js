/**
 * @file Prefer ToBeDisabled or toBeEnabled over attribute checks.
 * @author Ben Monro.
 */

import createBannedAttributeRule from "../createBannedAttributeRule.js";

/** @import {JestDomRuleModule} from "../types.d.ts" */

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    description: "prefer toBeRequired over checking properties",
    recommended: true,
    url: "prefer-required",
  },
  fixable: "code",
  schema: [],
};

export const create = createBannedAttributeRule({
  preferred: "toBeRequired",
  negatedPreferred: "not.toBeRequired",
  attributes: ["required", "aria-required"],
});
