# jest-dom/prefer-to-have-selection

📝 Prefer toHaveSelection over checking selection manually.

💼 This rule is enabled in the 🌐 `all` config.

<!-- end auto-generated rule header -->

## Rule Details

This rule reports manual selection assertions and prefers the semantic
`toHaveSelection()` matcher from `jest-dom`.

Examples of **incorrect** code for this rule:

```js
expect(input.selectionStart).toBe(0);
expect(input.selectionEnd).toEqual(5);
expect(input.value.slice(input.selectionStart, input.selectionEnd)).toBe("hello");
expect(input.value.substring(input.selectionStart, input.selectionEnd)).toBe("hello");
```

Examples of **correct** code for this rule:

```js
expect(input).toHaveSelection("hello");
expect(input.selectionStart).not.toBe(0);
expect(input.value.slice(other.selectionStart, input.selectionEnd)).toBe("hello");
expect(document.getSelection().toString()).toBe("hello");
```

## When Not To Use It

Don't use this rule if you:

- don't use `jest-dom`
- want to allow manual selection range assertions

## Further reading

- [toHaveSelection](https://github.com/testing-library/jest-dom#tohaveselection)
