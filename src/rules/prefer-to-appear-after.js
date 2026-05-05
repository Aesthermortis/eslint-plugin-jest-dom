/**
 * @file Prefer toAppearAfter over manual compareDocumentPosition assertions.
 * @author Aesthermortis.
 */

import { createDocumentOrderRule } from "../createDocumentOrderRule.js";

const messageId = "prefer-to-appear-after";

export const meta = {
  docs: {
    description: "prefer toAppearAfter over manual DOM order assertions",
    category: "Best Practices",
    recommended: false,
    url: "prefer-to-appear-after",
  },
  messages: {
    [messageId]: "Prefer toAppearAfter() over manual compareDocumentPosition assertions.",
  },
};

export const create = createDocumentOrderRule({
  documentPosition: "DOCUMENT_POSITION_PRECEDING",
  messageId,
});
