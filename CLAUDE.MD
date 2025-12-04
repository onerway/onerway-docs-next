# Onerway Documentation Project

## Project Overview
This is a multilingual documentation site for Onerway, built with Nuxt 4 and Nuxt Content. The project provides comprehensive documentation for the Onerway payment platform with support for English and Simplified Chinese.

## Tech Stack
- **Framework**: Nuxt 4.2.1
- **Content Management**: @nuxt/content 3.8.0
- **UI Framework**: @nuxt/ui 4.1.0
- **Internationalization**: @nuxtjs/i18n 10.2.0
- **Styling**: Custom CSS with Nuxt UI components
- **Icons**: @nuxt/icon with custom icon support
- **Images**: @nuxt/image for optimized images
- **Fonts**: @nuxt/fonts
- **Development**: TypeScript, ESLint, Vite

## Project Structure

```
onerway-docs-next2/
├── app/
│   ├── assets/
│   │   ├── css/           # Global styles
│   │   └── icons/         # Custom icon collections
│   ├── components/
│   │   ├── content/       # Content-specific components
│   │   │   ├── toc/       # Table of contents components
│   │   │   ├── DocsResources.vue
│   │   │   ├── DocsResourceItem.vue
│   │   │   ├── DocsPageCard.vue
│   │   │   ├── DocsPageGrid.vue
│   │   │   ├── ProseAccordion.vue
│   │   │   ├── ProseAccordionItem.vue
│   │   │   ├── ProseAnnotation.vue
│   │   │   ├── Annotate.vue
│   │   │   └── InlineBlocks.vue
│   │   ├── header/        # Header navigation components
│   │   │   ├── AppHeader.vue
│   │   │   └── AppHeaderMobileNav.vue
│   │   └── AppLogo.vue
│   ├── composables/
│   │   ├── useDocsNav.ts  # Documentation navigation logic
│   │   └── useScrollSpy.ts # Scroll tracking for TOC
│   ├── layouts/
│   │   └── docs.vue       # Main documentation layout
│   ├── pages/
│   │   └── [...slug].vue  # Catch-all route for content pages
│   ├── types/
│   │   └── injection-keys.ts
│   ├── app.config.ts
│   └── app.vue
├── content/
│   ├── en/                # English documentation
│   │   ├── 1.get-started/
│   │   └── ...
│   └── zh_cn/             # Chinese documentation
│       ├── 1.get-started/
│       ├── 2.payments/
│       └── ...
├── i18n/
│   └── locales/
│       ├── en.json        # English UI translations
│       └── zh_cn.json     # Chinese UI translations
├── content.config.ts      # Content module configuration
├── nuxt.config.ts         # Nuxt configuration
└── package.json
```

## Key Features

### 1. Multilingual Support
- Two languages: English (en) and Simplified Chinese (zh_cn)
- Strategy: `no_prefix` - language detection without URL prefixes
- Separate content directories for each language
- UI translations via i18n JSON files

### 2. Content Management
- File-based content using Nuxt Content
- Markdown files with YAML frontmatter
- Navigation structure defined in `.navigation.yml` files
- Table of contents generation (depth: 4, searchDepth: 6)

### 3. Documentation Layout
- Responsive docs layout with sidebar navigation
- Table of contents with scroll spy
- Mobile-optimized navigation
- Header with language switcher

### 4. Custom Components
- **DocsResources**: Display resource links
- **DocsPageCard/DocsPageGrid**: Card-based content display
- **ProseAccordion**: Expandable content sections
- **ProseAnnotation**: Block-level annotations with hover tooltips (use with `::` syntax)
- **Annotate**: Inline annotations for term explanations (use with `:` syntax)
- **InlineBlocks**: Forces block-level elements to render inline on the same line
- **ContentToc**: Dynamic table of contents with scroll tracking
- **AppHeader**: Main navigation header
- **AppHeaderMobileNav**: Mobile-friendly navigation menu

### 5. Composables
- **useDocsNav**: Manages documentation navigation state and structure
- **useScrollSpy**: Tracks scroll position for TOC highlighting

## Development

### Setup
```bash
pnpm install
```

### Development Server
```bash
pnpm dev
# Runs on http://localhost:3000
```

### Build for Production
```bash
pnpm build
```

### Preview Production Build
```bash
pnpm preview
```

## Content Organization

### Content Structure
- Content is organized numerically (1.get-started, 2.payments, etc.)
- Each section can have a `.navigation.yml` file for custom navigation
- Markdown files support frontmatter for metadata

### Adding New Content
1. Create markdown file in appropriate language directory
2. Add frontmatter with title, description, etc.
3. Update `.navigation.yml` if custom navigation is needed
4. Content will automatically appear in navigation

### Navigation Files
`.navigation.yml` files define the structure and order of navigation items for each section.

## Configuration

### Nuxt Config (`nuxt.config.ts`)
- Content depth configuration
- i18n settings
- Module configuration
- Component auto-import settings
- Icon configuration with custom collections

### Content Config (`content.config.ts`)
- Content module-specific configuration

### App Config (`app.config.ts`)
- Application-level configuration
- UI theme settings

## Git Status
Current branch: `main`

Recent significant changes:
- Added ContentToc and ProseAccordion components
- Enhanced mobile navigation experience
- Refactored navigation components
- Restructured Chinese content from `zh` to `zh_cn`
- Added i18n locale files
- Updated layout and configuration files

## Development Guidelines

### Component Development
- Place content-specific components in `app/components/content/`
- Use TypeScript for type safety
- Follow Vue 3 Composition API patterns
- Utilize Nuxt UI components when possible

### Styling
- Global styles in `app/assets/css/main.css`
- Use Nuxt UI's utility classes
- Component-scoped styles when needed

### Composables
- Create reusable logic in `app/composables/`
- Use proper TypeScript typing
- Follow Vue composable patterns

### Content Authoring
- Write in Markdown with frontmatter
- Use proper heading hierarchy (h1-h4)
- Reference internal links correctly
- Add metadata for SEO

## Best Practices

1. **Type Safety**: Use TypeScript throughout the project
2. **Component Structure**: Keep components focused and reusable
3. **Performance**: Leverage Nuxt's auto-imports and code splitting
4. **Accessibility**: Ensure proper semantic HTML and ARIA labels
5. **Mobile First**: Design for mobile, enhance for desktop
6. **i18n**: Keep translations synchronized across languages
7. **Content Quality**: Maintain consistent documentation structure

## Important Notes

- The project uses Nuxt 4 (latest version)
- Content depth is set to 4 for TOC generation
- Custom icons are stored in `app/assets/icons/`
- Language detection is automatic (no URL prefix)
- Default locale is English

## Troubleshooting

### Common Issues
1. **Content not showing**: Check `.navigation.yml` structure
2. **i18n issues**: Verify locale files are properly formatted
3. **Build errors**: Clear `.nuxt` directory and rebuild
4. **Styling issues**: Check CSS import order in `nuxt.config.ts`

## Resources
- [Nuxt Documentation](https://nuxt.com/docs)
- [Nuxt Content](https://content.nuxt.com/)
- [Nuxt UI](https://ui.nuxt.com/)
- [Nuxt i18n](https://i18n.nuxtjs.org/)
