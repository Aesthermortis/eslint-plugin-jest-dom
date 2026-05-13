const validityMatchers = new Set(["toBe", "toEqual", "toStrictEqual"]);

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
/** @typedef {{ ariaInvalidValue: string | null; expectedValidity: boolean; messageId: string }} ValidityRuleOptions */
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
 * @param {CallExpressionArgument | Expression | undefined} node - AST node to inspect.
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
 * Checks whether a node is a literal with the expected boolean value.
 *
 * @param {CallExpressionArgument | undefined} node - AST node to inspect.
 * @param {boolean} expectedValidity - Expected boolean value.
 * @returns {boolean} Whether the node is the expected boolean literal.
 */
function isExpectedBooleanLiteral(node, expectedValidity) {
  return node?.type === astNodeTypes.Literal && node.value === expectedValidity;
}

/**
 * Checks for expect(element).toHaveAttribute("aria-invalid", "true").
 *
 * @param {CallExpression} expectCall - The expect(...) call.
 * @param {CallExpression} matcherCall - Matcher CallExpression node.
 * @param {string} ariaInvalidValue - Expected aria-invalid value.
 * @returns {boolean} Whether the assertion checks aria-invalid manually.
 */
function isAriaInvalidAssertion(expectCall, matcherCall, ariaInvalidValue) {
  if (
    !isStaticMemberExpression(matcherCall.callee) ||
    matcherCall.callee.property.name !== "toHaveAttribute" ||
    expectCall.arguments.length !== 1 ||
    matcherCall.arguments.length !== 2
  ) {
    return false;
  }

  const [attribute, value] = matcherCall.arguments;

  return (
    getStringLiteralValue(attribute) === "aria-invalid" &&
    getStringLiteralValue(value) === ariaInvalidValue
  );
}

/**
 * Checks for expect(element.checkValidity()).toBe(false).
 *
 * @param {CallExpression} expectCall - The expect(...) call.
 * @param {CallExpression} matcherCall - Matcher CallExpression node.
 * @param {boolean} expectedValidity - Expected checkValidity() value.
 * @returns {boolean} Whether the assertion checks checkValidity() manually.
 */
function isCheckValidityAssertion(expectCall, matcherCall, expectedValidity) {
  if (
    !isStaticMemberExpression(matcherCall.callee) ||
    !validityMatchers.has(matcherCall.callee.property.name) ||
    expectCall.arguments.length !== 1 ||
    matcherCall.arguments.length !== 1
  ) {
    return false;
  }

  const [checkValidityCall] = expectCall.arguments;
  const [validity] = matcherCall.arguments;

  return (
    isCallExpression(checkValidityCall) &&
    isStaticMemberExpression(checkValidityCall.callee) &&
    checkValidityCall.callee.property.name === "checkValidity" &&
    checkValidityCall.arguments.length === 0 &&
    isExpectedBooleanLiteral(validity, expectedValidity)
  );
}

/**
 * Creates a rule that reports manual validity assertions.
 *
 * @param {ValidityRuleOptions} ruleOptions - Validity rule options.
 * @returns {(context: RuleContext) => RuleListener} Rule listener factory.
 */
export function createValidityRule({ ariaInvalidValue, expectedValidity, messageId }) {
  /** @type {(context: RuleContext) => RuleListener} */
  const createRuleListener = (context) =>
    /** @type {RuleListener} */ ({
      /**
       * @param {CallExpression} node - Call expression node.
       * @returns {void}
       */
      CallExpression(node) {
        const matcherCall = getPositiveMatcherCall(node);

        if (!matcherCall) {
          return;
        }

        const { expectCall } = matcherCall;

        if (
          (ariaInvalidValue !== null &&
            isAriaInvalidAssertion(expectCall, node, ariaInvalidValue)) ||
          isCheckValidityAssertion(expectCall, node, expectedValidity)
        ) {
          context.report({
            node,
            messageId,
          });
        }
      },
    });

  return createRuleListener;
}
