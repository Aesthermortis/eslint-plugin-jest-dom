import { RuleTester } from "eslint";
import * as rule from "../../src/rules/prefer-to-have-style.js";

const errors = [{ message: "Use toHaveStyle instead of asserting on element style" }];
const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2015, sourceType: "module" },
});
ruleTester.run("prefer-to-have-style", rule, {
  valid: [
    `expect().toBe(true)`,
    `expect(el).toHaveStyle({foo:"bar"})`,
    `expect(el.style).toMatchSnapshot()`,
    `expect(el.style).toEqual(1)`,
    `expect(el.style).toEqual(foo)`,
    `expect(el.style[1]).toEqual([])`,
    `expect(el.style[1]).toEqual({})`,
    `expect(element.style[0]).toBe(new RegExp('reg'));`,
    `expect(el).toHaveAttribute("style")`,
    `React.useLayoutEffect(() => {
      if (foo) {
        document.body.setAttribute("style", "foo");
      }
    }, [foo]);`,
    `expect(collapse.style).not.toContain(
      expect.objectContaining({
        display: 'none',
        height: '0px',
      })
    )`,
  ],
  invalid: [
    {
      code: `expect(a.style).toHaveProperty('transform')`,
      errors,
    },
    {
      code: `expect(a.style).not.toHaveProperty('transform')`,
      errors,
    },
    {
      code: `expect(a.style).not.toHaveProperty(\`\${foo}\`)`,
      errors,
    },
    {
      code: `expect(el.style.foo).toBe("bar")`,
      errors,
      output: `expect(el).toHaveStyle({foo:"bar"})`,
    },
    {
      code: `const red = "red"; expect(el.style.color).toBe(red)`,
      errors,
      output: `const red = "red"; expect(el).toHaveStyle({color:red})`,
    },
    {
      code: `expect(el.style.foo).not.toBe("bar")`,
      errors,
      output: `expect(el).not.toHaveStyle({foo:"bar"})`,
    },
    {
      code: `const red = "red"; expect(el.style.color).not.toBe(red)`,
      errors,
      output: `const red = "red"; expect(el).not.toHaveStyle({color:red})`,
    },
    {
      code: "expect(el.style.backgroundImage).toBe(`url(${foo})`)",
      errors,
      output: "expect(el).toHaveStyle({backgroundImage:`url(${foo})`})",
    },
    {
      code: "expect(el.style.backgroundImage).not.toBe(`url(${foo})`)",
      errors,
      output: "expect(el).not.toHaveStyle({backgroundImage:`url(${foo})`})",
    },
    {
      code: `expect(el.style).toHaveProperty("background-color", "green")`,
      errors,
      output: `expect(el).toHaveStyle({backgroundColor: "green"})`,
    },
    {
      code: `expect(el.style).not.toHaveProperty("background-color", "green")`,
      errors,
      output: `expect(el).not.toHaveStyle({backgroundColor: "green"})`,
    },
    {
      code: `expect(screen.getByTestId("foo").style["scroll-snap-type"]).toBe("x mandatory")`,
      errors,
      output: `expect(screen.getByTestId("foo")).toHaveStyle({scrollSnapType: "x mandatory"})`,
    },
    {
      code: 'expect(el.style["scroll-snap-type"]).toBe(`${x} mandatory`)',
      errors,
      output: "expect(el).toHaveStyle({scrollSnapType: `${x} mandatory`})",
    },
    {
      code: `const value = "x mandatory"; expect(el.style["scroll-snap-type"]).toBe(value)`,
      errors,
      output: `const value = "x mandatory"; expect(el).toHaveStyle({scrollSnapType: value})`,
    },
    {
      code: `expect(el.style["scroll-snap-type"]).not.toBe("x mandatory")`,
      errors,
      output: `expect(el).not.toHaveStyle({scrollSnapType: "x mandatory"})`,
    },
    {
      code: `expect(el.style).toContain("background-color")`,
      errors,
      output: `expect(el).toHaveStyle({backgroundColor: expect.anything()})`,
    },
    {
      code: `expect(el.style).toContain(1)`,
      errors,
      output: `expect(el).toHaveStyle({1: expect.anything()})`,
    },
    {
      code: `expect(el.style).toContain(\`background-color\`)`,
      errors,
      output: `expect(el).toHaveStyle(\`background-color\`)`,
    },
    {
      code: `expect(el.style).not.toContain(\`background-color\`)`,
      errors,
      output: `expect(el).not.toHaveStyle(\`background-color\`)`,
    },
    {
      code: `expect(el.style).not.toContain("background-color")`,
      errors,
      output: `expect(el).not.toHaveStyle({backgroundColor: expect.anything()})`,
    },
    {
      code: `expect(el).toHaveAttribute("style", "background-color: green; border-width: 10px; color: blue;")`,
      errors,
      output: `expect(el).toHaveStyle("background-color: green; border-width: 10px; color: blue;")`,
    },
    {
      code: `expect(imageElement.style[\`box-shadow\`]).toBe(\`inset 0px 0px 0px 400px \${c}\`)`,
      errors,
      output: `expect(imageElement).toHaveStyle(\`box-shadow: inset 0px 0px 0px 400px \${c}\`)`,
    },
    {
      code: `expect(imageElement.style[\`box-shadow\`  ]).toBe(  \`inset 0px 0px 0px 400px \${c}\`)`,
      errors,
      output: `expect(imageElement).toHaveStyle(  \`box-shadow: inset 0px 0px 0px 400px \${c}\`)`,
    },
    {
      code: `expect(imageElement.style[\`box-\${shadow}\`]).toBe("inset 0px 0px 0px 400px 40px")`,
      errors,
      output: `expect(imageElement).toHaveStyle(\`box-\${shadow}: inset 0px 0px 0px 400px 40px\`)`,
    },
    {
      code: `expect(imageElement.style[\`box-shadow\`]).toBe(value)`,
      errors,
      output: null,
    },
    {
      code: `expect(imageElement.style[\`box-shadow\`]).not.toBe(\`inset 0px 0px 0px 400px \${c}\`)`,
      errors,
      output: `expect(imageElement).not.toHaveStyle(\`box-shadow: inset 0px 0px 0px 400px \${c}\`)`,
    },
    {
      code: `expect(imageElement.style[\`box-shadow\`]).not.toBe("inset 0px 0px 0px 400px 40px")`,
      errors,
      output: `expect(imageElement).not.toHaveStyle(\`box-shadow: inset 0px 0px 0px 400px 40px\`)`,
    },
    {
      code: `expect(element.style[1]).toEqual('padding');`,
      errors,
      output: `expect(element).toHaveStyle({padding: expect.anything()});`,
    },
    {
      code: `expect(element.style[1]).toBe(\`padding\`);`,
      errors,
      output: `expect(element).toHaveStyle({[\`padding\`]: expect.anything()});`,
    },
    {
      code: `expect(element.style[1]).not.toEqual('padding');`,
      errors,
    },
    {
      code: `expect(element.style[1]).not.toBe(\`padding\`);`,
      errors,
    },
    {
      code: `expect(element.style[1]).toBe(x);`,
      errors,
      output: `expect(element).toHaveStyle({[x]: expect.anything()});`,
    },
    {
      code: `expect(element.style[0]).toBe(1);`,
      errors,
    },
    {
      code: `expect(element.style[0]).toBe(/RegExp/);`,
      errors,
    },
    {
      code: `expect(imageElement.style[computed]).toBe(\`inset 0px 0px 0px 400px \${c}\`)`,
      errors,
      output: null,
    },
    {
      code: `expect(imageElement.style[computed]).not.toBe(\`inset 0px 0px 0px 400px \${c}\`)`,
      errors,
      output: null,
    },
    {
      code: `
        expect(myStencil({color: '--my-var'}).style).toHaveProperty(
          myStencil.vars.color,
          'var(--my-var)'
        );
      `,
      errors,
      output: `
        expect(myStencil({color: '--my-var'})).toHaveStyle(
          {[myStencil.vars.color]: 'var(--my-var)'}
        );
      `,
    },
    {
      code: `
        expect(myStencil({color: '--my-var'}).style).not.toHaveProperty(
          myStencil.vars.color,
          'var(--my-var)'
        );
      `,
      errors,
      output: `
        expect(myStencil({color: '--my-var'})).not.toHaveStyle(
          {[myStencil.vars.color]: 'var(--my-var)'}
        );
      `,
    },
  ],
});

