/**
 * @file Prefer ToHaveAttribute over checking getAttribute/hasAttribute.
 * @author Ben Monro.
 */
import { getSourceCode } from "../context.js";

const lineSeparator = "\u2028";
const paragraphSeparator = "\u2029";
const messageId = "prefer-to-have-text-content";

/** @import {JestDomRuleModule} from "../types.d.ts" */
/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpression} CallExpression */
/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpressionArgument} CallExpressionArgument */
/** @typedef {import("@typescript-eslint/types").TSESTree.Identifier} Identifier */
/** @typedef {import("@typescript-eslint/types").TSESTree.Literal} Literal */
/** @typedef {import("@typescript-eslint/types").TSESTree.MemberExpression} MemberExpression */
/** @typedef {import("@typescript-eslint/types").TSESTree.Node} Node */
/** @typedef {import("@typescript-eslint/types").TSESTree.TemplateLiteral} TemplateLiteral */
/**
 * @typedef {import("@typescript-eslint/utils/ts-eslint").RuleContext<
 *   string,
 *   readonly unknown[]
 * >} RuleContext
 */
/** @typedef {import("@typescript-eslint/utils/ts-eslint").RuleListener} RuleListener */
/** @typedef {Node & { parent?: NodeWithParent }} NodeWithParent */
/** @typedef {MemberExpression & { computed: false; property: Identifier }} StaticMemberExpression */
/**
 * @typedef {{
 *   expectedArg: CallExpressionArgument | undefined;
 *   expectCall: CallExpression;
 *   matcher: Identifier;
 *   textContentAccess: StaticMemberExpression;
 * }} TextContentAssertion
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
  TemplateLiteral:
    /** @type {import("@typescript-eslint/types").AST_NODE_TYPES.TemplateLiteral} */ (
      "TemplateLiteral"
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
 * @returns {node is Literal} Whether the node is a literal.
 */
function isLiteral(node) {
  return node?.type === astNodeTypes.Literal;
}

/**
 * @param {Node | undefined} node - AST node to inspect.
 * @returns {node is TemplateLiteral} Whether the node is a template literal.
 */
function isTemplateLiteral(node) {
  return node?.type === astNodeTypes.TemplateLiteral;
}

/**
 * @param {unknown} value - Raw value to escape.
 * @returns {string} Escaped value for a regex literal.
 */
const escapeForRegexLiteral = (value) =>
  String(value)
    .replaceAll(/[.*+\-?^${}()|[\]\\/]/g, String.raw`\$&`)
    .replaceAll("\n", String.raw`\n`)
    .replaceAll("\r", String.raw`\r`)
    .replaceAll(lineSeparator, String.raw`\u2028`)
    .replaceAll(paragraphSeparator, String.raw`\u2029`);

/**
 * @param {Literal} expectedArg - Expected matcher argument.
 * @param {string} expectedArgSource - Original expected argument source.
 * @returns {string} Replacement regex pattern.
 */
const getReplacementPattern = (expectedArg, expectedArgSource) =>
  "regex" in expectedArg && expectedArg.regex
    ? expectedArgSource
    : `/${escapeForRegexLiteral(expectedArg.value)}/`;

/**
 * @param {CallExpressionArgument | undefined} expectedArg - Expected matcher argument.
 * @returns {string | null} Exact replacement regex pattern, when safe.
 */
const getExactReplacementPattern = (expectedArg) => {
  if (!expectedArg) {
    return null;
  }

  if (isLiteral(expectedArg) && typeof expectedArg.value === "string") {
    return `/^${escapeForRegexLiteral(expectedArg.value)}$/`;
  }

  if (isTemplateLiteral(expectedArg) && expectedArg.expressions.length === 0) {
    const cookedValue = expectedArg.quasis[0]?.value.cooked;

    if (typeof cookedValue !== "string") {
      return null;
    }

    return `/^${escapeForRegexLiteral(cookedValue)}$/`;
  }

  return null;
};

/**
 * @param {StaticMemberExpression} node - Matched textContent member expression.
 * @returns {TextContentAssertion | null} Parsed positive textContent assertion.
 */
function getTextContentAssertion(node) {
  const expectCall = getParent(node);
  const matcherMember = expectCall && getParent(expectCall);
  const matcherCall = matcherMember && getParent(matcherMember);

  if (
    !isCallExpression(expectCall) ||
    !isStaticMemberExpression(matcherMember) ||
    !isCallExpression(matcherCall)
  ) {
    return null;
  }

  return {
    expectedArg: matcherCall.arguments[0],
    expectCall,
    matcher: matcherMember.property,
    textContentAccess: node,
  };
}

/**
 * @param {StaticMemberExpression} node - Matched textContent member expression.
 * @returns {TextContentAssertion | null} Parsed negated textContent assertion.
 */
function getNegatedTextContentAssertion(node) {
  const expectCall = getParent(node);
  const notMember = expectCall && getParent(expectCall);
  const matcherMember = notMember && getParent(notMember);
  const matcherCall = matcherMember && getParent(matcherMember);

  if (
    !isCallExpression(expectCall) ||
    !isStaticMemberExpression(notMember) ||
    !isStaticMemberExpression(matcherMember) ||
    !isCallExpression(matcherCall)
  ) {
    return null;
  }

  return {
    expectedArg: matcherCall.arguments[0],
    expectCall,
    matcher: matcherMember.property,
    textContentAccess: node,
  };
}

/**
 * @param {RuleContext} context - ESLint rule context.
 * @param {TextContentAssertion} assertion - Parsed textContent assertion.
 * @returns {string | null} Replacement pattern, when safe.
 */
function getContainOrMatchReplacement(context, assertion) {
  if (!assertion.expectedArg) {
    return null;
  }

  const expectedArgSource = getSourceCode(context).getText(assertion.expectedArg);

  return isLiteral(assertion.expectedArg)
    ? getReplacementPattern(assertion.expectedArg, expectedArgSource)
    : `new RegExp(${expectedArgSource})`;
}

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    url: "prefer-to-have-text-content",
    description: "Prefer toHaveTextContent over checking element.textContent",
    recommended: true,
  },
  messages: {
    [messageId]: "Use toHaveTextContent instead of asserting on DOM node attributes",
  },
  fixable: "code",
  schema: [],
};

