import { RuleTester } from "eslint";
import * as rule from "../../src/rules/prefer-to-have-class.js";

const errors = [{ messageId: "use-to-have-class" }];
const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2015, sourceType: "module" },
});
ruleTester.run("prefer-to-have-class", rule, {
  valid: [
    `expect().toBe(true)`,
    `const el = screen.getByText("foo"); expect(el).toHaveClass("bar")`,
    `const el = screen.getByText("foo"); expect(el.class).toEqual(foo)`,
    `const el = screen.getByText("foo"); expect(el.classList.contains("foo")).toBe()`,
    `const el = screen.getByText("foo"); expect(el.classList.contains("foo")).toEqual(value)`,
    `const el = screen.getByText("foo"); expect(el).toHaveAttribute("class")`,
    `const el = screen.getByText("foo"); expect(el).toHaveAttribute("className", "bar")`,
    `const el = screen.getByText("foo"); expect(el).toHaveAttribute("clazz", "bar")`,
    `const el = screen.getByText("foo"); expect(el).not.toHaveAttribute("clazz", "bar")`,
    `const el = screen.getByText("foo"); expect(el).not.toHaveAttribute("clazz", expect.stringContaining("bar"))`,
    `const el = screen.getByText("foo"); expect(el).toHaveAttribute("clazz", expect.stringContaining("bar"))`,
    `const el = screen.getByText("foo"); expect(el).toHaveProperty("class", "foo")`,
    `const el = screen.getByText("foo"); expect(el).toHaveProperty("clazz", "foo")`,
    `const el = screen.getByText("foo"); expect(el).not.toHaveProperty("clazz", "foo")`,
    `const el = screen.getByText("foo"); expect(el).toHaveProperty("clazz", expect.stringContaining("bar"))`,
    `const el = screen.getByText("foo"); expect(el).not.toHaveProperty("clazz", expect.stringContaining("bar"))`,
    `const el = screen.getByText("foo"); expect(el).toHaveAttribute("class", expect.stringMatching("bar"));`,
    `const el = screen.getByText("foo"); expect(el.className).toEqual(expect.stringContaining())`,
    `const el = screen.getByText("foo"); expect(el).toHaveAttribute("class", expect.stringContaining())`,
    `const { result } = renderHook(() =>
        useMyHook({
          classes,
        })
    );

    expect(result.current.className).toBe("foo");`,
    `const { result } = renderHook(() =>
        useMyHook({
          classes,
        })
    );

    expect(result.current.className).toEqual(expect.stringContaining("foo"));`,
    `const { result } = renderHook(() =>
        useMyHook({
          classes,
        })
    );

    expect(result.current.className).not.toBe("foo");`,
    `const el = getFoo(); expect(el).toHaveProperty("className", "foo: bar")`,
    `const el = getFoo(); expect(el).not.toHaveProperty("className", "foo: bar")`,
    `const el = getFoo(); expect(el).toHaveProperty("className",expect.stringContaining("foo"))`,
  ],
  invalid: [
    {
      code: `expect(screen.getByRole("button").className).toBe("foo")`,
      errors,
      output: `expect(screen.getByRole("button")).toHaveClass("foo", { exact: true })`,
    },
    {
      code: `expect(getByRole("button").className).toBe("foo")`,
      errors,
      output: `expect(getByRole("button")).toHaveClass("foo", { exact: true })`,
    },
    {
      code: `expect(screen.getByRole("button").className).not.toBe("foo")`,
      errors,
      output: `expect(screen.getByRole("button")).not.toHaveClass("foo", { exact: true })`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el).toHaveProperty("className", "foo")`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("foo", { exact: true })`,
    },
    {
      code: `const el = getByText("foo"); expect(el).toHaveProperty("className", "foo")`,
      errors,
      output: `const el = getByText("foo"); expect(el).toHaveClass("foo", { exact: true })`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el).toHaveAttribute("class", "foo")`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("foo", { exact: true })`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el).toHaveAttribute(\`class\`, "foo")`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("foo", { exact: true })`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el).toHaveAttribute("class", expect.stringContaining("bar"))`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("bar")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el).toHaveAttribute(\`class\`, expect.stringContaining("bar"))`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("bar")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el).not.toHaveProperty("className", "foo")`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).not.toHaveClass("foo", { exact: true })`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el).not.toHaveAttribute("class", "foo")`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).not.toHaveClass("foo", { exact: true })`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.className).toContain("foo")`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("foo")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.className).not.toContain("foo")`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).not.toHaveClass("foo")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.className).toBe("foo")`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("foo", { exact: true })`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.className).toEqual("foo")`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("foo", { exact: true })`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.className).toStrictEqual("foo")`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("foo", { exact: true })`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.className).toEqual(expect.stringContaining("foo"))`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("foo")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.className).toEqual(expect.stringContaining(\`foo\`))`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass(\`foo\`)`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.className).toStrictEqual(expect.stringContaining("foo"))`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("foo")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.className).toEqual(expect.stringContaining("bar"))`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("bar")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.classList).toContain("bar")`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("bar")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.classList).toBe("bar")`,
      errors,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.classList[0]).toBe("bar")`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("bar")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.classList[0]).not.toBe("bar")`,
      errors,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.classList[0]).toContain(("fo"))`,
      errors,
    },

    {
      code: `const el = screen.getByText("foo"); expect(el.classList).toEqual(expect.objectContaining({0:"foo"}))`,
      errors,
    },

    {
      code: `const el = screen.getByText("foo"); expect(el.classList).toContain(className)`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass(className)`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.classList).toContain("className")`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("className")`,
    },

    {
      code: `const el = screen.getByText("foo"); expect(el.classList).toContain(foo("bar"))`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass(foo("bar"))`,
    },

    {
      code: `const el = screen.getByText("foo"); expect(el.classList.contains("foo")).toBe(false)`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).not.toHaveClass("foo")`,
    },

    {
      code: `const el = screen.getByText("foo"); expect(el.classList.contains("foo")).toBe(true)`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("foo")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.classList.contains("foo")).toBeTruthy()`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("foo")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.classList.contains("foo")).toBeFalsy()`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).not.toHaveClass("foo")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.classList.contains("foo")).toBeTrue()`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("foo")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.classList.contains("foo")).toBeFalse()`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).not.toHaveClass("foo")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.classList.contains("foo")).toEqual(true)`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("foo")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.classList.contains("foo")).toEqual(false)`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).not.toHaveClass("foo")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.classList.contains("foo")).toStrictEqual(true)`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).toHaveClass("foo")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.classList.contains("foo")).toStrictEqual(false)`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).not.toHaveClass("foo")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.classList).not.toContain("bar")`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).not.toHaveClass("bar")`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.classList).not.toBe("bar")`,
      errors,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.classList[0]).not.toContain(("fo"))`,
      errors,
    },

    {
      code: `const el = screen.getByText("foo"); expect(el.classList).not.toEqual(expect.objectContaining({0:"foo"}))`,
      errors,
    },

    {
      code: `const el = screen.getByText("foo"); expect(el.classList).not.toContain(className)`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).not.toHaveClass(className)`,
    },
    {
      code: `const el = screen.getByText("foo"); expect(el.classList).not.toContain("className")`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).not.toHaveClass("className")`,
    },

    {
      code: `const el = screen.getByText("foo"); expect(el.classList).not.toContain(foo("bar"))`,
      errors,
      output: `const el = screen.getByText("foo"); expect(el).not.toHaveClass(foo("bar"))`,
    },
  ],
});

