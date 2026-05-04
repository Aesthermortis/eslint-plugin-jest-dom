import { getQueryNodeFrom } from "./assignment-ast.js";

/**
 * Gets a string literal value from an AST node.
 *
 * @param {object | undefined} node - AST node to inspect.
 * @returns {string | undefined} String literal value, when present.
 */
function getStringLiteralValue(node) {
  if (node?.type !== "Literal" || typeof node.value !== "string") {
    return;
  }

  return node.value;
}

/**
 * Creates a rule listener for replacing banned attribute value checks with jest-dom matchers.
 *
 * @param {object} ruleOptions - Banned attribute value rule options.
 * @param {string} ruleOptions.preferred - Preferred matcher name.
 * @param {string[]} ruleOptions.attributes - Attribute names banned by the rule.
 * @param {string[]} ruleOptions.values - Attribute values banned by the rule.
 * @returns {function(object): object} Rule listener factory.
 */
export default function createBannedAttributeValueRule({ preferred, attributes, values }) {
  const bannedAttributes = new Set(attributes);
  const bannedValues = new Set(values);

  return (context) => ({
    "CallExpression[callee.object.callee.name='expect'][callee.property.name=/toHaveProperty|toHaveAttribute/]"(
      node,
    ) {
      if (node.arguments.length !== 2 || node.callee.object.arguments.length === 0) {
        return;
      }

      const attribute = getStringLiteralValue(node.arguments[0]);
      const value = getStringLiteralValue(node.arguments[1]);

      if (!bannedAttributes.has(attribute) || !bannedValues.has(value)) {
        return;
      }

      const { isDTLQuery } = getQueryNodeFrom(context, node.callee.object.arguments[0]);

      if (!isDTLQuery) {
        return;
      }

      const incorrectFunction = node.callee.property.name;
      const message = `Use ${preferred}() instead of ${incorrectFunction}(${node.arguments
        .map(({ raw }) => raw)
        .join(", ")})`;

      context.report({
        node: node.callee.property,
        message,
        fix: (fixer) =>
          fixer.replaceTextRange([node.callee.property.range[0], node.range[1]], `${preferred}()`),
      });
    },
  });
}
