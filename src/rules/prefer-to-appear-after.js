/**
 * @file Prefer toAppearAfter over manual compareDocumentPosition assertions.
 * @author Aesthermortis.
 */

import { createDocumentOrderRule } from "../createDocumentOrderRule.js";

const messageId = "prefer-to-appear-after";

/** @import {JestDomRuleModule} from "../types.d.ts" */

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    description: "prefer toAppearAfter over manual DOM order assertions",
    recommended: false,
    url: "prefer-to-appear-after",
  },
  messages: {
    [messageId]: "Prefer toAppearAfter() over manual compareDocumentPosition assertions.",
  },
  schema: [],
};

export const create = createDocumentOrderRule({
  documentPosition: "DOCUMENT_POSITION_PRECEDING",
  messageId,
});
