/**
 * @file Prefer toBePartiallyPressed over checking mixed aria-pressed attributes.
 * @author Aesthermortis.
 */

import createBannedAttributeValueRule from "../createBannedAttributeValueRule.js";

export const meta = {
  docs: {
    description: 'prefer toBePartiallyPressed over checking aria-pressed="mixed"',
    category: "Best Practices",
    recommended: false,
    url: "prefer-partially-pressed",
  },
  fixable: "code",
};

export const create = createBannedAttributeValueRule({
  preferred: "toBePartiallyPressed",
  attributes: ["aria-pressed"],
  values: ["mixed"],
});
