/**
 * @file Prefer toHaveAccessibleErrorMessage over checking aria-errormessage manually.
 * @author Aesthermortis.
 */

const attribute = "aria-errormessage";
const attributeMatchers = new Set(["toBe", "toEqual", "toStrictEqual"]);
const messageId = "prefer-to-have-accessible-error-message";

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
 * Checks whether an attribute value is a single non-empty ID token.
 *
 * @param {object | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the node is a single ID literal.
 */
function isSingleIdLiteral(node) {
  const id = getStringLiteralValue(node);

  return typeof id === "string" && /^\S+$/.test(id);
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
 * Checks for expect(element).toHaveAttribute("aria-errormessage", "error-id").
 *
 * @param {object} expectCall - The expect(...) call.
 * @param {object} matcherCall - Matcher CallExpression node.
 * @returns {boolean} Whether the assertion checks aria-errormessage manually.
 */
function isErrorMessageAttributeAssertion(expectCall, matcherCall) {
  if (
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
 * @param {object} expectCall - The expect(...) call.
 * @param {object} matcherCall - Matcher CallExpression node.
 * @returns {boolean} Whether the assertion checks getAttribute("aria-errormessage") manually.
 */
function isErrorMessageGetAttributeAssertion(expectCall, matcherCall) {
  if (
    !attributeMatchers.has(matcherCall.callee.property.name) ||
    expectCall.arguments.length !== 1 ||
    matcherCall.arguments.length !== 1
  ) {
    return false;
  }

  const [getAttributeCall] = expectCall.arguments;
  const [expectedId] = matcherCall.arguments;

  if (
    getAttributeCall.type !== "CallExpression" ||
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

export const meta = {
  docs: {
    description: "prefer toHaveAccessibleErrorMessage over checking aria-errormessage manually",
    category: "Best Practices",
    recommended: false,
    url: "prefer-to-have-accessible-error-message",
  },
  messages: {
    [messageId]: "Prefer toHaveAccessibleErrorMessage() over asserting aria-errormessage manually.",
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
