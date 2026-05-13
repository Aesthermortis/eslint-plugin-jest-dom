# ESLint Plugin Maintenance Guide

This guide defines the maintenance contract for modern ESM-only ESLint plugins.

It is intended for maintainers and automated coding agents working on this repository.

## Repository Contract

This repository targets:

- ESM-only module syntax
- modern Node.js
- ESLint 10
- flat config-first usage
- typed rule modules
- explicit rule metadata
- no CommonJS compatibility layer
- no legacy Node compatibility layer

The repository should not accumulate compatibility branches unless they are explicitly required by the current package contract.

## Core Principles

### ESM-only

Use native ESM syntax everywhere:

```js
import rules from "./rules/index.js";

export default {
  rules,
};
```

Do not use:

```js
const rules = require("./rules");

module.exports = {
  rules,
};
```

Do not introduce `createRequire()` as a shortcut unless the task explicitly requires interop with a CommonJS-only package.

### Optional dependency handling

A dependency declared through `peerDependenciesMeta.optional` must not be imported statically.

Static imports make the peer mandatory at module evaluation time.

Incorrect:

```js
import { queries } from "@testing-library/dom";
```

Correct:

```js
const loadTestingLibraryDom = async () => import("@testing-library/dom");
```

For optional ESM imports, catch only the expected missing-module error:

```js
const isOptionalPeerMissing = (error) =>
  error instanceof Error && "code" in error && error.code === "ERR_MODULE_NOT_FOUND";
```

Rethrow every other error.

Do not use `MODULE_NOT_FOUND` for ESM dynamic imports. That is associated with CommonJS `require()` resolution.

## Rule Metadata

Every rule must define complete and intentional metadata.

### Required fields

At minimum, each rule should define:

```js
meta: {
  type: "suggestion",
  docs: {
    description: "Prefer a more specific matcher",
    recommended: false,
  },
  schema: [],
  messages: {
    preferSpecificMatcher: "Prefer {{ matcher }} instead.",
  },
}
```

### `meta.type`

Allowed values:

- `"problem"`
- `"suggestion"`
- `"layout"`

Use `"problem"` when the rule detects code that can be incorrect, unsafe, deprecated, semantically broken, misleading, or likely to cause false positives or false negatives.

Use `"suggestion"` when the rule recommends clearer, more idiomatic, more specific, or more maintainable code while the current code still works.

Use `"layout"` only for formatting-only rules.

Do not assign `"suggestion"` blindly. Inspect the rule behavior first.

Common classification policy:

| Rule behavior                           | `meta.type`    |
| --------------------------------------- | -------------- |
| Prefer a more specific matcher          | `"suggestion"` |
| Prefer a clearer assertion              | `"suggestion"` |
| Detect invalid API usage                | `"problem"`    |
| Detect deprecated API usage             | `"problem"`    |
| Detect misleading test behavior         | `"problem"`    |
| Enforce whitespace or visual formatting | `"layout"`     |

### `meta.schema`

Every rule must define `meta.schema`.

Rules with no options:

```js
schema: [],
```

Rules with options must define a JSON Schema shape.

Do not use:

```js
schema: false;
```

Do not omit `schema`.

### `meta.docs`

Every rule must include `meta.docs.description`.

Descriptions should be concise, specific, and action-oriented.

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
  description: "Checks tests",
}
```

### `meta.fixable`

Only define `meta.fixable` when the rule actually provides a fixer.

Use:

```js
fixable: "code";
```

for semantic code rewrites.

Use:

```js
fixable: "whitespace";
```

only for whitespace-only fixes.

If the rule has no fixer, omit `fixable`.

### `meta.hasSuggestions`

Use `meta.hasSuggestions: true` only when the rule reports suggestions through `suggest`.

Do not confuse this with `meta.type: "suggestion"`.

These are different concepts:

```js
meta: {
  type: "problem",
  hasSuggestions: true,
}
```

means the rule detects a likely problem but offers suggestions.

```js
meta: {
  type: "suggestion",
  fixable: "code",
}
```

means the rule recommends a better style or idiom and can fix it.

## Rule Structure

Each rule module should export a full rule object.

Preferred:

```js
export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer a specific matcher",
      recommended: false,
    },
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