/**
 * The rule selectors already narrow most AST shapes, so these defensive branches need direct listener invocation to
 * stay covered.
 *
 * @param {object} context - Minimal ESLint rule context.
 * @returns {Array.<(node: object) => void>} Prefer-to-have-style listeners.
 */
function getPreferToHaveStyleListeners(context) {
  const listeners = Object.values(rule.create(context));

  expect(listeners).toHaveLength(9);

  return listeners;
}

/**
 * @param {object} context - Minimal ESLint rule context.
 * @returns {{
 *   stylePropertyListener: (node: object) => void;
 *   negatedStylePropertyListener: (node: object) => void;
 * }}  Style property listeners.
 */
function getStylePropertyListeners(context) {
  const listeners = getPreferToHaveStyleListeners(context);
  const stylePropertyListener = listeners.at(7);
  const negatedStylePropertyListener = listeners.at(8);

  expect(typeof stylePropertyListener).toBe("function");
  expect(typeof negatedStylePropertyListener).toBe("function");

  return {
    stylePropertyListener,
    negatedStylePropertyListener,
  };
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
    range: [0, 15],
  };
}

/**
 * @param {object} object - Member object node.
 * @param {object} property - Member property node.
 * @returns {object} Computed member expression node.
 */
function createComputedMemberExpression(object, property) {
  return {
    type: "MemberExpression",
    computed: true,
    object,
    property,
    range: [0, 20],
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

/** @returns {object} Identifier matcher argument node. */
function createIdentifierArgument() {
  return {
    type: "Identifier",
    name: "value",
    range: [20, 25],
  };
}

/** @returns {object} Unsupported matcher argument node. */
function createUnsupportedArgument() {
  return {
    type: "ObjectExpression",
    properties: [],
  };
}

/** @returns {object} Element style member expression node. */
function createStyleAccess() {
  return createStaticMemberExpression(
    {
      type: "Identifier",
      name: "element",
      range: [0, 7],
    },
    "style",
  );
}

/**
 * @param {string} matcherName - Matcher name.
 * @param {object[]} args - Matcher arguments.
 * @returns {object} Matcher call node.
 */
function createMatcherCall(matcherName, args = []) {
  const matcherMember = createStaticMemberExpression(
    {
      type: "CallExpression",
      callee: {
        type: "Identifier",
        name: "expect",
      },
      arguments: [],
    },
    matcherName,
  );

  return {
    type: "CallExpression",
    callee: matcherMember,
    arguments: args,
  };
}

/**
 * @param {object} styleAccess - Element style member expression node.
 * @param {object} matcherArgument - Matcher argument node.
 * @returns {object} Style access node with a positive static style assertion parent chain.
 */
function createStaticStyleAccess(styleAccess, matcherArgument) {
  const styleMember = createStaticMemberExpression(styleAccess, "color");
  const expectCall = {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: "expect",
    },
    arguments: [styleMember],
  };
  const matcherMember = createStaticMemberExpression(expectCall, "toBe");
  const matcherCall = {
    type: "CallExpression",
    callee: matcherMember,
    arguments: [matcherArgument],
  };

  styleAccess.parent = styleMember;
  styleMember.parent = expectCall;
  expectCall.parent = matcherMember;
  matcherMember.parent = matcherCall;

  return styleAccess;
}

/**
 * @param {object} styleAccess - Element style member expression node.
 * @param {object} matcherArgument - Matcher argument node.
 * @returns {object} Style access node with a negated static style assertion parent chain.
 */
function createNegatedStaticStyleAccess(styleAccess, matcherArgument) {
  const styleMember = createStaticMemberExpression(styleAccess, "color");
  const expectCall = {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: "expect",
    },
    arguments: [styleMember],
  };
  const notMember = createStaticMemberExpression(expectCall, "not");
  const matcherMember = createStaticMemberExpression(notMember, "toBe");
  const matcherCall = {
    type: "CallExpression",
    callee: matcherMember,
    arguments: [matcherArgument],
  };

  styleAccess.parent = styleMember;
  styleMember.parent = expectCall;
  expectCall.parent = notMember;
  notMember.parent = matcherMember;
  matcherMember.parent = matcherCall;

  return styleAccess;
}

