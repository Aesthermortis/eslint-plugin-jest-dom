/**
 * @file Prefer ToHaveClass over checking element className.
 * @author Ben Monro.
 */

import { getQueryNodeFrom } from "../assignment-ast.js";
import { getSourceCode } from "../context.js";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const messageId = "use-to-have-class";
const truthyMatchers = new Set(["toBeTruthy", "toBeTrue"]);
const falsyMatchers = new Set(["toBeFalsy", "toBeFalse"]);

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
/** @typedef {import("eslint").Rule.Fix} Fix */
/** @typedef {import("eslint").Rule.RuleFixer} RuleFixer */
/** @typedef {MemberExpression & { computed: false; property: Identifier }} StaticMemberExpression */
/**
 * @typedef {CallExpression & {
 *   callee: StaticMemberExpression;
 * }} StaticMemberCallExpression
 */
/**
 * @typedef {{
 *   classValue: CallExpressionArgument;
 *   checkedElement: Expression;
 *   expectArgument: CallExpressionArgument;
 *   matcher: Identifier;
 *   matcherArg: CallExpressionArgument | undefined;
 * }} ClassListContainsAssertion
 */
/**
 * @typedef {{
 *   classListProp: StaticMemberExpression;
 *   classValue: CallExpressionArgument;
 *   indexedAccess: MemberExpression;
 *   matcher: Identifier;
 * }} ClassListIndexAssertion
 */
/**
 * @typedef {{
 *   classNameProp: StaticMemberExpression;
 *   classValue: CallExpressionArgument | undefined;
 *   checkedProp: Identifier;
 *   matcher: Identifier;
 * }} ClassPropertyAssertion
 */
/**
 * @typedef {{
 *   classArg: CallExpressionArgument;
 *   classValueArg: CallExpressionArgument;
 *   matcher: Identifier;
 *   queryNode: Node;
 * }} ClassAttributeAssertion
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
 * @returns {node is MemberExpression} Whether the node is a member expression.
 */
function isMemberExpression(node) {
  return node?.type === astNodeTypes.MemberExpression;
}

/**
 * @param {CallExpression} node - Call expression to inspect.
 * @returns {node is StaticMemberCallExpression} Whether the call has a static member callee.
 */
function hasStaticMemberCallee(node) {
  return isStaticMemberExpression(node.callee);
}

/**
 * @param {CallExpressionArgument | undefined} node - AST node to inspect.
 * @returns {unknown} Literal value, when present.
 */
function getLiteralValue(node) {
  return node?.type === astNodeTypes.Literal ? node.value : undefined;
}

/**
 * @param {string} matcherName - Jest matcher name.
 * @param {CallExpressionArgument | undefined} matcherArg - Matcher argument.
 * @returns {boolean | null} Whether the assertion expects class presence.
 */
function getClassListContainsExpectation(matcherName, matcherArg) {
  if (matcherName === "toBe" || matcherName === "toEqual" || matcherName === "toStrictEqual") {
    const matcherValue = getLiteralValue(matcherArg);

    if (matcherValue === true) {
      return true;
    }

    if (matcherValue === false) {
      return false;
    }

    return null;
  }

  if (truthyMatchers.has(matcherName)) {
    return true;
  }

  if (falsyMatchers.has(matcherName)) {
    return false;
  }

  return null;
}

/**
 * @param {RuleContext} context - ESLint rule context.
 * @param {Node} node - Node to read.
 * @returns {string} Source text for the node.
 */
function getText(context, node) {
  return getSourceCode(context).getText(node);
}

/**
 * @param {CallExpressionArgument | undefined} node - Node to inspect.
 * @returns {node is StaticMemberExpression} Whether the node is a static member expression.
 */
function isStaticMemberArgument(node) {
  return isStaticMemberExpression(node);
}

/**
 * @param {CallExpressionArgument | undefined} node - Node to inspect.
 * @returns {node is StaticMemberCallExpression} Whether the node is a static member call.
 */
function isStaticMemberCallArgument(node) {
  return isCallExpression(node) && hasStaticMemberCallee(node);
}

/**
 * @param {CallExpressionArgument | undefined} node - Node to inspect.
 * @returns {node is CallExpression} Whether the node is expect.<matcher>(...).
 */
