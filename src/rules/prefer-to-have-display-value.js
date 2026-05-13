/**
 * @file Prefer toHaveDisplayValue over manual value assertions.
 * @author Aesthermortis.
 */

const valueMatchers = new Set(["toBe", "toEqual", "toStrictEqual"]);
const messageId = "prefer-to-have-display-value";

/** @import {JestDomRuleModule} from "../types.d.ts" */
/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpression} CallExpression */
/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpressionArgument} CallExpressionArgument */
/** @typedef {import("@typescript-eslint/types").TSESTree.Identifier} Identifier */
/** @typedef {import("@typescript-eslint/types").TSESTree.MemberExpression} MemberExpression */
/** @typedef {import("@typescript-eslint/types").TSESTree.Node} Node */
/**
 * @typedef {import("@typescript-eslint/utils/ts-eslint").RuleContext<
 *   string,
 *   readonly unknown[]
 * >} RuleContext
 */
/** @typedef {import("@typescript-eslint/utils/ts-eslint").RuleListener} RuleListener */
/** @typedef {MemberExpression & { computed: false; property: Identifier }} StaticMemberExpression */
/**
 * @typedef {{
 *   expectCall: CallExpression;
 *   matcherName: string;
 * }} PositiveMatcherCall
 */

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
 * Checks whether a node is an identifier.
 *
 * @param {Node | undefined} node - AST node to inspect.
 * @returns {node is Identifier} Whether the node is an identifier.
 */
function isIdentifier(node) {
  return node?.type === astNodeTypes.Identifier;
}

/**
 * Checks whether a node is a non-computed member expression with an identifier property.
 *
 * @param {Node | undefined} node - AST node to inspect.
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
 * Gets a positive Jest matcher call.
 *
 * @param {CallExpression} node - CallExpression node to inspect.
 * @returns {PositiveMatcherCall | null} Matcher details when supported.
 */
function getPositiveMatcherCall(node) {
  if (!isStaticMemberExpression(node.callee)) {
    return null;
  }

  const expectCall = node.callee.object;

  if (
    expectCall.type !== astNodeTypes.CallExpression ||
    !isIdentifier(expectCall.callee) ||
    expectCall.callee.name !== "expect"
  ) {
    return null;
  }

  return {
    expectCall,
    matcherName: node.callee.property.name,
  };
}

/**
 * Checks whether a node is a string literal.
 *
 * @param {CallExpressionArgument | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the node is a string literal.
 */
function isStringLiteral(node) {
  return node?.type === astNodeTypes.Literal && typeof node.value === "string";
}

/**
 * Checks whether an identifier name appears to reference a select control.
 *
 * @param {Node | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the identifier looks select-specific.
 */
function isLikelySelectControl(node) {
  return isIdentifier(node) && (node.name === "select" || node.name.endsWith("Select"));
}

/**
 * Checks for input.value or textarea.value.
 *
 * @param {CallExpressionArgument | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the node reads a non-select element value.
 */
function isValuePropertyRead(node) {
  return (
    isStaticMemberExpression(node) &&
    node.property.name === "value" &&
    !isLikelySelectControl(node.object)
  );
}

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    description: "prefer toHaveDisplayValue over manual value assertions",
    recommended: false,
    url: "prefer-to-have-display-value",
  },
  messages: {
    [messageId]: "Prefer toHaveDisplayValue() over manual value assertions.",
  },
  schema: [],
};

/**
 * @param {RuleContext} context - ESLint rule context.
 * @returns {RuleListener} Rule listener.
 */
export function create(context) {
  return {
    /**
     * @param {CallExpression} node - Matched call expression.
     * @returns {void}
     */
    CallExpression(node) {
      const matcherCall = getPositiveMatcherCall(node);

      if (
        !matcherCall ||
        !valueMatchers.has(matcherCall.matcherName) ||
        matcherCall.expectCall.arguments.length !== 1 ||
        node.arguments.length !== 1
      ) {
        return;
      }

      const [actual] = matcherCall.expectCall.arguments;
      const [expected] = node.arguments;

      if (isValuePropertyRead(actual) && isStringLiteral(expected)) {
        context.report({
          node,
          messageId,
        });
      }
    },
  };
}
