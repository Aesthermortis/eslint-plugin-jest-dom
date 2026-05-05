/**
 * @file Prefer toBeValid over manual validity assertions.
 * @author Aesthermortis.
 */

import { createValidityRule } from "../createValidityRule.js";

const messageId = "prefer-to-be-valid";

export const meta = {
  docs: {
    description: "prefer toBeValid over manual validity assertions",
    category: "Best Practices",
    recommended: false,
    url: "prefer-to-be-valid",
  },
  messages: {
    [messageId]: "Prefer toBeValid() over manual validity assertions.",
  },
};

export const create = createValidityRule({
  ariaInvalidValue: null,
  expectedValidity: true,
  messageId,
});
