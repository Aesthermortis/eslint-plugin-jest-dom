# jest-dom/prefer-to-have-accessible-error-message

📝 Prefer toHaveAccessibleErrorMessage over checking aria-errormessage manually.

💼 This rule is enabled in the 🌐 `all` config.

<!-- end auto-generated rule header -->

## Rule Details

This rule reports manual `aria-errormessage` assertions and prefers the semantic
`toHaveAccessibleErrorMessage()` matcher from `jest-dom`.

`aria-errormessage` stores an element ID, while `toHaveAccessibleErrorMessage()`
asserts the resolved accessible error message text. For that reason this rule
does not provide an autofix.

Examples of **incorrect** code for this rule:

```js
expect(input).toHaveAttribute("aria-errormessage", "error-id");
expect(input.getAttribute("aria-errormessage")).toBe("error-id");
expect(input.getAttribute("aria-errormessage")).toEqual("error-id");
expect(input.getAttribute("aria-errormessage")).toStrictEqual("error-id");
```

Examples of **correct** code for this rule:

```js
expect(input).toHaveAccessibleErrorMessage("This field is invalid");
expect(input).toHaveAttribute("aria-invalid", "true");
expect(input).toHaveAttribute("aria-describedby", "error-message");
expect(input).not.toHaveAttribute("aria-errormessage", "error-id");
expect(input).toHaveAttribute("aria-errormessage", errorId);
expect(input).toHaveAttribute("aria-errormessage", "error-id id2");
```

## When Not To Use It

Don't use this rule if you:

- don't use `jest-dom`
- want to allow manual `aria-errormessage` assertions

## Further reading

- [toHaveAccessibleErrorMessage](https://github.com/testing-library/jest-dom#tohaveaccessibleerrormessage)