/**
 * @param {object} styleAccess - Element style member expression node.
 * @param {string} matcherName - Matcher name.
 * @param {object[]} args - Matcher arguments.
 * @returns {object} Style access node with a positive matcher parent chain.
 */
function createStyleAccessWithMatcher(styleAccess, matcherName, args = []) {
  const expectCall = {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: "expect",
    },
    arguments: [styleAccess],
  };
  const matcherMember = createStaticMemberExpression(expectCall, matcherName);
  const matcherCall = {
    type: "CallExpression",
    callee: matcherMember,
    arguments: args,
  };

  styleAccess.parent = expectCall;
  expectCall.parent = matcherMember;
  matcherMember.parent = matcherCall;

  return styleAccess;
}

/**
 * @param {object} styleAccess - Element style member expression node.
 * @param {string} matcherName - Matcher name.
 * @param {object[]} args - Matcher arguments.
 * @returns {object} Style access node with a negated matcher parent chain.
 */
function createNegatedStyleAccessWithMatcher(styleAccess, matcherName, args = []) {
  const expectCall = {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: "expect",
    },
    arguments: [styleAccess],
  };
  const notMember = createStaticMemberExpression(expectCall, "not");
  const matcherMember = createStaticMemberExpression(notMember, matcherName);
  const matcherCall = {
    type: "CallExpression",
    callee: matcherMember,
    arguments: args,
  };

  styleAccess.parent = expectCall;
  expectCall.parent = notMember;
  notMember.parent = matcherMember;
  matcherMember.parent = matcherCall;

  return styleAccess;
}

