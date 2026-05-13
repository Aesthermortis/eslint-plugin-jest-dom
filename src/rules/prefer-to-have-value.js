/**
 * @file Prefer ToHaveAttribute over checking getAttribute/hasAttribute.
 * @author Ben Monro.
 */

import { getQueryNodeFrom } from "../assignment-ast.js";
import { getSourceCode } from "../context.js";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @import {JestDomRuleModule} from "../types.d.ts" */
/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpression} CallExpression */
/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpressionArgument} CallExpressionArgument */
/** @typedef {import("@typescript-eslint/types").TSESTree.Expression} Expression */
/** @typedef {import("@typescript-eslint/types").TSESTree.Identifier} Identifier */
/** @typedef {import("@typescript-eslint/types").TSESTree.MemberExpression} MemberExpression */
/** @typedef {import("@typescript-eslint/types").TSESTree.Node} Node */
/**
 * @typedef {import("@typescript-eslint/utils/ts-eslint").RuleContext<
 *   string,
 *   readonly unknown[]
 * >} RuleContext
 */
/** @typedef {import("@typescript-eslint/utils/ts-eslint").RuleListener} RuleListener */
/** @typedef {import("@typescript-eslint/utils/ts-eslint").AST.Token} Token */
/** @typedef {MemberExpression & { computed: false; property: Identifier }} StaticMemberExpression */
/**
 * @typedef {CallExpression & {
 *   callee: StaticMemberExpression;
 * }} StaticMemberCallExpression
 */
/**
 * @typedef {{
 *   matcher: Identifier;
 *   queryNode: Expression;
 *   valueAccess: StaticMemberExpression;
 *   valueProperty: Identifier;
 * }} ValueAssertion
 */
/**
 * @typedef {{
 *   matcher: Identifier;
 *   propertyArg: CallExpressionArgument;
 *   valueArg: CallExpressionArgument;
 * }} ValueAttributeAssertion
 */

const messageId = "use-to-have-value";

const astNodeTypes = /** @type {const} */ ({
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
 * @param {Node | undefined} node - AST node to inspect.
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
 * @param {CallExpression} node - CallExpression node to inspect.
 * @returns {node is StaticMemberCallExpression} Whether the call has a static member callee.
 */
function hasStaticMemberCallee(node) {
  return isStaticMemberExpression(/** @type {Node | undefined} */ (node.callee));
}

/**
 * Checks whether a node is a Testing Library role query that can produce a value assertion.
 *
 * @param {RuleContext} context - ESLint rule context.
 * @param {Node} nodeWithValueProp - AST node to inspect.
 * @returns {boolean} Whether the node is a supported value query.
 */
function isValidQueryNode(context, nodeWithValueProp) {
  const { query, queryArg, isDTLQuery } = getQueryNodeFrom(context, nodeWithValueProp);

  return (
    typeof query === "string" &&
    isDTLQuery &&
    /^(?:get|find|query)(?:All)?ByRole$/.test(query) &&
    typeof queryArg === "string" &&
    ["textbox", "dropdown"].includes(queryArg)
  );
}

/**
 * @param {CallExpression} node - Matched matcher call.
 * @returns {ValueAssertion | null} Parsed positive value assertion.
 */
function getValueAssertion(node) {
  if (!hasStaticMemberCallee(node)) {
    return null;
  }

  const expectCall = node.callee.object;
  const [expectArgument] =
    expectCall.type === astNodeTypes.CallExpression ? expectCall.arguments : [];

  if (!isStaticMemberExpression(expectArgument)) {
    return null;
  }

  return {
    matcher: node.callee.property,
    queryNode: expectArgument.object,
    valueAccess: expectArgument,
    valueProperty: expectArgument.property,
  };
}

/**
 * @param {CallExpression} node - Matched matcher call.
 * @returns {ValueAssertion | null} Parsed negated value assertion.
 */
function getNegatedValueAssertion(node) {
  if (!hasStaticMemberCallee(node) || !isStaticMemberExpression(node.callee.object)) {
    return null;
  }

  const expectCall = node.callee.object.object;
  const [expectArgument] =
    expectCall.type === astNodeTypes.CallExpression ? expectCall.arguments : [];

  if (!isStaticMemberExpression(expectArgument)) {
    return null;
  }

  return {
    matcher: node.callee.property,
    queryNode: expectArgument.object,
    valueAccess: expectArgument,
    valueProperty: expectArgument.property,
  };
}

/**
 * @param {CallExpression} node - Matched toHaveAttribute/toHaveProperty call.
 * @returns {ValueAttributeAssertion | null} Parsed value attribute/property assertion.
 */
function getValueAttributeAssertion(node) {
  if (!hasStaticMemberCallee(node)) {
    return null;
  }

  const [propertyArg, valueArg] = node.arguments;

  if (!propertyArg || !valueArg) {
    return null;
  }

  return {
    matcher: node.callee.property,
    propertyArg,
    valueArg,
  };
}

/**
 * @param {RuleContext} context - ESLint rule context.
 * @param {Identifier} valueProperty - The value property identifier.
 * @returns {Token | null} Token before the value property.
 */
function getTokenBeforeValueProperty(context, valueProperty) {
  return getSourceCode(context).getTokenBefore(valueProperty);
}

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    description: "prefer toHaveValue over checking element.value",
    url: "prefer-to-have-value",
    recommended: true,
  },
  fixable: "code",
  schema: [],
  messages: {
    [messageId]: `Prefer .toHaveValue() over other attribute checks`,
  },
};

