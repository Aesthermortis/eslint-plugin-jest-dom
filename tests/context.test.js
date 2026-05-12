import { getScope, getSourceCode } from "../src/context.js";

describe("getSourceCode", () => {
  it("returns sourceCode from the current ESLint context API", () => {
    const sourceCode = {};
    const context = {
      sourceCode,
    };

    expect(getSourceCode(context)).toBe(sourceCode);
  });
});

describe("getScope", () => {
  it("returns scope from the current ESLint source code API", () => {
    const node = /** @type {import("@typescript-eslint/types").TSESTree.Node} */ ({});
    const scope = {};
    let currentApiNode;
    const context = {
      sourceCode: {
        /**
         * @param {import("@typescript-eslint/types").TSESTree.Node} receivedNode - Node passed to the source code API.
         * @returns {object} Scope object.
         */
        getScope(receivedNode) {
          currentApiNode = receivedNode;
          return scope;
        },
      },
    };

    expect(getScope(context, node)).toBe(scope);
    expect(currentApiNode).toBe(node);
  });
});
