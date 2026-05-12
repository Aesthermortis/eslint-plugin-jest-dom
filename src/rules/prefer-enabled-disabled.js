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
    description: "prefer toBeDisabled or toBeEnabled over checking attributes",
    recommended: true,
    url: "prefer-enabled-disabled",
  },
  fixable: "code",
  schema: [],
};

export const create = createBannedAttributeRule({
  preferred: "toBeDisabled",
  negatedPreferred: "toBeEnabled",
  attributes: ["disabled"],
});