function isExpectMatcherArgument(node) {
  return (
    isCallExpression(node) &&
    isStaticMemberExpression(node.callee) &&
    node.callee.object.type === astNodeTypes.Identifier &&
    node.callee.object.name === "expect"
  );
}

/**
 * @param {CallExpressionArgument | undefined} node - Node to inspect.
 * @returns {node is CallExpressionArgument} Whether the node can represent a class-name literal.
 */
function isClassNameLiteralArgument(node) {
  return node?.type === astNodeTypes.Literal || node?.type === astNodeTypes.TemplateLiteral;
}

/**
 * @param {CallExpression} node - Matched assertion call.
 * @returns {ClassListContainsAssertion | null} Parsed classList.contains assertion.
 */
function getClassListContainsAssertion(node) {
  if (!hasStaticMemberCallee(node)) {
    return null;
  }

  const expectCall = node.callee.object;
  const [expectArgument] =
    expectCall.type === astNodeTypes.CallExpression ? expectCall.arguments : [];
  const containsCall = isStaticMemberCallArgument(expectArgument) ? expectArgument : null;
  const classListMember =
    containsCall && isStaticMemberExpression(containsCall.callee.object)
      ? containsCall.callee.object
      : null;
  const [classValue] = containsCall?.arguments ?? [];

  if (!containsCall || !classListMember || !classValue) {
    return null;
  }

  return {
    classValue,
    checkedElement: classListMember.object,
    expectArgument,
    matcher: node.callee.property,
    matcherArg: node.arguments[0],
  };
}

/**
 * @param {CallExpression} node - Matched assertion call.
 * @returns {ClassListIndexAssertion | null} Parsed classList[index] assertion.
 */
function getClassListIndexAssertion(node) {
  if (!hasStaticMemberCallee(node)) {
    return null;
  }

  const expectCall = node.callee.object;
  const [expectArgument] =
    expectCall.type === astNodeTypes.CallExpression ? expectCall.arguments : [];
  const [classValue] = node.arguments;

  if (
    !isMemberExpression(expectArgument) ||
    !isStaticMemberExpression(expectArgument.object) ||
    !classValue
  ) {
    return null;
  }

  return {
    classListProp: expectArgument.object,
    classValue,
    indexedAccess: expectArgument,
    matcher: node.callee.property,
  };
}

/**
 * @param {CallExpression} node - Matched assertion call.
 * @returns {ClassPropertyAssertion | null} Parsed expect(element.className/classList) assertion.
 */
function getClassPropertyAssertion(node) {
  if (!hasStaticMemberCallee(node)) {
    return null;
  }

  const expectCall = node.callee.object;
  const [expectArgument] =
    expectCall.type === astNodeTypes.CallExpression ? expectCall.arguments : [];

  if (!isStaticMemberArgument(expectArgument)) {
    return null;
  }

  return {
    classNameProp: expectArgument,
    classValue: node.arguments[0],
    checkedProp: expectArgument.property,
    matcher: node.callee.property,
  };
}

/**
 * @param {CallExpression} node - Matched negated assertion call.
 * @returns {ClassPropertyAssertion | null} Parsed expect(element.className/classList).not assertion.
 */
function getNegatedClassPropertyAssertion(node) {
  if (!hasStaticMemberCallee(node) || !isStaticMemberExpression(node.callee.object)) {
    return null;
  }

  const expectCall = node.callee.object.object;
  const [expectArgument] =
    expectCall.type === astNodeTypes.CallExpression ? expectCall.arguments : [];

  if (!isStaticMemberArgument(expectArgument)) {
    return null;
  }

  return {
    classNameProp: expectArgument,
    classValue: node.arguments[0],
    checkedProp: expectArgument.property,
    matcher: node.callee.property,
  };
}

/**
 * @param {RuleContext} context - ESLint rule context.
 * @param {ClassPropertyAssertion} assertion - Parsed class property assertion.
 * @returns {boolean} Whether the checked expression is a Testing Library DOM query.
 */
function isDomQueryClassProperty(context, assertion) {
  return getQueryNodeFrom(context, assertion.classNameProp.object).isDTLQuery;
}

