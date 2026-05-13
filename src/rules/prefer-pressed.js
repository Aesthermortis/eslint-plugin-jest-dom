/**
 * @file Prefer toBePressed over checking aria-pressed attributes.
 * @author Aesthermortis.
 */

import { getQueryNodeFrom } from "../assignment-ast.js";

const attribute = "aria-pressed";
const messageId = "preferPressed";
const pressedValues = new Map([
  ["true", "toBePressed"],
  ["false", "not.toBePressed"],
]);

/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpression} CallExpression */
/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpressionArgument} CallExpressionArgument */
/** @typedef {import("@typescript-eslint/types").TSESTree.Expression} Expression */
/** @typedef {import("@typescript-eslint/types").TSESTree.Identifier} Identifier */
/** @typedef {import("@typescript-eslint/types").TSESTree.MemberExpression} MemberExpression */
/**
 * @typedef {import("@typescript-eslint/utils/ts-eslint").RuleContext<
 *   string,
 *   readonly unknown[]
 * >} RuleContext
 */
/** @typedef {import("@typescript-eslint/utils/ts-eslint").RuleListener} RuleListener */
/** @typedef {MemberExpression & { computed: false; property: Identifier }} StaticMemberExpression */

const astNodeTypes = /** @type {const} */ ({
  CallExpression: /** @type {import("@typescript-eslint/types").AST_NODE_TYPES.CallExpression} */ (
    "CallExpression"
  ),
  Identifier: /** @type {import("@typescript-eslint/types").AST_NODE_TYPES.Identifier} */ (
    "Identifier"
  ),
  Literal: /** @type {import("@typescript-eslint/types").AST_NODE_TYPES.Literal} */ ("Literal"),
  MemberExpression:
    /** @type {import("@typescript-eslint/types").AST_NODE_TYPES.MemberExpression} */ (
      "MemberExpression"
    ),
});

/**
 * @param {Expression | undefined} node - AST node to inspect.
 * @returns {node is StaticMemberExpression} Whether the node is a static member expression.
 */
function isStaticMemberExpression(node) {
  return (
    node?.type === astNodeTypes.MemberExpression &&
    !node.computed &&
    node.property.type === astNodeTypes.Identifier
  );
}

/**
 * @param {Expression | undefined} node - AST node to inspect.
 * @returns {node is CallExpression} Whether the node is a call expression.
 */
function isCallExpression(node) {
  return node?.type === astNodeTypes.CallExpression;
}

/**
 * Gets a string literal value from an AST node.
 *
 * @param {CallExpressionArgument | undefined} node - AST node to inspect.
 * @returns {string | undefined} String literal value, when present.
 */
function getStringLiteralValue(node) {
  if (node?.type !== astNodeTypes.Literal || typeof node.value !== "string") {
    return;
  }

  return node.value;
}

/**
 * @param {CallExpressionArgument} node - Call argument node.
 * @returns {string} Source-like argument text for diagnostics.
 */
function getArgumentText(node) {
  return "raw" in node && typeof node.raw === "string" ? node.raw : "";
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
  messages: {
    [messageId]: "Use {{ preferred }}() instead of {{ incorrectFunction }}({{ matcherArguments }})",
  },
};

/**
 * @param {RuleContext} context - ESLint rule context.
 * @returns {RuleListener} Rule listener.
 */
export function create(context) {
  return /** @type {RuleListener} */ ({
    /**
     * @param {CallExpression} node - Matched assertion call.
     * @returns {void}
     */
    "CallExpression[callee.object.callee.name='expect'][callee.property.name=/toHaveProperty|toHaveAttribute/]"(
      node,
    ) {
      const matcherMember = node.callee;

      if (!isStaticMemberExpression(matcherMember) || !isCallExpression(matcherMember.object)) {
        return;
      }

      if (node.arguments.length !== 2 || matcherMember.object.arguments.length === 0) {
        return;
      }

      const checkedAttribute = getStringLiteralValue(node.arguments[0]);
      const checkedValue = getStringLiteralValue(node.arguments[1]);
      const preferred = pressedValues.get(checkedValue);

      if (checkedAttribute !== attribute || !preferred) {
        return;
      }

      const [expectArgument] = matcherMember.object.arguments;
      const { isDTLQuery } = getQueryNodeFrom(context, expectArgument);

      if (!isDTLQuery) {
        return;
      }

      const incorrectFunction = matcherMember.property.name;
      const matcherArguments = node.arguments
        .map((argument) => getArgumentText(argument))
        .join(", ");

      context.report({
        node: matcherMember.property,
        messageId,
        data: {
          preferred,
          incorrectFunction,
          matcherArguments,
        },
        fix: (fixer) =>
          fixer.replaceTextRange(
            [matcherMember.property.range[0], node.range[1]],
            `${preferred}()`,
          ),
      });
    },
  });
}
