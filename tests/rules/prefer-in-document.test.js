/**
 * @file Prefer ToBeInTheDocument over querying and asserting length.
 * @author Anton Niklasson.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import { parser } from "typescript-eslint";

import * as rule from "../../src/rules/prefer-in-document.js";
import { RuleTester } from "eslint";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

/**
 * Creates an invalid test case for the default use-document report.
 *
 * @param {string} code - Source code that should be reported.
 * @param {string} output - Expected autofix output.
 * @returns {object} Invalid RuleTester case.
 */
function invalidCase(code, output) {
  return {
    code,
    output,
    errors: [
      {
        messageId: "use-document",
      },
    ],
  };
}

/**
 * Creates an invalid test case that expects query and matcher suggestions.
 *
 * @param {string} code - Source code that should be reported.
 * @param {object} messageData - Message interpolation data for the report.
 * @param {string} replaceQueryOutput - Expected output for the query replacement.
 * @param {string} replaceMatcherOutput - Expected output for the matcher replacement.
 * @returns {object} Invalid RuleTester case with suggestions.
 */
function invalidCaseWithSuggestions(code, messageData, replaceQueryOutput, replaceMatcherOutput) {
  return {
    code,
    errors: [
      {
        messageId: "invalid-combination-length-1",
        data: messageData,
        suggestions: [
          {
            desc: `Replace ${messageData.query} with ${messageData.allQuery}`,
            output: replaceQueryOutput,
          },
          {
            desc: "Replace .toHaveLength(1) with .toBeInTheDocument()",
            output: replaceMatcherOutput,
          },
        ],
      },
    ],
  };
}

