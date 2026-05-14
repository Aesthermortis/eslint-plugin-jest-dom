/**
 * @file Prefer ToHaveStyle over checking element style.
 * @author Ben Monro.
 */
import { getSourceCode } from "../context.js";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
const messageId = "prefer-to-have-style";

/**
 * @param {string} styleName - CSS property name.
 * @returns {string} Camel-cased CSS property name.
 */
const camelCase = (styleName) =>
  styleName.replaceAll(/-([a-z])/g, (_match, character) => String(character).toUpperCase());

/** @import {JestDomRuleModule} from "../types.d.ts" */
/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpression} CallExpression */
/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpressionArgument} CallExpressionArgument */
/** @typedef {import("@typescript-eslint/types").TSESTree.Expression} Expression */
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
/** @typedef {import("eslint").Rule.ReportFixer} ReportFixer */
/** @typedef {Node & { parent?: NodeWithParent }} NodeWithParent */
/** @typedef {MemberExpression & { computed: false; property: Identifier }} StaticMemberExpression */
/** @typedef {MemberExpression & { computed: true; property: Expression }} ComputedMemberExpression */
/**
 * @typedef {CallExpression & {
 *   callee: StaticMemberExpression;
 * }} StaticMemberCallExpression
 */
/**
 * @typedef {{
 *   styleAccess: StaticMemberExpression;
 *   styleMember: StaticMemberExpression;
 *   styleName: Identifier;
 *   styleValue: CallExpressionArgument;
 *   matcher: Identifier;
 * }} StaticStylePropertyAssertion
 */
/**
 * @typedef {{
 *   styleAccess: StaticMemberExpression;
 *   styleName: CallExpressionArgument;
 *   matcher: Identifier;
 * }} StyleContainAssertion
 */
/**
 * @typedef {{
 *   styleAccess: StaticMemberExpression;
 *   styleMember: ComputedMemberExpression;
 *   styleName: Expression;
 *   styleValue: CallExpressionArgument;
 *   matcher: Identifier;
 *   expectCall: CallExpression;
 * }} ComputedStylePropertyAssertion
 */
/**
 * @typedef {{
 *   styleAccess: StaticMemberExpression;
 *   styleName: CallExpressionArgument;
 *   styleValue: CallExpressionArgument | undefined;
 *   matcher: Identifier;
 * }} StylePropertyMatcherAssertion
 */
/**
 * @typedef {{
 *   matcher: Identifier;
 *   styleAttribute: CallExpressionArgument;
 *   styleValue: CallExpressionArgument;
 * }} StyleAttributeAssertion
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
 * @returns {node is ComputedMemberExpression} Whether the node is a computed member expression.
 */
function isComputedMemberExpression(node) {
  return node?.type === astNodeTypes.MemberExpression && node.computed;
}

/**
 * @param {CallExpression} node - CallExpression node to inspect.
 * @returns {node is StaticMemberCallExpression} Whether the call has a static member callee.
 */
