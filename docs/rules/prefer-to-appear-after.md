# jest-dom/prefer-to-appear-after

📝 Prefer toAppearAfter over manual DOM order assertions.

💼 This rule is enabled in the 🌐 `all` config.

<!-- end auto-generated rule header -->

## Rule Details

This rule reports manual `compareDocumentPosition()` assertions that check
whether an element appears after another element in the DOM tree, and prefers
the semantic `toAppearAfter()` matcher from `jest-dom`.

Examples of **incorrect** code for this rule:

```js
expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
```

Examples of **correct** code for this rule:

```js
expect(first).toAppearAfter(second);
expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_PRECEDING).toBeFalsy();
```

## When Not To Use It

Don't use this rule if you:

- don't use `jest-dom`
- want to allow manual DOM order assertions

## Further reading

- [toAppearAfter](https://github.com/testing-library/jest-dom#toappearafter)
- [compareDocumentPosition](https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition)
