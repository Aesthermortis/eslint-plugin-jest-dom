# jest-dom/prefer-to-have-accessible-description

📝 Prefer toHaveAccessibleDescription over checking aria-description manually.

💼 This rule is enabled in the 🌐 `all` config.

<!-- end auto-generated rule header -->

## Rule Details

This rule reports literal `aria-description` assertions and prefers the semantic
`toHaveAccessibleDescription()` matcher from `jest-dom`.

This rule only reports literal `aria-description` assertions. Other accessible
description sources such as `aria-describedby` and `title` are left unchanged
because accessible description computation is semantic.

Examples of **incorrect** code for this rule:

```js
expect(element).toHaveAttribute("aria-description", "Help text");
expect(element.getAttribute("aria-description")).toBe("Help text");
expect(element.getAttribute("aria-description")).toEqual("Help text");
expect(element.getAttribute("aria-description")).toStrictEqual("Help text");
```

Examples of **correct** code for this rule:

```js
expect(element).toHaveAccessibleDescription("Help text");
```

## When Not To Use It

Don't use this rule if you:

- don't use `jest-dom`
- want to allow manual `aria-description` assertions

## Further reading

- [toHaveAccessibleDescription](https://github.com/testing-library/jest-dom#tohaveaccessibledescription)
