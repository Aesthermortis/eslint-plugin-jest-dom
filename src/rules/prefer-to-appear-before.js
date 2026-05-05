/**
 * @file Prefer toAppearBefore over manual compareDocumentPosition assertions.
 * @author Aesthermortis.
 */

import { createDocumentOrderRule } from "../createDocumentOrderRule.js";

const messageId = "prefer-to-appear-before";

export const meta = {
  docs: {
    description: "prefer toAppearBefore over manual DOM order assertions",
    category: "Best Practices",
    recommended: false,
    url: "prefer-to-appear-before",
  },
  messages: {
    [messageId]: "Prefer toAppearBefore() over manual compareDocumentPosition assertions.",
  },
};

export const create = createDocumentOrderRule({
  documentPosition: "DOCUMENT_POSITION_FOLLOWING",
  messageId,
});