function hasStaticMemberCallee(node) {
  return isStaticMemberExpression(/** @type {Node | undefined} */ (node.callee));
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
 * @param {CallExpressionArgument | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the node can be used as a direct matcher value.
 */
function isDirectMatcherValue(node) {
  return (
    node?.type === astNodeTypes.TemplateLiteral ||
    node?.type === astNodeTypes.Literal ||
    node?.type === astNodeTypes.Identifier
  );
}

/**
 * @param {CallExpressionArgument | undefined} node - AST node to inspect.
 * @returns {boolean} Whether the node is a literal or template literal.
 */
function isLiteralOrTemplate(node) {
  return isLiteral(node) || isTemplateLiteral(node);
}

/**
 * @param {Literal} node - Literal node.
 * @returns {string} Literal text value.
 */
function getLiteralTextValue(node) {
  return typeof node.value === "string" ? node.value : String(node.value);
}

/**
 * @param {CallExpressionArgument} node - AST node to inspect.
 * @returns {boolean} Whether the node is a number or RegExp literal.
 */
function isUnsupportedStyleValueLiteral(node) {
  return isLiteral(node) && (typeof node.value === "number" || node.value instanceof RegExp);
}

/**
 * Returns the property key used in the replacement style object.
 *
 * @param {RuleContext} context - ESLint rule context.
 * @param {Node} styleName - The asserted style property.
 * @returns {string} The replacement object property.
 */
function getReplacementObjectProperty(context, styleName) {
  if (isLiteral(styleName)) {
    return camelCase(getLiteralTextValue(styleName));
  }

  return `[${getSourceCode(context).getText(styleName)}]`;
}

/**
 * Builds the replacement toHaveStyle argument.
 *
 * @param {RuleContext} context - ESLint rule context.
 * @param {Node} styleName - The asserted style property.
 * @param {CallExpressionArgument} styleValue - The expected style value.
 * @returns {string} The replacement toHaveStyle argument.
 */
function getReplacementStyleParam(context, styleName, styleValue) {
  if (isLiteral(styleName)) {
    return `{${camelCase(getLiteralTextValue(styleName))}: ${getSourceCode(context).getText(
      styleValue,
    )}}`;
  }

  const styleNameText = getSourceCode(context).getText(styleName).slice(0, -1);
  let styleValueText = getSourceCode(context).getText(styleValue);

  styleValueText = isTemplateLiteral(styleValue)
    ? styleValueText.slice(1)
    : `${getLiteralTextValue(/** @type {Literal} */ (styleValue))}\``;

  return `${styleNameText}: ${styleValueText}`;
}

/**
 * @param {StaticMemberExpression} node - Matched element.style member.
 * @returns {StaticStylePropertyAssertion | null} Parsed positive static style assertion.
 */
function getStaticStylePropertyAssertion(node) {
  const styleMember = getParent(node);
  const expectCall = styleMember && getParent(styleMember);
  const matcherMember = expectCall && getParent(expectCall);
  const matcherCall = matcherMember && getParent(matcherMember);

  if (
    !isStaticMemberExpression(styleMember) ||
    !isCallExpression(expectCall) ||
    !isStaticMemberExpression(matcherMember) ||
    !isCallExpression(matcherCall)
  ) {
    return null;
  }

  const [styleValue] = matcherCall.arguments;

  if (!styleValue || !isDirectMatcherValue(styleValue)) {
    return null;
  }

  return {
    styleAccess: node,
    styleMember,
    styleName: styleMember.property,
    styleValue,
    matcher: matcherMember.property,
  };
}

/**
 * @param {StaticMemberExpression} node - Matched element.style member.
 * @returns {StaticStylePropertyAssertion | null} Parsed negated static style assertion.
 */
function getNegatedStaticStylePropertyAssertion(node) {
  const styleMember = getParent(node);
  const expectCall = styleMember && getParent(styleMember);
  const notMember = expectCall && getParent(expectCall);
  const matcherMember = notMember && getParent(notMember);
  const matcherCall = matcherMember && getParent(matcherMember);

  if (
    !isStaticMemberExpression(styleMember) ||
    !isCallExpression(expectCall) ||
    !isStaticMemberExpression(notMember) ||
    !isStaticMemberExpression(matcherMember) ||
    !isCallExpression(matcherCall)
  ) {
    return null;
  }

  const [styleValue] = matcherCall.arguments;

  if (!styleValue || !isDirectMatcherValue(styleValue)) {
    return null;
  }

  return {
    styleAccess: node,
    styleMember,
    styleName: styleMember.property,
    styleValue,
    matcher: matcherMember.property,
  };
}

/**
 * @param {StaticMemberExpression} node - Matched element.style member.
 * @returns {StyleContainAssertion | null} Parsed positive style containment assertion.
 */
function getStyleContainAssertion(node) {
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

  const [styleName] = matcherCall.arguments;

  if (!styleName || !isLiteralOrTemplate(styleName)) {
    return null;
  }

  return {
    styleAccess: node,
    styleName,
    matcher: matcherMember.property,
  };
}

/**
 * @param {StaticMemberExpression} node - Matched element.style member.
 * @returns {StyleContainAssertion | null} Parsed negated style containment assertion.
 */
function getNegatedStyleContainAssertion(node) {
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

  const [styleName] = matcherCall.arguments;

  if (!styleName || !isLiteralOrTemplate(styleName)) {
    return null;
  }

  return {
    styleAccess: node,
    styleName,
    matcher: matcherMember.property,
  };
}

/**
 * @param {StaticMemberExpression} node - Matched element.style member.
 * @returns {ComputedStylePropertyAssertion | null} Parsed positive computed style assertion.
 */
function getComputedStylePropertyAssertion(node) {
  const styleMember = getParent(node);
  const expectCall = styleMember && getParent(styleMember);
  const matcherMember = expectCall && getParent(expectCall);
  const matcherCall = matcherMember && getParent(matcherMember);

  if (
    !isComputedMemberExpression(styleMember) ||
    !isCallExpression(expectCall) ||
    !isStaticMemberExpression(matcherMember) ||
    !isCallExpression(matcherCall)
  ) {
    return null;
  }

  const [styleValue] = matcherCall.arguments;

  if (!styleValue || !isDirectMatcherValue(styleValue)) {
    return null;
  }

  return {
    styleAccess: node,
    styleMember,
    styleName: styleMember.property,
    styleValue,
    matcher: matcherMember.property,
    expectCall,
  };
}

/**
 * @param {StaticMemberExpression} node - Matched element.style member.
 * @returns {ComputedStylePropertyAssertion | null} Parsed negated computed style assertion.
 */
function getNegatedComputedStylePropertyAssertion(node) {
  const styleMember = getParent(node);
  const expectCall = styleMember && getParent(styleMember);
  const notMember = expectCall && getParent(expectCall);
  const matcherMember = notMember && getParent(notMember);
  const matcherCall = matcherMember && getParent(matcherMember);

  if (
    !isComputedMemberExpression(styleMember) ||
    !isCallExpression(expectCall) ||
    !isStaticMemberExpression(notMember) ||
    !isStaticMemberExpression(matcherMember) ||
    !isCallExpression(matcherCall)
  ) {
    return null;
  }

  const [styleValue] = matcherCall.arguments;

  if (!styleValue || !isLiteralOrTemplate(styleValue)) {
    return null;
  }

  return {
    styleAccess: node,
    styleMember,
    styleName: styleMember.property,
    styleValue,
    matcher: matcherMember.property,
    expectCall,
  };
}

/**
 * @param {StaticMemberExpression} node - Matched element.style member.
 * @returns {StylePropertyMatcherAssertion | null} Parsed toHaveProperty style assertion.
 */
function getStylePropertyMatcherAssertion(node) {
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

  const [styleName, styleValue] = matcherCall.arguments;

  if (!styleName) {
    return null;
  }

  return {
    styleAccess: node,
    styleName,
    styleValue,
    matcher: matcherMember.property,
  };
}

/**
 * @param {StaticMemberExpression} node - Matched element.style member.
 * @returns {StylePropertyMatcherAssertion | null} Parsed negated toHaveProperty style assertion.
 */
function getNegatedStylePropertyMatcherAssertion(node) {
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

  const [styleName, styleValue] = matcherCall.arguments;

  if (!styleName) {
    return null;
  }

  return {
    styleAccess: node,
    styleName,
    styleValue,
    matcher: matcherMember.property,
  };
}

/**
 * @param {RuleContext} context - ESLint rule context.
 * @param {CallExpressionArgument} styleName - Asserted style property.
 * @returns {string} Replacement style-name matcher argument.
 */
function getContainStyleReplacement(context, styleName) {
  return isLiteral(styleName)
    ? `{${camelCase(getLiteralTextValue(styleName))}: expect.anything()}`
    : getSourceCode(context).getText(styleName);
}

/**
 * @param {RuleContext} context - ESLint rule context.
 * @param {StylePropertyMatcherAssertion} assertion - Parsed style property assertion.
 * @returns {string | null} Replacement object text.
 */
function getStylePropertyReplacement(context, assertion) {
  if (!assertion.styleValue || !isLiteralOrTemplate(assertion.styleValue)) {
    return null;
  }

  return `{${getReplacementObjectProperty(context, assertion.styleName)}: ${getSourceCode(
    context,
  ).getText(assertion.styleValue)}}`;
}

/**
 * @param {CallExpression} node - Matched toHaveAttribute call.
 * @returns {StyleAttributeAssertion | null} Parsed style attribute assertion.
 */
function getStyleAttributeAssertion(node) {
  if (!hasStaticMemberCallee(node)) {
    return null;
  }

  const [styleAttribute, styleValue] = node.arguments;

  if (!styleAttribute || !styleValue) {
    return null;
  }

  return {
    matcher: node.callee.property,
    styleAttribute,
    styleValue,
  };
}

/**
 * @param {RuleContext} context - ESLint rule context.
 * @param {ComputedStylePropertyAssertion} assertion - Parsed computed style assertion.
 * @param {number} startOfStyleMemberExpression - Start of style member expression to remove.
 * @param {number} endOfStyleMemberExpression - End of style member expression to remove.
 * @returns {ReportFixer | null} Fixer, when the computed style assertion can be fixed.
 */
function getComputedStyleFix(
  context,
  assertion,
  startOfStyleMemberExpression,
  endOfStyleMemberExpression,
) {
  if (
    isUnsupportedStyleValueLiteral(assertion.styleValue) ||
    assertion.styleName.type === astNodeTypes.Identifier ||
    (assertion.styleValue.type === astNodeTypes.Identifier &&
      assertion.styleName.type !== astNodeTypes.Literal)
  ) {
    return null;
  }

  /** @type {ReportFixer} */
  const fix = (fixer) => [
    fixer.removeRange([startOfStyleMemberExpression, endOfStyleMemberExpression]),
    fixer.replaceText(assertion.matcher, "toHaveStyle"),
    fixer.replaceText(
      assertion.styleValue,
      isLiteral(assertion.styleName) && typeof assertion.styleName.value === "number"
        ? `{${getReplacementObjectProperty(context, assertion.styleValue)}: expect.anything()}`
        : getReplacementStyleParam(context, assertion.styleName, assertion.styleValue),
    ),
  ];

  return fix;
}

/**
 * @param {RuleContext} context - ESLint rule context.
 * @param {ComputedStylePropertyAssertion} assertion - Parsed computed style assertion.
 * @param {number} endOfStyleMemberExpression - End of style member expression to remove.
 * @returns {ReportFixer | null} Fixer, when the negated computed style assertion can be fixed.
 */
function getNegatedComputedStyleFix(context, assertion, endOfStyleMemberExpression) {
  if (
    (isLiteral(assertion.styleName) && typeof assertion.styleName.value === "number") ||
    assertion.styleName.type === astNodeTypes.Identifier
  ) {
    return null;
  }

  /** @type {ReportFixer} */
  const fix = (fixer) => [
    fixer.removeRange([assertion.styleAccess.object.range[1], endOfStyleMemberExpression]),
    fixer.replaceText(assertion.matcher, "toHaveStyle"),
    fixer.replaceText(
      assertion.styleValue,
      getReplacementStyleParam(context, assertion.styleName, assertion.styleValue),
    ),
  ];

  return fix;
}

/** @type {JestDomRuleModule["meta"]} */
export const meta = {
  type: "suggestion",
  docs: {
    url: "prefer-to-have-style",
    description: "prefer toHaveStyle over checking element style",
    recommended: true,
  },
  messages: {
    [messageId]: "Use toHaveStyle instead of asserting on element style",
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
    //expect(el.style.foo).toBe("bar");
    [`MemberExpression[property.name=style][parent.computed=false][parent.parent.parent.property.name=/^(toBe|toEqual|toStrictEqual)$/][parent.parent.parent.parent.arguments.0.type=/^(TemplateLiteral|Literal|Identifier)$/][parent.parent.callee.name=expect]`](
      /**
       * @param {StaticMemberExpression} node - Matched element.style member.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getStaticStylePropertyAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node: assertion.styleAccess.property,
        messageId,
        fix(fixer) {
          return [
            fixer.removeRange([
              assertion.styleAccess.object.range[1],
              assertion.styleName.range[1],
            ]),
            fixer.replaceText(assertion.matcher, "toHaveStyle"),
            fixer.replaceText(
              assertion.styleValue,
              `{${assertion.styleName.name}:${getSourceCode(context).getText(
                assertion.styleValue,
              )}}`,
            ),
          ];
        },
      });
    },
    //expect(el.style.foo).not.toBe("bar");
    [`MemberExpression[property.name=style][parent.computed=false][parent.parent.parent.property.name=not][parent.parent.parent.parent.property.name=/^(toBe|toEqual|toStrictEqual)$/][parent.parent.parent.parent.parent.arguments.0.type=/^(TemplateLiteral|Literal|Identifier)$/][parent.parent.callee.name=expect]`](
      /**
       * @param {StaticMemberExpression} node - Matched element.style member.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getNegatedStaticStylePropertyAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node: assertion.styleAccess.property,
        messageId,
        fix(fixer) {
          return [
            fixer.removeRange([
              assertion.styleAccess.object.range[1],
              assertion.styleName.range[1],
            ]),
            fixer.replaceText(assertion.matcher, "toHaveStyle"),
            fixer.replaceText(
              assertion.styleValue,
              `{${assertion.styleName.name}:${getSourceCode(context).getText(
                assertion.styleValue,
              )}}`,
            ),
          ];
        },
      });
    },
    // expect(el.style).toContain("foo-bar")
    [`MemberExpression[property.name=style][parent.parent.property.name=toContain][parent.parent.parent.arguments.0.type=/(Template)?Literal$/][parent.callee.name=expect]`](
      /**
       * @param {StaticMemberExpression} node - Matched element.style member.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getStyleContainAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node: assertion.styleAccess.property,
        messageId,
        fix(fixer) {
          return [
            fixer.removeRange([
              assertion.styleAccess.object.range[1],
              assertion.styleAccess.property.range[1],
            ]),
            fixer.replaceText(assertion.matcher, "toHaveStyle"),
            fixer.replaceText(
              assertion.styleName,
              getContainStyleReplacement(context, assertion.styleName),
            ),
          ];
        },
      });
    },
    // expect(el.style).not.toContain("foo-bar")
    [`MemberExpression[property.name=style][parent.parent.property.name=not][parent.parent.parent.property.name=toContain][parent.parent.parent.parent.arguments.0.type=/(Template)?Literal$/]`](
      /**
       * @param {StaticMemberExpression} node - Matched element.style member.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getNegatedStyleContainAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node: assertion.styleAccess.property,
        messageId,
        fix(fixer) {
          return [
            fixer.removeRange([
              assertion.styleAccess.object.range[1],
              assertion.styleAccess.property.range[1],
            ]),
            fixer.replaceText(assertion.matcher, "toHaveStyle"),
            fixer.replaceText(
              assertion.styleName,
              getContainStyleReplacement(context, assertion.styleName),
            ),
          ];
        },
      });
    },

    //expect(el).toHaveAttribute("style", "foo: bar");
    [`CallExpression[callee.property.name=toHaveAttribute][arguments.0.value=style][arguments.1][callee.object.callee.name=expect]`](
      /**
       * @param {CallExpression} node - Matched toHaveAttribute call.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getStyleAttributeAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node: assertion.styleAttribute,
        messageId,
        fix(fixer) {
          return [
            fixer.replaceText(assertion.matcher, "toHaveStyle"),
            fixer.removeRange([assertion.styleAttribute.range[0], assertion.styleValue.range[0]]),
          ];
        },
      });
    },

    //expect(el.style["foo-bar"]).toBe("baz")
    [`MemberExpression[property.name=style][parent.computed=true][parent.parent.parent.property.name=/^(toBe|toEqual|toStrictEqual)$/][parent.parent.parent.parent.arguments.0.type=/^(TemplateLiteral|Literal|Identifier)$/][parent.parent.callee.name=expect]`](
      /**
       * @param {StaticMemberExpression} node - Matched element.style member.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getComputedStylePropertyAssertion(node);

      if (!assertion) {
        return;
      }

      const startOfStyleMemberExpression = assertion.styleAccess.object.range[1];
      const endOfStyleMemberExpression = assertion.expectCall.arguments[0].range[1];

      context.report({
        node: assertion.styleAccess.property,
        messageId,
        fix: getComputedStyleFix(
          context,
          assertion,
          startOfStyleMemberExpression,
          endOfStyleMemberExpression,
        ),
      });
    },
    //expect(el.style["foo-bar"]).not.toBe("baz")
    [`MemberExpression[property.name=style][parent.computed=true][parent.parent.parent.property.name=not][parent.parent.parent.parent.parent.callee.property.name=/^(toBe|toEqual|toStrictEqual)$/][parent.parent.parent.parent.parent.arguments.0.type=/^(TemplateLiteral|Literal)$/][parent.parent.callee.name=expect]`](
      /**
       * @param {StaticMemberExpression} node - Matched element.style member.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getNegatedComputedStylePropertyAssertion(node);

      if (!assertion) {
        return;
      }

      const endOfStyleMemberExpression = assertion.expectCall.arguments[0].range[1];

      context.report({
        node: assertion.styleAccess.property,
        messageId,
        fix: getNegatedComputedStyleFix(context, assertion, endOfStyleMemberExpression),
      });
    },
    //expect(foo.style).toHaveProperty("foo", "bar")
    [`MemberExpression[property.name=style][parent.parent.property.name=toHaveProperty][parent.callee.name=expect]`](
      /**
       * @param {StaticMemberExpression} node - Matched element.style member.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getStylePropertyMatcherAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node: assertion.styleAccess.property,
        messageId,
        fix(fixer) {
          const replacement = getStylePropertyReplacement(context, assertion);

          if (!replacement || !assertion.styleValue) {
            return null;
          }

          return [
            fixer.removeRange([
              assertion.styleAccess.object.range[1],
              assertion.styleAccess.property.range[1],
            ]),
            fixer.replaceText(assertion.matcher, "toHaveStyle"),
            fixer.replaceTextRange(
              [assertion.styleName.range[0], assertion.styleValue.range[1]],
              replacement,
            ),
          ];
        },
      });
    },

    //expect(foo.style).not.toHaveProperty("foo", "bar")
    [`MemberExpression[property.name=style][parent.parent.property.name=not][parent.parent.parent.property.name=toHaveProperty][parent.callee.name=expect]`](
      /**
       * @param {StaticMemberExpression} node - Matched element.style member.
       * @returns {void}
       */
      node,
    ) {
      const assertion = getNegatedStylePropertyMatcherAssertion(node);

      if (!assertion) {
        return;
      }

      context.report({
        node: assertion.styleAccess.property,
        messageId,
        fix(fixer) {
          const replacement = getStylePropertyReplacement(context, assertion);

          if (!replacement || !assertion.styleValue) {
            return null;
          }

          return [
            fixer.removeRange([
              assertion.styleAccess.object.range[1],
              assertion.styleAccess.property.range[1],
            ]),
            fixer.replaceText(assertion.matcher, "toHaveStyle"),
            fixer.replaceTextRange(
              [assertion.styleName.range[0], assertion.styleValue.range[1]],
              replacement,
            ),
          ];
        },
      });
    },
  });
}
