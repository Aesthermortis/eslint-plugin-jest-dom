/**
 * @file Prefer ToBeEmpty over checking innerHTML.
 * @author Ben Monro.
 */
import { getSourceCode } from "../context.js";

/** @import {JestDomRuleModule} from "../types.d.ts" */
/** @typedef {import("@typescript-eslint/types").TSESTree.BinaryExpression} BinaryExpression */
/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpression} CallExpression */
/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpressionArgument} CallExpressionArgument */
/** @typedef {import("@typescript-eslint/types").TSESTree.Expression} Expression */
/** @typedef {import("@typescript-eslint/types").TSESTree.Identifier} Identifier */
/** @typedef {import("@typescript-eslint/types").TSESTree.Literal} Literal */
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
 *   expectCall: CallExpression;
 *   matcherCall: CallExpression;
 *   matcherProperty: Identifier;
 *   argument: CallExpressionArgument | undefined;
 * }} AssertionCall
 */
/**
 * @typedef {{
 *   matcherCall: CallExpression;
 *   matcherProperty: Identifier;
 *   argument: CallExpressionArgument | undefined;
 *   targetObject: Node;
 *   targetProperty: Identifier;
 * }} MemberAssertion
 */
/**
 * @typedef {{
 *   matcherCall: CallExpression;
 *   matcherProperty: Identifier;
 *   argument: CallExpressionArgument | undefined;
 *   targetObject: Node;
 * }} BinaryAssertion
 */

