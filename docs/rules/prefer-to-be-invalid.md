# jest-dom/prefer-to-be-invalid

📝 Prefer toBeInvalid over manual validity assertions.

💼 This rule is enabled in the 🌐 `all` config.

<!-- end auto-generated rule header -->

## Rule Details

This rule reports manual invalidity assertions and prefers the semantic
`toBeInvalid()` matcher from `jest-dom`.

Examples of **incorrect** code for this rule:

```js
expect(input).toHaveAttribute("aria-invalid", "true");
expect(input.checkValidity()).toBe(false);
expect(input.checkValidity()).toEqual(false);
expect(input.checkValidity()).toStrictEqual(false);
```

Examples of **correct** code for this rule:

```js
expect(input).toBeInvalid();
expect(input).toHaveAttribute("aria-invalid");
expect(input).not.toHaveAttribute("aria-invalid", "true");
```

## When Not To Use It

Don't use this rule if you:

- don't use `jest-dom`
- want to allow manual invalidity assertions

## Further reading

- [toBeInvalid](https://github.com/testing-library/jest-dom#tobeinvalid)
- [checkValidity](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/checkValidity)
