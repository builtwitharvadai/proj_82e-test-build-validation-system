# proj_82e-test-build-validation-system
A lightweight testing and build validation system designed to verify build processes and test configurations. This project provides a minimal framework for running test builds, validating build outputs, and ensuring build integrity. It serves as a foundational tool for development teams to quickly verify that their build pipelines are functioning c

## Requirements

- Node.js `>=18.0.0`
- npm (bundled with Node.js)

## Installation

```bash
npm install
```

To use the CLI from a local checkout, build it first and then run the generated
`dist/cli.js` entry point:

```bash
npm run build
node dist/cli.js
```

## Development

```bash
npm run build    # compile TypeScript from src/ into dist/
npm run lint     # lint the TypeScript sources with ESLint
npm run format   # format the project with Prettier
```

TypeScript is configured in strict mode targeting ES2022 with `NodeNext` modules,
so all relative imports inside `src/` must use explicit `.js` extensions.

## Project Structure

```
.
├── src/
│   ├── index.ts      # main library entry point (compiled to dist/index.js)
│   └── cli.ts        # CLI entry point with shebang (compiled to dist/cli.js)
├── dist/             # compiled output (generated, git-ignored)
├── package.json      # project metadata, dependencies and npm scripts
├── tsconfig.json     # TypeScript compiler configuration
├── .eslintrc.cjs     # ESLint configuration for TypeScript
├── .prettierrc.json  # Prettier formatting rules
└── .prettierignore   # paths excluded from formatting
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run build` | Compile the TypeScript sources with `tsc`. |
| `npm run clean` | Remove the `dist/` build output. |
| `npm run dev` | Run the CLI directly from source with `ts-node`. |
| `npm run lint` | Lint `src/**/*.ts` with ESLint. |
| `npm run lint:fix` | Lint and auto-fix `src/**/*.ts`. |
| `npm run format` | Format the project with Prettier. |
| `npm run format:check` | Check formatting without writing changes. |
| `npm test` | Placeholder until the test suite is configured. |
