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
/**
 * @typedef {{
 *   preferred: string;
 *   negatedPreferred: string;
 *   attributes: string[];
 *   excludeValues?: string[];
 * }} BannedAttributeRuleOptions
 */

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
  if ("raw" in node && typeof node.raw === "string") {
    return node.raw;
  }

  if (node.type === astNodeTypes.Identifier) {
    return node.name;
  }

  return "";
}

/**
 * Checks whether an attribute matcher uses an excluded literal value.
 *
 * @param {CallExpression} node - Attribute matcher call node.
 * @param {string[]} excludedValues - Lowercase values that should not be reported.
 * @returns {boolean} Whether the matcher value is excluded.
 */
function isExcludedValue(node, excludedValues) {
  const value = getStringLiteralValue(node.arguments[1]);

  return value !== undefined && excludedValues.includes(value.toLowerCase());
}

/**
 * Checks whether an attribute matcher targets a banned attribute.
 *
 * @param {CallExpression} node - Attribute matcher call node.
 * @param {string[]} attributes - Attribute names banned by the rule.
 * @returns {boolean} Whether the matcher targets a banned attribute.
 */
function isBannedArg(node, attributes) {
  const attribute = getStringLiteralValue(node.arguments[0]);

  return attribute !== undefined && attributes.includes(attribute);
}

/**
 * Creates a rule listener for replacing banned attribute checks with jest-dom matchers.
 *
 * @param {BannedAttributeRuleOptions} ruleOptions - Banned attribute rule options.
 * @returns {(context: RuleContext) => RuleListener} Rule listener factory.
 */