/**
 * @param {object} styleAccess - Element style member expression node.
 * @param {object} styleName - Computed style property node.
 * @param {object} matcherArgument - Matcher argument node.
 * @returns {object} Style access node with a positive computed style assertion parent chain.
 */
function createComputedStyleAccess(styleAccess, styleName, matcherArgument) {
  const styleMember = createComputedMemberExpression(styleAccess, styleName);
  const expectCall = {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: "expect",
    },
    arguments: [styleMember],
  };
  const matcherMember = createStaticMemberExpression(expectCall, "toBe");
  const matcherCall = {
    type: "CallExpression",
    callee: matcherMember,
    arguments: [matcherArgument],
  };

  styleAccess.parent = styleMember;
  styleMember.parent = expectCall;
  expectCall.parent = matcherMember;
  matcherMember.parent = matcherCall;

  return styleAccess;
}

/**
 * @param {object} styleAccess - Element style member expression node.
 * @param {object} styleName - Computed style property node.
 * @param {object} matcherArgument - Matcher argument node.
 * @returns {object} Style access node with a negated computed style assertion parent chain.
 */
function createNegatedComputedStyleAccess(styleAccess, styleName, matcherArgument) {
  const styleMember = createComputedMemberExpression(styleAccess, styleName);
  const expectCall = {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: "expect",
    },
    arguments: [styleMember],
  };
  const notMember = createStaticMemberExpression(expectCall, "not");
  const matcherMember = createStaticMemberExpression(notMember, "toBe");
  const matcherCall = {
    type: "CallExpression",
    callee: matcherMember,
    arguments: [matcherArgument],
  };

  styleAccess.parent = styleMember;
  styleMember.parent = expectCall;
  expectCall.parent = notMember;
  notMember.parent = matcherMember;
  matcherMember.parent = matcherCall;

  return styleAccess;
}

