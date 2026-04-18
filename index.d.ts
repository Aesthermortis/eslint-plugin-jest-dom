import { type Linter, type Rule } from "eslint";

export interface JestDomPlugin {
  meta: {
    name: string;
    namespace: "jest-dom";
    version: string;
  };
  configs: {
    all: Linter.Config;
    recommended: Linter.Config;
  };
  rules: {
    [key: string]: Rule.RuleModule;
  };
}

declare const plugin: JestDomPlugin;

export const configs: JestDomPlugin["configs"];
export const rules: JestDomPlugin["rules"];
export default plugin;
