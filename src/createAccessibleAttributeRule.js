/**
 * @file Shared detection for accessible attribute matcher rules.
 * @author Aesthermortis.
 */

const attributeMatchers = new Set(["toBe", "toEqual", "toStrictEqual"]);

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
 * Checks whether a node is a non-empty string literal.
 *
 * @param {object | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the node is a non-empty string literal.
 */
function isNonEmptyStringLiteral(node) {
  const value = getStringLiteralValue(node);

  return typeof value === "string" && value.length > 0;
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
 * Checks for expect(element).toHaveAttribute("attribute", "value").
 *
 * @param {object} expectCall - The expect(...) call.
 * @param {object} matcherCall - Matcher CallExpression node.
 * @param {string} attribute - Attribute name to report.
 * @returns {boolean} Whether the assertion checks the configured attribute manually.
 */
function isAttributeAssertion(expectCall, matcherCall, attribute) {
  if (
    matcherCall.callee.property.name !== "toHaveAttribute" ||
    expectCall.arguments.length !== 1 ||
    matcherCall.arguments.length !== 2
  ) {
    return false;
  }

  const [checkedAttribute, checkedValue] = matcherCall.arguments;

  return (
    getStringLiteralValue(checkedAttribute) === attribute && isNonEmptyStringLiteral(checkedValue)
  );
}

/**
 * Checks for expect(element.getAttribute("attribute")).toBe("value").
 *
 * @param {object} expectCall - The expect(...) call.
 * @param {object} matcherCall - Matcher CallExpression node.
 * @param {string} attribute - Attribute name to report.
 * @returns {boolean} Whether the assertion checks getAttribute("attribute") manually.
 */
function isGetAttributeAssertion(expectCall, matcherCall, attribute) {
  if (
    !attributeMatchers.has(matcherCall.callee.property.name) ||
    expectCall.arguments.length !== 1 ||
    matcherCall.arguments.length !== 1
  ) {
    return false;
  }

  const [getAttributeCall] = expectCall.arguments;
  const [expectedValue] = matcherCall.arguments;

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
    isNonEmptyStringLiteral(expectedValue)
  );
}

/**
 * Creates a rule that reports literal assertions against one accessible attribute.
 *
 * @param {object} ruleOptions - Rule creation options.
 * @param {string} ruleOptions.attribute - Attribute name to report.
 * @param {string} ruleOptions.messageId - Message ID to report.
 * @returns {(context: object) => object} ESLint rule create function.
 */
export function createAccessibleAttributeRule({ attribute, messageId }) {
  return (context) => ({
    CallExpression(node) {
      const matcherCall = getPositiveMatcherCall(node);

      if (!matcherCall) {
        return;
      }

      const { expectCall } = matcherCall;

      if (
        isAttributeAssertion(expectCall, node, attribute) ||
        isGetAttributeAssertion(expectCall, node, attribute)
      ) {
        context.report({
          node,
          messageId,
        });
      }
    },
  });
}
