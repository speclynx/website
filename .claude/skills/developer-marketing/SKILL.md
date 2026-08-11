---
name: developer-marketing
description: >-
  Strategic lens for creating or reviewing SpecLynx website content — blog
  posts, product pages, FAQs, getting-started/onboarding flows, guides,
  tutorials, and developer portal structure. Informed by reading "Developer
  Marketing Does Not Exist" (Adam DuVander): the educator mindset,
  problem-focused content, a developer experience checklist, tutorial/guide
  structure, and content cadence. Use this whenever planning a new post or
  page, choosing what to write about next, structuring a getting-started
  guide, drafting a headline, reviewing existing content for gaps, or when
  the user asks things like "what should we write about," "does this page
  work for developers," "how should this tutorial be structured," or "are we
  missing anything on the DX front." Consult it proactively even if the user
  doesn't name it — any task that shapes what SpecLynx publishes or how a
  developer-facing page is organized should route through this lens before
  or during the work.
---

# Developer Marketing (for SpecLynx)

SpecLynx's audience is developers, and developers evaluate tools by trying
them — not by reading pitches. This skill is the strategic lens for what to
publish, how to structure it, and why, applied to SpecLynx's five products
(Editor, OpenAPI Toolkit, CLI, Language Service, ApiDOM).

*Provenance:* informed by Vladimír Gorej's own reading of Adam DuVander's
*Developer Marketing Does Not Exist*, written in his own words and reorganized
around how it's actually used day to day — not a summary, excerpt, or
reproduction of the book. Read the book for the full argument; this file only
captures the operational takeaways relevant to running SpecLynx's site.

## Scope boundary — read this first

This skill governs content *strategy and structure*: what topic to cover, how
a tutorial or getting-started flow is sequenced, what a page's information
architecture should include, whether a piece has the right shape. It layers on
top of `CLAUDE.md` and never overrides its mechanical conventions
(author-is-a-Person, naming rules, FAQ/JSON-LD sync, and above all: **blog
post prose is written by humans**). For blog posts, apply this skill to plan
an angle, suggest headline directions, or assess a draft's structure — never
to write or rewrite the prose itself. For non-prose scaffolding
(getting-started flows, portal navigation, FAQ topic selection, tutorial step
outlines, page IA), apply it directly.

## The stance everything follows from

Think like an educator, not a marketer: share knowledge, not features. The
test for any piece of content is — *would this still teach something true and
useful to a developer who never adopts SpecLynx?* If not, it's a pitch wearing
a blog post's clothes, and developers can tell.

The practical consequence: **lead with the developer's problem, not
SpecLynx's solution.** A post on "why lossless parsing matters for tooling
built on OpenAPI documents" reaches every developer who has that problem —
and search is how they'll find it, which makes problem-focused content a rare
first impression you actually control. A post on "5 features of ApiDOM"
reaches only people already sold. Weave the product in without a blatant
pitch; counterintuitively, keeping the focus *off* your product is what pulls
developers toward it. That restraint is what makes content rank, get shared,
and earn trust at scale.

Everything below is this stance applied to a specific task. Jump to the
section matching what you're doing.

## Planning what to write next

Before proposing any topic, answer three questions — and if you can't answer
the first, surface the gap to the user instead of guessing:

1. **Who** is this reaching? Be specific: not "API developers" but e.g.
   "backend engineers maintaining a Node.js API who want spec-driven tooling
   without vendor lock-in." Sharpen with these axes — vague answers here
   produce vague content:
   - Large companies, startups, or both?
   - Tooling/language context: OpenAPI/AsyncAPI authors, VS Code users,
     CLI/CI users, Node.js library consumers?
   - Early-career or experienced? Individual contributor, or a lead choosing
     tooling for a team?
   - Role: API designer, backend engineer, platform/DX engineer, technical
     writer?
   - What are they trying to get out of the way so they can do their real job?
2. **How** does this share knowledge with them, rather than describe SpecLynx?
3. **What** is SpecLynx's viewpoint here — the thing competitors either don't
   believe or don't say? (E.g.: lossless parsing isn't a nice-to-have; it's
   the difference between tooling that respects an author's document and
   tooling that silently rewrites it.)

