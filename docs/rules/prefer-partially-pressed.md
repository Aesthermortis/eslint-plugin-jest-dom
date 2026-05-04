# jest-dom/prefer-partially-pressed

📝 Prefer toBePartiallyPressed over checking aria-pressed="mixed".

💼 This rule is enabled in the 🌐 `all` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule reports manual `aria-pressed="mixed"` assertions and prefers the
semantic `toBePartiallyPressed()` matcher from `jest-dom`.

Examples of **incorrect** code for this rule:

```js
expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "mixed");
expect(screen.getByRole("button")).toHaveProperty("aria-pressed", "mixed");
```

Examples of **correct** code for this rule:

```js
expect(screen.getByRole("button")).toBePartiallyPressed();
expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
expect(screen.getByRole("button")).not.toHaveAttribute("aria-pressed", "mixed");
```

## When Not To Use It

Don't use this rule if you:

- don't use `jest-dom`
- want to allow manual `aria-pressed="mixed"` assertions

## Further reading

- [toBePartiallyPressed](https://github.com/testing-library/jest-dom#tobepartiallypressed)
