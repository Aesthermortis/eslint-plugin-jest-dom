import {
  getAssignmentForIdentifier,
  getInnerNodeFrom,
  getQueryNodeFrom,
} from "../src/assignment-ast.js";

/** @typedef {import("@typescript-eslint/types").TSESTree.AwaitExpression} AwaitExpression */
/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpression} CallExpression */
/** @typedef {import("@typescript-eslint/types").TSESTree.CallExpressionArgument} CallExpressionArgument */
/** @typedef {import("@typescript-eslint/types").TSESTree.Expression} Expression */
/** @typedef {import("@typescript-eslint/types").TSESTree.Identifier} Identifier */
/** @typedef {import("@typescript-eslint/types").TSESTree.MemberExpression} MemberExpression */
/** @typedef {import("@typescript-eslint/types").TSESTree.Node} AstNode */
/** @typedef {import("@typescript-eslint/types").TSESTree.TSAsExpression} TSAsExpression */
/**
 * @typedef {import("@typescript-eslint/utils/ts-eslint").RuleContext<
 *   string,
 *   readonly unknown[]
 * >} RuleContext
 */
/** @typedef {import("@typescript-eslint/utils/ts-eslint").Scope.Variable} ScopeVariable */

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
  TSAsExpression: /** @type {import("@typescript-eslint/types").AST_NODE_TYPES.TSAsExpression} */ (
    "TSAsExpression"
  ),
  VariableDeclarator:
    /** @type {import("@typescript-eslint/types").AST_NODE_TYPES.VariableDeclarator} */ (
      "VariableDeclarator"
    ),
});

/**
 * @param {import("@typescript-eslint/types").AST_NODE_TYPES} type - AST node type.
 * @param {Record<string, unknown>} [properties] - Node properties.
 * @returns {Record<string, unknown>} Minimal AST node object.
 */
function createNodeObject(type, properties = {}) {
  return {
    loc: {
      end: { column: 0, line: 1 },
      start: { column: 0, line: 1 },
    },
    range: [0, 0],
    type,
    ...properties,
  };
}

/**
 * @param {string} name - Identifier name.
 * @returns {Identifier} Identifier node.
 */
function createIdentifier(name) {
  return /** @type {Identifier} */ (
    createNodeObject(astNodeTypes.Identifier, {
      decorators: [],
      name,
      optional: false,
      typeAnnotation: undefined,
    })
  );
}

/**
 * @param {unknown} value - Literal value.
 * @returns {CallExpressionArgument} Literal argument node.
 */
function createLiteral(value) {
  return /** @type {CallExpressionArgument} */ (
    createNodeObject(astNodeTypes.Literal, {
      raw: JSON.stringify(value),
      value,
    })
  );
}

/**
 * @param {Expression} callee - Call expression callee.
 * @param {CallExpressionArgument[]} [args] - Call arguments.
 * @returns {CallExpression} Call expression node.
 */
function createCallExpression(callee, args = []) {
  return /** @type {CallExpression} */ (
    createNodeObject(astNodeTypes.CallExpression, {
      arguments: args,
      callee,
      optional: false,
      typeArguments: undefined,
    })
  );
}

/**
 * @param {Expression} object - Member expression object.
 * @param {Identifier} property - Member expression property.
 * @returns {MemberExpression} Member expression node.
 */
function createMemberExpression(object, property) {
  return /** @type {MemberExpression} */ (
    createNodeObject(astNodeTypes.MemberExpression, {
      computed: false,
      object,
      optional: false,
      property,
    })
  );
}

/**
 * @param {Expression} expression - Awaited expression.
 * @returns {AwaitExpression} Await expression node.
 */
function createAwaitExpression(expression) {
  return /** @type {AwaitExpression} */ (
    createNodeObject(astNodeTypes.AwaitExpression, {
      argument: expression,
    })
  );
}

/**
 * @param {Expression} expression - Cast expression.
 * @returns {TSAsExpression} TS as expression node.
 */
