import { type Linter, type Rule } from "eslint";

declare const plugin: {
  meta: {
    name: string;
    namespace: "jest-dom";
    version: string;
  };
  configs: {
    all: Linter.Config & {
      name: "jest-dom/all";
    };
    recommended: Linter.Config & {
      name: "jest-dom/recommended";
    };
  };
  rules: Record<string, Rule.RuleModule>;
};

export type JestDomPlugin = typeof plugin;
export default plugin;
