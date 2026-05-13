/**
 * @file Prefer ToBeInTheDocument over checking getAttribute/hasAttribute.
 * @author Anton Niklasson.
 */

/*eslint complexity: ["error", {"max": 20}]*/

import { getAssignmentForIdentifier } from "../assignment-ast.js";
import { getSourceCode } from "../context.js";
import { queries } from "../queries.js";

/** @import {JestDomRuleModule} from "../types.d.ts" */
/** @typedef {import("@typescript-eslint/types").TSESTree.AwaitExpression} AwaitExpression */
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
/** @typedef {Node & { parent?: NodeWithParent }} NodeWithParent */
/** @typedef {MemberExpression & { computed: false; property: Identifier }} StaticMemberExpression */
/** @typedef {Identifier | StaticMemberExpression} QueryNode */
/**
 * @typedef {{
 *   queryNode: QueryNode | null;
 *   matcherNode: Identifier;
 *   matcherArguments: CallExpressionArgument[];
 *   negatedMatcher: boolean;
 *   expectCall?: CallExpression;
 * }} ReportContext
 */

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
  Literal: /** @type {import("@typescript-eslint/types").AST_NODE_TYPES.Literal} */ ("Literal"),
  MemberExpression:
    /** @type {import("@typescript-eslint/types").AST_NODE_TYPES.MemberExpression} */ (
      "MemberExpression"
    ),
});

const astTokenTypes = /** @type {const} */ ({
  Punctuator: /** @type {import("@typescript-eslint/types").AST_TOKEN_TYPES.Punctuator} */ (
    "Punctuator"
  ),
});

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "problem",
  docs: {
    description: "Prefer .toBeInTheDocument() for asserting the existence of a DOM node",
    url: "prefer-in-document",
    recommended: true,
  },
  fixable: "code",
  schema: [],
  messages: {
    "use-document": `Prefer .toBeInTheDocument() for asserting DOM node existence`,
    "invalid-combination-length-1": `Invalid combination of {{ query }} and .toHaveLength(1). Did you mean to use {{ allQuery }}?`,
    "replace-query-with-all": `Replace {{ query }} with {{ allQuery }}`,
  },
  hasSuggestions: true,
};

/**
 * Checks whether a matcher asserts absence instead of presence.
 *
 * @param {Identifier} matcherNode - Matcher property node.
 * @param {CallExpressionArgument[]} matcherArguments - Arguments passed to the matcher.
 * @returns {boolean} Whether the matcher asserts absence.
 */
function isAntonymMatcher(matcherNode, matcherArguments) {
  return (
    matcherNode.name === "toBeNull" ||
    matcherNode.name === "toBeFalsy" ||
    usesToBeOrToEqualWithNull(matcherNode, matcherArguments) ||
    usesToHaveLengthZero(matcherNode, matcherArguments)
  );
}

/**
 * Checks whether a matcher compares the received value with null.
 *
 * @param {Identifier} matcherNode - Matcher property node.
 * @param {CallExpressionArgument[]} matcherArguments - Arguments passed to the matcher.
 * @returns {boolean} Whether the matcher compares against null.
 */
function usesToBeOrToEqualWithNull(matcherNode, matcherArguments) {
  return (
    (matcherNode.name === "toBe" || matcherNode.name === "toEqual") &&
    getLiteralValue(matcherArguments[0]) === null
  );
}

/**
 * Checks whether a matcher asserts a zero length.
 *
 * @param {Identifier} matcherNode - Matcher property node.
 * @param {CallExpressionArgument[]} matcherArguments - Arguments passed to the matcher.
 * @returns {boolean} Whether the matcher asserts zero length.
 */
function usesToHaveLengthZero(matcherNode, matcherArguments) {
  // matcherArguments.length === 0: toHaveLength() will cause jest matcher error
  // matcherArguments[0].value:     toHaveLength(0, ...) means zero length
  return (
    matcherNode.name === "toHaveLength" &&
    (matcherArguments.length === 0 || getLiteralValue(matcherArguments[0]) === 0)
  );
}

/**
 * @param {Node} node - AST node whose parent should be read.
 * @returns {NodeWithParent | undefined} Parent node, when present.
 */
function getParent(node) {
  return /** @type {NodeWithParent} */ (node).parent;
}

/**
 * @param {Node | null | undefined} node - AST node to inspect.
 * @returns {node is AwaitExpression} Whether the node is an await expression.
 */
function isAwaitExpression(node) {
  return node?.type === astNodeTypes.AwaitExpression;
}