const valid = [
  "expect().toBe(true)",
  ...["getByText", "getByRole"].map((q) => [
    `expect(screen.${q}('foo')).toBeInTheDocument()`,
    `expect(${q}('foo')).toBeInTheDocument()`,
    `expect(wrapper.${q}('foo')).toBeInTheDocument()`,
    `let foo;
      foo = screen.${q}('foo');
      foo = somethingElse;
      expect(foo).toHaveLength(1);`,
  ]),
  `expect().not.toBeNull()`,
  `expect(myFunction()).toBe();`,
  `expect(myFunction()).toHaveLength();`,
  `let foo;
  foo = "bar";
  expect(foo).toHaveLength(1);`,
  `let foo;
  foo = "bar";
  expect(foo).toHaveLength(0);`,
  `let foo;
  foo = bar;
  expect(foo).not.toHaveLength(0)`,
  `let foo;
  expect(foo).toHaveLength(1);`,
  `let foo;
  expect(foo).toHaveLength()`,
  `let foo;
  expect(foo).toHaveLength(1, 2, 3)`,
  `expect(screen.notAQuery('foo-bar')).toHaveLength(1)`,
  `expect(screen.getAllByText('foo-bar')).toHaveLength(2)`,
  `import foo from "./foo";
  it('should be defined', () => {
    expect(useBoolean).toBeDefined();
  })`,
  `const span = foo('foo') as HTMLSpanElement`,
  `const rtl = render()
  const stars = rtl.container.querySelector('div').children

  expect(rtl.container.children).toHaveLength(1)
  expect(stars).toHaveLength(5)`,
  `    let content = container.querySelector('p')

    expect(content).not.toBeNull()

    fireEvent.click(closeButton)

    await waitExpect(
      () => {
        content = container.querySelector('p')
        expect(content).toBeNull()
      }
    )`,
  `expect(await screen.findAllByRole("button")).toHaveLength(
      NUM_BUTTONS
    )`,
  `expect(await screen.findAllByRole("button")).not.toHaveLength(
      NUM_BUTTONS
    )`,
  `expect( screen.getAllByRole("link") ).not.toHaveLength(0);`,

  `import {NUM_BUTTONS} from "./foo";
     expect(screen.getByText('foo')).toHaveLength(NUM_BUTTONS)`,
  `expect(screen.getAllByText("foo")).toHaveLength(getLength())`,
  `expect(screen.getAllByText("foo")).toBe(foo)`,
  `expect(screen.getAllByText("foo")).toEqual(foo)`,
  `
  const element =  getByText('value')
  expect(element).toBeTruthy`,
  `
  const element =  getByText('value')
  expect(element).toBe.truthy`,
  `
  const element =  getByText('value')
  expect(element).toBeInTheDocument`,

  // *AllBy* queries with `.toHaveLength(1)` is valid
  // see conclusion at https://github.com/testing-library/eslint-plugin-jest-dom/issues/171#issuecomment-895074086
  `expect(screen.getAllByRole('foo')).toHaveLength(1)`,
  `expect(await screen.findAllByRole('foo')).toHaveLength(1)`,
  `expect(getAllByRole('foo')).toHaveLength(1)`,
  `expect(wrapper.getAllByRole('foo')).toHaveLength(1)`,
  `const foo = screen.getAllByRole('foo');
    expect(foo).toHaveLength(1);`,
  `const foo = getAllByRole('foo');
    expect(foo).toHaveLength(1);`,
  `let foo;
    foo = getAllByRole('foo');
    expect(foo).toHaveLength(1);`,
  `let foo;
    foo = screen.getAllByRole('foo');
    expect(foo).toHaveLength(1);`,

  `expect(screen.getAllByRole('foo')).toHaveLength(1,//comment
  )`,
  `const foo = screen.getAllByRole('foo');
    expect(foo).toHaveLength(1,//comment
    );`,
  `let foo;
    foo = screen.getAllByRole('foo');
    expect(foo).toHaveLength(1,//comment
    );`,

  // *AllBy* queries with `.toHaveLength(0)` is valid
  // see conclusion at https://github.com/testing-library/eslint-plugin-jest-dom/issues/171#issuecomment-895074086
  `expect(screen.queryAllByTestId("foo")).toHaveLength(0)`,
  `expect(queryAllByText('foo')).toHaveLength(0)`,
  `let foo;
    foo = screen.queryAllByText('foo');
    expect(foo).toHaveLength(0);`,

  `expect(screen.getAllByRole('foo')).toHaveLength(0//comment
    )`,
  `let foo;
    foo = screen.getAllByRole('foo');
    expect(foo).toHaveLength(0//comment
    );`,
];
const invalid = [
  invalidCase(
    `expect(screen.getByText('foo')).toHaveLength()`,
    `expect(screen.getByText('foo')).not.toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(screen.getAllByText('foo')).toHaveLength()`,
    `expect(screen.getByText('foo')).not.toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(screen.getByRole('foo')).toHaveLength()`,
    `expect(screen.getByRole('foo')).not.toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(screen.getAllByRole('foo')).toHaveLength()`,
    `expect(screen.getByRole('foo')).not.toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(screen.getByRole('foo')).toHaveLength(0,2,3)`,
    `expect(screen.getByRole('foo')).not.toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(screen.getAllByRole('foo')).toHaveLength(0,2,3,)`,
    `expect(screen.getByRole('foo')).not.toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(screen.getByRole('foo')).toHaveLength(1,2,3)`,
    `expect(screen.getByRole('foo')).toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(screen.getAllByRole('foo')).toHaveLength(1,2,3,)`,
    `expect(screen.getByRole('foo')).toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(screen.getAllByRole('foo')).toHaveLength(0,2,3//comment
)`,
    `expect(screen.getByRole('foo')).not.toBeInTheDocument(//comment
)`,
  ),
  invalidCase(
    `expect(screen.getAllByRole('foo')).toHaveLength(1,2,3,//comment
)`,
    `expect(screen.getByRole('foo')).toBeInTheDocument(//comment
)`,
  ),
  invalidCase(
    `expect(screen.getAllByRole('foo')).toHaveLength(0,2,//comment
3,4)`,
    `expect(screen.getByRole('foo')).not.toBeInTheDocument(//comment
)`,
  ),
  invalidCase(
    `expect(screen.getAllByRole('foo')).toHaveLength(1,2,//comment
3,4,)`,
    `expect(screen.getByRole('foo')).toBeInTheDocument(//comment
)`,
  ),
  invalidCase(
    `expect(screen.getAllByRole('foo')).toHaveLength(0,2/*comment*/,3)`,
    `expect(screen.getByRole('foo')).not.toBeInTheDocument(/*comment*/)`,
  ),
  invalidCase(
    `expect(screen.getAllByRole('foo')).toHaveLength(1,2,/*comment*/3,)`,
    `expect(screen.getByRole('foo')).toBeInTheDocument(/*comment*/)`,
  ),
  // Report invalid combination of *By* query with .toHaveLength(1) assertion
  // and suggest fixes by:
  // - Replacing *By* with *AllBy* query
  // - Replacing .toHaveLength(1) with .toBeInTheDocument() assertion
  invalidCaseWithSuggestions(
    `expect(screen.getByText('foo')).toHaveLength(1)`,
    {
      query: "getByText",
      allQuery: "getAllByText",
    },
    `expect(screen.getAllByText('foo')).toHaveLength(1)`,
    `expect(screen.getByText('foo')).toBeInTheDocument()`,
  ),
  invalidCaseWithSuggestions(
    `const NUM_BUTTONS=1;
     expect(screen.getByText('foo')).toHaveLength(NUM_BUTTONS)`,
    {
      query: "getByText",
      allQuery: "getAllByText",
    },
    `const NUM_BUTTONS=1;
     expect(screen.getAllByText('foo')).toHaveLength(NUM_BUTTONS)`,
    `const NUM_BUTTONS=1;
     expect(screen.getByText('foo')).toBeInTheDocument()`,
  ),

  invalidCaseWithSuggestions(
    `expect(getByText('foo')).toHaveLength(1)`,
    {
      query: "getByText",
      allQuery: "getAllByText",
    },
    `expect(getAllByText('foo')).toHaveLength(1)`,
    `expect(getByText('foo')).toBeInTheDocument()`,
  ),
  invalidCaseWithSuggestions(
    `expect(wrapper.getByText('foo')).toHaveLength(1)`,
    {
      query: "getByText",
      allQuery: "getAllByText",
    },
    `expect(wrapper.getAllByText('foo')).toHaveLength(1)`,
    `expect(wrapper.getByText('foo')).toBeInTheDocument()`,
  ),
  invalidCaseWithSuggestions(
    `const foo = screen.getByText('foo');
    expect(foo).toHaveLength(1);`,
    {
      query: "getByText",
      allQuery: "getAllByText",
    },
    `const foo = screen.getAllByText('foo');
    expect(foo).toHaveLength(1);`,
    `const foo = screen.getByText('foo');
    expect(foo).toBeInTheDocument();`,
  ),
  invalidCaseWithSuggestions(
    `const foo = getByText('foo');
    expect(foo).toHaveLength(1);`,
    {
      query: "getByText",
      allQuery: "getAllByText",
    },
    `const foo = getAllByText('foo');
    expect(foo).toHaveLength(1);`,
    `const foo = getByText('foo');
    expect(foo).toBeInTheDocument();`,
  ),
  invalidCaseWithSuggestions(
    `let foo;
    foo = getByText('foo');
    expect(foo).toHaveLength(1);`,
    {
      query: "getByText",
      allQuery: "getAllByText",
    },
    `let foo;
    foo = getAllByText('foo');
    expect(foo).toHaveLength(1);`,
    `let foo;
    foo = getByText('foo');
    expect(foo).toBeInTheDocument();`,
  ),
  invalidCaseWithSuggestions(
    `let foo;
    foo = screen.getByText('foo');
    expect(foo).toHaveLength(1);`,
    {
      query: "getByText",
      allQuery: "getAllByText",
    },
    `let foo;
    foo = screen.getAllByText('foo');
    expect(foo).toHaveLength(1);`,
    `let foo;
    foo = screen.getByText('foo');
    expect(foo).toBeInTheDocument();`,
  ),

  // Invalid cases that applies to queryBy* and queryAllBy*

  invalidCase(
    `expect(queryByText('foo')).toHaveLength(0)`,
    `expect(queryByText('foo')).not.toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(queryByText('foo')).toBeNull()`,
    `expect(queryByText('foo')).not.toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(queryByText('foo')).not.toBeNull()`,
    `expect(queryByText('foo')).toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(queryByText('foo')) .not .toBeNull()`,
    `expect(queryByText('foo')).toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(queryByText('foo')).toBe(null)`,
    `expect(queryByText('foo')).not.toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(queryByText('foo')).not.toBe(null)`,
    `expect(queryByText('foo')).toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(queryByText('foo')).toEqual(null)`,
    `expect(queryByText('foo')).not.toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(queryByText('foo')).not.toEqual(null)`,
    `expect(queryByText('foo')).toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(queryByText('foo')).toBeDefined()`,
    `expect(queryByText('foo')).toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(queryByText('foo')) .not .toBeDefined()`,
    `expect(queryByText('foo')) .not .toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(queryByText('foo')).toBeFalsy()`,
    `expect(queryByText('foo')).not.toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(queryByText('foo')).not.toBeFalsy()`,
    `expect(queryByText('foo')).toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(queryByText('foo')).toBeTruthy()`,
    `expect(queryByText('foo')).toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(queryByText('foo')).not.toBeTruthy()`,
    `expect(queryByText('foo')).not.toBeInTheDocument()`,
  ),
  invalidCase(
    `let foo;
      foo = screen.queryByText('foo');
      expect(foo).toHaveLength(0);`,
    `let foo;
      foo = screen.queryByText('foo');
      expect(foo).not.toBeInTheDocument();`,
  ),
  invalidCase(
    `let foo;
      foo = screen.queryByText('foo');
      expect(foo) .not.toBeNull();`,
    `let foo;
      foo = screen.queryByText('foo');
      expect(foo).toBeInTheDocument();`,
  ),
  invalidCase(
    `let foo = screen.queryByText('foo');
      expect(foo).not.toBeNull();`,
    `let foo = screen.queryByText('foo');
      expect(foo).toBeInTheDocument();`,
  ),

  invalidCase(
    `expect(queryAllByText('foo')).toBeNull()`,
    `expect(queryByText('foo')).not.toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(queryAllByText('foo')).not.toBeNull()`,
    `expect(queryByText('foo')).toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(queryAllByText('foo')) .not .toBeNull()`,
    `expect(queryByText('foo')).toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(queryAllByText('foo')).toBeDefined()`,
    `expect(queryByText('foo')).toBeInTheDocument()`,
  ),
  invalidCase(
    `expect(queryAllByText('foo')) .not .toBeDefined()`,
    `expect(queryByText('foo')) .not .toBeInTheDocument()`,
  ),
  invalidCase(
    `let foo;
      foo = screen.queryAllByText('foo');
      expect(foo) .not.toBeNull();`,
    `let foo;
      foo = screen.queryByText('foo');
      expect(foo).toBeInTheDocument();`,
  ),
  invalidCase(
    `let foo = screen.queryAllByText('foo');
      expect(foo).not.toBeNull();`,
    `let foo = screen.queryByText('foo');
      expect(foo).toBeInTheDocument();`,
  ),
  //END
  invalidCase(
    `it("foo", async () => {
      expect(await findByRole("button")).toBeDefined();
    })`,
    `it("foo", async () => {
      expect(await findByRole("button")).toBeInTheDocument();
    })`,
  ),
  invalidCase(
    `it("foo", async () => {
      expect(await findByRole("button")).not.toBeNull();
    })`,
    `it("foo", async () => {
      expect(await findByRole("button")).toBeInTheDocument();
    })`,
  ),
  invalidCase(
    `it("foo", async () => {
      expect(await screen.findByText(/Compressing video/)).toBeDefined();
    })`,
    `it("foo", async () => {
      expect(await screen.findByText(/Compressing video/)).toBeInTheDocument();
    })`,
  ),
  invalidCase(
    `it("foo", async () => {
      expect(await screen.findByText(/Compressing video/)).not.toBeDefined();
    })`,
    `it("foo", async () => {
      expect(await screen.findByText(/Compressing video/)).not.toBeInTheDocument();
    })`,
  ),

  invalidCase(
    `it("foo", async () => {
      const compressingFeedback = await screen.findByText(/Compressing video/);
      expect(compressingFeedback).toBeDefined();
    });`,
    `it("foo", async () => {
      const compressingFeedback = await screen.findByText(/Compressing video/);
      expect(compressingFeedback).toBeInTheDocument();
    });`,
  ),
  invalidCase(
    `it("foo", async () => {
      const compressingFeedback = await screen.findByText(/Compressing video/);
      expect(compressingFeedback).not.toBeNull();
    });`,
    `it("foo", async () => {
      const compressingFeedback = await screen.findByText(/Compressing video/);
      expect(compressingFeedback).toBeInTheDocument();
    });`,
  ),
  invalidCase(
    `it("foo", async () => {
      let compressingFeedback;
      compressingFeedback = await screen.findByText(/Compressing video/);
      expect(compressingFeedback).toBeDefined();
    });`,
    `it("foo", async () => {
      let compressingFeedback;
      compressingFeedback = await screen.findByText(/Compressing video/);
      expect(compressingFeedback).toBeInTheDocument();
    });`,
  ),
  invalidCase(
    `it("foo", async () => {
      let compressingFeedback;
      compressingFeedback = await screen.findByText(/Compressing video/);
      expect(compressingFeedback).not.toBeDefined();
    });`,
    `it("foo", async () => {
      let compressingFeedback;
      compressingFeedback = await screen.findByText(/Compressing video/);
      expect(compressingFeedback).not.toBeInTheDocument();
    });`,
  ),
  invalidCase(
    `const span = getByText('foo') as HTMLSpanElement
  expect(span).not.toBeNull()`,
    `const span = getByText('foo') as HTMLSpanElement
  expect(span).toBeInTheDocument()`,
  ),
  invalidCase(
    `const span = await findByText('foo') as HTMLSpanElement
  expect(span).not.toBeNull()`,
    `const span = await findByText('foo') as HTMLSpanElement
  expect(span).toBeInTheDocument()`,
  ),
  invalidCase(
    `let span;
     span = getByText('foo') as HTMLSpanElement
  expect(span).not.toBeNull()`,
    `let span;
     span = getByText('foo') as HTMLSpanElement
  expect(span).toBeInTheDocument()`,
  ),
];

