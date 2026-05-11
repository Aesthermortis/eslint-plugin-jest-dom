<div align="center">
<h1>eslint-plugin-jest-dom</h1>

<p>ESLint plugin to follow best practices and anticipate common mistakes when writing tests with jest-dom.</p>
</div>

---

<p align="center">
  <a href="https://github.com/Aesthermortis/eslint-plugin-jest-dom/actions/workflows/validate.yml">
    <img
      alt="Quality checks"
      src="https://img.shields.io/github/actions/workflow/status/Aesthermortis/eslint-plugin-jest-dom/validate.yml?branch=main&label=Quality%20checks&logo=github&style=flat-square"
    >
  </a>
  <a href="./LICENSE">
    <img
      alt="MIT License"
      src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square"
    >
  </a>
  <a href="https://github.com/prettier/prettier">
    <img
      alt="Prettier Code Style"
      src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"
    >
  </a>
</p>

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Recommended Configuration](#recommended-configuration)
- [Supported Rules](#supported-rules)

## Installation

This fork can be installed with `npm` directly from GitHub as one of your
project's `devDependencies`:

```bash
npm i -D github:Aesthermortis/eslint-plugin-jest-dom
```

> [!NOTE]
> This fork targets `Node.js 24+`, `npm 11+`, and `ESLint 10`.
> It also has an optional peer dependency on [`@testing-library/dom`](https://testing-library.com/docs/dom-testing-library/intro/)
> to detect the full set of Testing Library queries.

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
🌐 Set in the `all` configuration.\
✅ Set in the `recommended` configuration.\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💡 Manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

| Name                                                                                             | Description                                                                  | 💼    | 🔧  | 💡  |
| :----------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- | :---- | :-- | :-- |
| [prefer-checked](docs/rules/prefer-checked.md)                                                   | prefer toBeChecked over checking attributes                                  | 🌐 ✅ | 🔧  |     |
| [prefer-empty](docs/rules/prefer-empty.md)                                                       | Prefer toBeEmpty over checking innerHTML                                     | 🌐 ✅ | 🔧  |     |
| [prefer-enabled-disabled](docs/rules/prefer-enabled-disabled.md)                                 | prefer toBeDisabled or toBeEnabled over checking attributes                  | 🌐 ✅ | 🔧  |     |
| [prefer-focus](docs/rules/prefer-focus.md)                                                       | prefer toHaveFocus over checking document.activeElement                      | 🌐 ✅ | 🔧  |     |
| [prefer-in-document](docs/rules/prefer-in-document.md)                                           | Prefer .toBeInTheDocument() for asserting the existence of a DOM node        | 🌐 ✅ | 🔧  | 💡  |
| [prefer-partially-checked](docs/rules/prefer-partially-checked.md)                               | prefer toBePartiallyChecked over checking aria-checked="mixed"               | 🌐    | 🔧  |     |
| [prefer-partially-pressed](docs/rules/prefer-partially-pressed.md)                               | prefer toBePartiallyPressed over checking aria-pressed="mixed"               | 🌐    | 🔧  |     |
| [prefer-pressed](docs/rules/prefer-pressed.md)                                                   | prefer toBePressed over checking aria-pressed manually                       | 🌐    | 🔧  |     |
| [prefer-required](docs/rules/prefer-required.md)                                                 | prefer toBeRequired over checking properties                                 | 🌐 ✅ | 🔧  |     |
| [prefer-to-appear-after](docs/rules/prefer-to-appear-after.md)                                   | prefer toAppearAfter over manual DOM order assertions                        | 🌐    |     |     |
| [prefer-to-appear-before](docs/rules/prefer-to-appear-before.md)                                 | prefer toAppearBefore over manual DOM order assertions                       | 🌐    |     |     |
| [prefer-to-be-invalid](docs/rules/prefer-to-be-invalid.md)                                       | prefer toBeInvalid over manual validity assertions                           | 🌐    |     |     |
| [prefer-to-be-valid](docs/rules/prefer-to-be-valid.md)                                           | prefer toBeValid over manual validity assertions                             | 🌐    |     |     |
| [prefer-to-contain-element](docs/rules/prefer-to-contain-element.md)                             | prefer toContainElement over manual contains assertions                      | 🌐    |     |     |
| [prefer-to-have-accessible-description](docs/rules/prefer-to-have-accessible-description.md)     | prefer toHaveAccessibleDescription over checking aria-description manually   | 🌐    |     |     |
| [prefer-to-have-accessible-error-message](docs/rules/prefer-to-have-accessible-error-message.md) | prefer toHaveAccessibleErrorMessage over checking aria-errormessage manually | 🌐    |     |     |
| [prefer-to-have-accessible-name](docs/rules/prefer-to-have-accessible-name.md)                   | prefer toHaveAccessibleName over checking aria-label manually                | 🌐    |     |     |
| [prefer-to-have-attribute](docs/rules/prefer-to-have-attribute.md)                               | prefer toHaveAttribute over checking getAttribute/hasAttribute               | 🌐 ✅ | 🔧  |     |
| [prefer-to-have-class](docs/rules/prefer-to-have-class.md)                                       | prefer toHaveClass over checking element className                           | 🌐 ✅ | 🔧  |     |
| [prefer-to-have-display-value](docs/rules/prefer-to-have-display-value.md)                       | prefer toHaveDisplayValue over manual value assertions                       | 🌐    |     |     |
| [prefer-to-have-role](docs/rules/prefer-to-have-role.md)                                         | prefer toHaveRole over checking role attributes manually                     | 🌐    |     |     |
| [prefer-to-have-selection](docs/rules/prefer-to-have-selection.md)                               | prefer toHaveSelection over checking selection manually                      | 🌐    |     |     |
| [prefer-to-have-style](docs/rules/prefer-to-have-style.md)                                       | prefer toHaveStyle over checking element style                               | 🌐 ✅ | 🔧  |     |
| [prefer-to-have-text-content](docs/rules/prefer-to-have-text-content.md)                         | Prefer toHaveTextContent over checking element.textContent                   | 🌐 ✅ | 🔧  |     |
| [prefer-to-have-value](docs/rules/prefer-to-have-value.md)                                       | prefer toHaveValue over checking element.value                               | 🌐 ✅ | 🔧  |     |

<!-- end auto-generated rules list -->