/**
 * The rule selectors already narrow most AST shapes, so these defensive branches need direct listener invocation to
 * stay covered.
 *
 * @param {object} context - Minimal ESLint rule context.
 * @returns {Array.<(node: object) => void>} Prefer-to-have-class listeners.
 */
function getPreferToHaveClassListeners(context) {
  const listeners = Object.values(rule.create(context));

  expect(listeners).toHaveLength(9);

  return listeners;
}

/**
 * @param {object} object - Member object node.
 * @param {string} propertyName - Member property name.
 * @returns {object} Static member expression node.
 */
function createStaticMemberExpression(object, propertyName) {
  return {
    type: "MemberExpression",
    computed: false,
    object,
    property: {
      type: "Identifier",
      name: propertyName,
      range: [10, 15],
    },
  };
}

/**
 * @param {string} matcherName - Jest matcher name.
 * @param {object[]} args - Matcher arguments.
 * @returns {object} Matcher call node.
 */
function createMatcherCall(matcherName, args = []) {
  return {
    type: "CallExpression",
    callee: createStaticMemberExpression(
      {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: "expect",
        },
        arguments: [],
      },
      matcherName,
    ),
    arguments: args,
  };
}

/**
 * @param {string} matcherName - Jest matcher name.
 * @param {object[]} args - Matcher arguments.
 * @returns {object} Negated matcher call node.
 */
function createNegatedMatcherCall(matcherName, args = []) {
  return {
    type: "CallExpression",
    callee: createStaticMemberExpression(
      createStaticMemberExpression(
        {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: "expect",
          },
          arguments: [],
        },
        "not",
      ),
      matcherName,
    ),
    arguments: args,
  };
}

/**
 * @param {object} expectArgument - Argument passed to expect().
 * @param {string} matcherName - Jest matcher name.
 * @param {object[]} args - Matcher arguments.
 * @returns {object} Matcher call node.
 */
