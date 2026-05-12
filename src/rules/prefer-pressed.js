/**
 * @file Prefer toBePressed over checking aria-pressed attributes.
 * @author Aesthermortis.
 */

import { getQueryNodeFrom } from "../assignment-ast.js";

const attribute = "aria-pressed";
const pressedValues = new Map([
  ["true", "toBePressed"],
  ["false", "not.toBePressed"],
]);

/**
 * Gets a string literal value from an AST node.
 *
 * @param {object | undefined} node - AST node to inspect.
 * @returns {string | undefined} String literal value, when present.
 */
function getStringLiteralValue(node) {
  if (node?.type !== "Literal" || typeof node.value !== "string") {
    return;
  }

  return node.value;
}

/** @import {JestDomRuleModule} from "../types.d.ts" */

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    description: "prefer toBePressed over checking aria-pressed manually",
    recommended: false,
    url: "prefer-pressed",
  },
  fixable: "code",
  schema: [],
};

export const create = (context) => ({
  "CallExpression[callee.object.callee.name='expect'][callee.property.name=/toHaveProperty|toHaveAttribute/]"(
    node,
  ) {
    if (node.arguments.length !== 2 || node.callee.object.arguments.length === 0) {
      return;
    }

    const checkedAttribute = getStringLiteralValue(node.arguments[0]);
    const checkedValue = getStringLiteralValue(node.arguments[1]);
    const preferred = pressedValues.get(checkedValue);

    if (checkedAttribute !== attribute || !preferred) {
      return;
    }

    const { isDTLQuery } = getQueryNodeFrom(context, node.callee.object.arguments[0]);

    if (!isDTLQuery) {
      return;
    }

    const incorrectFunction = node.callee.property.name;
    const message = `Use ${preferred}() instead of ${incorrectFunction}(${node.arguments
      .map(({ raw }) => raw)
      .join(", ")})`;

    context.report({
      node: node.callee.property,
      message,
      fix: (fixer) =>
        fixer.replaceTextRange([node.callee.property.range[0], node.range[1]], `${preferred}()`),
    });
  },
});