/**
 * @param {Node | null | undefined} node - AST node to inspect.
 * @returns {node is CallExpression} Whether the node is a call expression.
 */
function isCallExpression(node) {
  return node?.type === astNodeTypes.CallExpression;
}

/**
 * @param {Node | null | undefined} node - AST node to inspect.
 * @returns {node is Identifier} Whether the node is an identifier.
 */
function isIdentifier(node) {
  return node?.type === astNodeTypes.Identifier;
}

/**
 * @param {Node | null | undefined} node - AST node to inspect.
 * @returns {node is Literal} Whether the node is a literal.
 */
function isLiteral(node) {
  return node?.type === astNodeTypes.Literal;
}

/**
 * @param {Node | null | undefined} node - AST node to inspect.
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
 * @param {CallExpressionArgument | Node | undefined} node - AST node to inspect.
 * @returns {unknown} Literal value, when present.
 */
function getLiteralValue(node) {
  return isLiteral(node) ? node.value : undefined;
}

/**
 * @param {QueryNode} queryNode - Query node to read.
 * @returns {string} Query name.
 */
function getQueryName(queryNode) {
  return isIdentifier(queryNode) ? queryNode.name : queryNode.property.name;
}

/**
 * @param {QueryNode} queryNode - Query node to replace.
 * @returns {Identifier} Node to use as a query name replacement target.
 */
function getQueryReplacementNode(queryNode) {
  return isIdentifier(queryNode) ? queryNode : queryNode.property;
}

/**
 * @param {CallExpression} callExpressionNode - Call expression to inspect.
 * @returns {QueryNode | null} Query callee when it is statically named.
 */
function getQueryCalleeNode(callExpressionNode) {
  return isIdentifier(callExpressionNode.callee) ||
    isStaticMemberExpression(callExpressionNode.callee)
    ? callExpressionNode.callee
    : null;
}

/**
 * @param {CallExpressionArgument} argument - Argument passed to expect(...).
 * @returns {QueryNode | null} Query node inside the argument.
 */
function getQueryNodeFromExpectArgument(argument) {
  if (isAwaitExpression(argument) && isCallExpression(argument.argument)) {
    return getQueryCalleeNode(argument.argument);
  }

  return isCallExpression(argument) ? getQueryCalleeNode(argument) : null;
}

/**
 * Extract the DTL query identifier from a call expression.
 *
 * <query>() -> <query>
 * screen.<query>() -> <query>
 *
 * @param {Node | null | undefined} callExpressionNode - Candidate call expression node.
 * @returns {Identifier | null} The identifier or member property node when present.
 */
function getDTLQueryIdentifierNode(callExpressionNode) {
  if (!isCallExpression(callExpressionNode)) {
    return null;
  }

  if (isIdentifier(callExpressionNode.callee)) {
    return callExpressionNode.callee;
  }

  return isStaticMemberExpression(callExpressionNode.callee)
    ? callExpressionNode.callee.property
    : null;
}

/**
 * @param {RuleContext} context - ESLint rule context.
 * @returns {RuleListener} Rule listener.
 */
