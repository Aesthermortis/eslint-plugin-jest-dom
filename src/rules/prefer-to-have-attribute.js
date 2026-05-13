/**
 * @file Prefer ToHaveAttribute over checking getAttribute/hasAttribute.
 * @author Ben Monro.
 */
import { getSourceCode } from "../context.js";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const messageIds = {
  preferGetAttribute: "prefer-get-attribute",
  preferHasAttribute: "prefer-has-attribute",
  invalidGetAttribute: "invalid-get-attribute",
  invalidHasAttribute: "invalid-has-attribute",
};

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
/** @typedef {import("eslint").Rule.Fix} Fix */
/** @typedef {import("eslint").Rule.RuleFixer} RuleFixer */
/** @typedef {Node & { parent?: NodeWithParent }} NodeWithParent */
/** @typedef {MemberExpression & { computed: false; property: Identifier }} StaticMemberExpression */
/**
 * @typedef {{
 *   attributeCall: CallExpression;
 *   attributeNameArgument: CallExpressionArgument;
 *   checkedElement: Expression;
 *   expectCall: CallExpression;
 *   matcherCall: CallExpression;
 *   matcherArguments: CallExpressionArgument[];
 *   matcherProperty: Identifier;
 * }} AttributeAssertion
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
 * @param {Node} node - AST node whose parent should be read.
 * @returns {NodeWithParent | undefined} Parent node, when present.
 */
function getParent(node) {
  return /** @type {NodeWithParent} */ (node).parent;
}

/**
 * @param {Node | undefined} node - AST node to inspect.
 * @returns {node is CallExpression} Whether the node is a call expression.
 */
function isCallExpression(node) {
  return node?.type === astNodeTypes.CallExpression;
}

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
 * @param {Node | undefined} node - AST node to inspect.
 * @returns {node is CallExpression} Whether the node is expect(...).
 */
function isExpectCall(node) {
  return (
    isCallExpression(node) &&
    node.callee.type === astNodeTypes.Identifier &&
    node.callee.name === "expect"
  );
}

/**
 * @param {CallExpressionArgument | undefined} node - AST node to inspect.
 * @returns {unknown} Literal value, when present.
 */
function getLiteralValue(node) {
  return node?.type === astNodeTypes.Literal ? node.value : undefined;
}

/**
 * @param {CallExpression} node - getAttribute/hasAttribute call node.
 * @returns {AttributeAssertion | null} Attribute assertion details.
 */
function getAttributeAssertion(node) {
  if (!isStaticMemberExpression(node.callee) || !node.arguments[0]) {
    return null;
  }

  const expectCall = getParent(node);
  const matcherMember = expectCall && getParent(expectCall);
  const matcherCall = matcherMember && getParent(matcherMember);

  if (
    !isExpectCall(expectCall) ||
    !isStaticMemberExpression(matcherMember) ||
    !isCallExpression(matcherCall)
  ) {
    return null;
  }

  return {
    attributeCall: node,
    attributeNameArgument: node.arguments[0],
    checkedElement: node.callee.object,
    expectCall,
    matcherCall,
    matcherArguments: matcherCall.arguments,
    matcherProperty: matcherMember.property,
  };
}

/**
 * @param {RuleFixer} fixer - ESLint fixer.
 * @param {AttributeAssertion} assertion - Attribute assertion details.
 * @returns {Fix} Fix that removes the attribute accessor from the expected value.
 */
function removeAttributeAccessor(fixer, assertion) {
  return fixer.removeRange([assertion.checkedElement.range[1], assertion.attributeCall.range[1]]);
}

/**
 * @param {RuleContext} context - ESLint rule context.
 * @param {AttributeAssertion} assertion - Attribute assertion details.
 * @returns {string} Original attribute-name source text.
 */
function getAttributeNameText(context, assertion) {
  return getSourceCode(context).getText(assertion.attributeNameArgument);
}

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "problem",
  docs: {
    description: "prefer toHaveAttribute over checking  getAttribute/hasAttribute ",
    url: "prefer-to-have-attribute",
    recommended: true,
  },
  fixable: "code",
  schema: [],
  messages: {
    [messageIds.preferGetAttribute]: "Use toHaveAttribute instead of asserting on getAttribute",
    [messageIds.preferHasAttribute]: "Use toHaveAttribute instead of asserting on hasAttribute",
    [messageIds.invalidGetAttribute]: "Invalid matcher for getAttribute",
    [messageIds.invalidHasAttribute]: "Invalid matcher for hasAttribute",
  },
};

/**
 * @param {RuleContext} context - ESLint rule context.
 * @returns {RuleListener} Rule listener.
 */
