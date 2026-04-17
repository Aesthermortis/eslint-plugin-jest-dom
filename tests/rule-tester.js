import { createRequire } from "node:module";
import { RuleTester } from "eslint";

const require = createRequire(import.meta.url);
const withLegacyContext = (rule) => ({
  ...rule,
  create(context) {
    const compatibleContext = Object.assign(Object.create(context), {
      getScope: (node) => context.sourceCode?.getScope(node) ?? context.getScope?.(node),
      getSourceCode: () => context.sourceCode ?? context.getSourceCode?.(),
    });

    return rule.create(compatibleContext);
  },
});

export class FlatCompatRuleTester extends RuleTester {
  constructor(testerConfig) {
    super(FlatCompatRuleTester._flatCompat(testerConfig));
  }

  run(ruleName, rule, tests) {
    super.run(ruleName, withLegacyContext(rule), {
      valid: tests.valid.map((test) => FlatCompatRuleTester._flatCompat(test)),
      invalid: tests.invalid.map((test) => FlatCompatRuleTester._flatCompat(test)),
    });
  }

  static _flatCompat(config) {
    if (!config || typeof config === "string") {
      return config;
    }

    const flatConfig = {
      ...config,
      languageOptions: { ...(config.languageOptions ?? {}), parserOptions: {} },
    };

    for (const [key, value] of Object.entries(config)) {
      if (key === "parser") {
        flatConfig.languageOptions.parser = typeof value === "string" ? require(value) : value;
        delete flatConfig.parser;

        continue;
      }

      if (key === "parserOptions") {
        for (const [option, val] of Object.entries(value)) {
          if (option === "ecmaVersion" || option === "sourceType") {
            flatConfig.languageOptions[option] = val;

            continue;
          }

          flatConfig.languageOptions.parserOptions[option] = val;
        }

        delete flatConfig.parserOptions;
        continue;
      }
    }

    if (Object.keys(flatConfig.languageOptions.parserOptions).length === 0) {
      delete flatConfig.languageOptions.parserOptions;
    }

    return flatConfig;
  }
}