**Constrain the formats.** A blog that publishes everything is a blog about
nothing. Stick to two or three recurring types; for SpecLynx the defaults are
**Tutorial** (a concrete spec-workflow problem, solved) and **Best Practices**
(e.g. structuring overlays, keeping specs lossless through a toolchain),
because they compound — tutorials double as documentation and work at every
funnel stage, even for existing users. **Vision** (why lossless/error-recovery
parsing matters, where API tooling is headed), **Comparison** (honestly
argued trade-offs between approaches), and **Roundup** (a curated list of
related technical choices with real analysis, not just links) are solid
occasional additions. Interview and behind-the-scenes formats exist but are
low priority for a small team — mention as options, don't push.

**Cadence beats volume.** Somewhere between two posts a month and two a week,
sustained, is the realistic band — consistency on a constrained set of themes
is what makes a blog read as a publication rather than a dumping ground. Never
recommend more than the team can sustain at high quality: a few great articles
outperform many mediocre ones, and a blog silent for 6–12 months actively
undercuts credibility (see the DX checklist below).

When asked for topic ideas, a reliable move: look at which existing posts and
pages perform best, and propose adjacent headlines — same audience and theme,
new angle.

## Outlining a tutorial

No content educates and inspires developers more than a tutorial. When
outlining or reviewing one, check it follows this arc:

1. **Context first** — name the problem before any steps. Readers need to know
   *why* they'd follow along before being asked to.
2. **Show the end result** — what does success concretely look like? A working
   CLI command, a validated overlay, a rendered spec.
3. **Walk the steps like a colleague, not a manual** — periodically recap
   what's done and what's next so the reader never loses the thread.
4. **End with the next step** — a related tutorial, reference docs, a CLI flag
   reference. Never just stop.

Habits to flag in a draft's outline:

- A "Prerequisites" wall at the top reads as homework — fold requirements in
  right where they're needed instead.
- Don't punt on a concept that's load-bearing for understanding; link out only
  the genuinely inessential detail.
- Start steps with a verb ("Run", "Add", "Validate") — it keeps momentum.
- Prefer bullets and sub-headings over dense paragraphs; a tutorial reader is
  scanning for the next action.

The written tutorial isn't the only format: instructor-on-camera video,
narrated audio, slide decks, and screencasts (of results or of code) all
work as companions or alternatives. One caveat when suggesting them — video
is a weak medium for text-heavy material like specs and code listings, so
for SpecLynx's subject matter the written form usually stays primary.

## Writing or reviewing a guide

A guide is broader and less tool-centric than a tutorial: it unpacks a problem
space and its best practices, and runs longer. The counterintuitive move that
makes guides work: be willing to explain how a reader could solve the problem
*without* SpecLynx. That honesty is what earns trust — and it's also what lets
the reader discover for themselves how much work the DIY route is. The deepest
guides become signature content: a competitor can copy features, but not
demonstrated depth of understanding. For ApiDOM especially — losslessness,
error recovery, round-tripping — this is the territory to keep deepening.

Keep guides open, not gated. An open, deep guide outranks a gated landing page
in search, and gating trades that reach for a marginal email capture —
developers are exactly the audience most skeptical of the trade. If a gated
version is genuinely wanted, offer it *alongside* the open content (e.g. a PDF
edition), never instead of it.

A finished guide is a quarry, not a monument: repurpose pieces as blog posts
(a fresh angle on the material beats verbatim reuse), slides, talks, or a
short email series.

## Designing a getting-started flow

If a developer-facing page could carry exactly one element, it would be a
clear "get started" path built around a real use case. "Time to Hello World"
is the metric that matters: the getting-started flow is what moves a developer
from "this looks plausible" to "this works for me."

The flow is only as good as the use case it's built on, and the right use
case comes from understanding how developers actually want to use the
product. When choosing (or challenging) one, brainstorm candidates along
several axes — by industry, company size, customer segment, business
department the code serves, and developer persona — then pick the most common
path, not the most impressive one.

When designing or reviewing the flow itself — for any of the five products —
check against these five failure modes:

1. **Product-first framing.** The use case is the headline; the product is how
   it gets solved. Solve one common problem with a *subset* of functionality.
