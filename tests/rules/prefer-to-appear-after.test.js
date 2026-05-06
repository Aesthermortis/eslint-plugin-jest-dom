import { RuleTester } from "eslint";
import * as rule from "../../src/rules/prefer-to-appear-after.js";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2015, sourceType: "module" },
});

const error = {
  message: "Prefer toAppearAfter() over manual compareDocumentPosition assertions.",
};

ruleTester.run("prefer-to-appear-after", rule, {
  valid: [
    `expect(first).toAppearAfter(second)`,
    `expect(first.compareDocumentPosition(second)).not.toBe(Node.DOCUMENT_POSITION_PRECEDING)`,
    `expect(first.compareDocumentPosition(second)).toBe(Node.DOCUMENT_POSITION_PRECEDING)`,
    `expect(first.compareDocumentPosition(second)).toEqual(Node.DOCUMENT_POSITION_PRECEDING)`,
    `expect(first.compareDocumentPosition(second)).toStrictEqual(Node.DOCUMENT_POSITION_PRECEDING)`,
    `expect(first.compareDocumentPosition(second)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)`,
    `expect(first.compareDocumentPosition(second)).toBe(2)`,
    `expect(first.compareDocumentPosition(second)).toBe(position)`,
    `expect(first.compareDocumentPosition(second)).toBeTruthy()`,
    `expect(first.compareDocumentPosition(second)).toBe(window.Node.DOCUMENT_POSITION_PRECEDING)`,
    `expect(first.compareDocumentPosition(second)).toContain(Node.DOCUMENT_POSITION_PRECEDING)`,
    `expect(first.compareDocumentPosition(second) & window.Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()`,
    `expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_PRECEDING).toBe(false)`,
    `expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_PRECEDING).toBeFalsy()`,
    `expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy(extra)`,
    `expect(first.compareDocumentPosition(second) & someFlag).toBeTruthy()`,
    `expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_CONTAINS).toBeTruthy()`,
    `expect(first.compareDocumentPosition()).toBe(Node.DOCUMENT_POSITION_PRECEDING)`,
    `expect(first.compareDocumentPosition(second, extra)).toBe(Node.DOCUMENT_POSITION_PRECEDING)`,
    `expect(first[compareDocumentPosition](second)).toBe(Node.DOCUMENT_POSITION_PRECEDING)`,
    `expect(first["compareDocumentPosition"](second) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()`,
    `expect(first.contains(second)).toBe(Node.DOCUMENT_POSITION_PRECEDING)`,
    `expect().toBe(Node.DOCUMENT_POSITION_PRECEDING)`,
  ],
  invalid: [
    {
      code: `expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(Node.DOCUMENT_POSITION_PRECEDING & first.compareDocumentPosition(second)).toBeTruthy()`,
      errors: [error],
      output: null,
    },
  ],
});
