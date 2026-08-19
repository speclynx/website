---
name: blog-hero-image
description: >-
  Design, render, and wire in the hero image for a SpecLynx blog post — a
  hand-crafted 1280×520 SVG illustration in the brand palette (navy/blue/
  light-blue/green, flat geometric, soft glows, no logo, no photography),
  rasterized with headless Chrome and saved as WebP in assets/images/blog/.
  Use this whenever a blog post needs a hero/cover/header/og image, when the
  user says "make an image for this post", "hero for the new article",
  "blog illustration", "cover image", or wants to iterate on an existing
  hero's composition or colors — even if they don't say "hero" or "SVG".
  Also use it when they want a prompt to design the image on claude.ai
  instead. Every post requires a hero, so reach for this proactively when
  a new post is being added and no image exists yet.
---

# Blog hero image (for SpecLynx)

Every post on speclynx.com ships with a custom hero illustration, in the
spirit of quobix.com/articles: a single flat-geometric scene that tells the
article's story in brand colors. The blog index features the latest post with
a big image and shows the rest as image-top cards, so a missing or off-brand
hero breaks both the layout and the visual identity.

This skill covers the whole job: pick a metaphor → write the SVG → render a
preview → iterate with the user → export WebP → fill in the post's `image:`
front matter. Prose is still the human's — you own only the image and its
metadata.

Two ways to produce the SVG:

- **Default — design it here.** Write the SVG yourself, render with the
  bundled script, look at the PNG, refine. Fast loop, no context switch.
- **Alternative — design on claude.ai.** If the user prefers to iterate
  visually as an artifact, fill in `references/claudeai-prompt.md` with the
  topic and metaphor, hand it over, and pick up the downloaded SVG at the
  render step. Same rules, same script.

## 1. Find the metaphor

Read the post (`_posts/<date>-<slug>.md`) if it exists; otherwise ask for a
one-line summary. Then propose a **central metaphor** — the visual story the
frame tells — and confirm it before drawing. Offer two or three directions in
a sentence each when the topic is abstract. A good metaphor:

- illustrates the *problem or transformation* the article is about, not the
  product's feature list (a black box cracking open, a tangled line becoming
  a clean graph, a lens resolving blur into structure);
- works at card size (160px tall, cropped from the right) as a single
  recognizable silhouette;
- needs no words to read. Text is a last resort — at most one short display
  word (a product name, a spec keyword) if the metaphor genuinely demands it.

The previous hero (`assets/images/blog/open-sourcing-apidom.webp`) is the
style reference; open it to calibrate density and mood before drawing.

## 2. Draw the SVG

Write the SVG to the scratchpad as `<slug>.svg`. Non-negotiables, and why:

| Rule | Why |
|---|---|
| `viewBox="0 0 1280 520"`, width/height 1280/520, fully self-contained (no `<image>`, scripts, external fonts, `@import`) | Rendered by a local Chrome with no network; exported at exactly this size |
| Palette only: `#092B4E` navy (base), `#0C3A66` mid blue (gradient partner), `#3A97CC` brand blue, `#77D6F4` light blue, `#BEE9FA` near-white glow, `#7EE0B2` green accent, white. Opacity is how you get tints — not new hexes | Consistency across the blog index; the lint flags anything else |
| Background: diagonal gradient `#092B4E → #0C3A66 → #092B4E` plus one or two large blurred glow circles | Gives depth without leaving the palette; every hero shares this ground |
| No logo, no "SpecLynx", no "Blog" anywhere | The illustration owns the frame; branding lives in the page chrome |
| Flat geometric shapes with rounded corners, `feGaussianBlur` glows, light rays as tapered translucent triangles, small circular "element node" particles in light blue / green / white | The house style — reads well at card size and matches the existing hero |
| Keep everything essential inside the **left 85%** (x ≤ ~1090); only decorative elements beyond | Cards use `object-cover object-left`, so the right edge is what gets cropped |
| If text is used: `font-family: system-ui, sans-serif`, bold, one word | No webfonts available at render time; keeps it legible |

Build in layers — background, glows, rays, main subject, particles — with
`<g>` groups and comments so the user can ask for "more rays" or "move the
crowd left" and you can edit surgically. Prefer `<defs>` for reused
gradients/filters. Avoid giant blur radii on many elements (slow to render,
muddy at card size); two or three glows carry a frame.

## 3. Render, look, iterate

```bash
python3 .claude/skills/blog-hero-image/scripts/render.py <scratch>/<slug>.svg --png <scratch>/<slug>.png
```

The script lints first (viewBox, off-palette colors, forbidden text, external
refs) and prints warnings, then screenshots via headless Chrome. **Read the
PNG yourself** before showing it — check the silhouette reads, nothing
essential sits in the right 15%, glows aren't washing out the subject, and
the particles look intentional rather than scattered. Fix obvious issues
first, then give the user the PNG path and a one-line description of what
they're looking at. Iterate on their feedback; keep each round's SVG edit
small and re-render. Don't ask about details you can settle yourself
(exact shades, particle counts) — ask about direction (metaphor, focal
subject, mood).

If the user wants to design on claude.ai instead: fill the two bracketed
slots in `references/claudeai-prompt.md`, hand them the prompt, and when
they return the SVG, run it through the same script — the lint catches
drift from the rules.

## 4. Export and wire in

When the user is happy:

```bash
python3 .claude/skills/blog-hero-image/scripts/render.py <scratch>/<slug>.svg \
  --png <scratch>/<slug>.png --webp assets/images/blog/<slug>.webp
```

`<slug>` matches the post's filename slug. Then set the post's front matter:

```yaml
image:
  path: assets/images/blog/<slug>.webp
  width: 1280
  height: 520
  alt: <what the picture literally shows, one sentence, no "image of">
  caption: "<short caption tying the scene to the article>"
```

Propose `alt` and `caption` and let the user adjust — both are image
metadata, not article prose. `image` is required by the templates; the
JSON-LD and blog index assume every post has it. Keep the SVG source in the
scratchpad (or hand it to the user) — it isn't committed unless they ask.

Sanity check before finishing: the WebP is 1280×520 and roughly 30–120 KB;
the post renders at `/blog/<slug>/` with `bundle exec jekyll serve`; the
card on `/blog/` still reads with the right side cropped.

## Don'ts

- No photography, stock art, clip art, emoji, or colors outside the palette.
- No logo overlay, wordmark, or "Blog" label composited onto the image.
- Don't write or rewrite the post's prose while you're in there.
- Don't add new build dependencies — Chrome + Pillow is the whole toolchain.
