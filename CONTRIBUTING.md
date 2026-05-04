# Contributing

## Runtime requirements

This fork targets modern JavaScript runtimes.

- Node.js >= 24.0.0
- npm >= 11.0.0

The expected package manager is declared in `package.json`:

```json
{
  "packageManager": "npm@11.13.0",
  "engines": {
    "node": ">=24.0.0",
    "npm": ">=11.0.0"
  }
}
```

## Maintenance policy

- Modern Node.js is the baseline.
- Tooling should be explicit and versioned in this repository.
- Hidden preset-based toolchains are avoided.
- Polyfills are only added when they provide clear value for supported runtimes.
- Bug fixes should stay atomic and include upstream context when relevant.

## Local validation

Install dependencies with the locked dependency graph:

```bash
npm ci --no-audit --fund=false --include=dev
```

Run the full local validation suite:

```bash
npm run validate
```

For focused checks, use:

```bash
npm run lint
npm run format:check
npm test
```

The `validate` script mirrors the checks expected by CI.

## Commit messages

Use Conventional Commits with an explicit scope.

Examples:

```text
docs(repo): clean project documentation
ci(validate): name validation job
ci(deps): configure dependabot updates
fix(prefer-text): preserve exact text assertions
```

## External references

When a change is based on an external issue, pull request, or commit, prefer
contextual references instead of closing keywords.

Use footer tokens compatible with Conventional Commits:

```text
External-Context: owner/repository#123
Related-Context: owner/repository#456
Patch-Reference: owner/repository@commit-sha
```

Avoid `Fixes`, `Closes`, or `Resolves` for external repositories unless the
commit is intended to close an issue in that repository.
