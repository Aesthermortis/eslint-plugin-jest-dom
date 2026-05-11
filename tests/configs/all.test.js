import { ESLint } from "eslint";
import allRules from "../../src/configs/all.js";
import plugin from "../../src/index.js";
import rules from "../../src/rules/index.js";

const lintAllRulesFixture = async () => {
  const eslint = new ESLint({
    overrideConfig: [
      {
        plugins: { "jest-dom": plugin },
        rules: allRules,
      },
    ],
    overrideConfigFile: true,
  });
  const [result] = await eslint.lintFiles(["tests/fixtures/all-rules-smoke.js"]);

  return result.messages.map(({ ruleId }) => ruleId);
};

it("enables every non-deprecated rule", () => {
  const enabledRules = Object.fromEntries(
    Object.entries(rules)
      .filter(([, rule]) => !rule.meta?.deprecated)
      .map(([ruleName]) => [`jest-dom/${ruleName}`, "error"]),
  );

  expect(allRules).toStrictEqual(enabledRules);
});

it("reports recommended and opt-in rules", async () => {
  await expect(lintAllRulesFixture()).resolves.toStrictEqual([
    "jest-dom/prefer-to-have-text-content",
    "jest-dom/prefer-to-be-valid",
  ]);
});
