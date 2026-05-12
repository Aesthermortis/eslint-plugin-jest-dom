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
    description: "prefer toBeChecked over checking attributes",
    recommended: true,
    url: "prefer-checked",
  },
  fixable: "code",
  schema: [],
};

export const create = createBannedAttributeRule({
  preferred: "toBeChecked",
  negatedPreferred: "not.toBeChecked",
  attributes: ["checked", "aria-checked"],
  excludeValues: ["mixed"],
});
