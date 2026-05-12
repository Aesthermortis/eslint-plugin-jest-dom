import { getScope } from "./context.js";
import { queries } from "./queries.js";

/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpressionArgument} CallExpressionArgument */
/** @typedef {import("@typescript-eslint/types").TSESTree.Expression} Expression */
/** @typedef {import("@typescript-eslint/types").TSESTree.Node} AstNode */
/**
 * @typedef {import("@typescript-eslint/utils/ts-eslint").RuleContext<
 *   string,
 *   readonly unknown[]
 * >} RuleContext
 */
/** @typedef {{ isDTLQuery: boolean; query: string | null; queryArg: unknown }} QueryNodeResult */

const astNodeTypes = /** @type {const} */ ({
  AwaitExpression:
    /** @type {import("@typescript-eslint/types").AST_NODE_TYPES.AwaitExpression} */ (
      "AwaitExpression"
    ),
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
  TSAsExpression: /** @type {import("@typescript-eslint/types").AST_NODE_TYPES.TSAsExpression} */ (
    "TSAsExpression"
  ),
  VariableDeclarator:
    /** @type {import("@typescript-eslint/types").AST_NODE_TYPES.VariableDeclarator} */ (
      "VariableDeclarator"
    ),
});

/**
 * @param {Expression} callee - Call expression callee.
 * @returns {string | null} Static query name, when present.
 */
function getQueryName(callee) {
  if (callee.type === astNodeTypes.Identifier) {
    return callee.name;
  }

  if (
    callee.type === astNodeTypes.MemberExpression &&
    callee.property.type === astNodeTypes.Identifier
  ) {
    return callee.property.name;
  }

  return null;
}

/**
 * @param {CallExpressionArgument | undefined} node - Call argument node.
 * @returns {unknown} Static literal value, when present.
 */
function getNodeValue(node) {
  return node && "value" in node ? node.value : undefined;
}

/**
 * Gets the inner relevant node (CallExpression, Identity, et al.) given a generic expression node await someAsyncFunc()
 * => someAsyncFunc()
 * someElement as HTMLDivElement => someElement.
 *
 * @param {RuleContext} context - Context for a rule.
 * @param {AstNode} node - Node for a rule.
 * @param {AstNode} expression - An expression node.
 * @returns {AstNode | undefined} A node.
 */
export function getInnerNodeFrom(context, node, expression) {
  switch (expression.type) {
    case astNodeTypes.Identifier: {
      return getAssignmentForIdentifier(context, node, expression.name);
    }
    case astNodeTypes.TSAsExpression: {
      return getInnerNodeFrom(context, node, expression.expression);
    }
    case astNodeTypes.AwaitExpression: {
      return getInnerNodeFrom(context, node, expression.argument);
    }
    case astNodeTypes.MemberExpression: {
      return getInnerNodeFrom(context, node, expression.object);
    }
    default: {
      return expression;
    }
  }
}

/**
 * Get the node corresponding to the latest assignment to a variable named `identifierName`
 *
 * @param {RuleContext} context - Context for a rule.
 * @param {AstNode} node - Node for a rule.
 * @param {string} identifierName - Name of an identifier.
 * @returns {AstNode | undefined} A node, possibly undefined.
 */
export function getAssignmentForIdentifier(context, node, identifierName) {
  const variable = getScope(context, node).set.get(identifierName);

  if (!variable) {
    return;
  }

  const definition = variable.defs[0];
  const init =
    definition?.node.type === astNodeTypes.VariableDeclarator ? definition.node.init : null;

  if (init) {
    // let foo = bar;
    return getInnerNodeFrom(context, node, init);
  }

  // let foo;
  // foo = bar;
  const assignmentRef = variable.references.toReversed().find((ref) => !!ref.writeExpr);
  const writeExpr = assignmentRef?.writeExpr;

  return writeExpr ? getInnerNodeFrom(context, node, writeExpr) : undefined;
}

/**
 * Get query node, arg and isDTLQuery flag for a given node. useful for rules that you only want to apply to dom
 * elements.
 *
 * @param {RuleContext} context - Context for a rule.
 * @param {AstNode} nodeWithValueProp - AST node to get the query from.
 * @returns {QueryNodeResult} Object with query, queryArg, and isDTLQuery.
 */
export function getQueryNodeFrom(context, nodeWithValueProp) {
  const queryNode = getInnerNodeFrom(context, nodeWithValueProp, nodeWithValueProp);

  if (!queryNode || queryNode.type !== astNodeTypes.CallExpression) {
    return {
      isDTLQuery: false,
      query: null,
      queryArg: null,
    };
  }

  const query = getQueryName(queryNode.callee);
  const queryArg = getNodeValue(queryNode.arguments[0]);
  const isDTLQuery = query === null ? false : queries.includes(query);

  return { queryArg, query, isDTLQuery };
}
