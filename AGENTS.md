# ESLint Plugin Maintenance Rules

This repository is an ESM-only ESLint plugin targeting modern Node.js and ESLint 10.

Do not introduce CommonJS compatibility code unless explicitly requested.
Do not copy CommonJS examples from ESLint documentation into this repository.

## Module System

Use ESM exclusively.

Allowed:

```js
import plugin from "./src/index.js";

export default plugin;
```

Forbidden:

```js
const plugin = require("./src/index.js");

module.exports = plugin;
```

Also forbidden:

```js
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
```

Use dynamic `import()` for optional runtime loading.

## Optional Peer Dependencies

If a package is declared as an optional peer dependency, do not import it statically.

Incorrect:

```js
import { queries } from "@testing-library/dom";
```

Correct:

```js
const loadTestingLibraryDom = async () => import("@testing-library/dom");
```

If the optional peer is missing, handle only the expected ESM loader error and rethrow all other errors.

```js
const isOptionalPeerMissing = (error) =>
  error instanceof Error && "code" in error && error.code === "ERR_MODULE_NOT_FOUND";
```

Do not use `MODULE_NOT_FOUND` for ESM dynamic imports. That code belongs to CommonJS `require()` paths.

## Rule Module Shape

Each rule module must export a complete ESLint rule object.

Preferred shape:

```js
export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer a more specific matcher",
      recommended: false,
    },
    fixable: "code",
    schema: [],
    messages: {
      preferSpecificMatcher: "Prefer {{ matcher }} instead.",
    },
  },

  create(context) {
    return {};
  },
};
```

Do not export raw `create()` functions as rules.

Incorrect:

```js
export default function create(context) {
  return {};
}
```

## `meta.type`

Always assign `meta.type` deliberately.

Allowed values:

- `"problem"`
- `"suggestion"`
- `"layout"`

Use `"problem"` when the rule reports code that is likely incorrect, unsafe, deprecated, semantically broken, misleading, or capable of producing false positives or false negatives.

Use `"suggestion"` when the rule recommends clearer, more idiomatic, more specific, or more maintainable code while the current code still works.

Use `"layout"` only for formatting-only rules involving whitespace, commas, semicolons, parentheses, or visual structure.

Do not use `"suggestion"` as a blind default.

For matcher-preference rules, `"suggestion"` is usually correct.

For invalid matcher usage, deprecated APIs, unsafe test behavior, or misleading assertions, use `"problem"`.

## `meta.schema`

Every rule must define `meta.schema`.

Rules with no options must use:

```js
schema: [],
```

Rules with options must use a real JSON Schema definition.

Do not use:

```js
schema: false;
```

Do not omit `schema`.

ESLint validates rule options through `meta.schema`; an empty array means the rule accepts no options.

## `meta.docs`

Each rule must include `meta.docs.description`.

Use concise, action-oriented descriptions.

Good:

```js
docs: {
  description: "Prefer toHaveTextContent over textContent assertions",
  recommended: false,
}
```

Bad:

```js
docs: {
  description: "Checks stuff",
}
```

## `meta.fixable`

Only set `meta.fixable` when the rule actually provides a fixer.

Allowed values:

```js
fixable: "code";
fixable: "whitespace";
```

Do not set `fixable` preemptively.

If a report uses `fix(fixer)`, `meta.fixable` must be present.

If the rule has no fixer, omit `fixable`.

## `meta.hasSuggestions`

Set `meta.hasSuggestions: true` only when the rule reports suggestions through `suggest`.

Do not confuse `meta.type: "suggestion"` with `meta.hasSuggestions`.

A rule can have:

```js
type: "problem",
hasSuggestions: true
```

or:

```js
type: "suggestion",
fixable: "code"
```

depending on behavior.

## Messages

Use `meta.messages`.

Avoid inline string literals inside `context.report()`.

Preferred:

```js
context.report({
  node,
  messageId: "preferSpecificMatcher",
  data: {
    matcher: "toHaveTextContent",
  },
});
```

Avoid:

```js
context.report({
  node,
  message: "Prefer toHaveTextContent.",
});
```

## Type Safety

Do not allow unsafe `any` values to cross module boundaries.

Avoid APIs typed as `any`, especially:

- `require()`
- untyped dynamic loaders
- untyped plugin maps
- untyped rule maps
- untyped config objects

When dynamic imports are necessary, define the expected module shape:

```js
/** @typedef {{ queries: Record<string, unknown> }} TestingLibraryDomModule */
```

Then type the loader:

```js
/** @returns {Promise<TestingLibraryDomModule>} */
const loadTestingLibraryDom = async () => import("@testing-library/dom");
```

## Plugin Entry Point

The plugin entry point must be ESM.

Preferred:

```js
const plugin = {
  meta: {
    name: "eslint-plugin-example",
    version: "1.0.0",
  },
  rules,
  configs,
};

export default plugin;
```

Do not use CommonJS exports.

## Configs

Use flat config style.

Preferred:

```js
export const recommended = [
  {
    plugins: {
      "plugin-name": plugin,
    },
    rules: {
      "plugin-name/rule-name": "error",
    },
  },
];
```

Avoid eslintrc-only patterns unless explicitly needed.

## Documentation Warning

ESLint documentation may show both ESM and CommonJS examples.

For this repository, always translate examples to ESM.

If an official example uses:

```js
module.exports = rule;
```

use:

```js
export default rule;
```

If an official example uses:

```js
const plugin = require("eslint-plugin-example");
```

use:

```js
import plugin from "eslint-plugin-example";
```

Never introduce CommonJS solely because an official documentation example uses it.

## Maintenance Policy

When editing rules:

1. Inspect the actual rule behavior.
2. Assign `meta.type` according to semantics.
3. Add or preserve `schema`.
4. Preserve behavior unless the task explicitly asks for behavior changes.
5. Do not refactor unrelated code.
6. Do not add CommonJS compatibility.
7. Do not add legacy Node compatibility.
8. Run lint and tests after changes.

## Commit Policy

Use Conventional Commits.

Examples:

```txt
refactor(rules): add rule metadata schemas
```

```txt
fix(queries): handle missing optional peer import
```

```txt
refactor(plugin): type rule exports
```

Avoid vague subjects such as:

```txt
update rules
fix lint
changes
```
