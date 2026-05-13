/**
 * @file Prefer toHaveRole over checking role attributes manually.
 * @author Aesthermortis.
 */

import { getQueryNodeFrom } from "../assignment-ast.js";

const roleMatchers = new Set(["toBe", "toEqual", "toStrictEqual"]);
const messageId = "prefer-to-have-role";

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
 * @typedef {CallExpression & {
 *   callee: StaticMemberExpression;
 * }} StaticMemberCallExpression
 */
/**
 * @typedef {{
 *   expectCall: CallExpression;
 *   matcherCall: StaticMemberCallExpression;
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
 * Checks whether a call expression has a static member callee.
 *
 * @param {CallExpression} node - CallExpression node to inspect.
 * @returns {node is StaticMemberCallExpression} Whether the call has a static member callee.
 */
function hasStaticMemberCallee(node) {
  return isStaticMemberExpression(node.callee);
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
 * Checks whether a role value is a single explicit role token.
 *
 * @param {CallExpressionArgument | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the node is a single role literal.
 */
function isSingleRoleLiteral(node) {
  const role = getStringLiteralValue(node);

  return typeof role === "string" && /^\S+$/.test(role);
}

/**
 * Gets a positive Jest matcher call.
 *
 * @param {CallExpression} node - CallExpression node to inspect.
 * @returns {PositiveMatcherCall | null} Matcher details when supported.
 */
function getPositiveMatcherCall(node) {
  if (!hasStaticMemberCallee(node)) {
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
    matcherCall: node,
    matcherName: node.callee.property.name,
  };
}

/**
 * Checks whether an expression comes from a Testing Library role query.
 *
 * @param {RuleContext} context - ESLint rule context.
 * @param {Node} node - AST node to inspect.
 * @returns {boolean} Whether the node resolves to a role query.
 */
function isRoleQuery(context, node) {
  const { isDTLQuery, query } = getQueryNodeFrom(context, node);

  return isDTLQuery && typeof query === "string" && query.endsWith("ByRole");
}

/**
 * Checks for expect(element).toHaveAttribute("role", "button").
 *
 * @param {RuleContext} context - ESLint rule context.
 * @param {CallExpression} expectCall - The expect(...) call.
 * @param {StaticMemberCallExpression} matcherCall - Matcher CallExpression node.
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
 * @param {RuleContext} context - ESLint rule context.
 * @param {CallExpression} expectCall - The expect(...) call.
 * @param {StaticMemberCallExpression} matcherCall - Matcher CallExpression node.
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
    getAttributeCall.type !== astNodeTypes.CallExpression ||
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

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    description: "prefer toHaveRole over checking role attributes manually",
    recommended: false,
    url: "prefer-to-have-role",
  },
  messages: {
    [messageId]: "Prefer toHaveRole() over asserting role attributes manually.",
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

      if (!matcherCall) {
        return;
      }

      const { expectCall } = matcherCall;

      if (
        isRoleAttributeAssertion(context, expectCall, matcherCall.matcherCall) ||
        isRoleGetAttributeAssertion(context, expectCall, matcherCall.matcherCall)
      ) {
        context.report({
          node,
          messageId,
        });
      }
    },
  };
}