export function create(context) {
  const alternativeMatchers =
    /^(toHaveLength|toBeDefined|toBeNull|toBe|toEqual|toBeTruthy|toBeFalsy)$/;

  /**
   * Resolves a numeric length value from a literal or assigned identifier.
   *
   * @param {CallExpressionArgument[]} matcherArguments - Arguments passed to the matcher.
   * @returns {unknown} Length value when it can be resolved.
   */
  function getLengthValue(matcherArguments) {
    let lengthValue;
    const [matcherArgument] = matcherArguments;

    if (isIdentifier(matcherArgument)) {
      const assignment = getAssignmentForIdentifier(context, matcherArgument, matcherArgument.name);
      if (isLiteral(assignment)) {
        lengthValue = assignment.value;
      }
    } else if (isLiteral(matcherArgument)) {
      lengthValue = matcherArgument.value;
    }

    return lengthValue;
  }

  /**
   * Reports invalid existence assertions for Testing Library queries.
   *
   * @param {ReportContext} reportContext - Nodes and matcher state for the candidate assertion.
   * @returns {void}
   */
  function check({ queryNode, matcherNode, matcherArguments, negatedMatcher, expectCall }) {
    const matcherMember = getParent(matcherNode);
    const matcherCall = matcherMember && getParent(matcherMember);

    if (!isCallExpression(matcherCall)) {
      return;
    }

    // only report on dom nodes which we can resolve to RTL queries.
    if (!queryNode) {
      return;
    }

    // *By* query with .toHaveLength(0/1) matcher are considered violations
    //
    // | Selector type | .toHaveLength(1)            | .toHaveLength(0)                      |
    // | ============= | =========================== | ===================================== |
    // | *By* query    | Did you mean to use *AllBy* | Replace with .not.toBeInTheDocument() |
    // | *AllBy* query | Correct                     | Correct
    //
    // @see https://github.com/testing-library/eslint-plugin-jest-dom/issues/171
    //
    if (matcherNode.name === "toHaveLength" && matcherArguments.length === 1) {
      const lengthValue = getLengthValue(matcherArguments);
      const queryName = getQueryName(queryNode);

      const isSingleQuery = queries.includes(queryName) && !/AllBy/.test(queryName);
      const hasViolation = isSingleQuery && [1, 0].includes(lengthValue);

      if (!hasViolation) {
        return;
      }
      // If length === 1, report violation with suggestions
      // Otherwise fallback to default report
      if (lengthValue === 1) {
        const allQuery = queryName.replace("By", "AllBy");
        return context.report({
          node: matcherNode,
          messageId: "invalid-combination-length-1",
          data: {
            query: queryName,
            allQuery,
          },
          loc: matcherNode.loc,
          suggest: [
            {
              messageId: "replace-query-with-all",
              data: { query: queryName, allQuery },
              fix(fixer) {
                return fixer.replaceText(getQueryReplacementNode(queryNode), allQuery);
              },
            },
            {
              desc: "Replace .toHaveLength(1) with .toBeInTheDocument()",
              fix(fixer) {
                // Remove any arguments in the matcher
                return [
                  ...matcherArguments.map((argument) => fixer.remove(argument)),
                  fixer.replaceText(matcherNode, "toBeInTheDocument"),
                ];
              },
            },
          ],
        });
      }
    }

    // toBe() or toEqual() are only invalid with null
    if (
      (matcherNode.name === "toBe" || matcherNode.name === "toEqual") &&
      (matcherArguments.length === 0 || !usesToBeOrToEqualWithNull(matcherNode, matcherArguments))
    ) {
      return;
    }

    const query = getQueryName(queryNode);

    if (queries.includes(query)) {
      context.report({
        node: matcherNode,
        messageId: "use-document",
        loc: matcherNode.loc,
        fix(fixer) {
          /** @type {Fix[]} */
          const operations = [];

          // Remove any arguments in the matcher
          for (const argument of matcherArguments) {
            const sourceCode = getSourceCode(context);
            const token = sourceCode.getTokenAfter(argument);
            if (token?.value === "," && token.type === astTokenTypes.Punctuator) {
              // Remove commas if toHaveLength had more than one argument or a trailing comma
              operations.push(fixer.replaceText(token, ""));
            }
            operations.push(fixer.remove(argument));
          }

          // AllBy should not be used with toBeInTheDocument
          operations.push(
            fixer.replaceText(getQueryReplacementNode(queryNode), query.replace("All", "")),
          );
          // Flip the .not if necessary
          if (isAntonymMatcher(matcherNode, matcherArguments)) {
            if (negatedMatcher && expectCall) {
              operations.push(
                fixer.replaceTextRange(
                  [expectCall.range[1], matcherNode.range[1]],
                  ".toBeInTheDocument",
                ),
              );

              return operations;
            } else {
              operations.push(fixer.insertTextBefore(matcherNode, "not."));
            }
          }

          // Replace the actual matcher
          operations.push(fixer.replaceText(matcherNode, "toBeInTheDocument"));

          return operations;
        },
      });
    }
  }

  return /** @type {RuleListener} */ ({
    // expect(<query>).not.<matcher>
    [`CallExpression[callee.object.object.callee.name='expect'][callee.object.property.name='not'][callee.property.name=${alternativeMatchers}], CallExpression[callee.object.callee.name='expect'][callee.object.property.name='not'][callee.object.arguments.0.argument.callee.name=${alternativeMatchers}]`](
      /**
       * @param {CallExpression} node - Matched assertion call.
       * @returns {void}
       */
      node,
    ) {
      const matcherCall = /** @type {CallExpression} */ (node);

      if (!isStaticMemberExpression(matcherCall.callee)) {
        return;
      }

      const notMember = matcherCall.callee.object;

      if (!isStaticMemberExpression(notMember) || !isCallExpression(notMember.object)) {
        return;
      }

      const expectCall = notMember.object;

      if (expectCall.arguments.length === 0) {
        return;
      }

      const [argument] = expectCall.arguments;

      if (!argument) {
        return;
      }

      const queryNode = getQueryNodeFromExpectArgument(argument);
      const matcherNode = matcherCall.callee.property;
      const matcherArguments = matcherCall.arguments;

      check({
        negatedMatcher: true,
        queryNode,
        matcherNode,
        matcherArguments,
        expectCall,
      });
    },
    // // const foo = <query> expect(foo).not.<matcher>
    [`MemberExpression[object.object.callee.name=expect][object.property.name=not][property.name=${alternativeMatchers}][object.object.arguments.0.type=Identifier]`](
      /**
       * @param {MemberExpression} node - Matched matcher member.
       * @returns {void}
       */
      node,
    ) {
      const matcherMember = /** @type {MemberExpression} */ (node);

      if (
        !isStaticMemberExpression(matcherMember) ||
        !isStaticMemberExpression(matcherMember.object)
      ) {
        return;
      }

      const expectCall = matcherMember.object.object;

      if (!isCallExpression(expectCall) || !isIdentifier(expectCall.arguments[0])) {
        return;
      }

      const queryNode = getAssignmentForIdentifier(
        context,
        matcherMember,
        expectCall.arguments[0].name,
      );

      // Not an RTL query
      if (!isCallExpression(queryNode)) {
        return;
      }

      const matcherNode = matcherMember.property;

      const matcherCall = getParent(matcherMember);

      if (!isCallExpression(matcherCall)) {
        return;
      }

      const matcherArguments = matcherCall.arguments;

      check({
        negatedMatcher: true,
        queryNode:
          isIdentifier(queryNode.callee) || isStaticMemberExpression(queryNode.callee)
            ? queryNode.callee
            : null,
        matcherNode,
        matcherArguments,
        expectCall,
      });
    },
    // const foo = <query> expect(foo).<matcher>
    [`MemberExpression[object.callee.name=expect][property.name=${alternativeMatchers}][object.arguments.0.type=Identifier]`](
      /**
       * @param {MemberExpression} node - Matched matcher member.
       * @returns {void}
       */
      node,
    ) {
      const matcherMember = /** @type {MemberExpression} */ (node);

      if (!isStaticMemberExpression(matcherMember) || !isCallExpression(matcherMember.object)) {
        return;
      }

      const [expectArgument] = matcherMember.object.arguments;

      if (!isIdentifier(expectArgument)) {
        return;
      }

      // Value expression being assigned to the left-hand value
      const rightValueNode = getAssignmentForIdentifier(
        context,
        matcherMember,
        expectArgument.name,
      );

      // Not a DTL query
      if (!isCallExpression(rightValueNode)) {
        return;
      }

      const queryIdentifierNode = getDTLQueryIdentifierNode(rightValueNode);

      const matcherNode = matcherMember.property;

      const matcherCall = getParent(matcherMember);

      if (!isCallExpression(matcherCall)) {
        return;
      }

      const matcherArguments = matcherCall.arguments;
      check({
        negatedMatcher: false,
        queryNode: queryIdentifierNode,
        matcherNode,
        matcherArguments,
      });
    },
    // expect(await <query>).<matcher>
    // expect(<query>).<matcher>
    [`CallExpression[callee.object.callee.name='expect'][callee.property.name=${alternativeMatchers}], CallExpression[callee.object.callee.name='expect'][callee.object.arguments.0.argument.callee.name=${alternativeMatchers}]`](
      /**
       * @param {CallExpression} node - Matched assertion call.
       * @returns {void}
       */
      node,
    ) {
      const matcherCall = /** @type {CallExpression} */ (node);

      if (
        !isStaticMemberExpression(matcherCall.callee) ||
        !isCallExpression(matcherCall.callee.object)
      ) {
        return;
      }

      const arg = matcherCall.callee.object.arguments[0];

      if (!arg) {
        return;
      }

      const queryIdentifierNode = isAwaitExpression(arg)
        ? getDTLQueryIdentifierNode(arg.argument)
        : getDTLQueryIdentifierNode(arg);

      const matcherNode = matcherCall.callee.property;
      const matcherArguments = matcherCall.arguments;

      check({
        negatedMatcher: false,
        queryNode: queryIdentifierNode,
        matcherNode,
        matcherArguments,
      });
    },
  });
}