Avoid exporting raw `create()` functions:

```js
export default function create(context) {
  return {};
}
```

## Reports and Messages

Prefer `messageId` over inline message strings.

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

This keeps messages centralized, testable, and easier to refactor.

## Type Safety

Avoid unsafe `any` at module boundaries.

Common sources of unsafe `any`:

- `require()`
- untyped dynamic loaders
- untyped plugin maps
- untyped rule maps
- untyped config maps
- untyped test helpers

When loading modules dynamically, define the expected module shape:

```js
/** @typedef {{ queries: Record<string, unknown> }} TestingLibraryDomModule */
```

Then type the loader:

```js
/** @returns {Promise<TestingLibraryDomModule>} */
const loadTestingLibraryDom = async () => import("@testing-library/dom");
```

## Plugin Entry Point

The plugin entry point should expose a stable ESM default export.

Preferred:

```js
import rules from "./rules/index.js";
import configs from "./configs/index.js";

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

If the plugin exports named configs or helpers, keep those exports ESM-native:

```js
export { rules };
export { configs };
export default plugin;
```

Do not add CommonJS mirrors.

## Configs

Prefer flat config patterns.

Example:

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

Avoid eslintrc-only examples unless the package explicitly supports eslintrc.

## Automated Agent Instructions

When using Codex or another coding agent, give it this contract:

```txt
Audit this ESLint plugin as an ESM-only modern ESLint 10 plugin.

Repository contract:
- ESM only.
- No CommonJS.
- No require().
- No module.exports.
- No createRequire().
- No legacy Node compatibility.
- Prefer flat config patterns.
- Do not copy CommonJS examples from ESLint documentation.

Tasks:
1. Inspect all rule modules.
2. Ensure every rule exports a complete rule object with meta and create.
3. Ensure every rule has meta.type.
4. Assign meta.type semantically:
   - "problem" for invalid, unsafe, deprecated, misleading, or semantically broken code.
   - "suggestion" for clearer, more idiomatic, more specific, or more maintainable code.
   - "layout" only for formatting-only rules.
5. Ensure every rule has meta.schema.
   - Use schema: [] for rules with no options.
   - Use JSON Schema for rules with options.
   - Do not use schema: false.
6. Ensure every rule uses meta.messages and messageId.
7. Ensure meta.fixable is present only when the rule provides a fixer.
8. Ensure meta.hasSuggestions is present only when the rule provides suggestions.
9. Type plugin indexes, rule maps, configs, and dynamic imports without unsafe any.
10. Preserve behavior unless a change is required to satisfy the metadata contract.
11. Do not refactor unrelated code.

Expected output:
- Files changed.
- Rules audited.
- meta.type assigned per rule.
- Any rule marked as "problem" must include a short justification.
- Confirmation that no CommonJS code was introduced.
- Confirmation that lint and tests pass.
```

## Review Checklist

Before merging changes to rules or plugin entry points, verify:

- [ ] No `require()` was introduced.
- [ ] No `module.exports` was introduced.
- [ ] No `createRequire()` was introduced.
- [ ] Optional peers are loaded with dynamic `import()`.
- [ ] Every rule has `meta.type`.
- [ ] Every rule has `meta.schema`.
- [ ] Rules without options use `schema: []`.
- [ ] Rules with options use JSON Schema.
- [ ] Every rule uses `meta.messages`.
- [ ] `meta.fixable` only appears when a fixer exists.
- [ ] `meta.hasSuggestions` only appears when suggestions exist.
- [ ] Rule behavior was preserved unless intentionally changed.
- [ ] Lint passes.
- [ ] Tests pass.

## Commit Examples

```txt
refactor(rules): add rule metadata schemas

Add explicit meta.schema declarations to rules without options and
classify rule meta.type values according to ESLint semantics.

No behavior change.
```

```txt
refactor(queries): replace require with dynamic import

Load the optional @testing-library/dom peer through ESM dynamic import
instead of createRequire.

This preserves optional peer behavior while removing the CommonJS loader
path and unsafe require return type.
```

```txt
docs: add ESLint plugin maintenance guide

Document the ESM-only maintenance contract for rule modules, plugin
entry points, metadata, schemas, optional peers, and type safety.
```
