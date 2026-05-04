import { createRequire } from "node:module";
import { RuleTester } from "eslint";

const require = createRequire(import.meta.url);

/**
 * Loads a legacy RuleTester parser config value.
 *
 * @param {string | object} parser - Parser package name or parser object.
 * @returns {object} Parser object for flat config.
 */
function loadParser(parser) {
  if (typeof parser !== "string") {
    return parser;
  }

  // Legacy RuleTester configs can identify parsers by package name.
  // eslint-disable-next-line security/detect-non-literal-require
  return require(parser);
}

/**
 * Moves a legacy parser value into flat config language options.
 *
 * @param {object} flatConfig - Flat config being normalized.
 * @param {string | object} parser - Parser package name or parser object.
 * @returns {void}
 */
function applyParser(flatConfig, parser) {
  flatConfig.languageOptions.parser = loadParser(parser);
  delete flatConfig.parser;
}

/**
 * Moves legacy parser options into their flat config locations.
 *
 * @param {object} flatConfig - Flat config being normalized.
 * @param {object} parserOptions - Legacy parser options.
 * @returns {void}
 */
function applyParserOptions(flatConfig, parserOptions) {
  const parserOptionEntries = [];

  for (const [option, value] of Object.entries(parserOptions)) {
    switch (option) {
      case "ecmaVersion": {
        flatConfig.languageOptions.ecmaVersion = value;
        break;
      }
      case "sourceType": {
        flatConfig.languageOptions.sourceType = value;
        break;
      }
      default: {
        parserOptionEntries.push([option, value]);
      }
    }
  }

  if (parserOptionEntries.length > 0) {
    flatConfig.languageOptions.parserOptions = Object.fromEntries(parserOptionEntries);
  }

  delete flatConfig.parserOptions;
}

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
      languageOptions: { ...config.languageOptions },
    };

    for (const [key, value] of Object.entries(config)) {
      if (key === "parser") {
        applyParser(flatConfig, value);
        continue;
      }

      if (key === "parserOptions") {
        applyParserOptions(flatConfig, value);
      }
    }

    return flatConfig;
  }
}