const ruleTester = new RuleTester({
  languageOptions: { parser, ecmaVersion: 2020, sourceType: "module" },
});
ruleTester.run("prefer-in-document", rule, {
  valid: valid.flat(),
  invalid: invalid.flat(),
});

/**
 * The rule selectors already narrow most AST shapes, so these defensive branches need direct listener invocation to
 * stay covered.
 *
 * @param {object} context - Minimal ESLint rule context.
 * @returns {Array.<(node: object) => void>} Prefer-in-document listeners.
 */
function getPreferInDocumentListeners(context) {
  const listeners = Object.values(rule.create(context));

  expect(listeners).toHaveLength(4);

  return listeners;
}

/**
 * @param {object} object - Member object node.
 * @param {string} propertyName - Member property name.
 * @returns {object} Static member expression node.
 */
function createStaticMemberExpression(object, propertyName) {
  const property = {
    type: "Identifier",
    name: propertyName,
    range: [20, 30],
  };
  const member = {
    type: "MemberExpression",
    computed: false,
    object,
    property,
  };

  property.parent = member;

  return member;
}

/** @returns {object} Testing Library query call node. */
function createQueryCall() {
  return {
    type: "CallExpression",
    callee: {
      type: "Identifier",
      name: "queryByText",
    },
    arguments: [
      {
        type: "Literal",
        value: "foo",
      },
    ],
  };
}