/**
 * @param {RuleContext} context - ESLint rule context.
 * @returns {RuleListener} Rule listener.
 */
export function create(context) {
  return /** @type {RuleListener} */ ({
    // expect(element.value).toBe('foo') / toEqual / toStrictEqual
    // expect(<query>.value).toBe('foo') / toEqual / toStrictEqual
    // expect((await <query>).value).toBe('foo') / toEqual / toStrictEqual
    [`CallExpression[callee.property.name=/to(Be|(Strict)?Equal)$/][callee.object.arguments.0.property.name=value][callee.object.callee.name=expect]`](
      /**
       * @param {CallExpression} node - Matched matcher call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getValueAssertion(node);

      if (!assertion || !isValidQueryNode(context, assertion.queryNode)) {
        return;
      }

      context.report({
        messageId,
        node,
        fix(fixer) {
          const dotToken = getTokenBeforeValueProperty(context, assertion.valueProperty);

          if (!dotToken) {
            return null;
          }

          return [
            fixer.remove(dotToken),
            fixer.remove(assertion.valueProperty),
            fixer.replaceText(assertion.matcher, "toHaveValue"),
          ];
        },
      });
    },

    // expect(element.value).not.toBe('foo') / toEqual / toStrictEqual
    // expect(<query>.value).not.toBe('foo') / toEqual / toStrictEqual
    // expect((await <query>).value).not.toBe('foo') / toEqual / toStrictEqual
    [`CallExpression[callee.property.name=/to(Be|(Strict)?Equal)$/][callee.object.object.callee.name=expect][callee.object.property.name=not][callee.object.object.arguments.0.property.name=value]`](
      /**
       * @param {CallExpression} node - Matched matcher call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getNegatedValueAssertion(node);

      if (!assertion || !isValidQueryNode(context, assertion.queryNode)) {
        return;
      }

      context.report({
        messageId,
        node,
        fix(fixer) {
          const dotToken = getTokenBeforeValueProperty(context, assertion.valueProperty);

          if (!dotToken) {
            return null;
          }

          return [
            fixer.removeRange([dotToken.range[0], assertion.valueProperty.range[1]]),
            fixer.replaceText(assertion.matcher, "toHaveValue"),
          ];
        },
      });
    },

    //expect(element).toHaveAttribute('value', 'foo')  / Property
    [`CallExpression[callee.property.name=/toHave(Attribute|Property)/][arguments.0.value=value][arguments.1][callee.object.callee.name=expect], CallExpression[callee.property.name=/toHave(Attribute|Property)/][arguments.0.value=value][arguments.1][callee.object.object.callee.name=expect][callee.object.property.name=not]`](
      /**
       * @param {CallExpression} node - Matched matcher call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getValueAttributeAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        messageId,
        node,

        fix(fixer) {
          return [
            fixer.replaceText(assertion.matcher, "toHaveValue"),
            fixer.removeRange([assertion.propertyArg.range[0], assertion.valueArg.range[0]]),
          ];
        },
      });
    },
  });
}
