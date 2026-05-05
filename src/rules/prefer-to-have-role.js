/**
 * @file Prefer toHaveRole over checking role attributes manually.
 * @author Aesthermortis.
 */

import { getQueryNodeFrom } from "../assignment-ast.js";

const roleMatchers = new Set(["toBe", "toEqual", "toStrictEqual"]);
const messageId = "prefer-to-have-role";

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

/**
 * Checks whether a role value is a single explicit role token.
 *
 * @param {object | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the node is a single role literal.
 */
function isSingleRoleLiteral(node) {
  const role = getStringLiteralValue(node);

  return typeof role === "string" && /^\S+$/.test(role);
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
 * Checks whether an expression comes from a Testing Library role query.
 *
 * @param {object} context - ESLint rule context.
 * @param {object} node - AST node to inspect.
 * @returns {boolean} Whether the node resolves to a role query.
 */
function isRoleQuery(context, node) {
  const { isDTLQuery, query } = getQueryNodeFrom(context, node);

  return isDTLQuery && query.endsWith("ByRole");
}

/**
 * Checks for expect(element).toHaveAttribute("role", "button").
 *
 * @param {object} context - ESLint rule context.
 * @param {object} expectCall - The expect(...) call.
 * @param {object} matcherCall - Matcher CallExpression node.
 * @returns {boolean} Whether the assertion checks a role attribute manually.
 */
function isRoleAttributeAssertion(context, expectCall, matcherCall) {
  if (
    matcherCall.callee.property.name !== "toHaveAttribute" ||
    expectCall.arguments.length !== 1 ||
    matcherCall.arguments.length !== 2
  ) {
    return false;
  }

  const [attribute, value] = matcherCall.arguments;

  return (
    getStringLiteralValue(attribute) === "role" &&
    isSingleRoleLiteral(value) &&
    !isRoleQuery(context, expectCall.arguments[0])
  );
}

/**
 * Checks for expect(element.getAttribute("role")).toBe("button").
 *
 * @param {object} context - ESLint rule context.
 * @param {object} expectCall - The expect(...) call.
 * @param {object} matcherCall - Matcher CallExpression node.
 * @returns {boolean} Whether the assertion checks getAttribute("role") manually.
 */
function isRoleGetAttributeAssertion(context, expectCall, matcherCall) {
  if (
    !roleMatchers.has(matcherCall.callee.property.name) ||
    expectCall.arguments.length !== 1 ||
    matcherCall.arguments.length !== 1
  ) {
    return false;
  }

  const [getAttributeCall] = expectCall.arguments;
  const [role] = matcherCall.arguments;

  if (
    getAttributeCall.type !== "CallExpression" ||
    !isStaticMemberExpression(getAttributeCall.callee)
  ) {
    return false;
  }

  return (
    getAttributeCall.callee.property.name === "getAttribute" &&
    getStringLiteralValue(getAttributeCall.arguments[0]) === "role" &&
    getAttributeCall.arguments.length === 1 &&
    isSingleRoleLiteral(role) &&
    !isRoleQuery(context, getAttributeCall.callee.object)
  );
}

export const meta = {
  docs: {
    description: "prefer toHaveRole over checking role attributes manually",
    category: "Best Practices",
    recommended: false,
    url: "prefer-to-have-role",
  },
  messages: {
    [messageId]: "Prefer toHaveRole() over asserting role attributes manually.",
  },
};

export const create = (context) => ({
  CallExpression(node) {
    const matcherCall = getPositiveMatcherCall(node);

    if (!matcherCall) {
      return;
    }

    const { expectCall } = matcherCall;

    if (
      isRoleAttributeAssertion(context, expectCall, node) ||
      isRoleGetAttributeAssertion(context, expectCall, node)
    ) {
      context.report({
        node,
        messageId,
      });
    }
  },
});
