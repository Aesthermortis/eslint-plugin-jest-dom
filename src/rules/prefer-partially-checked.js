/**
 * @file Prefer toBePartiallyChecked over checking mixed aria-checked attributes.
 * @author Aesthermortis.
 */

import createBannedAttributeValueRule from "../createBannedAttributeValueRule.js";

/** @import {JestDomRuleModule} from "../types.d.ts" */

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    description: 'prefer toBePartiallyChecked over checking aria-checked="mixed"',
    recommended: false,
    url: "prefer-partially-checked",
  },
  fixable: "code",
  schema: [],
};

export const create = createBannedAttributeValueRule({
  preferred: "toBePartiallyChecked",
  attributes: ["aria-checked"],
  values: ["mixed"],
});
