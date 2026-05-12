import { type Linter, type Rule } from "eslint";

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

declare const jestDom: {
  meta: {
    name: "eslint-plugin-jest-dom";
    namespace: "jest-dom";
    version: string;
  };

  configs: {
    all: Linter.Config & {
      name: "jest-dom/all";
      plugins: {
        "jest-dom": typeof jestDom;
      };
      rules: {
        "jest-dom/prefer-checked": "error";
        "jest-dom/prefer-empty": "error";
        "jest-dom/prefer-enabled-disabled": "error";
        "jest-dom/prefer-focus": "error";
        "jest-dom/prefer-in-document": "error";
        "jest-dom/prefer-partially-checked": "error";
        "jest-dom/prefer-partially-pressed": "error";
        "jest-dom/prefer-pressed": "error";
        "jest-dom/prefer-required": "error";
        "jest-dom/prefer-to-be-invalid": "error";
        "jest-dom/prefer-to-be-valid": "error";
        "jest-dom/prefer-to-contain-element": "error";
        "jest-dom/prefer-to-appear-after": "error";
        "jest-dom/prefer-to-appear-before": "error";
        "jest-dom/prefer-to-have-accessible-description": "error";
        "jest-dom/prefer-to-have-accessible-error-message": "error";
        "jest-dom/prefer-to-have-accessible-name": "error";
        "jest-dom/prefer-to-have-attribute": "error";
        "jest-dom/prefer-to-have-class": "error";
        "jest-dom/prefer-to-have-display-value": "error";
        "jest-dom/prefer-to-have-role": "error";
        "jest-dom/prefer-to-have-selection": "error";
        "jest-dom/prefer-to-have-style": "error";
        "jest-dom/prefer-to-have-text-content": "error";
        "jest-dom/prefer-to-have-value": "error";
      };
    };

    recommended: Linter.Config & {
      name: "jest-dom/recommended";
      plugins: {
        "jest-dom": typeof jestDom;
      };
      rules: {
        "jest-dom/prefer-checked": "error";
        "jest-dom/prefer-empty": "error";
        "jest-dom/prefer-enabled-disabled": "error";
        "jest-dom/prefer-focus": "error";
        "jest-dom/prefer-in-document": "error";
        "jest-dom/prefer-required": "error";
        "jest-dom/prefer-to-have-attribute": "error";
        "jest-dom/prefer-to-have-class": "error";
        "jest-dom/prefer-to-have-style": "error";
        "jest-dom/prefer-to-have-text-content": "error";
        "jest-dom/prefer-to-have-value": "error";
      };
    };
  };

  rules: Record<string, JestDomRuleModule>;
};

export type JestDomPlugin = typeof jestDom;
export default jestDom;
