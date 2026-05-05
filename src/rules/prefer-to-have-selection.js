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
 * Checks whether a node reads selectionStart or selectionEnd from an element.
 *
 * @param {object | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the node reads a selection range property.
 */
function isSelectionRangeProperty(node) {
  return isStaticMemberExpression(node) && selectionRangeProperties.has(node.property.name);
}

/**
 * Gets the element object from an element.value member expression.
 *
 * @param {object | undefined} node - AST node to inspect.
 * @returns {object | null} Element expression when present.
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
 * @param {object} firstNode - First AST node.
 * @param {object} secondNode - Second AST node.
 * @param {object | undefined} sourceCode - Current source code object.
 * @returns {boolean} Whether the two nodes have the same source text.
 */
function hasSameSourceText(firstNode, secondNode, sourceCode) {
  return sourceCode?.getText(firstNode) === sourceCode?.getText(secondNode);
}

/**
 * Checks for expect(element.selectionStart).toBe(...) style assertions.
 *
 * @param {object} expectCall - The expect(...) call.
 * @param {object} matcherCall - Matcher CallExpression node.
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
 * @param {object} expectCall - The expect(...) call.
 * @param {object} matcherCall - Matcher CallExpression node.
 * @param {object | undefined} sourceCode - Current source code object.
 * @returns {boolean} Whether the assertion checks selected text manually.
 */
function isSelectedTextAssertion(expectCall, matcherCall, sourceCode) {
  if (expectCall.arguments.length !== 1 || matcherCall.arguments.length !== 1) {
    return false;
  }

  const [expectedSelection] = matcherCall.arguments;

  if (expectedSelection.type !== "Literal" || typeof expectedSelection.value !== "string") {
    return false;
  }

  const selectedTextCall = expectCall.arguments[0];

  if (
    selectedTextCall.type !== "CallExpression" ||
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

export const meta = {
  docs: {
    description: "prefer toHaveSelection over checking selection manually",
    category: "Best Practices",
    recommended: false,
    url: "prefer-to-have-selection",
  },
  messages: {
    [messageId]: "Prefer toHaveSelection() over asserting text selection manually.",
  },
};

export const create = (context) => ({
  CallExpression(node) {
    const matcherCall = getPositiveMatcherCall(node);

    if (!matcherCall) {
      return;
    }

    const { expectCall, matcherName } = matcherCall;

    if (
      (directSelectionMatchers.has(matcherName) && isDirectSelectionAssertion(expectCall, node)) ||
      (selectedTextMatchers.has(matcherName) &&
        isSelectedTextAssertion(expectCall, node, getSourceCode(context)))
    ) {
      context.report({
        node,
        messageId,
      });
    }
  },
});
