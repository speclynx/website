# CLAUDE.md

Project context for AI assistants working on the SpecLynx website.

## Project Overview

Jekyll static site for SpecLynx — an API tooling company. Hosted on GitHub Pages at `https://speclynx.com/`.

Three products:
- **OpenAPI Toolkit** — Free VSCode extension for API spec authoring (validation, completion, hover, preview, linting)
- **Language Service** — LSP-compatible npm library (`@speclynx/apidom-ls`) for API spec intelligence
- **ApiDOM** — Semantic parser for API specifications (OpenAPI, AsyncAPI, Arazzo, JSON Schema)

## Tech Stack

- **Jekyll** via `github-pages` gem (~232)
- **Tailwind CSS** via CDN (`cdn.tailwindcss.com`)
- **Prism.js** v1.29.0 for syntax highlighting (JS, TS, YAML, JSON, Bash)
- **Vanilla JavaScript** (no framework)
- **No npm/Node dependencies** — pure Ruby/Jekyll with CDN-based frontend libs

### Jekyll Plugins
- `jekyll-feed` — RSS feed
- `jekyll-sitemap` — sitemap.xml generation
- `jekyll-seo-tag` — Open Graph, Twitter Cards, canonical URLs, basic JSON-LD

## Build & Serve

```bash
bundle exec jekyll serve        # Dev server (localhost:4000)
bundle exec jekyll build        # Build to _site/
```

## File Structure

```
_config.yml                      # Site config (title, url, baseurl, plugins)
_layouts/
  base.html                      # HTML skeleton: head, nav, content, footer, org schema
  default.html                   # Wraps content in container (inherits base)
_includes/
  head.html                      # <head> with seo tag, meta, CDN scripts
  nav.html                       # Responsive navbar with dropdowns
  footer.html                    # Footer with links and social icons
  schema-organization.html       # Organization JSON-LD (included sitewide)
pages/
  homepage.html                  # Landing page (permalink: /)
  openapi-toolkit.html           # Product page with sidebar nav
  language-service.html          # Product page with sidebar nav
  apidom/overview.html           # Product page with sidebar nav (permalink: /apidom/)
  about.html                     # Team page
  pricing.html                   # Free + Enterprise tiers
  privacy.html, terms.html       # Legal pages
assets/
  css/main.css                   # Custom CSS + CSS variables
  js/main.js                     # Mobile menu, lightbox, tooltips, heading anchors
  images/                        # Logos, diagrams, screenshots
robots.txt                       # Sitemap directive (uses Jekyll variables)
llms.txt                         # LLM crawler discovery file
```

## CSS Conventions

- CSS custom properties for branding: `--color-primary-dark: #092B4E`, `--color-primary-light: #1a74a5`
- Tailwind utilities for layout, combined with custom classes (`.primary-cta`, `.product-card`, `.hero-section`)
- Standard container: `class="container mx-auto px-4 max-w-6xl"`
- Color `--color-primary-light` (#1a74a5) chosen to pass WCAG AA 4.5:1 contrast on both white and `#EFF6FF` hero backgrounds

## Inline Links in Body Text

Use `class="text-primary-light underline hover:no-underline"` for links inside paragraphs. This ensures links are distinguishable by more than color alone (Lighthouse accessibility requirement).

## Heading Anchors

JavaScript in `main.js` auto-generates `#` anchor links on headings with IDs and on first headings inside sections with IDs. Uses `:scope >` selector to avoid duplicates from nested sections.

All `<h3>` elements on product pages have descriptive IDs matching their text (e.g., `id="parsing-an-openapi-document"`).

`scroll-margin-top: 80px` on `[id]` elements prevents anchors from hiding under the sticky header.

## Quality Checks

### W3C HTML Validation
All 8 pages pass with 0 errors via `https://validator.w3.org/nu/` (POST rendered HTML).

Note: `jekyll-seo-tag` generates `<meta ... />` with trailing slashes (XHTML style). These show as validator **infos**, not errors. Cannot be fixed on our side — it's the plugin's output.

### Chrome Lighthouse
All pages score **100** on Accessibility, SEO, and Best Practices.

Run with: `npx lighthouse <url> --chrome-flags="--headless --no-sandbox"`

Key accessibility decisions:
- `aria-label="Open menu"` on hamburger button
- LaunchList iframes get `title="Email signup form"` via JS
- Descriptive link text ("Explore OpenAPI Toolkit" instead of "Learn more")
- `<main>` landmark on all pages
- Footer headings use `<p>` not `<h4>` (heading hierarchy)

### Images
- OpenAPI Toolkit page has 20 screenshots — all below-the-fold images use `loading="lazy"`
- First screenshot (above fold) loads eagerly

## AEO (Answer Engine Optimization)

### Schema.org JSON-LD Structured Data
- **Organization** — sitewide via `_includes/schema-organization.html` (name, logo, email, sameAs)
- **SoftwareApplication** — on each product page (category, license, price, author)
- **BreadcrumbList** — on each product page (Home > Product Name)
- **Person** — on About page (both co-founders with jobTitle, URLs, sameAs)
- **FAQPage** — on each product page (4 Q&A pairs each)
- **WebSite/WebPage** — auto-generated by `jekyll-seo-tag`

### FAQ Sections
Each product page has a visible FAQ section at the bottom with matching `FAQPage` JSON-LD. Keep the visible HTML text and JSON-LD `text` values in sync when editing.

### robots.txt
Uses Jekyll front matter (`layout: none`) so Liquid variables resolve. Contains `Sitemap:` directive pointing to `{{ site.url }}{{ site.baseurl }}/sitemap.xml`.

### llms.txt
Plain-text file at site root describing the company and products for LLM crawlers. Also uses Jekyll variables for URLs.

## Important Notes

- No mention of SmartBear or Swagger as company names in ApiDOM content. The origin story refers to "a large API company."
- ApiDOM's `traverse` function is in `@speclynx/apidom-traverse` (there is no `visit` function)
- ApiDOM is lossless: preserves comments, key ordering, format styles, raw CST source texts, and LSP-compatible source maps (UTF-16 code units)
- The `baseurl` is `""` (empty) — internal links use `{{ '/path/' | relative_url }}`
- The `url` is `https://speclynx.com`
