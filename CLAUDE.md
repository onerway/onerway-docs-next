# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code)
when working with code in this repository.

## Project Overview

This is **Onerway Docs Next** - a multilingual documentation
platform built with Nuxt 3 for payment product
documentation. The project supports Chinese (Simplified &
Traditional) and English with structured content collections
for Get Started, Payments, and Transfers modules.

## Tech Stack & Architecture

- **Framework**: Nuxt 3 (^3.17.5) with TypeScript
- **Package Manager**: pnpm (version 10.13.1) - required
- **Content**: Nuxt Content (3.5.1) with structured
  collections and Zod schemas
- **UI**: Nuxt UI Pro (3.1.3) with Tailwind CSS
- **Internationalization**: @nuxtjs/i18n for multi-language
  support
- **3D Graphics**: Three.js integration for visual elements
- **Code Quality**: ESLint + Prettier with Husky pre-commit
  hooks
- **Utilities**: VueUse for Vue composition utilities

## Development Commands

### Core Development

```bash
pnpm dev              # Start development server (http://localhost:3000)
pnpm build            # Build for production
pnpm generate         # Generate static site
pnpm preview          # Preview production build
```

### Code Quality (Always run before committing)

```bash
pnpm lint             # Run ESLint
pnpm lint:fix         # Auto-fix ESLint issues
pnpm format           # Format code with Prettier
pnpm fix:all          # Auto-fix all issues (lint + format)
pnpm lint:all         # Run all linting checks
```

### Content Management

```bash
pnpm generate:missing # Generate missing content report (detects translation gaps)
```

## Project Structure & Content Architecture

### Content Collections (content.config.ts)

- **get_started_en/zh**: Getting started documentation
- **payments_en/zh**: Payment API documentation with
  method/endpoint metadata
- **transfers_en/zh**: Transfer documentation
- **changelog_en/zh**: Version-controlled changelogs by
  domain
- **metadata**: Version info and language completeness
  tracking

### Directory Layout

```
content/                    # Documentation content
├── en/                    # English documentation
├── zh-cn/                 # Simplified Chinese
└── zh-tw/                 # Traditional Chinese

components/
├── business/              # Domain-specific components
├── layout/                # Layout components (AppHeader, AppFooter, etc.)
└── icons/                 # Icon components

i18n/locales/             # Translation files
pages/                    # Nuxt pages ([...slug].vue for docs routing)
```

## Content Management System

### Version Management

- Each module (get-started, payments, transfers) has
  independent versioning
- Version info stored in `content/metadata/*.yml`
- Supports current/deprecated/legacy status tracking

### Missing Content Detection

- Run `pnpm generate:missing` to detect translation gaps
- System tracks content completeness per language
- Badge marking for missing menu items

### Content Schema Requirements

All documentation pages require:

- `title` (required)
- `description`, `version`, `category`, `tags` (optional)
- `order` for navigation sorting
- `draft` flag for unpublished content

Payments docs additionally support:

- `apiMethod`: GET, POST, PUT, DELETE, PATCH
- `apiEndpoint`: API endpoint path

## Development Guidelines

### Code Quality Enforcement

- ESLint with strict TypeScript rules and Vue/Nuxt plugins
- Prettier for code formatting
- Husky pre-commit hooks run `fix:all` and `lint:all`
- Lint-staged for focused file processing

### Component Development

- Follow existing UI Pro component patterns
- Use TypeScript with strict type checking
- Implement responsive design for mobile compatibility
- Support dark/light theme switching

### Internationalization

- All user-facing text must be in i18n files
- Support for 3 locales: en, zh-cn, zh-tw
- Content detection prevents broken navigation

## Testing & Deployment

### Before Committing

Always run these commands to ensure code quality:

```bash
pnpm fix:all     # Fix formatting and linting issues
pnpm lint:all    # Verify all checks pass
```

### Build Verification

```bash
pnpm build       # Verify production build succeeds
pnpm generate    # Test static generation
```

## Special Considerations

### Content Workflow

- Content editing integrates with Nuxt Studio
- Multi-language content synchronization required
- Version-controlled changelog system for each domain

### Performance Optimization

- Vite optimization configured for Three.js
- Font optimization with Google Fonts
- Image optimization with @nuxt/image

### Cursor IDE Integration

This project includes Cursor rules for structured
development phases. When working on implementation tasks,
refer to `.cursor/rules/onerway-docs-implementation.mdc` for
phase-based development guidelines.

## Composable Architecture

This project uses a sophisticated three-tier composable
architecture:

### Tier 1: Core Services (Planned)

- **useCoreCache()**: Shared caching with TTL management
- **useCoreStorage()**: localStorage/sessionStorage
  abstraction
- **useDebounce()**: Unified debounce/throttle utilities

### Tier 2: Feature Composables

- **useDocumentation**: Document system with modular classes
  - PathResolver: Content path resolution and caching
  - NavigationProcessor: Navigation tree processing
  - BreadcrumbBuilder: Breadcrumb generation
- **useRecentPages**: Recent pages tracking with modular
  classes
  - CacheManager: Memory and TTL cache management
  - ContentService: Content metadata fetching
- **useClipboard**: Simple clipboard operations

### Composable Complexity Guidelines

- **Simple** (<200 lines): Single file (e.g.,
  `useClipboard.ts`)
- **Medium** (200-500 lines): Single file with sections
- **Complex** (>500 lines): Modular directory structure
  with:
  - `index.ts`: Main composable export
  - `types.ts`: Type definitions
  - `constants.ts`: Configuration constants
  - `classes/`: Business logic classes
  - `utils/`: Utility functions
  - Root-level re-export file (e.g., `useDocumentation.ts`)

### Development Rules

- Always check `.cursor/rules/COMPOSABLES.md` for existing
  functionality
- Use dependency injection for complex business logic
- Follow SSR-safe patterns with `useState`
- Implement proper cleanup in `onUnmounted`

## Key Files to Understand

- `nuxt.config.ts`: Main Nuxt configuration and module setup
- `content.config.ts`: Content collections and schema
  definitions
- `app.config.ts`: UI configuration and theming
- `eslint.config.mjs`: Comprehensive linting rules
- `scripts/generate-missing-content.js`: Content gap
  detection
- `.cursor/rules/COMPOSABLES.md`: Composable registry and
  guidelines
- `.cursor/rules/frontend-development-guidelines.mdc`:
  Complete development standards
