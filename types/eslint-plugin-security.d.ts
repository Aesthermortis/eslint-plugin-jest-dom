declare module "eslint-plugin-security" {
  import type { ESLint, Linter, Rule } from "eslint";

  const security: {
    configs: {
      recommended: {
        name: "security/recommended";
        plugins: { security: ESLint.Plugin };
        rules: {
          "security/detect-bidi-characters": "warn";
          "security/detect-buffer-noassert": "warn";
          "security/detect-child-process": "warn";
          "security/detect-disable-mustache-escape": "warn";
          "security/detect-eval-with-expression": "warn";
          "security/detect-new-buffer": "warn";
          "security/detect-no-csrf-before-method-override": "warn";
          "security/detect-non-literal-fs-filename": "warn";
          "security/detect-non-literal-regexp": "warn";
          "security/detect-non-literal-require": "warn";
          "security/detect-object-injection": "warn";
          "security/detect-possible-timing-attacks": "warn";
          "security/detect-pseudoRandomBytes": "warn";
          "security/detect-unsafe-regex": "warn";
        };
      } & Linter.Config;
    };
    meta: {
      name: "eslint-plugin-security";
      namespaces: "security";
      version: string;
    };
    rules: {
      "detect-bidi-characters": Rule.RuleModule;
      "detect-buffer-noassert": Rule.RuleModule;
      "detect-child-process": Rule.RuleModule;
      "detect-disable-mustache-escape": Rule.RuleModule;
      "detect-eval-with-expression": Rule.RuleModule;
      "detect-new-buffer": Rule.RuleModule;
      "detect-no-csrf-before-method-override": Rule.RuleModule;
      "detect-non-literal-fs-filename": Rule.RuleModule;
      "detect-non-literal-regexp": Rule.RuleModule;
      "detect-non-literal-require": Rule.RuleModule;
      "detect-object-injection": Rule.RuleModule;
      "detect-possible-timing-attacks": Rule.RuleModule;
      "detect-pseudoRandomBytes": Rule.RuleModule;
      "detect-unsafe-regex": Rule.RuleModule;
    };
  };

  export default security;
}
