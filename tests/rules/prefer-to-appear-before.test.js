import { RuleTester } from "eslint";
import * as rule from "../../src/rules/prefer-to-appear-before.js";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2015, sourceType: "module" },
});

const error = {
  message: "Prefer toAppearBefore() over manual compareDocumentPosition assertions.",
};

ruleTester.run("prefer-to-appear-before", rule, {
  valid: [
    `expect(first).toAppearBefore(second)`,
    `expect(first.compareDocumentPosition(second)).not.toBe(Node.DOCUMENT_POSITION_FOLLOWING)`,
    `expect(first.compareDocumentPosition(second)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)`,
    `expect(first.compareDocumentPosition(second)).toEqual(Node.DOCUMENT_POSITION_FOLLOWING)`,
    `expect(first.compareDocumentPosition(second)).toStrictEqual(Node.DOCUMENT_POSITION_FOLLOWING)`,
    `expect(first.compareDocumentPosition(second)).toBe(Node.DOCUMENT_POSITION_PRECEDING)`,
    `expect(first.compareDocumentPosition(second)).toBe(4)`,
    `expect(first.compareDocumentPosition(second)).toBe(position)`,
    `expect(first.compareDocumentPosition(second)).toBeTruthy()`,
    `expect(first.compareDocumentPosition(second)).toBe(window.Node.DOCUMENT_POSITION_FOLLOWING)`,
    `expect(first.compareDocumentPosition(second)).toContain(Node.DOCUMENT_POSITION_FOLLOWING)`,
    `expect(first.compareDocumentPosition(second) & window.Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()`,
    `expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(false)`,
    `expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeFalsy()`,
    `expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy(extra)`,
    `expect(first.compareDocumentPosition(second) & someFlag).toBeTruthy()`,
    `expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_CONTAINED_BY).toBeTruthy()`,
    `expect(first.compareDocumentPosition()).toBe(Node.DOCUMENT_POSITION_FOLLOWING)`,
    `expect(first.compareDocumentPosition(second, extra)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)`,
    `expect(first[compareDocumentPosition](second)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)`,
    `expect(first["compareDocumentPosition"](second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()`,
    `expect(first.contains(second)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)`,
    `expect().toBe(Node.DOCUMENT_POSITION_FOLLOWING)`,
  ],
  invalid: [
    {
      code: `expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()`,
      errors: [error],
      output: null,
    },
    {
      code: `expect(Node.DOCUMENT_POSITION_FOLLOWING & first.compareDocumentPosition(second)).toBeTruthy()`,
      errors: [error],
      output: null,
    },
  ],
});
