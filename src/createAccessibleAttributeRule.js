/**
 * @file Shared detection for accessible attribute matcher rules.
 * @author Aesthermortis.
 */

const attributeMatchers = new Set(["toBe", "toEqual", "toStrictEqual"]);

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
/** @typedef {{ attribute: string; messageId: string }} AccessibleAttributeRuleOptions */
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
 * Checks whether a node is a non-empty string literal.
 *
 * @param {CallExpressionArgument | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the node is a non-empty string literal.
 */
function isNonEmptyStringLiteral(node) {
  const value = getStringLiteralValue(node);

  return typeof value === "string" && value.length > 0;
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
 * Checks for expect(element).toHaveAttribute("attribute", "value").
 *
 * @param {CallExpression} expectCall - The expect(...) call.
 * @param {CallExpression} matcherCall - Matcher CallExpression node.
 * @param {string} attribute - Attribute name to report.
 * @returns {boolean} Whether the assertion checks the configured attribute manually.
 */
function isAttributeAssertion(expectCall, matcherCall, attribute) {
  if (
    !isStaticMemberExpression(matcherCall.callee) ||
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
 * @param {CallExpression} expectCall - The expect(...) call.
 * @param {CallExpression} matcherCall - Matcher CallExpression node.
 * @param {string} attribute - Attribute name to report.
 * @returns {boolean} Whether the assertion checks getAttribute("attribute") manually.
 */
function isGetAttributeAssertion(expectCall, matcherCall, attribute) {
  if (
    !isStaticMemberExpression(matcherCall.callee) ||
    !attributeMatchers.has(matcherCall.callee.property.name) ||
    expectCall.arguments.length !== 1 ||
    matcherCall.arguments.length !== 1
  ) {
    return false;
  }

  const [getAttributeCall] = expectCall.arguments;
  const [expectedValue] = matcherCall.arguments;

  if (
    getAttributeCall.type !== astNodeTypes.CallExpression ||
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
 * @param {AccessibleAttributeRuleOptions} ruleOptions - Rule creation options.
 * @returns {(context: RuleContext) => RuleListener} ESLint rule create function.
 */
export function createAccessibleAttributeRule({ attribute, messageId }) {
  return (context) =>
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
