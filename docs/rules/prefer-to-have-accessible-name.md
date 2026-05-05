# jest-dom/prefer-to-have-accessible-name

📝 Prefer toHaveAccessibleName over checking aria-label manually.

💼 This rule is enabled in the 🌐 `all` config.

<!-- end auto-generated rule header -->

## Rule Details

This rule reports literal `aria-label` assertions and prefers the semantic
`toHaveAccessibleName()` matcher from `jest-dom`.

This rule only reports literal `aria-label` assertions. Other accessible name
sources such as `aria-labelledby`, `alt`, `title`, labels, and text content are
left unchanged because accessible name computation is semantic.

Examples of **incorrect** code for this rule:

```js
expect(element).toHaveAttribute("aria-label", "Save");
expect(element.getAttribute("aria-label")).toBe("Save");
expect(element.getAttribute("aria-label")).toEqual("Save");
expect(element.getAttribute("aria-label")).toStrictEqual("Save");
```

Examples of **correct** code for this rule:

```js
expect(element).toHaveAccessibleName("Save");
```

## When Not To Use It

Don't use this rule if you:

- don't use `jest-dom`
- want to allow manual `aria-label` assertions

## Further reading

- [toHaveAccessibleName](https://github.com/testing-library/jest-dom#tohaveaccessiblename)