/**
 * @param {RuleFixer} fixer - ESLint fixer.
 * @param {ClassPropertyAssertion} assertion - Parsed class property assertion.
 * @returns {Fix} Fix that removes .className/.classList.
 */
function removeClassProperty(fixer, assertion) {
  return fixer.removeRange([
    assertion.classNameProp.object.range[1],
    assertion.checkedProp.range[1],
  ]);
}

/**
 * @param {CallExpression} node - Matched toHaveAttribute/toHaveProperty call.
 * @param {boolean} isNegated - Whether the matcher is behind .not.
 * @returns {ClassAttributeAssertion | null} Parsed class attribute/property assertion.
 */
function getClassAttributeAssertion(node, isNegated) {
  if (!hasStaticMemberCallee(node)) {
    return null;
  }

  const matcher = node.callee.property;
  const [classArg, classValueArg] = node.arguments;

  if (!classArg || !classValueArg) {
    return null;
  }

  const matcherObject =
    isNegated && isStaticMemberExpression(node.callee.object)
      ? node.callee.object.object
      : node.callee.object;
  const [queryNode] =
    matcherObject.type === astNodeTypes.CallExpression ? matcherObject.arguments : [];

  if (!queryNode) {
    return null;
  }

  return {
    classArg,
    classValueArg,
    matcher,
    queryNode,
  };
}

/**
 * @param {RuleContext} context - ESLint rule context.
 * @param {ClassAttributeAssertion} assertion - Parsed class attribute/property assertion.
 * @returns {boolean} Whether the assertion checks the class/className field.
 */
function isClassAttributeAssertion(context, assertion) {
  if (!isClassNameLiteralArgument(assertion.classArg)) {
    return false;
  }

  const classNameValue = getText(context, assertion.classArg).slice(1, -1);

  return (
    (assertion.matcher.name === "toHaveAttribute" && classNameValue === "class") ||
    (assertion.matcher.name === "toHaveProperty" && classNameValue === "className")
  );
}

/**
 * @param {RuleContext} context - ESLint rule context.
 * @param {ClassAttributeAssertion} assertion - Parsed class attribute/property assertion.
 * @returns {boolean} Whether the checked expression is a Testing Library DOM query.
 */
