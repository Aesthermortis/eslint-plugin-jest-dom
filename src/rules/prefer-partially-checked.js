/**
 * @file Prefer toBePartiallyChecked over checking mixed aria-checked attributes.
 * @author Aesthermortis.
 */

import createBannedAttributeValueRule from "../createBannedAttributeValueRule.js";

export const meta = {
  docs: {
    description: 'prefer toBePartiallyChecked over checking aria-checked="mixed"',
    category: "Best Practices",
    recommended: false,
    url: "prefer-partially-checked",
  },
  fixable: "code",
};

export const create = createBannedAttributeValueRule({
  preferred: "toBePartiallyChecked",
  attributes: ["aria-checked"],
  values: ["mixed"],
});
