/** @typedef {import("@typescript-eslint/types").TSESTree.BinaryExpression} BinaryExpression */
/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpression} CallExpression */
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
/** @typedef {{ documentPosition: string; messageId: string }} DocumentOrderRuleOptions */
/** @typedef {{ expectCall: CallExpression; matcherName: string }} MatcherCall */

const astNodeTypes = /** @type {const} */ ({
  BinaryExpression:
    /** @type {import("@typescript-eslint/types").AST_NODE_TYPES.BinaryExpression} */ (
      "BinaryExpression"
    ),
  CallExpression: /** @type {import("@typescript-eslint/types").AST_NODE_TYPES.CallExpression} */ (
    "CallExpression"
  ),
  Identifier: /** @type {import("@typescript-eslint/types").AST_NODE_TYPES.Identifier} */ (
    "Identifier"
  ),
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
 * Checks whether a node reads a Node.DOCUMENT_POSITION_* constant.
 *
 * @param {Expression | undefined} node - AST node to inspect.
 * @param {string} documentPosition - Expected document position constant name.
 * @returns {boolean} Whether the node is the expected Node document position constant.
 */
function isExpectedDocumentPosition(node, documentPosition) {
  return (
    isStaticMemberExpression(node) &&
    node.object.type === astNodeTypes.Identifier &&
    node.object.name === "Node" &&
    node.property.name === documentPosition
  );
}

/**
 * Checks for element.compareDocumentPosition(other).
 *
 * @param {Expression | undefined} node - AST node to inspect.
 * @returns {node is CallExpression} Whether the node is a compareDocumentPosition call with one argument.
 */
function isCompareDocumentPositionCall(node) {
  return (
    isCallExpression(node) &&
    isStaticMemberExpression(node.callee) &&
    node.callee.property.name === "compareDocumentPosition" &&
    node.arguments.length === 1
  );
}

/**
 * Checks for element.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_*.
 *
 * @param {Expression | undefined} node - AST node to inspect.
 * @param {string} documentPosition - Expected document position constant name.
 * @returns {boolean} Whether the node is the expected document position bitmask.
 */
function isDocumentPositionBitmask(node, documentPosition) {
  if (node?.type !== astNodeTypes.BinaryExpression || node.operator !== "&") {
    return false;
  }

  const bitmaskNode = /** @type {BinaryExpression} */ (node);

  return (
    (isCompareDocumentPositionCall(bitmaskNode.left) &&
      isExpectedDocumentPosition(bitmaskNode.right, documentPosition)) ||
    (isExpectedDocumentPosition(bitmaskNode.left, documentPosition) &&
      isCompareDocumentPositionCall(bitmaskNode.right))
  );
}

/**
 * Creates a rule that reports manual compareDocumentPosition bitmask assertions.
 *
 * @param {DocumentOrderRuleOptions} ruleOptions - Document order rule options.
 * @returns {(context: RuleContext) => RuleListener} Rule listener factory.
 */
export function createDocumentOrderRule({ documentPosition, messageId }) {
  /** @type {(context: RuleContext) => RuleListener} */
  const createRuleListener = (context) =>
    /** @type {RuleListener} */ ({
      /**
       * @param {CallExpression} node - Call expression node.
       * @returns {void}
       */
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

  return createRuleListener;
}
