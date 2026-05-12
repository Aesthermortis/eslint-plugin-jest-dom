/**
 * @file Prefer ToHaveAttribute over checking getAttribute/hasAttribute.
 * @author Ben Monro.
 */
import { getSourceCode } from "../context.js";

const lineSeparator = "\u2028";
const paragraphSeparator = "\u2029";
const escapeForRegexLiteral = (value) =>
  value
    .toString()
    .replaceAll(/[.*+\-?^${}()|[\]\\/]/g, String.raw`\$&`)
    .replaceAll("\n", String.raw`\n`)
    .replaceAll("\r", String.raw`\r`)
    .replaceAll(lineSeparator, String.raw`\u2028`)
    .replaceAll(paragraphSeparator, String.raw`\u2029`);
const getReplacementPattern = (expectedArg, expectedArgSource) =>
  expectedArg.regex ? expectedArgSource : `/${escapeForRegexLiteral(expectedArg.value)}/`;
const getExactReplacementPattern = (expectedArg) => {
  if (!expectedArg) {
    return null;
  }

  if (expectedArg.type === "Literal" && typeof expectedArg.value === "string") {
    return `/^${escapeForRegexLiteral(expectedArg.value)}$/`;
  }

  if (expectedArg.type === "TemplateLiteral" && expectedArg.expressions.length === 0) {
    const cookedValue = expectedArg.quasis[0].value.cooked;

    if (cookedValue === null) {
      return null;
    }

    return `/^${escapeForRegexLiteral(cookedValue)}$/`;
  }

  return null;
};

/** @import {JestDomRuleModule} from "../types.d.ts" */

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    url: "prefer-to-have-text-content",
    description: "Prefer toHaveTextContent over checking element.textContent",
    recommended: true,
  },
  fixable: "code",
  schema: [],
};

export const create = (context) => ({
  [`MemberExpression[property.name='textContent'][parent.callee.name='expect'][parent.parent.property.name=/toContain$|toMatch$/]`](
    node,
  ) {
    const expectedArg = node.parent.parent.parent.arguments[0];

    const expectedArgSource = getSourceCode(context).getText(expectedArg);
    context.report({
      node: node.parent,
      message: `Use toHaveTextContent instead of asserting on DOM node attributes`,
      fix: (fixer) => {
        return [
          fixer.removeRange([node.object.range[1], node.property.range[1]]),
          fixer.replaceTextRange(node.parent.parent.property.range, "toHaveTextContent"),
          fixer.replaceTextRange(
            expectedArg.range,
            expectedArg.type === "Literal"
              ? getReplacementPattern(expectedArg, expectedArgSource)
              : `new RegExp(${expectedArgSource})`,
          ),
        ];
      },
    });
  },
  [`MemberExpression[property.name='textContent'][parent.callee.name='expect'][parent.parent.property.name=/^(toBe|toEqual|toStrictEqual)$/]`](
    node,
  ) {
    const expectedArg = node.parent.parent.parent.arguments[0];
    context.report({
      node: node.parent,
      message: `Use toHaveTextContent instead of asserting on DOM node attributes`,
      fix: (fixer) => {
        const replacementPattern = getExactReplacementPattern(expectedArg);

        if (replacementPattern === null) {
          return null;
        }

        return [
          fixer.removeRange([node.object.range[1], node.property.range[1]]),
          fixer.replaceTextRange(node.parent.parent.property.range, "toHaveTextContent"),
          fixer.replaceTextRange(expectedArg.range, replacementPattern),
        ];
      },
    });
  },
  [`MemberExpression[property.name='textContent'][parent.callee.name='expect'][parent.parent.property.name='not'][parent.parent.parent.property.name=/^(toBe|toEqual|toStrictEqual)$/]`](
    node,
  ) {
    const expectedArg = node.parent.parent.parent.parent.arguments[0];
    context.report({
      node: node.parent,
      message: `Use toHaveTextContent instead of asserting on DOM node attributes`,
      fix: (fixer) => {
        const replacementPattern = getExactReplacementPattern(expectedArg);

        if (replacementPattern === null) {
          return null;
        }

        return [
          fixer.removeRange([node.object.range[1], node.property.range[1]]),
          fixer.replaceTextRange(node.parent.parent.parent.property.range, "toHaveTextContent"),
          fixer.replaceTextRange(expectedArg.range, replacementPattern),
        ];
      },
    });
  },
  [`MemberExpression[property.name='textContent'][parent.callee.name='expect'][parent.parent.property.name='not'][parent.parent.parent.property.name=/toContain$|toMatch$/]`](
    node,
  ) {
    const expectedArg = node.parent.parent.parent.parent.arguments[0];
    const expectedArgSource = getSourceCode(context).getText(expectedArg);
    context.report({
      node: node.parent,
      message: `Use toHaveTextContent instead of asserting on DOM node attributes`,
      fix: (fixer) => [
        fixer.removeRange([node.object.range[1], node.property.range[1]]),
        fixer.replaceTextRange(node.parent.parent.parent.property.range, "toHaveTextContent"),
        fixer.replaceTextRange(
          expectedArg.range,
          expectedArg.type === "Literal"
            ? getReplacementPattern(expectedArg, expectedArgSource)
            : `new RegExp(${expectedArgSource})`,
        ),
      ],
    });
  },
});
