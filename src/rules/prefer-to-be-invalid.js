/**
 * @file Prefer toBeInvalid over manual validity assertions.
 * @author Aesthermortis.
 */

import { createValidityRule } from "../createValidityRule.js";

const messageId = "prefer-to-be-invalid";

/** @import {JestDomRuleModule} from "../types.d.ts" */

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    description: "prefer toBeInvalid over manual validity assertions",
    recommended: false,
    url: "prefer-to-be-invalid",
  },
  messages: {
    [messageId]: "Prefer toBeInvalid() over manual validity assertions.",
  },
  schema: [],
};

export const create = createValidityRule({
  ariaInvalidValue: "true",
  expectedValidity: false,
  messageId,
});