/**
 * @param {RuleContext} context - ESLint rule context.
 * @returns {RuleListener} Rule listener.
 */
export function create(context) {
  return /** @type {RuleListener} */ ({
    [`MemberExpression[property.name='textContent'][parent.callee.name='expect'][parent.parent.property.name=/toContain$|toMatch$/]`](
      /**
       * @param {StaticMemberExpression} node - Matched textContent member expression.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getTextContentAssertion(node);

      if (!assertion?.expectedArg) {
        return;
      }

      context.report({
        node: assertion.expectCall,
        messageId,
        fix: (fixer) => {
          const replacement = getContainOrMatchReplacement(context, assertion);

          if (replacement === null) {
            return null;
          }

          return [
            fixer.removeRange([
              assertion.textContentAccess.object.range[1],
              assertion.textContentAccess.property.range[1],
            ]),
            fixer.replaceTextRange(assertion.matcher.range, "toHaveTextContent"),
            fixer.replaceTextRange(assertion.expectedArg.range, replacement),
          ];
        },
      });
    },
    [`MemberExpression[property.name='textContent'][parent.callee.name='expect'][parent.parent.property.name=/^(toBe|toEqual|toStrictEqual)$/]`](
      /**
       * @param {StaticMemberExpression} node - Matched textContent member expression.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getTextContentAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node: assertion.expectCall,
        messageId,
        fix: (fixer) => {
          const replacementPattern = getExactReplacementPattern(assertion.expectedArg);

          if (replacementPattern === null || !assertion.expectedArg) {
            return null;
          }

          return [
            fixer.removeRange([
              assertion.textContentAccess.object.range[1],
              assertion.textContentAccess.property.range[1],
            ]),
            fixer.replaceTextRange(assertion.matcher.range, "toHaveTextContent"),
            fixer.replaceTextRange(assertion.expectedArg.range, replacementPattern),
          ];
        },
      });
    },
    [`MemberExpression[property.name='textContent'][parent.callee.name='expect'][parent.parent.property.name='not'][parent.parent.parent.property.name=/^(toBe|toEqual|toStrictEqual)$/]`](
      /**
       * @param {StaticMemberExpression} node - Matched textContent member expression.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getNegatedTextContentAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node: assertion.expectCall,
        messageId,
        fix: (fixer) => {
          const replacementPattern = getExactReplacementPattern(assertion.expectedArg);

          if (replacementPattern === null || !assertion.expectedArg) {
            return null;
          }

          return [
            fixer.removeRange([
              assertion.textContentAccess.object.range[1],
              assertion.textContentAccess.property.range[1],
            ]),
            fixer.replaceTextRange(assertion.matcher.range, "toHaveTextContent"),
            fixer.replaceTextRange(assertion.expectedArg.range, replacementPattern),
          ];
        },
      });
    },
    [`MemberExpression[property.name='textContent'][parent.callee.name='expect'][parent.parent.property.name='not'][parent.parent.parent.property.name=/toContain$|toMatch$/]`](
      /**
       * @param {StaticMemberExpression} node - Matched textContent member expression.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getNegatedTextContentAssertion(node);

      if (!assertion?.expectedArg) {
        return;
      }

      context.report({
        node: assertion.expectCall,
        messageId,
        fix: (fixer) => {
          const replacement = getContainOrMatchReplacement(context, assertion);

          if (replacement === null) {
            return null;
          }

          return [
            fixer.removeRange([
              assertion.textContentAccess.object.range[1],
              assertion.textContentAccess.property.range[1],
            ]),
            fixer.replaceTextRange(assertion.matcher.range, "toHaveTextContent"),
            fixer.replaceTextRange(assertion.expectedArg.range, replacement),
          ];
        },
      });
    },
  });
}
