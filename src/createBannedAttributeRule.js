import { getQueryNodeFrom } from "./assignment-ast.js";

/**
 * Checks whether an attribute matcher uses an excluded literal value.
 *
 * @param {object} node - Attribute matcher call node.
 * @param {string[]} excludedValues - Lowercase values that should not be reported.
 * @returns {boolean} Whether the matcher value is excluded.
 */
function isExcludedValue(node, excludedValues) {
  return (
    excludedValues.length > 0 &&
    node.arguments.length >= 2 &&
    node.arguments[1].type === "Literal" &&
    typeof node.arguments[1].value === "string" &&
    excludedValues.includes(node.arguments[1].value.toLowerCase())
  );
}

/**
 * Checks whether an attribute matcher targets a banned attribute.
 *
 * @param {object} node - Attribute matcher call node.
 * @param {string[]} attributes - Attribute names banned by the rule.
 * @returns {boolean} Whether the matcher targets a banned attribute.
 */
function isBannedArg(node, attributes) {
  return node.arguments.length > 0 && attributes.includes(node.arguments[0].value);
}

/**
 * Creates a rule listener for replacing banned attribute checks with jest-dom matchers.
 *
 * @param {object} ruleOptions - Banned attribute rule options.
 * @param {string} ruleOptions.preferred - Preferred matcher name.
 * @param {string} ruleOptions.negatedPreferred - Preferred matcher for negated assertions.
 * @param {string[]} ruleOptions.attributes - Attribute names banned by the rule.
 * @param {string[]} [ruleOptions.excludeValues] - Attribute values that should not be reported.
 * @returns {function(object): object} Rule listener factory.
 */
export default function createBannedAttributeRule({
  preferred,
  negatedPreferred,
  attributes,
  excludeValues = [],
}) {
  const excludedValues = excludeValues.map((value) => value.toLowerCase());

  return (context) => {
    const getCorrectFunctionFor = (node, negated = false) =>
      (node.arguments.length === 1 ||
        node.arguments[1].value === true ||
        node.arguments[1].type !== "Literal" ||
        (typeof node.arguments[1].value === "string" &&
          node.arguments[1].value.toLowerCase() === "true") ||
        node.arguments[1].value === "") &&
      !negated
        ? preferred
        : negatedPreferred;

    //expect(el).not.toBeEnabled() => expect(el).toBeDisabled()
    return {
      [`CallExpression[callee.property.name=/${preferred}|${negatedPreferred}/][callee.object.property.name='not'][callee.object.object.callee.name='expect']`](
        node,
      ) {
        if (!negatedPreferred.startsWith("toBe")) {
          return;
        }

        const incorrectFunction = node.callee.property.name;

        const correctFunction = incorrectFunction === preferred ? negatedPreferred : preferred;
        context.report({
          message: `Use ${correctFunction}() instead of not.${incorrectFunction}()`,
          node,
          fix: (fixer) =>
            fixer.replaceTextRange(
              [node.callee.object.property.range[0], node.range[1]],
              `${correctFunction}()`,
            ),
        });
      },
      //expect(getByText('foo').<attribute>).toBeTruthy()
      "CallExpression[callee.property.name=/toBe(Truthy|Falsy)?|toEqual/][callee.object.callee.name='expect']"(
        node,
      ) {
        if (node.callee.object.arguments.length === 0) {
          return;
        }

        const {
          arguments: [{ object, property, property: { name } = {} }],
        } = node.callee.object;
        const matcher = node.callee.property.name;
        const matcherArg = node.arguments.length > 0 && node.arguments[0].value;
        if (!attributes.includes(name)) {
          return;
        }
        const { isDTLQuery } = getQueryNodeFrom(context, node.callee.object.arguments[0]);
        if (!isDTLQuery) {
          return;
        }

        const isNegated =
          matcher.endsWith("Falsy") ||
          ((matcher === "toBe" || matcher === "toEqual") && matcherArg !== true);
        const correctFunction = getCorrectFunctionFor(node.callee.object, isNegated);
        context.report({
          node,
          message: `Use ${correctFunction}() instead of checking .${name} directly`,
          fix: (fixer) => [
            fixer.removeRange([object.range[1], property.range[1]]),
            fixer.replaceTextRange(
              [node.callee.property.range[0], node.range[1]],
              `${correctFunction}()`,
            ),
          ],
        });
      },
      "CallExpression[callee.property.name=/toHaveProperty|toHaveAttribute/][callee.object.property.name='not'][callee.object.object.callee.name='expect']"(
        node,
      ) {
        if (!isBannedArg(node, attributes)) {
          return;
        }

        if (isExcludedValue(node, excludedValues)) {
          return;
        }

        const arg = node.arguments[0].value;
        const correctFunction = getCorrectFunctionFor(node, true);

        const incorrectFunction = node.callee.property.name;
        context.report({
          message: `Use ${correctFunction}() instead of not.${incorrectFunction}('${arg}')`,
          node,
          fix: (fixer) =>
            fixer.replaceTextRange(
              [node.callee.object.property.range[0], node.range[1]],
              `${correctFunction}()`,
            ),
        });
      },
      "CallExpression[callee.object.callee.name='expect'][callee.property.name=/toHaveProperty|toHaveAttribute/]"(
        node,
      ) {
        if (!isBannedArg(node, attributes)) {
          return;
        }

        if (isExcludedValue(node, excludedValues)) {
          return;
        }

        const { isDTLQuery } = getQueryNodeFrom(context, node.callee.object.arguments[0]);

        if (!isDTLQuery) {
          return;
        }

        const correctFunction = getCorrectFunctionFor(node);

        const incorrectFunction = node.callee.property.name;

        const message = `Use ${correctFunction}() instead of ${incorrectFunction}(${node.arguments
          .map(({ raw, name }) => raw || name)
          .join(", ")})`;

        const secondArgIsLiteral =
          node.arguments.length === 2 && node.arguments[1].type === "Literal";

        context.report({
          node: node.callee.property,
          message,
          fix: (fixer) => {
            if (node.arguments.length === 1 || secondArgIsLiteral) {
              return [
                fixer.replaceTextRange(
                  [node.callee.property.range[0], node.range[1]],
                  `${correctFunction}()`,
                ),
              ];
            }

            return null;
          },
        });
      },
    };
  };
}
