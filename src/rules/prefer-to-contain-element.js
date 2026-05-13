/**
 * @file Prefer toContainElement over manual contains assertions.
 * @author Aesthermortis.
 */

const containsMatchers = new Set(["toBe", "toEqual", "toStrictEqual"]);
const messageId = "prefer-to-contain-element";

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
/** @typedef {{ expectCall: CallExpression; matcherName: string }} MatcherCall */

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
 * Checks whether a node is a non-computed member expression with an identifier property.
 *
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
 * @param {Expression} node - AST node to inspect.
 * @returns {node is CallExpression} Whether the node is expect(...).
 */
function isExpectCall(node) {
  return (
    node.type === astNodeTypes.CallExpression &&
    node.callee.type === astNodeTypes.Identifier &&
    node.callee.name === "expect"
  );
}

/**
 * Gets a positive Jest matcher call.
 *
 * @param {CallExpression} node - CallExpression node to inspect.
 * @returns {MatcherCall | null} Matcher details when supported.
 */
function getPositiveMatcherCall(node) {
  if (!isStaticMemberExpression(node.callee)) {
    return null;
  }

  const expectCall = node.callee.object;

  if (!isExpectCall(expectCall)) {
    return null;
  }

  return {
    expectCall,
    matcherName: node.callee.property.name,
  };
}

/**
 * Checks whether a node is a literal true assertion.
 *
 * @param {CallExpressionArgument | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the node is a true literal.
 */
function isTrueLiteral(node) {
  return node?.type === astNodeTypes.Literal && node.value === true;
}

/**
 * Checks for parent.contains(child).
 *
 * @param {CallExpressionArgument | undefined} node - AST node to inspect.
 * @returns {node is CallExpression} Whether the node is a contains call with one argument.
 */
function isContainsCall(node) {
  return (
    isCallExpression(node) &&
    isStaticMemberExpression(node.callee) &&
    node.callee.property.name === "contains" &&
    node.arguments.length === 1
  );
}

/** @import {JestDomRuleModule} from "../types.d.ts" */

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    description: "prefer toContainElement over manual contains assertions",
    recommended: false,
    url: "prefer-to-contain-element",
  },
  messages: {
    [messageId]: "Prefer toContainElement() over manual contains assertions.",
  },
  schema: [],
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
    CallExpression(node) {
      const matcherCall = getPositiveMatcherCall(node);

      if (
        !matcherCall ||
        !containsMatchers.has(matcherCall.matcherName) ||
        matcherCall.expectCall.arguments.length !== 1 ||
        node.arguments.length !== 1
      ) {
        return;
      }

      const [actual] = matcherCall.expectCall.arguments;
      const [expected] = node.arguments;

      if (isContainsCall(actual) && isTrueLiteral(expected)) {
        context.report({
          node,
          messageId,
        });
      }
    },
  });
}
