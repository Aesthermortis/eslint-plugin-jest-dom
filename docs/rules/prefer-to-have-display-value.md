# jest-dom/prefer-to-have-display-value

📝 Prefer toHaveDisplayValue over manual value assertions.

💼 This rule is enabled in the 🌐 `all` config.

<!-- end auto-generated rule header -->

## Rule Details

This rule reports literal `.value` equality assertions and prefers the semantic
`toHaveDisplayValue()` matcher from `jest-dom`.

This rule only reports literal `.value` equality assertions. Dynamic expected
values and obvious select variables are left unchanged because select display
values can differ from raw element values.

Examples of **incorrect** code for this rule:

```js
expect(input.value).toBe("hello");
expect(input.value).toEqual("hello");
expect(input.value).toStrictEqual("hello");
```

Examples of **correct** code for this rule:

```js
expect(input).toHaveDisplayValue("hello");
```

## When Not To Use It

Don't use this rule if you:

- don't use `jest-dom`
- want to allow manual `.value` assertions

## Further reading

- [toHaveDisplayValue](https://github.com/testing-library/jest-dom#tohavedisplayvalue)