describe("prefer-to-have-style defensive AST handling", () => {
  test("ignores malformed style assertions", () => {
    let reportCalls = 0;
    const report = () => {
      reportCalls += 1;
    };
    const [
      staticStyleListener,
      negatedStaticStyleListener,
      styleContainListener,
      negatedStyleContainListener,
      styleAttributeListener,
      computedStyleListener,
      negatedComputedStyleListener,
      stylePropertyListener,
      negatedStylePropertyListener,
    ] = getPreferToHaveStyleListeners({ report });
    const unparentedStyleAccess = createStyleAccess();

    staticStyleListener(unparentedStyleAccess);
    negatedStaticStyleListener(createStyleAccess());
    styleContainListener(createStyleAccess());
    negatedStyleContainListener(createStyleAccess());
    computedStyleListener(createStyleAccess());
    negatedComputedStyleListener(createStyleAccess());
    stylePropertyListener(createStyleAccess());
    negatedStylePropertyListener(createStyleAccess());
    styleAttributeListener({
      type: "CallExpression",
      callee: {
        type: "Identifier",
        name: "toHaveAttribute",
      },
      arguments: [createLiteral("style"), createLiteral("color: red")],
    });
    styleAttributeListener(createMatcherCall("toHaveAttribute", []));

    staticStyleListener(createStaticStyleAccess(createStyleAccess(), createUnsupportedArgument()));
    negatedStaticStyleListener(
      createNegatedStaticStyleAccess(createStyleAccess(), createUnsupportedArgument()),
    );
    styleContainListener(
      createStyleAccessWithMatcher(createStyleAccess(), "toContain", [createUnsupportedArgument()]),
    );
    negatedStyleContainListener(
      createNegatedStyleAccessWithMatcher(createStyleAccess(), "toContain", [
        createUnsupportedArgument(),
      ]),
    );
    computedStyleListener(
      createComputedStyleAccess(
        createStyleAccess(),
        createLiteral("color"),
        createUnsupportedArgument(),
      ),
    );
    negatedComputedStyleListener(
      createNegatedComputedStyleAccess(
        createStyleAccess(),
        createLiteral("color"),
        createIdentifierArgument(),
      ),
    );
    stylePropertyListener(createStyleAccessWithMatcher(createStyleAccess(), "toHaveProperty"));
    negatedStylePropertyListener(
      createNegatedStyleAccessWithMatcher(createStyleAccess(), "toHaveProperty"),
    );

    expect(reportCalls).toBe(0);
  });

  test("returns null fixes for style property assertions without values", () => {
    /** @type {Array.<{ fix: (fixer: object) => null }>} */
    const reports = [];
    /** @param {{ fix: (fixer: object) => null }} descriptor - Report descriptor captured from context.report(). */
    const report = (descriptor) => {
      reports.push(descriptor);
    };
    const { stylePropertyListener, negatedStylePropertyListener } = getStylePropertyListeners({
      report,
    });
    const fixer = {};

    stylePropertyListener(
      createStyleAccessWithMatcher(createStyleAccess(), "toHaveProperty", [createLiteral("color")]),
    );
    negatedStylePropertyListener(
      createNegatedStyleAccessWithMatcher(createStyleAccess(), "toHaveProperty", [
        createLiteral("color"),
      ]),
    );

    expect(reports).toHaveLength(2);
    expect(reports.map((descriptor) => descriptor.fix(fixer))).toStrictEqual([null, null]);
  });
});
