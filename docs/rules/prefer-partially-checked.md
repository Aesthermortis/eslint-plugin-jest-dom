# jest-dom/prefer-partially-checked

📝 Prefer toBePartiallyChecked over checking aria-checked="mixed".

💼 This rule is enabled in the 🌐 `all` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule reports manual `aria-checked="mixed"` assertions and prefers the
semantic `toBePartiallyChecked()` matcher from `jest-dom`.

Examples of **incorrect** code for this rule:

```js
expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed");
expect(screen.getByRole("checkbox")).toHaveProperty("aria-checked", "mixed");
```

Examples of **correct** code for this rule:

```js
expect(screen.getByRole("checkbox")).toBePartiallyChecked();
expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
expect(screen.getByRole("checkbox")).not.toHaveAttribute("aria-checked", "mixed");
```

## When Not To Use It

Don't use this rule if you:

- don't use `jest-dom`
- want to allow manual `aria-checked="mixed"` assertions

## Further reading

- [toBePartiallyChecked](https://github.com/testing-library/jest-dom#tobepartiallychecked)
