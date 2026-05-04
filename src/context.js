/**
 * Gets the source code object from the current ESLint context API or its legacy method.
 *
 * @param {object} context - Context for a rule.
 * @returns {object | undefined} Source code for the current file, when available.
 */
export function getSourceCode(context) {
  if (context.sourceCode) {
    return context.sourceCode;
  }

  return context.getSourceCode?.();
}

/**
 * Gets the scope for a node from the current ESLint source code API or the legacy context method.
 *
 * @param {object} context - Context for a rule.
 * @param {object} node - Node to get the scope for.
 * @returns {object | undefined} Scope for the node, when available.
 */
export function getScope(context, node) {
  const sourceCode = getSourceCode(context);

  if (sourceCode && sourceCode.getScope) {
    return sourceCode.getScope(node);
  }

  return context.getScope?.(node);
}
