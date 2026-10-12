# Contributing

Hello! It's great that you are interested in contributing to the ESLint config.
Before submitting your contribution, please take a moment to read the following
guide:

## Installation

This project uses the [pnpm](https://pnpm.io) package manager. Therefore, to
work with the project, you need to install it.

How to set up a project locally and run tests:

1. Clone repo:

```sh
git clone git@github.com:azat-io/eslint-config.git
```

2. Install dependencies:

```sh
pnpm install
```

3. Build the package, because `eslint.config.ts` lints the repository with the
   built config:

```sh
pnpm build
```

4. Run tests:

```sh
pnpm test
```

## Project Structure

```
eslint-config/
├── core/              # Configs, one folder per option
│   ├── base/          # Rules for every project
│   └── react/         # Rules for the react option, and so on
├── runtime/           # Rule downgrades by Node.js and browser targets
├── scripts/           # Development scripts, not published
├── test/              # Tests (Vitest), at the path of the file under test
├── utils/             # Shared helpers
└── index.ts           # Config factory, the package entry point
```

## Available Scripts

```sh
pnpm build            # Build the package (Vite)
pnpm test             # Run all test:* scripts
pnpm test:unit        # Unit tests with coverage (Vitest)
pnpm test:js          # ESLint, needs a build
pnpm test:types       # TypeScript type check
pnpm test:format      # Prettier formatting check
pnpm test:spelling    # Spell check (cspell)
pnpm test:packages    # Dependency dedupe check
pnpm runtime:support  # Regenerate runtime/support.json
```

## Runtime Support Data

`runtime/support.json` lists the minimal Node.js and browser versions for every
rule that `runtime/` can downgrade. `scripts/generate-runtime-support.ts` builds
it from `@mdn/browser-compat-data`. Regenerate it after updating that package or
the rule list, and commit the result:

```sh
RUNTIME_SUPPORT_DATE=2026-10-11 pnpm runtime:support
```

The date pins Baseline queries such as `baseline widely available`, so the same
data always gives the same targets. Without it, the script uses today.

## Pull Request Guidelines

Before creating a pull request, fork this repo and create a new branch.

Commit messages must follow the
[commit message convention](https://conventionalcommits.org/) so that changelogs
can be automatically generated.

Make sure tests pass.
