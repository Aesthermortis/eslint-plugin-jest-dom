# jest-dom/prefer-to-have-role

📝 Prefer toHaveRole over checking role attributes manually.

💼 This rule is enabled in the 🌐 `all` config.

<!-- end auto-generated rule header -->

## Rule Details

This rule reports manual role attribute assertions and prefers the semantic
`toHaveRole()` matcher from `jest-dom`.

Examples of **incorrect** code for this rule:

```js
expect(element).toHaveAttribute("role", "button");
expect(element.getAttribute("role")).toBe("button");
expect(element.getAttribute("role")).toEqual("switch");
expect(element.getAttribute("role")).toStrictEqual("checkbox");
```

Examples of **correct** code for this rule:

```js
expect(element).toHaveRole("button");
expect(element).toHaveAttribute("role");
expect(element).toHaveAttribute("role", role);
expect(element).toHaveAttribute("role", "button switch");
expect(element).not.toHaveAttribute("role", "button");
expect(screen.getByRole("button")).toHaveAttribute("role", "button");
```

## When Not To Use It

Don't use this rule if you:

- don't use `jest-dom`
- want to allow manual role attribute assertions

## Further reading

- [toHaveRole](https://github.com/testing-library/jest-dom#tohaverole)
