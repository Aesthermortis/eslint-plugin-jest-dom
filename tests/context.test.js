import { getScope, getSourceCode } from "../src/context.js";

describe("getSourceCode", () => {
  it("returns sourceCode from the current ESLint context API", () => {
    const sourceCode = {};
    const context = {
      sourceCode,
    };

    expect(getSourceCode(context)).toBe(sourceCode);
  });

  it("returns undefined when the context has no source code API", () => {
    expect(getSourceCode({})).toBeUndefined();
  });
});

describe("getScope", () => {
  it("returns scope from the current ESLint source code API", () => {
    const node = {};
    const scope = {};
    let currentApiNode;
    const context = {
      sourceCode: {
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
