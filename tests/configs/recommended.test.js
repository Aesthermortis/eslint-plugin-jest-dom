import { ESLint } from "eslint";
import recommendedRules from "../../src/configs/recommended.js";
import plugin from "../../src/index.js";

const lintRecommendedFixture = async () => {
  const eslint = new ESLint({
    overrideConfig: [
      {
        plugins: { "jest-dom": plugin },
        rules: recommendedRules,
      },
    ],
    overrideConfigFile: true,
  });
  const [result] = await eslint.lintFiles(["tests/fixtures/recommended-smoke.js"]);

  return result.messages.map(({ ruleId }) => ruleId);
};

it("enables the expected recommended rules", () => {
  expect(recommendedRules).toStrictEqual({
    "jest-dom/prefer-checked": "error",
    "jest-dom/prefer-empty": "error",
    "jest-dom/prefer-enabled-disabled": "error",
    "jest-dom/prefer-focus": "error",
    "jest-dom/prefer-in-document": "error",
    "jest-dom/prefer-required": "error",
    "jest-dom/prefer-to-have-attribute": "error",
    "jest-dom/prefer-to-have-class": "error",
    "jest-dom/prefer-to-have-style": "error",
    "jest-dom/prefer-to-have-text-content": "error",
    "jest-dom/prefer-to-have-value": "error",
  });
});

it("reports recommended rules without enabling opt-in rules", async () => {
  await expect(lintRecommendedFixture()).resolves.toStrictEqual([
    "jest-dom/prefer-to-have-text-content",
  ]);
});