/** @returns {object} ESLint sourceCode stub with an identifier assignment. */
function createSourceCodeWithQueryAssignment() {
  return {
    getScope: () => ({
      set: new Map([
        [
          "element",
          {
            defs: [
              {
                node: {
                  type: "VariableDeclarator",
                  init: createQueryCall(),
                },
              },
            ],
            references: [],
          },
        ],
      ]),
    }),
  };
}

describe("prefer-in-document defensive AST handling", () => {
  test("ignores malformed matcher assertions", () => {
    let reportCalls = 0;
    const report = () => {
      reportCalls += 1;
    };
    const [
      negatedQueryListener,
      assignedNegatedQueryListener,
      assignedQueryListener,
      queryListener,
    ] = getPreferInDocumentListeners({
      report,
      sourceCode: createSourceCodeWithQueryAssignment(),
    });
    const malformedNode = {
      type: "Identifier",
      name: "toBeNull",
    };
    const queryCall = createQueryCall();
    const negatedExpectMember = createStaticMemberExpression(
      {
        type: "Identifier",
        name: "expectResult",
      },
      "not",
    );
    const assignedExpectCall = {
      type: "CallExpression",
      callee: {
        type: "Identifier",
        name: "expect",
      },
      arguments: [
        {
          type: "Identifier",
          name: "element",
        },
      ],
    };
    const assignedExpectCallWithoutArgument = {
      type: "CallExpression",
      callee: {
        type: "Identifier",
        name: "expect",
      },
      arguments: [],
    };
    const assignedNotMember = createStaticMemberExpression(assignedExpectCall, "not");
    const assignedMatcherMember = createStaticMemberExpression(assignedNotMember, "toBeNull");

    negatedQueryListener(malformedNode);
    negatedQueryListener({
      type: "CallExpression",
      callee: createStaticMemberExpression(
        {
          type: "Identifier",
          name: "expectResult",
        },
        "toBeNull",
      ),
      arguments: [],
    });
    negatedQueryListener({
      type: "CallExpression",
      callee: createStaticMemberExpression(negatedExpectMember, "toBeNull"),
      arguments: [],
    });
    negatedQueryListener({
      type: "CallExpression",
      callee: createStaticMemberExpression(
        createStaticMemberExpression(
          {
            type: "CallExpression",
            callee: {
              type: "Identifier",
              name: "expect",
            },
            arguments: Array.from({ length: 1 }),
          },
          "not",
        ),
        "toBeNull",
      ),
      arguments: [],
    });
    negatedQueryListener({
      type: "CallExpression",
      callee: createStaticMemberExpression(
        createStaticMemberExpression(
          {
            type: "CallExpression",
            callee: {
              type: "Identifier",
              name: "expect",
            },
            arguments: [
              {
                type: "CallExpression",
                callee: {
                  type: "Literal",
                  value: "notAQuery",
                },
                arguments: [],
              },
            ],
          },
          "not",
        ),
        "toBeNull",
      ),
      arguments: [],
    });
    assignedNegatedQueryListener(malformedNode);
    assignedNegatedQueryListener(createStaticMemberExpression(malformedNode, "toBeNull"));
    assignedNegatedQueryListener(
      createStaticMemberExpression(
        createStaticMemberExpression(assignedExpectCallWithoutArgument, "not"),
        "toBeNull",
      ),
    );
    assignedNegatedQueryListener(assignedMatcherMember);
    assignedQueryListener(malformedNode);
    assignedQueryListener(createStaticMemberExpression(queryCall, "toBeNull"));
    queryListener({
      type: "CallExpression",
      callee: createStaticMemberExpression(
        {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: "expect",
          },
          arguments: [
            {
              type: "CallExpression",
              callee: {
                type: "Literal",
                value: "notAQuery",
              },
              arguments: [],
            },
          ],
        },
        "toBeNull",
      ),
      arguments: [],
    });
    queryListener(malformedNode);

    expect(reportCalls).toBe(0);
  });

  test("ignores matcher calls without parent calls", () => {
    let reportCalls = 0;
    const report = () => {
      reportCalls += 1;
    };
    const [
      negatedQueryListener,
      assignedNegatedQueryListener,
      assignedQueryListener,
      queryListener,
    ] = getPreferInDocumentListeners({
      report,
      sourceCode: createSourceCodeWithQueryAssignment(),
    });
    const assignedExpectCall = {
      type: "CallExpression",
      callee: {
        type: "Identifier",
        name: "expect",
      },
      arguments: [
        {
          type: "Identifier",
          name: "element",
        },
      ],
    };
    const assignedNotMember = createStaticMemberExpression(assignedExpectCall, "not");
    const matcherCall = {
      type: "CallExpression",
      callee: createStaticMemberExpression(
        {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: "expect",
          },
          arguments: [createQueryCall()],
        },
        "toBeNull",
      ),
      arguments: [],
    };
    const sourceCodeWithInvalidQueryAssignment = {
      getScope: () => ({
        set: new Map([
          [
            "element",
            {
              defs: [
                {
                  node: {
                    type: "VariableDeclarator",
                    init: {
                      type: "CallExpression",
                      callee: {
                        type: "Literal",
                        value: "notAQuery",
                      },
                      arguments: [],
                    },
                  },
                },
              ],
              references: [],
            },
          ],
        ]),
      }),
    };
    const [, assignedNegatedQueryWithInvalidAssignmentListener] = getPreferInDocumentListeners({
      report,
      sourceCode: sourceCodeWithInvalidQueryAssignment,
    });
    const assignedNotMemberWithInvalidQuery = createStaticMemberExpression(
      assignedExpectCall,
      "not",
    );
    const assignedMatcherMemberWithInvalidQuery = createStaticMemberExpression(
      assignedNotMemberWithInvalidQuery,
      "toBeNull",
    );
    assignedMatcherMemberWithInvalidQuery.parent = {
      type: "CallExpression",
      callee: assignedMatcherMemberWithInvalidQuery,
      arguments: [],
    };

    negatedQueryListener(matcherCall);
    assignedNegatedQueryWithInvalidAssignmentListener(assignedMatcherMemberWithInvalidQuery);
    assignedNegatedQueryListener(createStaticMemberExpression(assignedNotMember, "toBeNull"));
    assignedQueryListener(createStaticMemberExpression(assignedExpectCall, "toBeNull"));
    queryListener(matcherCall);

    expect(reportCalls).toBe(0);
  });
});
