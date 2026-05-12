/**
 * @file Prefer toBePartiallyPressed over checking mixed aria-pressed attributes.
 * @author Aesthermortis.
 */

import createBannedAttributeValueRule from "../createBannedAttributeValueRule.js";

/** @import {JestDomRuleModule} from "../types.d.ts" */

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    description: 'prefer toBePartiallyPressed over checking aria-pressed="mixed"',
    recommended: false,
    url: "prefer-partially-pressed",
  },
  fixable: "code",
  schema: [],
};

export const create = createBannedAttributeValueRule({
  preferred: "toBePartiallyPressed",
  attributes: ["aria-pressed"],
  values: ["mixed"],
});
