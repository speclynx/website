# CLAUDE.md

Project context for AI assistants working on the SpecLynx website.

## Project Overview

Jekyll static site for SpecLynx — an API tooling company. Hosted on GitHub Pages at `https://speclynx.com/`.

Five products:
- **Editor** — Browser-based OpenAPI editor at `editor.speclynx.com` (fully client-side, open source)
- **OpenAPI Toolkit** — Free VS Code extension for API spec authoring (validation, completion, hover, preview, linting)
- **CLI** — Command-line tool (`@speclynx/cli`) currently shipping `overlay apply`, `overlay diff`, and `validate` (validation + linting for OpenAPI, AsyncAPI, Arazzo, Overlay; single file or URL per run); dereference, bundle, and convert are on the roadmap
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
_layouts/
  post.html                      # Blog post layout (breadcrumb, byline, TechArticle JSON-LD)
_includes/
  head.html                      # <head> with seo tag, meta, CDN scripts
  nav.html                       # Responsive navbar with dropdowns
  footer.html                    # Footer with links and social icons
  schema-organization.html       # Organization JSON-LD (included sitewide)
  apidom-sidebar.html            # Shared sidebar for ApiDOM pages (active state via page.url)
  docs-sidebar.html              # Sidebar for docs guide pages: outline of the current guide only, from page.toc
_posts/
  YYYY-MM-DD-title.md            # Blog posts (Markdown, rendered with post layout)
pages/
  homepage.html                  # Landing page (permalink: /)
  blog.html                      # Blog index (permalink: /blog/, cards grouped by year)
  docs.html                      # Docs landing (permalink: /docs/): Guides cards + Tutorials placeholder
  docs/guides/getting-started.html  # Getting-started guide (permalink: /docs/guides/getting-started/)
  editor.html                    # Editor product page (permalink: /editor/)
  openapi-toolkit.html           # Product page with sidebar nav
  cli.html                       # CLI product page (permalink: /cli/)
  language-service.html          # Product page with sidebar nav
  apidom/overview.html           # ApiDOM overview (permalink: /apidom/)
  apidom/installation.html       # ApiDOM installation guide (permalink: /apidom/installation/)
  apidom/parsing.html            # ApiDOM parsing guide (permalink: /apidom/parsing/)
  apidom/data-model.html         # ApiDOM data model guide (permalink: /apidom/data-model/)
  about.html                     # Team page
  privacy.html, terms.html       # Legal pages
assets/
  css/main.css                   # Custom CSS + CSS variables
  js/main.js                     # Mobile menu, lightbox, tooltips, heading anchors
  images/                        # Logos, diagrams, screenshots
  samples/getting-started/       # Downloadable sample spec + overlay used by the getting-started guide
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
All pages pass with 0 errors via `https://validator.w3.org/nu/` (POST rendered HTML).

Run with:
```bash
curl -s -H "Content-Type: text/html; charset=utf-8" \
  --data-binary @_site/path/to/index.html \
  "https://validator.w3.org/nu/?out=json" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); errors=[m for m in d.get('messages',[]) if m['type']=='error']; print(f'{len(errors)} errors'); [print(f\"  L{m.get('lastLine','?')}: {m['message']}\") for m in errors]"
```

Note: `jekyll-seo-tag` generates `<meta ... />` with trailing slashes (XHTML style). These show as validator **infos**, not errors. Cannot be fixed on our side — it's the plugin's output.

### Chrome Lighthouse
All pages score **100** on Accessibility, SEO, and Best Practices.

Run with (requires `bundle exec jekyll serve` running on localhost:4000):
```bash
npx lighthouse http://localhost:4000/path/ \
  --chrome-flags="--headless --no-sandbox" \
  --only-categories=accessibility,best-practices,seo \
  --output=json --quiet 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); cats=d['categories']; print(f\"Accessibility: {int(cats['accessibility']['score']*100)}\"); print(f\"Best Practices: {int(cats['best-practices']['score']*100)}\"); print(f\"SEO: {int(cats['seo']['score']*100)}\")"
```

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
- **Organization** — sitewide via `_includes/schema-organization.html` (name, logo, email, sameAs). Carries `"@id"` (the site root URL) so other JSON-LD blocks can reference it, e.g. blog posts' `"publisher": { "@id": ... }`
- **SoftwareApplication** — on each product page (category, license, price, author)
- **BreadcrumbList** — on each product page (Home > Product Name) and ApiDOM subpages (Home > ApiDOM > Page Name)
- **Person** — on About page (both co-founders with jobTitle, URLs, sameAs)
- **FAQPage** — on each product page (4 Q&A pairs each)
- **WebSite/WebPage** — auto-generated by `jekyll-seo-tag`

### FAQ Sections
Each product page has a visible FAQ section at the bottom with matching `FAQPage` JSON-LD. Keep the visible HTML text and JSON-LD `text` values in sync when editing.

