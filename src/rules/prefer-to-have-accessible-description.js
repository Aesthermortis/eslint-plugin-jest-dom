/**
 * @file Prefer toHaveAccessibleDescription over checking aria-description manually.
 * @author Aesthermortis.
 */

import { createAccessibleAttributeRule } from "../createAccessibleAttributeRule.js";

const messageId = "prefer-to-have-accessible-description";

/** @import {JestDomRuleModule} from "../types.d.ts" */

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    description: "prefer toHaveAccessibleDescription over checking aria-description manually",
    recommended: false,
    url: "prefer-to-have-accessible-description",
  },
  messages: {
    [messageId]: "Prefer toHaveAccessibleDescription() over asserting aria-description manually.",
  },
  schema: [],
};

export const create = createAccessibleAttributeRule({
  attribute: "aria-description",
  messageId,
});
