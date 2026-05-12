/**
 * Gets the source code object from the ESLint context.
 *
 * @param {import("@typescript-eslint/utils/ts-eslint").RuleContext<
 *   string,
 *   readonly unknown[]
 * >} context - Context for a rule.
 * @returns {Readonly<import("@typescript-eslint/utils/ts-eslint").SourceCode>} Source code for the current file.
 */
export function getSourceCode(context) {
  return context.sourceCode;
}

/**
 * Gets the scope for a node from the ESLint source code API.
 *
 * @param {import("@typescript-eslint/utils/ts-eslint").RuleContext<
 *   string,
 *   readonly unknown[]
 * >} context - Context for a rule.
 * @param {import("@typescript-eslint/types").TSESTree.Node} node - Node to get the scope for.
 * @returns {import("@typescript-eslint/utils/ts-eslint").Scope.Scope} Scope for the node.
 */
export function getScope(context, node) {
  return context.sourceCode.getScope(node);
}