export function create(context) {
  return /** @type {RuleListener} */ ({
    [`CallExpression[callee.property.name='getAttribute'][parent.callee.name='expect'][parent.parent.property.name=/toBeNull/]`](
      /**
       * @param {CallExpression} node - Matched getAttribute call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getAttributeAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node: assertion.expectCall,
        messageId: messageIds.preferGetAttribute,
        fix: (fixer) => [
          removeAttributeAccessor(fixer, assertion),
          fixer.replaceTextRange(
            [assertion.matcherProperty.range[0], assertion.matcherCall.range[1]],
            `not.toHaveAttribute(${getAttributeNameText(context, assertion)})`,
          ),
        ],
      });
    },
    [`CallExpression[callee.property.name='getAttribute'][parent.callee.name='expect'][parent.parent.property.name=/toContain$|toMatch$/]`](
      /**
       * @param {CallExpression} node - Matched getAttribute call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getAttributeAssertion(node);
      const [matcherArgument] = assertion?.matcherArguments ?? [];

      if (!assertion || !matcherArgument) {
        return;
      }

      const sourceCode = getSourceCode(context);
      context.report({
        node: assertion.expectCall,
        messageId: messageIds.preferGetAttribute,
        fix: (fixer) => [
          removeAttributeAccessor(fixer, assertion),
          fixer.replaceText(assertion.matcherProperty, "toHaveAttribute"),
          fixer.replaceText(
            matcherArgument,
            `${getAttributeNameText(context, assertion)}, expect.string${assertion.matcherProperty.name.slice(
              2,
            )}ing(${sourceCode.getText(matcherArgument)})`,
          ),
        ],
      });
    },
    [`CallExpression[callee.property.name='getAttribute'][parent.callee.name='expect'][parent.parent.property.name=/toBe$|to(Strict)?Equal/]`](
      /**
       * @param {CallExpression} node - Matched getAttribute call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getAttributeAssertion(node);
      const [matcherArgument] = assertion?.matcherArguments ?? [];

      if (!assertion || !matcherArgument) {
        return;
      }

      const isNull = getLiteralValue(matcherArgument) === null;
      const sourceCode = getSourceCode(context);
      context.report({
        node: assertion.expectCall,
        messageId: messageIds.preferGetAttribute,
        fix: (fixer) => {
          const lastFixer = isNull
            ? fixer.replaceText(matcherArgument, getAttributeNameText(context, assertion))
            : fixer.insertTextBefore(
                matcherArgument,
                `${sourceCode.getText(assertion.attributeNameArgument)}, `,
              );

          return [
            removeAttributeAccessor(fixer, assertion),
            fixer.replaceText(assertion.matcherProperty, `${isNull ? "not." : ""}toHaveAttribute`),
            lastFixer,
          ];
        },
      });
    },
    [`CallExpression[callee.property.name='hasAttribute'][parent.callee.name='expect'][parent.parent.property.name=/toBeNull|toBeUndefined|toBeDefined/]`](
      /**
       * @param {CallExpression} node - Matched hasAttribute call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getAttributeAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node: assertion.matcherProperty,
        messageId: messageIds.invalidHasAttribute,
      });
    },
    [`CallExpression[callee.property.name='getAttribute'][parent.callee.name='expect'][parent.parent.property.name=/toBeUndefined|toBeDefined/]`](
      /**
       * @param {CallExpression} node - Matched getAttribute call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getAttributeAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node: assertion.matcherProperty,
        messageId: messageIds.invalidGetAttribute,
      });
    },
    [`CallExpression[callee.property.name='hasAttribute'][parent.callee.name='expect'][parent.parent.property.name=/toBe$|to(Strict)?Equal/]`](
      /**
       * @param {CallExpression} node - Matched hasAttribute call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getAttributeAssertion(node);
      const [matcherArgument] = assertion?.matcherArguments ?? [];
      const matcherValue = getLiteralValue(matcherArgument);

      if (!assertion) {
        return;
      }

      if (typeof matcherValue === "boolean") {
        context.report({
          node: assertion.expectCall,
          messageId: messageIds.preferHasAttribute,
          fix: (fixer) => [
            removeAttributeAccessor(fixer, assertion),
            fixer.replaceText(
              assertion.matcherProperty,
              `${matcherValue === false ? "not." : ""}toHaveAttribute`,
            ),
            fixer.replaceText(matcherArgument, getAttributeNameText(context, assertion)),
          ],
        });
      } else {
        context.report({
          node: assertion.matcherProperty,
          messageId: messageIds.invalidHasAttribute,
        });
      }
    },
    [`CallExpression[callee.property.name='hasAttribute'][parent.callee.name='expect'][parent.parent.property.name=/toBeTruthy|toBeFalsy/]`](
      /**
       * @param {CallExpression} node - Matched hasAttribute call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getAttributeAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node: assertion.expectCall,
        messageId: messageIds.preferHasAttribute,
        fix: (fixer) => [
          removeAttributeAccessor(fixer, assertion),
          fixer.replaceTextRange(
            [assertion.matcherProperty.range[0], assertion.matcherCall.range[1]],
            `${
              assertion.matcherProperty.name === "toBeFalsy" ? "not." : ""
            }toHaveAttribute(${getAttributeNameText(context, assertion)})`,
          ),
        ],
      });
    },
  });
}
