import { type Linter, type Rule } from "eslint";

declare const jestDom: {
  meta: {
    name: "eslint-plugin-jest-dom";
    namespace: "jest-dom";
    version: string;
  };
  configs: {
    recommended: Linter.Config & {
      name: "jest-dom/recommended";
    };
  };
  rules: Record<string, Rule.RuleModule>;
};

export type JestDomPlugin = typeof jestDom;
export default jestDom;
