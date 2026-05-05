# jest-dom/prefer-to-be-valid

📝 Prefer toBeValid over manual validity assertions.

💼 This rule is enabled in the 🌐 `all` config.

<!-- end auto-generated rule header -->

## Rule Details

This rule reports manual validity assertions and prefers the semantic
`toBeValid()` matcher from `jest-dom`.

Examples of **incorrect** code for this rule:

```js
expect(input.checkValidity()).toBe(true);
expect(input.checkValidity()).toEqual(true);
expect(input.checkValidity()).toStrictEqual(true);
```

Examples of **correct** code for this rule:

```js
expect(input).toBeValid();
expect(input).not.toHaveAttribute("aria-invalid", "false");
```

## When Not To Use It

Don't use this rule if you:

- don't use `jest-dom`
- want to allow manual validity assertions

## Further reading

- [toBeValid](https://github.com/testing-library/jest-dom#tobevalid)
- [checkValidity](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/checkValidity)
