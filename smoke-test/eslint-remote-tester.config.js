import parser from "@typescript-eslint/parser";
import repositoriesTools from "eslint-remote-tester-repositories";

import jestDom from "../dist/index.js";

const { getPathIgnorePattern, getRepositories } = repositoriesTools;

export default {
  repositories: getRepositories({ randomize: true }),
  pathIgnorePattern: getPathIgnorePattern(),
  extensions: ["js", "jsx", "ts", "tsx"],
  concurrentTasks: 3,
  cache: false,
  logLevel: "info",
  rulesUnderTesting: Object.keys(jestDom.rules).map((ruleName) => `jest-dom/${ruleName}`),
  eslintConfig: [
    {
      files: ["**/*.{js,jsx,ts,tsx}"],
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parser,
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      ...jestDom.configs.all,
    },
  ],
};