function createTSAsExpression(expression) {
  return /** @type {TSAsExpression} */ (
    createNodeObject(astNodeTypes.TSAsExpression, {
      expression,
      typeAnnotation: createNodeObject(astNodeTypes.Identifier),
    })
  );
}

/**
 * @param {{ init?: AstNode | null; references?: Array.<{ writeExpr?: AstNode | null }> }} [options] - Variable parts.
 * @returns {ScopeVariable} Scope variable.
 */
function createScopeVariable({ init = null, references = [] } = {}) {
  return /** @type {ScopeVariable} */ ({
    defs: [
      {
        node: createNodeObject(astNodeTypes.VariableDeclarator, {
          id: createIdentifier("subject"),
          init,
        }),
      },
    ],
    references,
  });
}

/**
 * @param {Record<string, ScopeVariable>} variablesByName - Variables available in scope.
 * @returns {RuleContext} Rule context.
 */
function createContext(variablesByName = {}) {
  const variables = new Map(Object.entries(variablesByName));

  return /** @type {RuleContext} */ ({
    sourceCode: {
      getScope() {
        return {
          set: variables,
        };
      },
    },
  });
}

describe("getInnerNodeFrom", () => {
  it("resolves identifiers through their assigned initializer", () => {
    const assignedNode = createCallExpression(createIdentifier("getByText"), [
      createLiteral("Submit"),
    ]);
    const context = createContext({
      subject: createScopeVariable({ init: assignedNode }),
    });

    expect(getInnerNodeFrom(context, createIdentifier("root"), createIdentifier("subject"))).toBe(
      assignedNode,
    );
  });

  it("unwraps member, await, and TypeScript as expressions", () => {
    const queryCall = createCallExpression(createIdentifier("getByText"), [createLiteral("Save")]);
    const expression = createMemberExpression(
      createAwaitExpression(createTSAsExpression(queryCall)),
      createIdentifier("textContent"),
    );

    expect(getInnerNodeFrom(createContext(), createIdentifier("root"), expression)).toBe(queryCall);
  });
});

describe("getAssignmentForIdentifier", () => {
  it("returns the latest write expression when a variable has no initializer", () => {
    const firstAssignment = createCallExpression(createIdentifier("getByText"), [
      createLiteral("First"),
    ]);
    const latestAssignment = createCallExpression(createIdentifier("getByRole"), [
      createLiteral("button"),
    ]);
    const context = createContext({
      subject: createScopeVariable({
        references: [{ writeExpr: firstAssignment }, { writeExpr: latestAssignment }],
      }),
    });

    expect(getAssignmentForIdentifier(context, createIdentifier("root"), "subject")).toBe(
      latestAssignment,
    );
  });

  it("returns undefined when the identifier is not in scope", () => {
    expect(
      getAssignmentForIdentifier(createContext(), createIdentifier("root"), "missing"),
    ).toBeUndefined();
  });
});

describe("getQueryNodeFrom", () => {
  it("identifies direct Testing Library query calls", () => {
    const queryCall = createCallExpression(createIdentifier("getByText"), [createLiteral("Save")]);

    expect(getQueryNodeFrom(createContext(), queryCall)).toStrictEqual({
      isDTLQuery: true,
      query: "getByText",
      queryArg: "Save",
    });
  });

  it("identifies member Testing Library query calls", () => {
    const queryCall = createCallExpression(
      createMemberExpression(createIdentifier("screen"), createIdentifier("getByRole")),
      [createLiteral("button")],
    );

    expect(getQueryNodeFrom(createContext(), queryCall)).toStrictEqual({
      isDTLQuery: true,
      query: "getByRole",
      queryArg: "button",
    });
  });

  it("returns a negative result when the node is not a query call", () => {
    expect(getQueryNodeFrom(createContext(), createIdentifier("subject"))).toStrictEqual({
      isDTLQuery: false,
      query: null,
      queryArg: null,
    });
  });
});
