/**
 * @file Prefer toHaveAccessibleName over checking aria-label manually.
 * @author Aesthermortis.
 */

import { createAccessibleAttributeRule } from "../createAccessibleAttributeRule.js";

const messageId = "prefer-to-have-accessible-name";

/** @import {JestDomRuleModule} from "../types.d.ts" */

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    description: "prefer toHaveAccessibleName over checking aria-label manually",
    recommended: false,
    url: "prefer-to-have-accessible-name",
  },
  messages: {
    [messageId]: "Prefer toHaveAccessibleName() over asserting aria-label manually.",
  },
  schema: [],
};

export const create = createAccessibleAttributeRule({
  attribute: "aria-label",
  messageId,
});
