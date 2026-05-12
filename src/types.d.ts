import type { Rule } from "eslint";

export type JestDomRuleDocs = {
  description: string;
  recommended: boolean;
  url: string;
};

export type JestDomRuleMeta = Omit<Rule.RuleMetaData, "docs"> & {
  docs: JestDomRuleDocs;
  schema: Rule.RuleMetaData["schema"];
  type: NonNullable<Rule.RuleMetaData["type"]>;
};

export type JestDomRuleModule = Omit<Rule.RuleModule, "meta"> & {
  meta: JestDomRuleMeta;
};
