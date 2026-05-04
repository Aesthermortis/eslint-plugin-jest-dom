/* global describe, expect, it */
import { getScope, getSourceCode } from "../src/context.js";

describe("getSourceCode", () => {
  it("returns sourceCode from the current ESLint context API", () => {
    const sourceCode = {};
    let legacyCallCount = 0;
    const context = {
      getSourceCode() {
        legacyCallCount += 1;
      },
      sourceCode,
    };

    expect(getSourceCode(context)).toBe(sourceCode);
    expect(legacyCallCount).toBe(0);
  });

  it("falls back to the legacy context method", () => {
    const sourceCode = {};
    let legacyCallCount = 0;
    const context = {
      getSourceCode() {
        legacyCallCount += 1;
        return sourceCode;
      },
    };

    expect(getSourceCode(context)).toBe(sourceCode);
    expect(legacyCallCount).toBe(1);
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
    let legacyCallCount = 0;
    const context = {
      getScope() {
        legacyCallCount += 1;
      },
      sourceCode: {
        getScope(receivedNode) {
          currentApiNode = receivedNode;
          return scope;
        },
      },
    };

    expect(getScope(context, node)).toBe(scope);
    expect(currentApiNode).toBe(node);
    expect(legacyCallCount).toBe(0);
  });

  it("falls back to the legacy context method", () => {
    const node = {};
    const scope = {};
    let legacyApiNode;
    const context = {
      getScope(receivedNode) {
        legacyApiNode = receivedNode;
        return scope;
      },
      sourceCode: {},
    };

    expect(getScope(context, node)).toBe(scope);
    expect(legacyApiNode).toBe(node);
  });

  it("returns undefined when the context has no scope API", () => {
    expect(getScope({}, {})).toBeUndefined();
  });
});