const messageId = "preferEmptyDOMElement";

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
  Literal: /** @type {import("@typescript-eslint/types").AST_NODE_TYPES.Literal} */ ("Literal"),
  MemberExpression:
    /** @type {import("@typescript-eslint/types").AST_NODE_TYPES.MemberExpression} */ (
      "MemberExpression"
    ),
});

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    description: "Prefer toBeEmpty over checking innerHTML",
    recommended: true,
    url: "prefer-empty",
  },
  fixable: "code",
  schema: [],
  messages: {
    [messageId]: "Use toBeEmptyDOMElement instead of checking inner html.",
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
 * @returns {node is Literal} Whether the node is a literal.
 */
function isLiteral(node) {
  return node?.type === astNodeTypes.Literal;
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
 * @param {CallExpressionArgument | undefined} node - AST node to inspect.
 * @returns {unknown} Literal value, when present.
 */
function getLiteralValue(node) {
  return isLiteral(node) ? node.value : undefined;
}

/**
 * @param {Node} node - Member expression inside expect(...).
 * @returns {AssertionCall | null} Positive assertion call details.
 */
function getPositiveAssertionCall(node) {
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
    expectCall,
    matcherCall,
    matcherProperty: matcherMember.property,
    argument: matcherCall.arguments[0],
  };
}

/**
 * @param {Node} node - Member expression inside expect(...).not.
 * @returns {AssertionCall | null} Negative assertion call details.
 */
function getNegativeAssertionCall(node) {
  const expectCall = getParent(node);
  const notMember = expectCall && getParent(expectCall);
  const matcherMember = notMember && getParent(notMember);
  const matcherCall = matcherMember && getParent(matcherMember);

  if (
    !isExpectCall(expectCall) ||
    !isStaticMemberExpression(notMember) ||
    notMember.property.name !== "not" ||
    !isStaticMemberExpression(matcherMember) ||
    !isCallExpression(matcherCall)
  ) {
    return null;
  }

  return {
    expectCall,
    matcherCall,
    matcherProperty: matcherMember.property,
    argument: matcherCall.arguments[0],
  };
}

/**
 * @param {MemberExpression} node - Matched member expression.
 * @returns {MemberAssertion | null} Positive member assertion details.
 */
function getPositiveMemberAssertion(node) {
  if (!isStaticMemberExpression(node)) {
    return null;
  }

  const assertion = getPositiveAssertionCall(node);

  return assertion
    ? {
        ...assertion,
        targetObject: node.object,
        targetProperty: node.property,
      }
    : null;
}

/**
 * @param {MemberExpression} node - Matched member expression.
 * @returns {MemberAssertion | null} Negative member assertion details.
 */
function getNegativeMemberAssertion(node) {
  if (!isStaticMemberExpression(node)) {
    return null;
  }

  const assertion = getNegativeAssertionCall(node);

  return assertion
    ? {
        ...assertion,
        targetObject: node.object,
        targetProperty: node.property,
      }
    : null;
}

/**
 * @param {BinaryExpression} node - Matched binary expression.
 * @returns {BinaryAssertion | null} Binary assertion details.
 */
function getBinaryAssertion(node) {
  if (!isStaticMemberExpression(node.left)) {
    return null;
  }

  const assertion = getPositiveAssertionCall(node);

  return assertion
    ? {
        ...assertion,
        targetObject: node.left.object,
      }
    : null;
}

/**
 * @param {CallExpressionArgument | undefined} node - Assertion argument node to inspect.
 * @param {import("@typescript-eslint/utils/ts-eslint").SourceCode} sourceCode - Source code helper.
 * @returns {boolean} Whether the argument is non-empty.
 */
function isNonEmptyStringOrTemplateLiteral(node, sourceCode) {
  return !node || !['""', "''", "``", "null"].includes(sourceCode.getText(node));
}

/**
 * @param {BinaryExpression} node - Matched binary expression.
 * @param {BinaryAssertion} assertion - Binary assertion details.
 * @returns {string} Replacement matcher name.
 */
function getBinaryReplacementMatcher(node, assertion) {
  return Boolean(getLiteralValue(assertion.argument)) === node.operator.startsWith("=")
    ? "toBeEmptyDOMElement"
    : "not.toBeEmptyDOMElement";
}

/**
 * @param {RuleFixer} fixer - ESLint fixer.
 * @param {BinaryExpression} node - Matched binary expression.
 * @param {BinaryAssertion} assertion - Binary assertion details.
 * @returns {Fix[]} Fixes for a binary assertion.
 */
function fixBinaryAssertion(fixer, node, assertion) {
  const fixes = [
    fixer.removeRange([assertion.targetObject.range[1], node.range[1]]),
    fixer.replaceText(assertion.matcherProperty, getBinaryReplacementMatcher(node, assertion)),
  ];

  if (assertion.argument) {
    fixes.push(fixer.remove(assertion.argument));
  }

  return fixes;
}

/**
 * @param {RuleFixer} fixer - ESLint fixer.
 * @param {MemberAssertion} assertion - Member assertion details.
 * @returns {Fix[]} Fixes for a member assertion.
 */
function fixMemberAssertion(fixer, assertion) {
  const fixes = [
    fixer.removeRange([assertion.targetObject.range[1], assertion.targetProperty.range[1]]),
    fixer.replaceText(assertion.matcherProperty, "toBeEmptyDOMElement"),
  ];

  if (assertion.argument) {
    fixes.push(fixer.remove(assertion.argument));
  }

  return fixes;
}
/**
 * @param {RuleContext} context - ESLint rule context.
 * @returns {RuleListener} Rule listener.
 */
export function create(context) {
  const sourceCode = getSourceCode(context);

  return {
    [`BinaryExpression[left.property.name='innerHTML'][right.value=''][parent.callee.name='expect'][parent.parent.property.name=/toBe$|to(Strict)?Equal/]`](
      node,
    ) {
      const assertion = getBinaryAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node,
        messageId,
        fix: (fixer) => fixBinaryAssertion(fixer, node, assertion),
      });
    },
    [`BinaryExpression[left.property.name='firstChild'][right.value=null][parent.callee.name='expect'][parent.parent.property.name=/toBe$|to(Strict)?Equal/]`](
      node,
    ) {
      const assertion = getBinaryAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node,
        messageId,
        fix: (fixer) => fixBinaryAssertion(fixer, node, assertion),
      });
    },
    [`MemberExpression[property.name = 'innerHTML'][parent.callee.name = 'expect'][parent.parent.property.name = /toBe$|to(Strict)?Equal/]`](
      node,
    ) {
      const assertion = getPositiveMemberAssertion(node);

      if (!assertion || isNonEmptyStringOrTemplateLiteral(assertion.argument, sourceCode)) {
        return;
      }

      context.report({
        node,
        messageId,
        fix: (fixer) => fixMemberAssertion(fixer, assertion),
      });
    },

    [`MemberExpression[property.name='innerHTML'][parent.parent.property.name='not'][parent.parent.parent.property.name=/toBe$|to(Strict)?Equal$/][parent.parent.object.callee.name='expect']`](
      node,
    ) {
      const assertion = getNegativeMemberAssertion(node);

      if (!assertion || isNonEmptyStringOrTemplateLiteral(assertion.argument, sourceCode)) {
        return;
      }

      context.report({
        node,
        messageId,
        fix: (fixer) => fixMemberAssertion(fixer, assertion),
      });
    },
    [`MemberExpression[property.name = 'firstChild'][parent.callee.name = 'expect'][parent.parent.property.name = /toBeNull$/]`](
      node,
    ) {
      const assertion = getPositiveMemberAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node,
        messageId,
        fix: (fixer) => fixMemberAssertion(fixer, assertion),
      });
    },
    [`MemberExpression[property.name='firstChild'][parent.parent.property.name='not'][parent.parent.parent.property.name=/toBe$|to(Strict)?Equal$/][parent.parent.object.callee.name='expect']`](
      node,
    ) {
      const assertion = getNegativeMemberAssertion(node);

      if (!assertion || getLiteralValue(assertion.argument) !== null) {
        return;
      }

      context.report({
        node,
        messageId,
        fix: (fixer) => fixMemberAssertion(fixer, assertion),
      });
    },
    [`MemberExpression[property.name='firstChild'][parent.parent.property.name='not'][parent.parent.parent.property.name=/toBeNull$/][parent.parent.object.callee.name='expect']`](
      node,
    ) {
      const assertion = getNegativeMemberAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node,
        messageId,
        fix: (fixer) => fixMemberAssertion(fixer, assertion),
      });
    },
    [`MemberExpression[property.name = 'firstChild'][parent.callee.name = 'expect'][parent.parent.property.name = /toBe$|to(Strict)?Equal/]`](
      node,
    ) {
      const assertion = getPositiveMemberAssertion(node);

      if (!assertion || getLiteralValue(assertion.argument) !== null) {
        return;
      }

      context.report({
        node,
        messageId,
        fix: (fixer) => fixMemberAssertion(fixer, assertion),
      });
    },
  };
}