function createMatcherCallWithExpectArgument(expectArgument, matcherName, args = []) {
  return {
    type: "CallExpression",
    callee: createStaticMemberExpression(
      {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: "expect",
        },
        arguments: [expectArgument],
      },
      matcherName,
    ),
    arguments: args,
  };
}

/**
 * @param {object} matcherObject - Object used before the matcher property.
 * @param {string} matcherName - Jest matcher name.
 * @param {object[]} args - Matcher arguments.
 * @returns {object} Matcher call node.
 */
function createMatcherCallOnObject(matcherObject, matcherName, args = []) {
  return {
    type: "CallExpression",
    callee: createStaticMemberExpression(matcherObject, matcherName),
    arguments: args,
  };
}

/**
 * @param {string} value - Literal value.
 * @returns {object} Literal node.
 */
function createLiteral(value) {
  return {
    type: "Literal",
    value,
    range: [20, 25],
  };
}

describe("prefer-to-have-class defensive AST handling", () => {
  test("ignores malformed class assertions", () => {
    let reportCalls = 0;
    const report = () => {
      reportCalls += 1;
    };
    const [
      classListContainsListener,
      classListIndexListener,
      ,
      classPropertyListener,
      classPropertyMatcherListener,
      negatedClassPropertyListener,
      classAttributeListener,
      negatedClassAttributeListener,
      classAttributeMatcherListener,
    ] = getPreferToHaveClassListeners({ report });
    const malformedMatcherCall = {
      type: "CallExpression",
      callee: {
        type: "Identifier",
        name: "toBe",
      },
      arguments: [createLiteral("foo")],
    };
    const matcherCallWithoutExpectedValue = createMatcherCall("toBe", []);
    const matcherCallWithoutExpectArgument = createMatcherCall("toBe", [createLiteral("foo")]);
    const negatedMatcherCallWithoutExpectArgument = createNegatedMatcherCall("toBe", [
      createLiteral("foo"),
    ]);
    const matcherCallWithoutClassAttribute = createMatcherCall("toHaveAttribute", []);
    const matcherObjectIdentifier = {
      type: "Identifier",
      name: "expectResult",
    };
    const matcherCallOnIdentifier = createMatcherCallOnObject(matcherObjectIdentifier, "toBe", [
      createLiteral("foo"),
    ]);
    const negatedMatcherCallOnIdentifier = createMatcherCallOnObject(
      createStaticMemberExpression(matcherObjectIdentifier, "not"),
      "toBe",
      [createLiteral("foo")],
    );
    const classListContainsCall = {
      type: "CallExpression",
      callee: createStaticMemberExpression(
        createStaticMemberExpression(
          {
            type: "Identifier",
            name: "element",
            range: [0, 7],
          },
          "classList",
        ),
        "contains",
      ),
      arguments: [createLiteral("foo")],
    };

    classListContainsListener(malformedMatcherCall);
    classListContainsListener(matcherCallWithoutExpectArgument);
    classListContainsListener(matcherCallOnIdentifier);
    classListContainsListener(
      createMatcherCallWithExpectArgument(classListContainsCall, "toHaveLength"),
    );
    classListIndexListener(malformedMatcherCall);
    classListIndexListener(matcherCallWithoutExpectArgument);
    classListIndexListener(matcherCallOnIdentifier);
    classPropertyListener(malformedMatcherCall);
    classPropertyListener(matcherCallWithoutExpectArgument);
    classPropertyListener(matcherCallOnIdentifier);
    classPropertyMatcherListener(matcherCallWithoutExpectedValue);
    negatedClassPropertyListener(malformedMatcherCall);
    negatedClassPropertyListener(matcherCallWithoutExpectArgument);
    negatedClassPropertyListener(negatedMatcherCallWithoutExpectArgument);
    negatedClassPropertyListener(negatedMatcherCallOnIdentifier);
    classAttributeListener(malformedMatcherCall);
    classAttributeListener(matcherCallWithoutClassAttribute);
    classAttributeListener(
      createMatcherCallOnObject(matcherObjectIdentifier, "toHaveAttribute", [
        createLiteral("class"),
        createLiteral("foo"),
      ]),
    );
    classAttributeListener(
      createMatcherCall("toHaveAttribute", [createLiteral("class"), createLiteral("foo")]),
    );
    classAttributeListener(
      createMatcherCallWithExpectArgument(
        {
          type: "Identifier",
          name: "element",
        },
        "toHaveAttribute",
        [
          {
            type: "Identifier",
            name: "class",
          },
          createLiteral("foo"),
        ],
      ),
    );
    negatedClassAttributeListener(negatedMatcherCallWithoutExpectArgument);
    classAttributeMatcherListener(createMatcherCall("toHaveAttribute", [createLiteral("class")]));

    expect(reportCalls).toBe(0);
  });
});