### robots.txt
Uses Jekyll front matter (`layout: none`) so Liquid variables resolve. Contains `Sitemap:` directive pointing to `{{ site.url }}{{ site.baseurl }}/sitemap.xml`.

### llms.txt
Plain-text file at site root describing the company and products for LLM crawlers. Also uses Jekyll variables for URLs.

## ApiDOM Documentation Pages

ApiDOM has a multi-page documentation section with a shared sidebar (`_includes/apidom-sidebar.html`):
- **Overview** (`/apidom/`) — what ApiDOM is, key properties (lossless, error recovery, isomorphic)
- **Installation** (`/apidom/installation/`) — npm install, Node.js >=16.14.2, TypeScript types, quick try example
- **Parsing** (`/apidom/parsing/`) — parsing modes (strict/non-strict comparison table), parse from file/URL/string, non-strict mode options, source maps, style preservation
- **The Data Model** (`/apidom/data-model/`) — what `parse()` returns: parse result, elements (`element`/`content`/`meta`/`attributes`), primitive elements, semantic elements, namespaces, reading the model, where metadata lives

Key conventions for ApiDOM content:
- Use "strict mode" and "non-strict mode" consistently — don't mention underlying parsers (Tree-sitter, JSON.parse, yaml) outside the comparison table
- Source maps and style preservation are **opt-in**, not automatic
- Reference package (`@speclynx/apidom-reference`) defaults to **strict mode**; parser adapters default to **non-strict mode**
- Reference package `FileResolver` ships with an **empty `fileAllowList`** (default deny): parsing a local file requires passing a configured `FileResolver`; parsing from a URL works with no extra configuration
- Reference package options nest under `parse.parserOpts`; adapter options are top-level
- Use "data model" not "element" when referring to the parsed result
- The package is "one of the main entry points" (not "the main entry point")
- Official OpenAPI media type: `application/openapi+json;version=3.1.2` (per IETF draft, not `vnd.oai.` prefix)

## Blog

