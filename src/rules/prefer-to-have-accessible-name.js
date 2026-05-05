/**
 * @file Prefer toHaveAccessibleName over checking aria-label manually.
 * @author Aesthermortis.
 */

import { createAccessibleAttributeRule } from "../createAccessibleAttributeRule.js";

const messageId = "prefer-to-have-accessible-name";

export const meta = {
  docs: {
    description: "prefer toHaveAccessibleName over checking aria-label manually",
    category: "Best Practices",
    recommended: false,
    url: "prefer-to-have-accessible-name",
  },
  messages: {
    [messageId]: "Prefer toHaveAccessibleName() over asserting aria-label manually.",
  },
};

export const create = createAccessibleAttributeRule({
  attribute: "aria-label",
  messageId,
});
