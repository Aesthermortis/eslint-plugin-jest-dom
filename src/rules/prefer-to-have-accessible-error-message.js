/**
 * @file Prefer toHaveAccessibleErrorMessage over checking aria-errormessage manually.
 * @author Aesthermortis.
 */

const attribute = "aria-errormessage";
const attributeMatchers = new Set(["toBe", "toEqual", "toStrictEqual"]);
const messageId = "prefer-to-have-accessible-error-message";

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
 * @param {Expression | CallExpressionArgument | undefined} node - AST node to inspect.
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
 * Checks whether an attribute value is a single non-empty ID token.
 *
 * @param {CallExpressionArgument | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the node is a single ID literal.
 */
function isSingleIdLiteral(node) {
  const id = getStringLiteralValue(node);

  return typeof id === "string" && /^\S+$/.test(id);
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
 * Checks for expect(element).toHaveAttribute("aria-errormessage", "error-id").
 *
 * @param {CallExpression} expectCall - The expect(...) call.
 * @param {CallExpression} matcherCall - Matcher CallExpression node.
 * @returns {boolean} Whether the assertion checks aria-errormessage manually.
 */
function isErrorMessageAttributeAssertion(expectCall, matcherCall) {
  if (
    !isStaticMemberExpression(matcherCall.callee) ||
    matcherCall.callee.property.name !== "toHaveAttribute" ||
    expectCall.arguments.length !== 1 ||
    matcherCall.arguments.length !== 2
  ) {
    return false;
  }

  const [checkedAttribute, checkedValue] = matcherCall.arguments;

  return getStringLiteralValue(checkedAttribute) === attribute && isSingleIdLiteral(checkedValue);
}

/**
 * Checks for expect(element.getAttribute("aria-errormessage")).toBe("error-id").
 *
 * @param {CallExpression} expectCall - The expect(...) call.
 * @param {CallExpression} matcherCall - Matcher CallExpression node.
 * @returns {boolean} Whether the assertion checks getAttribute("aria-errormessage") manually.
 */
function isErrorMessageGetAttributeAssertion(expectCall, matcherCall) {
  if (
    !isStaticMemberExpression(matcherCall.callee) ||
    !attributeMatchers.has(matcherCall.callee.property.name) ||
    expectCall.arguments.length !== 1 ||
    matcherCall.arguments.length !== 1
  ) {
    return false;
  }

  const [getAttributeCall] = expectCall.arguments;
  const [expectedId] = matcherCall.arguments;

  if (
    !isCallExpression(getAttributeCall) ||
    !isStaticMemberExpression(getAttributeCall.callee) ||
    getAttributeCall.callee.property.name !== "getAttribute" ||
    getAttributeCall.arguments.length !== 1
  ) {
    return false;
  }

  return (
    getStringLiteralValue(getAttributeCall.arguments[0]) === attribute &&
    isSingleIdLiteral(expectedId)
  );
}

/** @import {JestDomRuleModule} from "../types.d.ts" */

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    description: "prefer toHaveAccessibleErrorMessage over checking aria-errormessage manually",
    recommended: false,
    url: "prefer-to-have-accessible-error-message",
  },
  messages: {
    [messageId]: "Prefer toHaveAccessibleErrorMessage() over asserting aria-errormessage manually.",
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

      if (!matcherCall) {
        return;
      }

      const { expectCall } = matcherCall;

      if (
        isErrorMessageAttributeAssertion(expectCall, node) ||
        isErrorMessageGetAttributeAssertion(expectCall, node)
      ) {
        context.report({
          node,
          messageId,
        });
      }
    },
  });
}
