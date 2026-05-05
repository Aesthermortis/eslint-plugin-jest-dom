/**
 * @file Prefer toBeInvalid over manual validity assertions.
 * @author Aesthermortis.
 */

import { createValidityRule } from "../createValidityRule.js";

const messageId = "prefer-to-be-invalid";

export const meta = {
  docs: {
    description: "prefer toBeInvalid over manual validity assertions",
    category: "Best Practices",
    recommended: false,
    url: "prefer-to-be-invalid",
  },
  messages: {
    [messageId]: "Prefer toBeInvalid() over manual validity assertions.",
  },
};

export const create = createValidityRule({
  ariaInvalidValue: "true",
  expectedValidity: false,
  messageId,
});
