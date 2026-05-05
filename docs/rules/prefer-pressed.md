# jest-dom/prefer-pressed

📝 Prefer toBePressed over checking aria-pressed manually.

💼 This rule is enabled in the 🌐 `all` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule reports manual `aria-pressed="true"` and `aria-pressed="false"`
assertions and prefers the semantic `toBePressed()` matcher from `jest-dom`.

Examples of **incorrect** code for this rule:

```js
expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
expect(screen.getByRole("button")).toHaveProperty("aria-pressed", "true");
expect(screen.getByRole("button")).toHaveProperty("aria-pressed", "false");
```

Examples of **correct** code for this rule:

```js
expect(screen.getByRole("button")).toBePressed();
expect(screen.getByRole("button")).not.toBePressed();
expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "mixed");
expect(screen.getByRole("button")).not.toHaveAttribute("aria-pressed", "true");
```

## When Not To Use It

Don't use this rule if you:

- don't use `jest-dom`
- want to allow manual `aria-pressed` assertions

## Further reading

- [toBePressed](https://github.com/testing-library/jest-dom#tobepressed)