function isDomQueryClassAttribute(context, assertion) {
  return getQueryNodeFrom(context, assertion.queryNode).isDTLQuery;
}

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    url: "prefer-to-have-class",
    description: "prefer toHaveClass over checking element className",
    recommended: true,
  },
  messages: {
    [messageId]: `Prefer .toHaveClass() over checking element className`,
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
    //expect(el.classList.contains("foo")).toBe(true)
    [`CallExpression[callee.object.callee.name=expect][callee.object.arguments.0.callee.object.property.name=classList][callee.object.arguments.0.callee.property.name=contains][callee.property.name=/^(toBe|toBeTruthy|toBeFalsy|toBeTrue|toBeFalse|toEqual|toStrictEqual)$/]`](
      /**
       * @param {CallExpression} node - Matched assertion call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getClassListContainsAssertion(node);

      if (!assertion) {
        return;
      }

      const isTruthy = getClassListContainsExpectation(
        assertion.matcher.name,
        assertion.matcherArg,
      );

      if (isTruthy === null) {
        return;
      }

      context.report({
        node: assertion.matcher,
        messageId,
        fix(fixer) {
          return [
            fixer.removeRange([
              assertion.checkedElement.range[1],
              assertion.expectArgument.range[1],
            ]),

            fixer.replaceText(assertion.matcher, `${isTruthy ? "" : "not."}toHaveClass`),
            assertion.matcherArg
              ? fixer.replaceText(assertion.matcherArg, getText(context, assertion.classValue))
              : fixer.insertTextBefore(
                  getSourceCode(context).getTokenAfter(assertion.matcher, { skip: 1 }),
                  getText(context, assertion.classValue),
                ),
          ];
        },
      });
    },

    //expect(el.classList[0]).toBe("bar")
    [`CallExpression[callee.object.callee.name=expect][callee.object.arguments.0.object.property.name=classList][callee.property.name=/toBe$|to(Strict)?Equal|toContain/][arguments.0.type=/Literal$/]`](
      /**
       * @param {CallExpression} node - Matched assertion call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getClassListIndexAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node: assertion.matcher,
        messageId,
        fix(fixer) {
          // can't autofix here as toHaveClass doesn't have a partial matcher / regex for class names.
          if (assertion.matcher.name === "toContain") {
            return null;
          }

          return [
            fixer.removeRange([
              assertion.classListProp.object.range[1],
              assertion.indexedAccess.range[1],
            ]),
            fixer.replaceText(assertion.matcher, "toHaveClass"),
            fixer.replaceText(assertion.classValue, getText(context, assertion.classValue)),
          ];
        },
      });
    },

    //expect(el.classList[0]).not.toBe("bar")
    [`CallExpression[callee.object.object.callee.name=expect][callee.object.object.arguments.0.object.property.name=classList][callee.object.property.name=not][callee.property.name=/toBe$|to(Strict)?Equal|toContain/][arguments.0.type=/Literal$/]`](
      /**
       * @param {CallExpression} node - Matched assertion call.
       * @returns {void}
       */
      node,
    ) {
      // can't autofix this case because the class could be in another element of the classList array.
      context.report({
        node,
        messageId,
      });
    },
    //expect(el.className | el.classList).toBe("bar") / toStrict?Equal / toContain
    [`CallExpression[callee.object.callee.name=expect][callee.object.arguments.0.property.name=/class(Name|List)/][callee.property.name=/toBe$|to(Strict)?Equal|toContain/]`](
      /**
       * @param {CallExpression} node - Matched assertion call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getClassPropertyAssertion(node);

      if (!assertion?.classValue || !isDomQueryClassProperty(context, assertion)) {
        return;
      }

      // don't report here if using `expect.foo()`
      if (isExpectMatcherArgument(assertion.classValue)) {
        return;
      }

      context.report({
        node: assertion.matcher,
        messageId,
        fix(fixer) {
          if (
            assertion.checkedProp.name === "classList" &&
            assertion.matcher.name !== "toContain"
          ) {
            return null;
          }

          return [
            removeClassProperty(fixer, assertion),
            fixer.replaceText(assertion.matcher, "toHaveClass"),
            fixer.replaceText(
              assertion.classValue,
              `${getText(context, assertion.classValue)}${
                assertion.matcher.name === "toContain" ? "" : ", { exact: true }"
              }`,
            ),
          ];
        },
      });
    },

    //expect(el.className | el.classList).toEqual(expect.stringContaining("foo") | objectContaining) / toStrictEqual
    [`CallExpression[callee.object.callee.name=expect][callee.object.arguments.0.property.name=/class(Name|List)/][callee.property.name=/to(Strict)?Equal/][arguments.0.callee.object.name=expect]`](
      /**
       * @param {CallExpression} node - Matched assertion call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getClassPropertyAssertion(node);
      const matcherArgument = assertion?.classValue;

      if (
        !assertion ||
        !isDomQueryClassProperty(context, assertion) ||
        !isStaticMemberCallArgument(matcherArgument)
      ) {
        return;
      }

      const matcherArg = matcherArgument.callee.property;
      const [classValue] = matcherArgument.arguments;

      if (!classValue) {
        return;
      }

      context.report({
        node: assertion.matcher,
        messageId,
        fix(fixer) {
          if (matcherArg.name !== "stringContaining") {
            return null;
          }

          return [
            removeClassProperty(fixer, assertion),
            fixer.replaceText(assertion.matcher, "toHaveClass"),
            fixer.replaceText(matcherArgument, getText(context, classValue)),
          ];
        },
      });
    },

    //expect(screen.getByRole("button").className | classList).not.toBe("foo"); / toStrict?Equal / toContain
    [`CallExpression[callee.object.object.callee.name=expect][callee.object.object.arguments.0.property.name=/class(Name|List)/][callee.object.property.name=not][callee.property.name=/toBe$|to(Strict)?Equal|toContain/]`](
      /**
       * @param {CallExpression} node - Matched assertion call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getNegatedClassPropertyAssertion(node);

      if (!assertion?.classValue || !isDomQueryClassProperty(context, assertion)) {
        return;
      }

      context.report({
        node: assertion.matcher,
        messageId,
        fix(fixer) {
          if (
            assertion.checkedProp.name === "classList" &&
            assertion.matcher.name !== "toContain"
          ) {
            return null;
          }

          return [
            removeClassProperty(fixer, assertion),
            fixer.replaceText(assertion.matcher, "toHaveClass"),
            fixer.replaceText(
              assertion.classValue,
              `${getText(context, assertion.classValue)}${
                assertion.matcher.name === "toContain" ? "" : ", { exact: true }"
              }`,
            ),
          ];
        },
      });
    },

    //expect(el).toHaveProperty("className", "foo: bar");
    //expect(el).toHaveAttribute("class", "foo: bar");
    [[
      `CallExpression[callee.object.callee.name=expect][callee.property.name=toHaveAttribute][arguments.0.type=/Literal/][arguments.1.type=/Literal$/]`,
      `CallExpression[callee.object.callee.name=expect][callee.property.name=toHaveProperty][arguments.0.type=/Literal/][arguments.1.type=/Literal$/]`,
    ].join(",")](
      /**
       * @param {CallExpression} node - Matched assertion call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getClassAttributeAssertion(node, false);

      if (
        !assertion ||
        !isClassAttributeAssertion(context, assertion) ||
        !isDomQueryClassAttribute(context, assertion)
      ) {
        return;
      }

      context.report({
        node: assertion.matcher,
        messageId,
        fix(fixer) {
          return [
            fixer.replaceText(assertion.matcher, "toHaveClass"),
            fixer.replaceText(assertion.classArg, getText(context, assertion.classValueArg)),
            fixer.replaceText(assertion.classValueArg, `{ exact: true }`),
          ];
        },
      });
    },

    //expect(el).not.toHaveAttribute("class", "foo: bar");
    //expect(el).not.toHaveProperty("className", "foo: bar");
    [[
      `CallExpression[callee.object.object.callee.name=expect][callee.object.property.name=not][callee.property.name=toHaveAttribute][arguments.0.type=/Literal/][arguments.1.type=/Literal$/]`,
      `CallExpression[callee.object.object.callee.name=expect][callee.object.property.name=not][callee.property.name=toHaveProperty][arguments.0.type=/Literal/][arguments.1.type=/Literal$/]`,
    ].join(",")](
      /**
       * @param {CallExpression} node - Matched assertion call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getClassAttributeAssertion(node, true);

      if (
        !assertion ||
        !isClassAttributeAssertion(context, assertion) ||
        !isDomQueryClassAttribute(context, assertion)
      ) {
        return;
      }

      context.report({
        node: assertion.matcher,
        messageId,
        fix(fixer) {
          return [
            fixer.replaceText(assertion.matcher, "toHaveClass"),
            fixer.replaceText(assertion.classArg, getText(context, assertion.classValueArg)),
            fixer.replaceText(assertion.classValueArg, `{ exact: true }`),
          ];
        },
      });
    },

    //expect(el).toHaveProperty(`className`, expect.stringContaining("foo"));
    //expect(el).toHaveAttribute(`class`, expect.stringContaining("foo"));
    [[
      `CallExpression[callee.object.callee.name=expect][callee.property.name=toHaveAttribute][arguments.0.type=/Literal/][arguments.1.callee.object.name=expect][arguments.1.callee.property.name=stringContaining]`,
      `CallExpression[callee.object.callee.name=expect][callee.property.name=toHaveProperty][arguments.0.type=/Literal/][arguments.1.callee.object.name=expect][arguments.1.callee.property.name=stringContaining]`,
    ].join(",")](
      /**
       * @param {CallExpression} node - Matched assertion call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getClassAttributeAssertion(node, false);
      const classValue = assertion?.classValueArg;

      if (
        !assertion ||
        !isClassAttributeAssertion(context, assertion) ||
        !isDomQueryClassAttribute(context, assertion) ||
        !isStaticMemberCallArgument(classValue)
      ) {
        return;
      }

      const [classValueArg] = classValue.arguments;

      if (!classValueArg) {
        return;
      }

      context.report({
        node: assertion.matcher,
        messageId,
        fix(fixer) {
          return [
            fixer.replaceText(assertion.matcher, "toHaveClass"),
            fixer.replaceText(assertion.classArg, getText(context, classValueArg)),
            fixer.removeRange([assertion.classArg.range[1], classValue.range[1]]),
          ];
        },
      });
    },
  });
}
