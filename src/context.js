/**
 * Gets the source code object from the ESLint context.
 *
 * @param {object} context - Context for a rule.
 * @returns {object} Source code for the current file.
 */
export function getSourceCode(context) {
  return context.sourceCode;
}

/**
 * Gets the scope for a node from the ESLint source code API.
 *
 * @param {object} context - Context for a rule.
 * @param {object} node - Node to get the scope for.
 * @returns {object} Scope for the node.
 */
export function getScope(context, node) {
  return context.sourceCode.getScope(node);
}
