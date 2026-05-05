/**
 * @file Prefer toHaveDisplayValue over manual value assertions.
 * @author Aesthermortis.
 */

const valueMatchers = new Set(["toBe", "toEqual", "toStrictEqual"]);
const messageId = "prefer-to-have-display-value";

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
 * Checks whether a node is a string literal.
 *
 * @param {object | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the node is a string literal.
 */
function isStringLiteral(node) {
  return node?.type === "Literal" && typeof node.value === "string";
}

/**
 * Checks whether an identifier name appears to reference a select control.
 *
 * @param {object} node - Identifier node to inspect.
 * @returns {boolean} Whether the identifier looks select-specific.
 */
function isLikelySelectControl(node) {
  return node.type === "Identifier" && (node.name === "select" || node.name.endsWith("Select"));
}

/**
 * Checks for input.value or textarea.value.
 *
 * @param {object | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the node reads a non-select element value.
 */
function isValuePropertyRead(node) {
  return (
    isStaticMemberExpression(node) &&
    node.property.name === "value" &&
    !isLikelySelectControl(node.object)
  );
}

export const meta = {
  docs: {
    description: "prefer toHaveDisplayValue over manual value assertions",
    category: "Best Practices",
    recommended: false,
    url: "prefer-to-have-display-value",
  },
  messages: {
    [messageId]: "Prefer toHaveDisplayValue() over manual value assertions.",
  },
};

export const create = (context) => ({
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
});
