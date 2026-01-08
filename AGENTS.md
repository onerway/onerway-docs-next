# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Nuxt 4 shell. Components in `app/components/` (`content/` for docs UI, `header/` for nav, `AppLogo.vue`), composables in `app/composables/`, main layout in `app/layouts/docs.vue`, routing in `app/pages/[...slug].vue`.
- `content/`: Markdown docs per locale (`en/`, `zh_cn/`) organized by numbered folders; optional `.navigation.yml` to control sidebar order.
- `i18n/locales/`: UI translation JSON; keep `en` and `zh_cn` aligned.
- Assets: `app/assets/css/` for global styles, `app/assets/icons/` for custom icons, `public/` for static files.
- Config: `nuxt.config.ts`, `content.config.ts`, `app.config.ts`, TypeScript in `tsconfig.json`, lint rules in `eslint.config.mjs`.

## Build, Test, and Development Commands
- `pnpm install`: install dependencies (preferred).
- `pnpm dev`: dev server at http://localhost:3000.
- `pnpm build`: production build; `pnpm preview`: serve the build.
- `pnpm generate`: optional static output.
- Lint: `pnpm eslint .` (after Nuxt creates `.nuxt/eslint.config.mjs` via dev/build).

## Coding Style & Naming Conventions
- Use TypeScript + Vue 3 Composition API; strongly type props/returns.
- Component prefixes: `App` (layout/shell), `Docs` (structure/toc/resources), `Prose` (content rendering/MD enhancements). Keep content components in `app/components/content/`.
- Indentation: 2 spaces; keep imports tidy; Nuxt UI utility classes for styling, scoped CSS only when needed.
- Locale defaults: `en` as default, no URL prefix; mirror keys across locales.
- MDC nesting uses colons (`::`, `:::` ...) for block depth (see `content/CLAUDE.md` if adding MDC-rich content).

## Content & i18n Workflow
- Add docs under the correct locale/section with frontmatter; numeric folder names drive ordering, `.navigation.yml` refines it.
- Keep UI strings synced in `i18n/locales/*.json`; review both locales when adding components or content.
- Writing standards: follow `content/CLAUDE.MD` (clear headings, short paragraphs, TOC-ready H1-H4, avoid ambiguous pronouns, consistent terminology, strong examples and env-var handling).

## Testing Guidelines
- `@nuxt/test-utils` present but no test script yet. If adding tests, wire `pnpm test` (Vitest + Nuxt test utils) and cover nav/TOC/i18n-critical flows; document new scripts.

## Components & Docs Workflow
- Component prefixes: `App`/`Docs`/`Prose`; register docs UI in `app/components/content/`. Update `app/components/README.md` tables when adding/altering components; include example links or `TODO` markers.
- For design/tech docs: add investigations under `docs/investigations/`, designs under `docs/designs/` (use component-designer skill), references under `docs/technical-references/`; keep `docs/README.md` lists in sync.

## Commit & Pull Request Guidelines
- Conventional Commits, Chinese preferred: `<type>(<scope>): <subject>` (feat/fix/docs/style/refactor/perf/test/chore); no AI attribution.
- Example: `feat(ProseA): 为 MDC 链接添加徽章` with bullet list body; use footer for breaking changes or issue refs.
- PRs: include summary, linked issues, screenshots for UI, note tests run; pair content changes with locale updates when applicable.
