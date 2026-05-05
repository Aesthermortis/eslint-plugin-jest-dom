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
 * Checks whether a node reads a Node.DOCUMENT_POSITION_* constant.
 *
 * @param {object | undefined} node - AST node to inspect.
 * @param {string} documentPosition - Expected document position constant name.
 * @returns {boolean} Whether the node is the expected Node document position constant.
 */
function isExpectedDocumentPosition(node, documentPosition) {
  return (
    isStaticMemberExpression(node) &&
    node.object.type === "Identifier" &&
    node.object.name === "Node" &&
    node.property.name === documentPosition
  );
}

/**
 * Checks for element.compareDocumentPosition(other).
 *
 * @param {object | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the node is a compareDocumentPosition call with one argument.
 */
function isCompareDocumentPositionCall(node) {
  return (
    node?.type === "CallExpression" &&
    isStaticMemberExpression(node.callee) &&
    node.callee.property.name === "compareDocumentPosition" &&
    node.arguments.length === 1
  );
}

/**
 * Checks for element.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_*.
 *
 * @param {object | undefined} node - AST node to inspect.
 * @param {string} documentPosition - Expected document position constant name.
 * @returns {boolean} Whether the node is the expected document position bitmask.
 */
function isDocumentPositionBitmask(node, documentPosition) {
  if (node?.type !== "BinaryExpression" || node.operator !== "&") {
    return false;
  }

  return (
    (isCompareDocumentPositionCall(node.left) &&
      isExpectedDocumentPosition(node.right, documentPosition)) ||
    (isExpectedDocumentPosition(node.left, documentPosition) &&
      isCompareDocumentPositionCall(node.right))
  );
}

/**
 * Creates a rule that reports manual compareDocumentPosition bitmask assertions.
 *
 * @param {object} ruleOptions - Document order rule options.
 * @param {string} ruleOptions.documentPosition - Node.DOCUMENT_POSITION_* constant name to report.
 * @param {string} ruleOptions.messageId - Message ID to report.
 * @returns {function(object): object} Rule listener factory.
 */
export function createDocumentOrderRule({ documentPosition, messageId }) {
  return (context) => ({
    CallExpression(node) {
      const matcherCall = getPositiveMatcherCall(node);

      if (
        !matcherCall ||
        matcherCall.matcherName !== "toBeTruthy" ||
        matcherCall.expectCall.arguments.length !== 1 ||
        node.arguments.length > 0
      ) {
        return;
      }

      const [actual] = matcherCall.expectCall.arguments;

      if (isDocumentPositionBitmask(actual, documentPosition)) {
        context.report({
          node,
          messageId,
        });
      }
    },
  });
}
