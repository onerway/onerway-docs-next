# Repository Guidelines

## Project Structure & Module Organization
- `pages/` Route-driven Vue SFCs (kebab-case filenames become routes).
- `components/` Reusable UI (PascalCase filenames).
- `composables/` Reusable logic (`useXxx.ts` pattern).
- `layouts/`, `middleware/` App chrome and navigation guards.
- `server/` Server routes and utilities (e.g., `server/api/foo.get.ts`).
- `content/` Markdown/docs managed by Nuxt Content; see `content.config.ts`.
- `assets/` Source assets processed by build; `public/` served as-is.
- `i18n/` Localization files; `shared/` shared types/utilities.
- `scripts/` Maintenance scripts (e.g., `scripts/clear-cache.js`).

## Build, Test, and Development Commands
- `pnpm dev` Start local dev server.
- `pnpm build` Production build; `pnpm preview` preview the build.
- `pnpm generate` Static site generation (if used in deploy).
- `pnpm clear-cache` Clear Nuxt cache; `pnpm dev:fresh`/`build:fresh` = clear then run.
- `pnpm lint` / `lint:fix` Lint (ESLint). `pnpm format` / `format:check` (Prettier).
- `pnpm lint:all` Run ESLint and Prettier checks; CI and hooks rely on this.
- Content helper: `pnpm generate:missing` fills in missing content scaffolds.

## Coding Style & Naming Conventions
- TypeScript first; strict, explicit types in `shared/` and server code.
- Format with Prettier; lint with ESLint (`eslint.config.mjs`).
- Indentation: 2 spaces. Filenames: PascalCase in `components/`, kebab-case in `pages/`.
- Composables prefixed `use`, no default exports for utilities.

## Testing Guidelines
- Automated tests are not yet configured. Until added, rely on:
  - `pnpm lint:all` for static checks and `pnpm preview` for manual QA.
  - Prefer `@nuxt/test-utils` + Vitest when introducing tests; name files `*.spec.ts` near sources.

## Commit & Pull Request Guidelines
- Use Conventional Commits where possible: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`.
- Keep subjects concise; link issues (e.g., `Closes #123`).
- Before pushing: `pnpm fix:all && pnpm lint:all` (hooks enforce this).
- PRs: include a short summary, screenshots for UI changes, test/QA steps, and docs/content updates.

## Security & Configuration Tips
- Do not commit secrets. Use `.env` and Nuxt runtime config (`nuxt.config.ts`, `app.config.ts`).
- Public env vars must be prefixed `NUXT_PUBLIC_`.
- Cache issues? See `CACHE_TROUBLESHOOTING.md` for safe cleanup steps.