2. **Concept dump.** Don't front-load background — drip concepts in exactly
   when the walkthrough needs them, and link to deeper docs for the rest.
3. **Trying to cover everything.** Get the reader to a working result fast;
   completeness is the reference docs' job, not this page's.
4. **Competing entry points.** One canonical getting-started path per product.
   Language or format variants are fine if chosen from a single place;
   parallel guides fragment the first impression.
5. **Going long.** Finishable in one sitting: explain the minimum needed to
   see the potential, then end — with concrete next steps and links.

And make it easy to ask a question from anywhere in the flow — a visible,
reliable contact path beats a feedback black hole.

## Auditing developer experience

When auditing the site or substantially reworking a product page, walk it
against these four questions. Call out the weakest one or two explicitly
rather than declaring everything fine — and fix the biggest gap first.

**Can a developer try it without talking to anyone?**
- A genuine self-serve path, no sales-call gate
- A free tier or trial
- A pricing page that's actually clear — no "call us," no gotchas

**Can they get from curious to working code fast?**
- A getting-started guide deep enough to show real capability, not a toy
- Libraries/SDKs in the languages they already use
- Sample apps or repos to download, paired with a supporting tutorial
- Concrete terminal examples — much of a developer's day happens in a shell,
  and the CLI product page especially should lean into this

**Can they trust what they find?**
- Reference documentation that's accurate and in sync with the product
- Documentation surfaced prominently — in the nav, not buried
- Status information for anything hosted (relevant to the Editor)
- Recent, dated blog activity — a 6–12-month-old latest post reads as an
  abandoned project
- Where feasible, examples a reader can actually run, not just read

**Is there somewhere to go when they're stuck?**
- A visibly reliable place to ask questions — answered, not a black hole

## Free tools and open source as marketing

Open source is already SpecLynx marketing: ApiDOM, public SDKs, and open docs
improve a developer's first real experience and earn credibility with people
who've already found the project. Part of that "content" is responsiveness —
outside issues and PRs that get watched and answered.

If a standalone give-away tool is proposed as a marketing play, hold it to:
**no catch** (no signup or paid plan — even requiring an email breeds
skepticism); **one specific problem** solved well, not a multipurpose kit;
**search first** — check what already exists before building; **its own home**
(dedicated repo or page); and **recognizable relevance** to SpecLynx's actual
domain of spec parsing and tooling. The formula: focus on a problem, give away
a useful solution, and let the product ride its draft.

Partnerships and sponsorships follow the same spirit: long-term relationships
with people already talking to the right developers, not quick growth tactics.

## Product problem-angles

When content touches a specific product, anchor it to that product's problem,
not its feature list:

- **Editor** — authoring and reviewing OpenAPI documents without losing
  formatting or comments. Tutorials should center on real editing workflows.
- **OpenAPI Toolkit** — catching spec errors and getting completion/hover
  *before* they cost review time. Its screenshots are the "show the end
  result" step in action.
- **CLI** — applying and diffing overlays in CI, not just locally. Lean into
  runnable terminal examples.
- **Language Service** — building custom editor tooling on a reliable
  LSP-compatible foundation instead of reinventing spec intelligence.
- **ApiDOM** — losslessness and error recovery made concrete: round-tripping a
  document, tooling that survives malformed input. Signature-content
  territory — new guide material should deepen it, not restate the overview.

## The underlying discipline

Two traits sit beneath all of the above. First, **empathy**: every piece of
content should come from someone standing in the developer's shoes — during
research, planning, and review alike. Having lived the coding life helps but
isn't required; genuinely understanding the reader's pains is. When reviewing
content, ask whether its author demonstrably understands the problem or is
describing it from the outside. Second, **a steady supply of content is the
lifeblood** of developer marketing — it's what lets SpecLynx keep exploring
new topics and keep the drumbeat of its viewpoint going. The written word
stays the staple, but video, podcasts, and other media are legitimate
extensions of the same work when capacity allows.

## Quick review heuristic

For any existing page or post: does it lead with a developer's problem or with
SpecLynx's features? Would it still be useful to someone who ends up choosing
a competing tool? When a page reads as a pitch, the fix is almost always to
move the problem explanation earlier and the product mention later — not to
add more feature copy.
