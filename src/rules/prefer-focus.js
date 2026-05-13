/**
 * @file Prefer ToHaveFocus over checking activeElementa.
 * @author Ben Monro.
 */

const variantsOfDoc = [
  // document:
  `[object.name=document]`,
  // window.document || global.document:
  `[object.object.name=/(global|window)$/][object.property.name=document]`,
  // global.window.document:
  `[object.object.object.name='global'][object.object.property.name='window'][object.property.name=document]`,
];

/** @import {JestDomRuleModule} from "../types.d.ts" */
/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpression} CallExpression */
/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpressionArgument} CallExpressionArgument */
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
 *   element: CallExpressionArgument;
 *   matcherProperty: Identifier;
 *   reportNode: Node;
 * }} FocusAssertion
 */

const messageId = "preferFocus";

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

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    url: "prefer-focus",
    description: "prefer toHaveFocus over checking document.activeElement",
    recommended: true,
  },
  fixable: "code",
  schema: [],
  messages: {
    [messageId]: "Use toHaveFocus instead of checking activeElement",
  },
};

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
 * @returns {node is Identifier} Whether the node is an identifier.
 */
function isIdentifier(node) {
  return node?.type === astNodeTypes.Identifier;
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
 * @returns {node is CallExpression} Whether the node is an expect(...) call.
 */
function isExpectCall(node) {
  return (
    isCallExpression(node) &&
    node.callee.type === astNodeTypes.Identifier &&
    node.callee.name === "expect"
  );
}

/**
 * @param {Node} node - document.activeElement node inside expect(...).toBe(element).
 * @returns {FocusAssertion | null} Positive activeElement assertion details.
 */
function getPositiveExpectAssertion(node) {
  const expectCall = getParent(node);
  const matcherMember = expectCall && getParent(expectCall);
  const matcherCall = matcherMember && getParent(matcherMember);

  if (
    !isExpectCall(expectCall) ||
    !isStaticMemberExpression(matcherMember) ||
    !isCallExpression(matcherCall) ||
    !matcherCall.arguments[0]
  ) {
    return null;
  }

  return {
    element: matcherCall.arguments[0],
    matcherProperty: matcherMember.property,
    reportNode: expectCall,
  };
}

/**
 * @param {Node} node - document.activeElement node inside expect(...).not.toBe(element).
 * @returns {FocusAssertion | null} Negative activeElement assertion details.
 */
function getNegativeExpectAssertion(node) {
  const expectCall = getParent(node);
  const notMember = expectCall && getParent(expectCall);
  const matcherMember = notMember && getParent(notMember);
  const matcherCall = matcherMember && getParent(matcherMember);

  if (
    !isExpectCall(expectCall) ||
    !isStaticMemberExpression(notMember) ||
    notMember.property.name !== "not" ||
    !isStaticMemberExpression(matcherMember) ||
    !isCallExpression(matcherCall) ||
    !matcherCall.arguments[0]
  ) {
    return null;
  }

  return {
    element: matcherCall.arguments[0],
    matcherProperty: matcherMember.property,
    reportNode: expectCall,
  };
}

/**
 * @param {Node} node - document.activeElement node passed as matcher argument.
 * @returns {Pick<FocusAssertion, "matcherProperty" | "reportNode"> | null} Matcher details.
 */
function getComparedActiveElementAssertion(node) {
  const matcherCall = getParent(node);

  if (!isCallExpression(matcherCall) || !isStaticMemberExpression(matcherCall.callee)) {
    return null;
  }

  return {
    matcherProperty: matcherCall.callee.property,
    reportNode: matcherCall,
  };
}

/**
 * @param {RuleFixer} fixer - ESLint fixer.
 * @param {MemberExpression} node - document.activeElement node.
 * @param {FocusAssertion} assertion - Assertion details.
 * @param {".not"|""} modifier - Matcher modifier text.
 * @returns {Fix[]} Fixes for document.activeElement inside expect(...).
 */
function fixExpectedActiveElement(fixer, node, assertion, modifier) {
  if (isIdentifier(assertion.element)) {
    return [
      fixer.replaceText(node, assertion.element.name),
      fixer.remove(assertion.element),
      fixer.replaceText(assertion.matcherProperty, "toHaveFocus"),
    ];
  }

  return [
    fixer.removeRange([node.range[0], assertion.element.range[0]]),
    fixer.insertTextAfterRange(
      [assertion.element.range[1], assertion.element.range[1] + 1],
      `${modifier}.toHaveFocus()`,
    ),
  ];
}

/**
 * @param {RuleFixer} fixer - ESLint fixer.
 * @param {MemberExpression} node - document.activeElement node.
 * @param {Pick<FocusAssertion, "matcherProperty">} assertion - Assertion details.
 * @returns {Fix[]} Fixes for document.activeElement passed to a matcher.
 */
function fixComparedActiveElement(fixer, node, assertion) {
  return [fixer.remove(node), fixer.replaceText(assertion.matcherProperty, "toHaveFocus")];
}

/**
 * @param {RuleContext} context - ESLint rule context.
 * @returns {RuleListener} Rule listener.
 */
export function create(context) {
  return {
    [variantsOfDoc
      .map(
        (variant) =>
          `MemberExpression${variant}[property.name='activeElement'][parent.parent.object.callee.name='expect'][parent.parent.property.name='not'][parent.parent.parent.property.name=/to(Be|(Strict)?Equal)$/]`,
      )
      .join(", ")](node) {
      const assertion = getNegativeExpectAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node: assertion.reportNode,
        messageId,
        fix: (fixer) => fixExpectedActiveElement(fixer, node, assertion, ".not"),
      });
    },
    [variantsOfDoc
      .map(
        (variant) =>
          `MemberExpression${variant}[property.name='activeElement'][parent.callee.object.object.callee.name='expect'][parent.callee.property.name=/to(Be|(Strict)?Equal)$/]`,
      )
      .join(", ")](node) {
      const assertion = getComparedActiveElementAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node: assertion.reportNode,
        messageId,
        fix: (fixer) => fixComparedActiveElement(fixer, node, assertion),
      });
    },
    [variantsOfDoc
      .map(
        (variant) =>
          `MemberExpression${variant}[property.name='activeElement'][parent.callee.name='expect'][parent.parent.property.name=/to(Be|(Strict)?Equal)$/]`,
      )
      .join(", ")](node) {
      const assertion = getPositiveExpectAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node: assertion.reportNode,
        messageId,
        fix: (fixer) => fixExpectedActiveElement(fixer, node, assertion, ""),
      });
    },
    [variantsOfDoc
      .map(
        (variant) =>
          `MemberExpression${variant}[property.name='activeElement'][parent.callee.object.callee.name='expect'][parent.callee.property.name=/to(Be|(Strict)?Equal)$/]`,
      )
      .join(", ")](node) {
      const assertion = getComparedActiveElementAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node: assertion.reportNode,
        messageId,
        fix: (fixer) => fixComparedActiveElement(fixer, node, assertion),
      });
    },
  };
}
