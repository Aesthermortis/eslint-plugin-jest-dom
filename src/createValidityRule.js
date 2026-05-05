const validityMatchers = new Set(["toBe", "toEqual", "toStrictEqual"]);

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
 * Checks whether a node is a literal with the expected boolean value.
 *
 * @param {object | undefined} node - AST node to inspect.
 * @param {boolean} expectedValidity - Expected boolean value.
 * @returns {boolean} Whether the node is the expected boolean literal.
 */
function isExpectedBooleanLiteral(node, expectedValidity) {
  return node?.type === "Literal" && node.value === expectedValidity;
}

/**
 * Checks for expect(element).toHaveAttribute("aria-invalid", "true").
 *
 * @param {object} expectCall - The expect(...) call.
 * @param {object} matcherCall - Matcher CallExpression node.
 * @param {string} ariaInvalidValue - Expected aria-invalid value.
 * @returns {boolean} Whether the assertion checks aria-invalid manually.
 */
function isAriaInvalidAssertion(expectCall, matcherCall, ariaInvalidValue) {
  if (
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
 * @param {object} expectCall - The expect(...) call.
 * @param {object} matcherCall - Matcher CallExpression node.
 * @param {boolean} expectedValidity - Expected checkValidity() value.
 * @returns {boolean} Whether the assertion checks checkValidity() manually.
 */
function isCheckValidityAssertion(expectCall, matcherCall, expectedValidity) {
  if (
    !validityMatchers.has(matcherCall.callee.property.name) ||
    expectCall.arguments.length !== 1 ||
    matcherCall.arguments.length !== 1
  ) {
    return false;
  }

  const [checkValidityCall] = expectCall.arguments;
  const [validity] = matcherCall.arguments;

  return (
    checkValidityCall.type === "CallExpression" &&
    isStaticMemberExpression(checkValidityCall.callee) &&
    checkValidityCall.callee.property.name === "checkValidity" &&
    checkValidityCall.arguments.length === 0 &&
    isExpectedBooleanLiteral(validity, expectedValidity)
  );
}

/**
 * Creates a rule that reports manual validity assertions.
 *
 * @param {object} ruleOptions - Validity rule options.
 * @param {string | null} ruleOptions.ariaInvalidValue - aria-invalid value to report, or null to skip aria-invalid
 *                                                     assertions.
 * @param {boolean} ruleOptions.expectedValidity - checkValidity() value to report.
 * @param {string} ruleOptions.messageId - Message ID to report.
 * @returns {function(object): object} Rule listener factory.
 */
export function createValidityRule({ ariaInvalidValue, expectedValidity, messageId }) {
  return (context) => ({
    CallExpression(node) {
      const matcherCall = getPositiveMatcherCall(node);

      if (!matcherCall) {
        return;
      }

      const { expectCall } = matcherCall;

      if (
        (ariaInvalidValue !== null && isAriaInvalidAssertion(expectCall, node, ariaInvalidValue)) ||
        isCheckValidityAssertion(expectCall, node, expectedValidity)
      ) {
        context.report({
          node,
          messageId,
        });
      }
    },
  });
}