- Posts live in `_posts/` as Markdown with permalink `/blog/:title/` (set via `collections.posts` in `_config.yml`)
- Front matter: `title`, `description`, `date`, `image` (`path`/`width`/`height`/`alt`/`caption`); optional `author`/`author_url`/`author_link` overrides. `image` is required — templates assume it. Free-text values (title, description, author) go through `jsonify` in JSON-LD, so any characters are safe
- **Every post must have a catchy hero image** (quobix.com/articles style: custom illustration, brand colors, no photography). No SpecLynx logo or wordmark in the image — the topic illustration owns the whole frame. 1280×520 WebP in `assets/images/blog/`, named after the post slug, plus a PNG sibling with the same name for social link previews (Facebook and LinkedIn do not render WebP `og:image`). Front matter: `image.path` is the WebP (page, cards, our JSON-LD), `image.social` is the PNG; `_includes/head.html` swaps the PNG into the `jekyll-seo-tag` output (`og:image`, `twitter:image`, the plugin's JSON-LD) whenever `image.social` is set. The render script writes both files. Use the `blog-hero-image` skill (`.claude/skills/blog-hero-image/`): it holds the design rules, a lint+render script (`scripts/render.py`: SVG → headless Chrome PNG → PIL WebP), and the claude.ai prompt template for designing the SVG externally
- **Post prose is written by humans.** AI assistants build blog infrastructure and hero images but never draft or rewrite article content
- **Author is always a Person, never the Organization.** Defaults to Vladimír Gorej via `_config.yml` front matter defaults; SpecLynx appears only as `publisher` in JSON-LD. The visible byline links to `/about/#vladimir-gorej` (`author_link`); JSON-LD Person `url` is `https://vladimirgorej.com/` (`author_url`)
- About page anchors: `#our-team` (section), `#vladimir-gorej` and `#francesco-tumanischvili` (team cards)
- `_layouts/post.html` emits TechArticle + BreadcrumbList (Home > Blog > title) JSON-LD; `jekyll-seo-tag` adds its own BlogPosting. Byline shows date, linked author, and reading time (words / 200)
- `pages/blog.html` features the latest post large (image + text split card), then remaining posts as image-top cards grouped by year; emits Blog JSON-LD with a `blogPost` list
- Markdown output is styled by `.post-content` rules in `main.css` (Tailwind preflight strips defaults); fenced code blocks get Prism highlighting automatically
- Internal links inside post Markdown use Liquid, same as pages: `[text]({{ '/path/' | relative_url }})` — never bare `(/path/)`
- RSS feed at `/feed.xml` via `jekyll-feed`; linked from the blog index
- The blog is linked in the nav (desktop + mobile), footer Resources, and `llms.txt`

## Docs

Structure mirrors usearazzo.com/docs: a landing page at `/docs/` with **Guides** and **Tutorials** as card grids. Headings and intros are left-aligned like the rest of the site (only the text inside placeholder cards is centered); the header has a "What are you looking for?" pill row linking to the sections. Every grid row is filled to three: real cards, then one dashed `.product-card-placeholder` with centered "More guides/tutorials on the way" text (linking to Discussions), then empty dashed placeholders (`aria-hidden`, hidden below the breakpoint where they would wrap) so the row never looks half-empty. This matches usearazzo.com exactly. No API reference section yet; a reference section is planned, and the landing intro does not mention reference docs.

- Guides are long-form, problem-first, and may span several products. Tutorials (when added) are one use case, one tool, finishable in a sitting. Route new docs work through the `developer-marketing` skill
- The ApiDOM pages (`/apidom/...`) are product documentation, not guides; they are not listed on the docs landing. Product pages never move
- `/docs/guides/getting-started/` follows one sample OpenAPI document through all five products: fix the two errors in the Editor (step 2; the reader pastes over the `petstore-3.1.yaml` fixture the Editor opens with, since the Editor cannot load from a URL), extend the fixed file with a response schema and a `components` `Pet` schema in VS Code (step 3), CLI validate + CI (step 4, validates the broken original as `broken.yaml`), CLI overlay apply (step 5), ApiDOM (step 6). Each step moves the same document forward; no step is throwaway. It only uses shipped CLI commands. All terminal output and the ApiDOM snippet were run for real; re-run them if the CLI or packages change
- Guides get a hero image like blog posts (same `blog-hero-image` skill and rules), stored in `assets/images/docs/<slug>.webp` with a `<slug>.png` sibling, declared in the guide's `image` front matter (`path` = WebP, `social` = PNG, same social-preview mechanism as blog posts), shown in a `<figure>` under the guide intro and as the thumbnail on its landing card
- Guide screenshots live in `assets/images/docs/getting-started/` (user-supplied PNG converted to WebP with Pillow at quality 85, `lightbox-trigger` + `loading="lazy"` like the Toolkit page). Present: `editor-errors.webp` (step 2) and `ref-completion.webp` (step 3, captured in the browser Editor on the exact step 3 file; the caption says so, since the Editor runs the same Toolkit extension as VS Code)
- Sample files live in `assets/samples/getting-started/` (`openapi.yaml` has two deliberate errors: missing `info.version`, numeric `operationId`; `overlay.yaml` adds a description and a server). Keep them in sync with the listings in the guide
- Every **Get started** CTA (nav desktop + mobile, homepage hero + pipeline section, manifesto) links to the getting-started guide. Plain **Docs** links (nav, footer) go to `/docs/`
- Terminal mocks use `.t-add` (green) for lines an operation added to a document
- The docs landing uses `layout: base` with full-bleed sections whose backgrounds alternate (hero gradient header, then `bg-white` / `bg-gray-50` per section, like the homepage). Keep alternating as sections are added
- Guide pages use `layout: base` with `_includes/docs-sidebar.html` on the left (same wrapper as ApiDOM pages). The sidebar is specific to the current guide: a back link to `/docs/#guides` ("← Guides", also used for the "Back to guides" link at the foot of the page), the guide title (`sidebar_title` front matter, falls back to `title`), and the guide's section anchors from a `toc` list in front matter (`title` + `anchor` per item). The in-page "On this page" box renders the same `toc` and is `lg:hidden`, so it only appears when the sidebar is hidden. Keep `toc` anchors in sync with the heading IDs

## Naming Conventions

- Use **"VS Code"** (with a space), not "VSCode". This matches Microsoft's official branding.
- URLs and package names keep their original casing (e.g., `vscode-openapi-toolkit`, `vscode.dev`)

## Important Notes

- No mention of SmartBear or Swagger as company names in ApiDOM content. The origin story refers to "a large API company."
- ApiDOM's `traverse` function is in `@speclynx/apidom-traverse` (there is no `visit` function)
- ApiDOM is lossless: preserves comments, key ordering, format styles, raw CST source texts, and LSP-compatible source maps (UTF-16 code units)
- The `baseurl` is `""` (empty) — internal links use `{{ '/path/' | relative_url }}`
- The `url` is `https://speclynx.com`
- **UseArazzo** (usearazzo.com) is a separate Arazzo workflow toolkit built on SpecLynx, not a SpecLynx product page. It appears in three places only: the featured band on the homepage (`#usearazzo`, a dark panel inside "The tools" section, directly under the tools list, heading is an h3, its own green accent via `.usearazzo-*` classes in `main.css`, logo at `assets/images/logos/usearazzo-logo.svg`), the last row of "The tools" list, and the footer Products list. CTAs stay "Explore UseArazzo" (external) and "Talk to the maintainers" (mailto) until a commercial offer exists: no pricing, no "buy". The band says only "Free and open source under Apache 2.0" (the pre-1.0 / not-on-npm caveat was cut as unnecessary). Its workflow illustration is stylized SVG, not real CLI output
