# jest-dom/prefer-to-appear-before

📝 Prefer toAppearBefore over manual DOM order assertions.

💼 This rule is enabled in the 🌐 `all` config.

<!-- end auto-generated rule header -->

## Rule Details

This rule reports manual `compareDocumentPosition()` assertions that check
whether an element appears before another element in the DOM tree, and prefers
the semantic `toAppearBefore()` matcher from `jest-dom`.

Examples of **incorrect** code for this rule:

```js
expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
```

Examples of **correct** code for this rule:

```js
expect(first).toAppearBefore(second);
expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeFalsy();
```

## When Not To Use It

Don't use this rule if you:

- don't use `jest-dom`
- want to allow manual DOM order assertions

## Further reading

- [toAppearBefore](https://github.com/testing-library/jest-dom#toappearbefore)
- [compareDocumentPosition](https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition)
