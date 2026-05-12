/**
 * @file Prefer toContainElement over manual contains assertions.
 * @author Aesthermortis.
 */

const containsMatchers = new Set(["toBe", "toEqual", "toStrictEqual"]);
const messageId = "prefer-to-contain-element";

/**
 * Checks whether a node is a non-computed member expression with an identifier property.
 *
 * @param {object | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the node is a static member expression.
 */
function isStaticMemberExpression(node) {
  return node?.type === "MemberExpression" && !node.computed && node.property.type === "Identifier";
}

/**
 * Gets a positive Jest matcher call.
 *
 * @param {object} node - CallExpression node to inspect.
 * @returns {{ expectCall: object; matcherName: string } | null} Matcher details when supported.
 */
function getPositiveMatcherCall(node) {
  if (!isStaticMemberExpression(node.callee)) {
    return null;
  }

  const expectCall = node.callee.object;

  if (expectCall.type !== "CallExpression" || expectCall.callee.name !== "expect") {
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
 * @param {object | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the node is a true literal.
 */
function isTrueLiteral(node) {
  return node?.type === "Literal" && node.value === true;
}

/**
 * Checks for parent.contains(child).
 *
 * @param {object | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the node is a contains call with one argument.
 */
function isContainsCall(node) {
  return (
    node?.type === "CallExpression" &&
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

export const create = (context) => ({
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
