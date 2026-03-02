# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build        # production build (tsdown → dist/main.mjs)
npm run dev          # watch mode
npm run lint         # biome check
npm run lint:fix     # biome check --write
npm run format       # biome format --write
npm run start        # run compiled CLI directly
```

No test runner is configured. Lint and build run together as a pre-publish check (`prepublishOnly`).

## Architecture

Clean Architecture with four layers. Dependencies flow inward only — outer layers depend on inner, never the reverse.

```
src/
  main.ts                     # Composition Root — wires adapters → use cases → CLI
  domain/                     # Zero external dependencies
    entities/                 # GenerateParams, EditParams, ImageResult, Model
    errors.ts                 # ApiKeyMissingError, ApiError, ImageNotFoundError
    ports/                    # ImageGeneratorPort, KeyStorePort, FileStoragePort
  application/
    usecases/                 # GenerateImage, EditImage, Login, Logout, GetAuthStatus
  infrastructure/
    adapters/                 # GrokApiAdapter, CredentialStoreAdapter, FileStorageAdapter
  presentation/
    cli.ts                    # Commander program factory
    commands/                 # auth.command.ts, generate.command.ts, edit.command.ts
```

**Key architectural decisions:**
- `main.ts` is the only place that instantiates concrete classes and wires dependencies.
- Use cases receive ports (interfaces) only — never concrete adapters.
- `GrokApiAdapter` wraps `@ai-sdk/xai` + `ai` SDK; all xAI API calls go through it.
- `CredentialStoreAdapter` uses `cross-keychain` for OS-native credential storage with `XAI_API_KEY` env var as fallback.
- `FileStorageAdapter` handles file naming (`grok-img-{timestamp}-{index}.{ext}`) and directory creation.

## Spec-First Workflow

This project has a spec in [spec/architecture.md](spec/architecture.md). Any structural changes must update the spec before touching code.

## Code Style

Linter/formatter: **Biome** (no ESLint, no Prettier). Config in [biome.json](biome.json):
- 2-space indentation, 90-char line width
- Double quotes, no semicolons
- Import sorting enforced via `assist.actions.source.organizeImports`

TypeScript is strict mode, ESM modules only (`.js` extensions required in imports even for `.ts` source files).

## Build Output

`tsdown` bundles `src/main.ts` → `dist/main.mjs` (single ESM file, Node 20 target). The shebang `#!/usr/bin/env node` is injected automatically. Source maps are included. Only `dist/`, `README.md`, and `LICENSE` are published to npm.
