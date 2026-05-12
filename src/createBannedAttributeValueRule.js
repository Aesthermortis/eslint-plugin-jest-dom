import { getQueryNodeFrom } from "./assignment-ast.js";

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
/** @typedef {{ preferred: string; attributes: string[]; values: string[] }} BannedAttributeValueRuleOptions */

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
 * @param {CallExpressionArgument} node - Call argument node.
 * @returns {string} Source-like argument text for diagnostics.
 */
function getArgumentText(node) {
  return "raw" in node && typeof node.raw === "string" ? node.raw : "";
}

/**
 * Creates a rule listener for replacing banned attribute value checks with jest-dom matchers.
 *
 * @param {BannedAttributeValueRuleOptions} ruleOptions - Banned attribute value rule options.
 * @returns {(context: RuleContext) => RuleListener} Rule listener factory.
 */
export default function createBannedAttributeValueRule({ preferred, attributes, values }) {
  const bannedAttributes = new Set(attributes);
  const bannedValues = new Set(values);

  /** @type {(context: RuleContext) => RuleListener} */
  const createRuleListener = (context) =>
    /** @type {RuleListener} */ ({
      /**
       * @param {CallExpression} node - Matched assertion call.
       * @returns {void}
       */
      "CallExpression[callee.object.callee.name='expect'][callee.property.name=/toHaveProperty|toHaveAttribute/]"(
        node,
      ) {
        const matcherMember = node.callee;

        if (!isStaticMemberExpression(matcherMember) || !isCallExpression(matcherMember.object)) {
          return;
        }

        if (node.arguments.length !== 2 || matcherMember.object.arguments.length === 0) {
          return;
        }

        const attribute = getStringLiteralValue(node.arguments[0]);
        const value = getStringLiteralValue(node.arguments[1]);

        if (
          attribute === undefined ||
          value === undefined ||
          !bannedAttributes.has(attribute) ||
          !bannedValues.has(value)
        ) {
          return;
        }

        const [expectArgument] = matcherMember.object.arguments;

        const { isDTLQuery } = getQueryNodeFrom(context, expectArgument);

        if (!isDTLQuery) {
          return;
        }

        const incorrectFunction = matcherMember.property.name;
        const message = `Use ${preferred}() instead of ${incorrectFunction}(${node.arguments
          .map((argument) => getArgumentText(argument))
          .join(", ")})`;

        context.report({
          node: matcherMember.property,
          message,
          fix: (fixer) =>
            fixer.replaceTextRange(
              [matcherMember.property.range[0], node.range[1]],
              `${preferred}()`,
            ),
        });
      },
    });

  return createRuleListener;
}
