# jest-dom/prefer-to-contain-element

📝 Prefer toContainElement over manual contains assertions.

💼 This rule is enabled in the 🌐 `all` config.

<!-- end auto-generated rule header -->

## Rule Details

This rule reports manual `contains()` assertions and prefers the semantic
`toContainElement()` matcher from `jest-dom`.

This rule only reports positive `contains(...)` assertions against the literal
`true`. Negative containment checks are left unchanged.

Examples of **incorrect** code for this rule:

```js
expect(parent.contains(child)).toBe(true);
expect(parent.contains(child)).toEqual(true);
expect(parent.contains(child)).toStrictEqual(true);
```

Examples of **correct** code for this rule:

```js
expect(parent).toContainElement(child);
expect(parent).not.toContainElement(child);
```

## When Not To Use It

Don't use this rule if you:

- don't use `jest-dom`
- want to allow manual `contains()` assertions

## Further reading

- [toContainElement](https://github.com/testing-library/jest-dom#tocontainelement)
- [contains](https://developer.mozilla.org/en-US/docs/Web/API/Node/contains)
