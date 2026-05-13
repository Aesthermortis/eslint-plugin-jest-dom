/**
 * @file Prefer toHaveSelection over checking selectionStart/selectionEnd manually.
 * @author Aesthermortis.
 */

import { getSourceCode } from "../context.js";

const directSelectionMatchers = new Set(["toBe", "toEqual"]);
const selectedTextMatchers = new Set(["toBe", "toEqual", "toStrictEqual"]);
const selectionRangeProperties = new Set(["selectionStart", "selectionEnd"]);
const selectionTextMethods = new Set(["slice", "substring"]);
const messageId = "prefer-to-have-selection";

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
/** @typedef {import("@typescript-eslint/utils/ts-eslint").SourceCode} SourceCode */
/** @typedef {MemberExpression & { computed: false; property: Identifier }} StaticMemberExpression */
/**
 * @typedef {CallExpression & {
 *   callee: StaticMemberExpression;
 * }} StaticMemberCallExpression
 */
/**
 * @typedef {{
 *   expectCall: CallExpression;
 *   matcherCall: StaticMemberCallExpression;
 *   matcherName: string;
 * }} PositiveMatcherCall
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
 * Checks whether a node is an identifier.
 *
 * @param {Node | undefined} node - AST node to inspect.
 * @returns {node is Identifier} Whether the node is an identifier.
 */
function isIdentifier(node) {
  return node?.type === astNodeTypes.Identifier;
}

/**
 * Checks whether a node is a non-computed member expression with an identifier property.
 *
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
 * Checks whether a call expression has a static member callee.
 *
 * @param {CallExpression} node - CallExpression node to inspect.
 * @returns {node is StaticMemberCallExpression} Whether the call has a static member callee.
 */
function hasStaticMemberCallee(node) {
  return isStaticMemberExpression(node.callee);
}

/**
 * Gets a positive Jest matcher call.
 *
 * @param {CallExpression} node - CallExpression node to inspect.
 * @returns {PositiveMatcherCall | null} Matcher details when supported.
 */
function getPositiveMatcherCall(node) {
  if (!hasStaticMemberCallee(node)) {
    return null;
  }

  const expectCall = node.callee.object;

  if (
    expectCall.type !== astNodeTypes.CallExpression ||
    !isIdentifier(expectCall.callee) ||
    expectCall.callee.name !== "expect"
  ) {
    return null;
  }

  return {
    expectCall,
    matcherCall: node,
    matcherName: node.callee.property.name,
  };
}

/**
 * Checks whether a node reads selectionStart or selectionEnd from an element.
 *
 * @param {Node | undefined} node - AST node to inspect.
 * @returns {node is StaticMemberExpression} Whether the node reads a selection range property.
 */
function isSelectionRangeProperty(node) {
  return isStaticMemberExpression(node) && selectionRangeProperties.has(node.property.name);
}

/**
 * Gets the element object from an element.value member expression.
 *
 * @param {Node | undefined} node - AST node to inspect.
 * @returns {Expression | null} Element expression when present.
 */
function getValueObject(node) {
  if (!isStaticMemberExpression(node) || node.property.name !== "value") {
    return null;
  }

  return node.object;
}

/**
 * Checks whether two AST nodes use the same source expression.
 *
 * @param {Node} firstNode - First AST node.
 * @param {Node} secondNode - Second AST node.
 * @param {SourceCode} sourceCode - Current source code object.
 * @returns {boolean} Whether the two nodes have the same source text.
 */
function hasSameSourceText(firstNode, secondNode, sourceCode) {
  return sourceCode.getText(firstNode) === sourceCode.getText(secondNode);
}

/**
 * Checks for expect(element.selectionStart).toBe(...) style assertions.
 *
 * @param {CallExpression} expectCall - The expect(...) call.
 * @param {StaticMemberCallExpression} matcherCall - Matcher CallExpression node.
 * @returns {boolean} Whether the assertion checks a selection range property.
 */
function isDirectSelectionAssertion(expectCall, matcherCall) {
  return (
    expectCall.arguments.length === 1 &&
    matcherCall.arguments.length === 1 &&
    isSelectionRangeProperty(expectCall.arguments[0])
  );
}

/**
 * Checks for expect(element.value.slice(element.selectionStart, element.selectionEnd)).toBe("text").
 *
 * @param {CallExpression} expectCall - The expect(...) call.
 * @param {StaticMemberCallExpression} matcherCall - Matcher CallExpression node.
 * @param {SourceCode} sourceCode - Current source code object.
 * @returns {boolean} Whether the assertion checks selected text manually.
 */
function isSelectedTextAssertion(expectCall, matcherCall, sourceCode) {
  if (expectCall.arguments.length !== 1 || matcherCall.arguments.length !== 1) {
    return false;
  }

  const [expectedSelection] = matcherCall.arguments;

  if (
    expectedSelection?.type !== astNodeTypes.Literal ||
    typeof expectedSelection.value !== "string"
  ) {
    return false;
  }

  const selectedTextCall = expectCall.arguments[0];

  if (
    selectedTextCall.type !== astNodeTypes.CallExpression ||
    !isStaticMemberExpression(selectedTextCall.callee)
  ) {
    return false;
  }

  if (!selectionTextMethods.has(selectedTextCall.callee.property.name)) {
    return false;
  }

  const valueObject = getValueObject(selectedTextCall.callee.object);
  const [selectionStart, selectionEnd] = selectedTextCall.arguments;

  if (!valueObject || selectedTextCall.arguments.length !== 2) {
    return false;
  }

  return (
    isSelectionRangeProperty(selectionStart) &&
    selectionStart.property.name === "selectionStart" &&
    isSelectionRangeProperty(selectionEnd) &&
    selectionEnd.property.name === "selectionEnd" &&
    hasSameSourceText(valueObject, selectionStart.object, sourceCode) &&
    hasSameSourceText(valueObject, selectionEnd.object, sourceCode)
  );
}

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    description: "prefer toHaveSelection over checking selection manually",
    recommended: false,
    url: "prefer-to-have-selection",
  },
  messages: {
    [messageId]: "Prefer toHaveSelection() over asserting text selection manually.",
  },
  schema: [],
};

/**
 * @param {RuleContext} context - ESLint rule context.
 * @returns {RuleListener} Rule listener.
 */
export function create(context) {
  return {
    /**
     * @param {CallExpression} node - Matched call expression.
     * @returns {void}
     */
    CallExpression(node) {
      const matcherCall = getPositiveMatcherCall(node);

      if (!matcherCall) {
        return;
      }

      const { expectCall, matcherName } = matcherCall;

      if (
        (directSelectionMatchers.has(matcherName) &&
          isDirectSelectionAssertion(expectCall, matcherCall.matcherCall)) ||
        (selectedTextMatchers.has(matcherName) &&
          isSelectedTextAssertion(expectCall, matcherCall.matcherCall, getSourceCode(context)))
      ) {
        context.report({
          node,
          messageId,
        });
      }
    },
  };
}
