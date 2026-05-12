/**
 * @file Prefer toAppearBefore over manual compareDocumentPosition assertions.
 * @author Aesthermortis.
 */

import { createDocumentOrderRule } from "../createDocumentOrderRule.js";

const messageId = "prefer-to-appear-before";

/** @import {JestDomRuleModule} from "../types.d.ts" */

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    description: "prefer toAppearBefore over manual DOM order assertions",
    recommended: false,
    url: "prefer-to-appear-before",
  },
  messages: {
    [messageId]: "Prefer toAppearBefore() over manual compareDocumentPosition assertions.",
  },
  schema: [],
};

export const create = createDocumentOrderRule({
  documentPosition: "DOCUMENT_POSITION_FOLLOWING",
  messageId,
});
