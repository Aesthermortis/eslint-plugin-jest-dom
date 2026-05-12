/**
 * @file Prefer toBeValid over manual validity assertions.
 * @author Aesthermortis.
 */

import { createValidityRule } from "../createValidityRule.js";

const messageId = "prefer-to-be-valid";

/** @import {JestDomRuleModule} from "../types.d.ts" */

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    description: "prefer toBeValid over manual validity assertions",
    recommended: false,
    url: "prefer-to-be-valid",
  },
  messages: {
    [messageId]: "Prefer toBeValid() over manual validity assertions.",
  },
  schema: [],
};

export const create = createValidityRule({
  ariaInvalidValue: null,
  expectedValidity: true,
  messageId,
});
