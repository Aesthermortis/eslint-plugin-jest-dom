/**
 * @file Prefer ToBeDisabled or toBeEnabled over attribute checks.
 * @author Ben Monro.
 */

import createBannedAttributeRule from "../createBannedAttributeRule.js";

export const meta = {
  docs: {
    description: "prefer toBeRequired over checking properties",
    category: "Best Practices",
    recommended: true,
    url: "prefer-required",
  },
  fixable: "code",
};

export const create = createBannedAttributeRule({
  preferred: "toBeRequired",
  negatedPreferred: "not.toBeRequired",
  attributes: ["required", "aria-required"],
});
