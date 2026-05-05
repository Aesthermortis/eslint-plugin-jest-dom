/**
 * @file Prefer toHaveAccessibleDescription over checking aria-description manually.
 * @author Aesthermortis.
 */

import { createAccessibleAttributeRule } from "../createAccessibleAttributeRule.js";

const messageId = "prefer-to-have-accessible-description";

export const meta = {
  docs: {
    description: "prefer toHaveAccessibleDescription over checking aria-description manually",
    category: "Best Practices",
    recommended: false,
    url: "prefer-to-have-accessible-description",
  },
  messages: {
    [messageId]: "Prefer toHaveAccessibleDescription() over asserting aria-description manually.",
  },
};

export const create = createAccessibleAttributeRule({
  attribute: "aria-description",
  messageId,
});