// eslint-disable-next-line eslint-plugin/prefer-message-ids, eslint-plugin/prefer-object-rule, eslint-plugin/require-meta-docs-description, eslint-plugin/require-meta-schema, eslint-plugin/require-meta-type -- This is a rule factory, not a rule module.
export default function createBannedAttributeRule({
  preferred,
  negatedPreferred,
  attributes,
  excludeValues = [],
}) {
  const excludedValues = excludeValues.map((value) => value.toLowerCase());

  /** @type {(context: RuleContext) => RuleListener} */
  const createRuleListener = (context) => {
    /**
     * @param {CallExpression} node - Attribute matcher call node.
     * @param {boolean} [negated] - Whether the assertion is currently negated.
     * @returns {string} Preferred matcher for the assertion state.
     */
    const getCorrectFunctionFor = (node, negated = false) =>
      (node.arguments.length === 1 ||
        node.arguments[1]?.type !== astNodeTypes.Literal ||
        node.arguments[1].value === true ||
        (typeof node.arguments[1].value === "string" &&
          node.arguments[1].value.toLowerCase() === "true") ||
        node.arguments[1].value === "") &&
      !negated
        ? preferred
        : negatedPreferred;

    //expect(el).not.toBeEnabled() => expect(el).toBeDisabled()
    return /** @type {RuleListener} */ ({
      /**
       * @param {CallExpression} node - Matched assertion call.
       * @returns {void}
       */
      [`CallExpression[callee.property.name=/${preferred}|${negatedPreferred}/][callee.object.property.name='not'][callee.object.object.callee.name='expect']`](
        node,
      ) {
        const matcherMember = node.callee;

        if (!isStaticMemberExpression(matcherMember)) {
          return;
        }

        const negatedMatcherMember = matcherMember.object;

        if (!isStaticMemberExpression(negatedMatcherMember)) {
          return;
        }

        if (!negatedPreferred.startsWith("toBe")) {
          return;
        }

        const incorrectFunction = matcherMember.property.name;

        const correctFunction = incorrectFunction === preferred ? negatedPreferred : preferred;
        context.report({
          message: `Use ${correctFunction}() instead of not.${incorrectFunction}()`,
          node,
          fix: (fixer) =>
            fixer.replaceTextRange(
              [negatedMatcherMember.property.range[0], node.range[1]],
              `${correctFunction}()`,
            ),
        });
      },
      //expect(getByText('foo').<attribute>).toBeTruthy()
      /**
       * @param {CallExpression} node - Matched assertion call.
       * @returns {void}
       */
      "CallExpression[callee.property.name=/toBe(Truthy|Falsy)?|toEqual/][callee.object.callee.name='expect']"(
        node,
      ) {
        const matcherMember = node.callee;

        if (!isStaticMemberExpression(matcherMember) || !isCallExpression(matcherMember.object)) {
          return;
        }

        const [expectArgument] = matcherMember.object.arguments;

        if (!isStaticMemberExpression(expectArgument)) {
          return;
        }

        const { object, property } = expectArgument;
        const { name } = property;
        const matcher = matcherMember.property.name;
        const matcherArg =
          node.arguments[0]?.type === astNodeTypes.Literal ? node.arguments[0].value : undefined;

        if (!attributes.includes(name)) {
          return;
        }

        const { isDTLQuery } = getQueryNodeFrom(context, expectArgument);
        if (!isDTLQuery) {
          return;
        }

        const isNegated =
          matcher.endsWith("Falsy") ||
          ((matcher === "toBe" || matcher === "toEqual") && matcherArg !== true);
        const correctFunction = getCorrectFunctionFor(matcherMember.object, isNegated);
        context.report({
          node,
          message: `Use ${correctFunction}() instead of checking .${name} directly`,
          fix: (fixer) => [
            fixer.removeRange([object.range[1], property.range[1]]),
            fixer.replaceTextRange(
              [matcherMember.property.range[0], node.range[1]],
              `${correctFunction}()`,
            ),
          ],
        });
      },
      /**
       * @param {CallExpression} node - Matched assertion call.
       * @returns {void}
       */
      "CallExpression[callee.property.name=/toHaveProperty|toHaveAttribute/][callee.object.property.name='not'][callee.object.object.callee.name='expect']"(
        node,
      ) {
        const matcherMember = node.callee;

        if (!isStaticMemberExpression(matcherMember)) {
          return;
        }

        const negatedMatcherMember = matcherMember.object;

        if (!isStaticMemberExpression(negatedMatcherMember)) {
          return;
        }

        const arg = getStringLiteralValue(node.arguments[0]);

        if (arg === undefined || !attributes.includes(arg)) {
          return;
        }

        if (isExcludedValue(node, excludedValues)) {
          return;
        }

        const correctFunction = getCorrectFunctionFor(node, true);

        const incorrectFunction = matcherMember.property.name;
        context.report({
          message: `Use ${correctFunction}() instead of not.${incorrectFunction}('${arg}')`,
          node,
          fix: (fixer) =>
            fixer.replaceTextRange(
              [negatedMatcherMember.property.range[0], node.range[1]],
              `${correctFunction}()`,
            ),
        });
      },
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

        if (!isBannedArg(node, attributes)) {
          return;
        }

        if (isExcludedValue(node, excludedValues)) {
          return;
        }

        if (matcherMember.object.arguments.length === 0) {
          return;
        }

        const [expectArgument] = matcherMember.object.arguments;

        const { isDTLQuery } = getQueryNodeFrom(context, expectArgument);

        if (!isDTLQuery) {
          return;
        }

        const correctFunction = getCorrectFunctionFor(node);

        const incorrectFunction = matcherMember.property.name;

        const message = `Use ${correctFunction}() instead of ${incorrectFunction}(${node.arguments
          .map((argument) => getArgumentText(argument))
          .join(", ")})`;

        const secondArgIsLiteral =
          node.arguments.length === 2 && node.arguments[1]?.type === astNodeTypes.Literal;

        context.report({
          node: matcherMember.property,
          message,
          fix: (fixer) => {
            if (node.arguments.length === 1 || secondArgIsLiteral) {
              return [
                fixer.replaceTextRange(
                  [matcherMember.property.range[0], node.range[1]],
                  `${correctFunction}()`,
                ),
              ];
            }

            return null;
          },
        });
      },
    });
  };

  return createRuleListener;
}
