<div align="center">
<h1>eslint-plugin-jest-dom</h1>

<p>ESLint plugin to follow best practices and anticipate common mistakes when writing tests with jest-dom.</p>
</div>

---

[![Build Status][build-badge]][build]
[![MIT License][license-badge]][license]
[![PRs Welcome][prs-badge]][prs]
[![Code of Conduct][coc-badge]][coc]

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [Usage](#usage)
- [Recommended Configuration](#recommended-configuration)
- [Supported Rules](#supported-rules)
- [Issues](#issues)
  - [🐛 Bugs](#-bugs)
  - [💡 Feature Requests](#-feature-requests)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `devDependencies`:

```bash
npm i -D github:Aesthermortis/eslint-plugin-jest-dom
```

This plugin targets `Node.js 24+`, `npm 11+`, and `ESLint 10`.
It also has an optional peer dependency on [`@testing-library/dom`](https://testing-library.com/docs/dom-testing-library/intro/)
to detect the full set of Testing Library queries.

## Usage

Add `jest-dom` to your `eslint.config.js` file:

```javascript
import jestDom from "eslint-plugin-jest-dom";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
    plugins: {
      "jest-dom": jestDom,
    },
    rules: {
      // your configuration
    },
  },
]);
```

Then configure the rules you want to use under the rules section.

```javascript
import jestDom from "eslint-plugin-jest-dom";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
    plugins: {
      "jest-dom": jestDom,
    },
    rules: {
      "jest-dom/prefer-checked": "error",
      "jest-dom/prefer-enabled-disabled": "error",
      "jest-dom/prefer-required": "error",
      "jest-dom/prefer-to-have-attribute": "error",
    },
  },
]);
```

## Recommended Configuration

This plugin exports a recommended configuration that enforces good `jest-dom`
practices _(you can find more info about enabled rules in
[Supported Rules section](#supported-rules))_.

To enable this configuration with `eslint.config.js`, register the plugin and
extend `jest-dom/recommended`:

```javascript
import jestDom from "eslint-plugin-jest-dom";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: [
      /* glob matching your test files */
    ],
    plugins: {
      "jest-dom": jestDom,
    },
    extends: ["jest-dom/recommended"],
  },
]);
```

If you need direct access to the exported config object, it is also available as
`jestDom.configs.recommended`:

```javascript
import jestDom from "eslint-plugin-jest-dom";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: [
      /* glob matching your test files */
    ],
    extends: [jestDom.configs.recommended],
  },
]);
```

## Supported Rules

<!-- begin auto-generated rules list -->

💼 Configurations enabled in.\
✅ Set in the `recommended` configuration.\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

| Name                                                                     | Description                                                           | 💼  | 🔧  | 💡  |
| :----------------------------------------------------------------------- | :-------------------------------------------------------------------- | :-- | :-- | :-- |
| [prefer-checked](docs/rules/prefer-checked.md)                           | prefer toBeChecked over checking attributes                           | ✅  | 🔧  |     |
| [prefer-empty](docs/rules/prefer-empty.md)                               | Prefer toBeEmpty over checking innerHTML                              | ✅  | 🔧  |     |
| [prefer-enabled-disabled](docs/rules/prefer-enabled-disabled.md)         | prefer toBeDisabled or toBeEnabled over checking attributes           | ✅  | 🔧  |     |
| [prefer-focus](docs/rules/prefer-focus.md)                               | prefer toHaveFocus over checking document.activeElement               | ✅  | 🔧  |     |
| [prefer-in-document](docs/rules/prefer-in-document.md)                   | Prefer .toBeInTheDocument() for asserting the existence of a DOM node | ✅  | 🔧  | 💡  |
| [prefer-required](docs/rules/prefer-required.md)                         | prefer toBeRequired over checking properties                          | ✅  | 🔧  |     |
| [prefer-to-have-attribute](docs/rules/prefer-to-have-attribute.md)       | prefer toHaveAttribute over checking getAttribute/hasAttribute        | ✅  | 🔧  |     |
| [prefer-to-have-class](docs/rules/prefer-to-have-class.md)               | prefer toHaveClass over checking element className                    | ✅  | 🔧  |     |
| [prefer-to-have-style](docs/rules/prefer-to-have-style.md)               | prefer toHaveStyle over checking element style                        | ✅  | 🔧  |     |
| [prefer-to-have-text-content](docs/rules/prefer-to-have-text-content.md) | Prefer toHaveTextContent over checking element.textContent            | ✅  | 🔧  |     |
| [prefer-to-have-value](docs/rules/prefer-to-have-value.md)               | prefer toHaveValue over checking element.value                        | ✅  | 🔧  |     |

<!-- end auto-generated rules list -->

## Issues

_Looking to contribute? Look for the [Good First Issue][good-first-issue]
label._

### 🐛 Bugs

Please file an issue for bugs, missing documentation, or unexpected behavior.

[**See Bugs**][bugs]

### 💡 Feature Requests

Please file an issue to suggest new features. Vote on feature requests by adding
a 👍. This helps maintainers prioritize what to work on.

[**See Feature Requests**][requests]

[npm]: https://www.npmjs.com
[node]: https://nodejs.org
[build-badge]: https://img.shields.io/github/actions/workflow/status/Aesthermortis/eslint-plugin-jest-dom/validate.yml?logo=github&style=flat-square
[build]: https://github.com/Aesthermortis/eslint-plugin-jest-dom/actions?query=workflow%3Avalidate
[license-badge]: https://img.shields.io/npm/l/eslint-plugin-jest-dom.svg?style=flat-square
[license]: https://github.com/Aesthermortis/eslint-plugin-jest-dom/blob/main/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/Aesthermortis/eslint-plugin-jest-dom/blob/main/other/CODE_OF_CONDUCT.md
[bugs]: https://github.com/Aesthermortis/eslint-plugin-jest-dom/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Acreated-desc+label%3Abug
[requests]: https://github.com/Aesthermortis/eslint-plugin-jest-dom/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3Aenhancement
[good-first-issue]: https://github.com/Aesthermortis/eslint-plugin-jest-dom/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3Aenhancement+label%3A%22good+first+issue%22
