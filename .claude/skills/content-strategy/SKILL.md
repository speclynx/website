---
name: content-strategy
description: >-
  Tactical system for turning SpecLynx's content stance into a concrete
  pipeline of pieces: generating and testing angles with the Problem/Angle/
  Teach pattern, catching common content mistakes before publishing,
  researching the audience through mindhunting, grouping scattered topics
  into durable concepts, grounding topics in real search terms, giving docs
  their distinct jobs, repurposing a guide into a tutorial, competing with
  the DIY instinct honestly, and mapping the tools and standards the
  audience already speaks. Informed by reading "Technical Content Strategy
  Decoded" (Adam DuVander). Use this whenever generating headline or topic
  candidates, deciding whether a draft or announcement actually has a
  problem/angle/teaching hook, planning a multi-piece content arc around one
  product or theme, deciding whether a guide is ready to spawn a tutorial,
  comparing SpecLynx to alternatives or DIY approaches, or when the user
  asks things like "what angle should this post take," "is this just a
  feature announcement," "what's our Concept Catalog," "should this be a
  guide or a tutorial," or "how do we compete with people hand-rolling
  this." Pairs with the `developer-marketing` skill, which sets the overall
  stance and audits developer experience; this skill is the system for
  producing individual pieces once that stance is set.
---

# Content Strategy (for SpecLynx)

Where `developer-marketing` sets the stance (educator, not marketer; lead
with the problem) and audits the site's developer experience,
`content-strategy` is the working system for turning that stance into
specific pieces: how to test whether a draft actually has something to say,
how to research the audience deeply enough to find real angles, how to keep
a backlog of topics from becoming a scattered pile, and how to compete
honestly with a reader who would rather build it themselves.

*Provenance:* informed by Vladimír Gorej's own reading of Adam DuVander's
*Technical Content Strategy Decoded*, written in his own words and
reorganized around how it's actually used day to day. It is not a summary,
excerpt, or reproduction of the book. Read the book for the full argument;
this file only captures the operational takeaways relevant to running
SpecLynx's site.

## Scope boundary (read this first)

This skill governs the *mechanics of producing content*, not whether to
publish at all or what SpecLynx's overall voice is; `developer-marketing`
and `CLAUDE.md` still own that. Apply this skill to test an angle, sequence
a multi-piece topic, or research the audience, never to write or rewrite
blog prose itself: **blog post prose is written by humans.** For product
pages, guides, and tutorials, apply the frameworks below to plan structure
and angle; the prose conventions (no em dashes, "VS Code" naming, shipped
CLI commands only, FAQ/JSON-LD sync) still come from `CLAUDE.md`.

## The Problem/Angle/Teach test

Before a headline, topic, or draft goes further, check it against three
questions. All three should be true; a piece missing one usually isn't
finished yet, it's a placeholder.

1. **Problem.** Does it name a real problem the audience has, before it
   names SpecLynx? A pure release announcement is the hardest case to pass
   this test honestly: it's tempting to lead with the release and stop
   there. The two existing posts show both ends. "One Overlay, three
   JSONPaths" passes cleanly: it opens on a problem every Overlay author
   can hit (the same overlay applies in one tool and fails in the next)
   and only then argues what a compliant implementation should do. "We
   just open-sourced SpecLynx ApiDOM" is the announcement case; its
   description earns its place by pivoting to what the reader can now do
   (power their own spec tooling on an auditable core), and that pivot is
   the part to strengthen in any future release post.
2. **Angle.** Does it take a specific position, rather than restate the
   obvious? A raw keyword or feature name isn't an angle; the angle is what
   that keyword or feature *means* for the reader's actual work. "Should a
   compliant implementation accept dialects?" is an angle; "Overlay support
   in the CLI" is a feature name.
3. **Teach.** Does it explain why something matters, not just how to do it?
   A piece that only shows mechanics without ever saying why the mechanics
   matter reads as documentation wearing a blog post's clothes.

Run this test on a draft outline before writing, and again on a finished
piece before publishing. When a piece fails, the fix is almost always to
push the problem statement earlier and the product mention later, not to
add more explanation of what the product does.

## Common mistakes to catch before publishing

A short list of failure modes worth checking a draft against directly,
because they're easy to write without noticing:

- **Features with no benefit attached.** A list of what something does,
  with no connection to what it's for.
- **No position taken.** A piece that explains a concept neutrally instead
  of arguing something, so it could have been written by anyone.
- **Depth without context.** Technical detail dropped in before the reader
  has a reason to care about it (CST nodes and source maps before the
  reader knows why a lossless parse matters to them).
- **Wrong level for the actual reader.** Written for whoever the author
  pictures, not the person who will actually land on the page from a
  search result.
- **Written from too close to the code.** The person who built something
  tends to explain how it works; the reader usually needs to know what it's
  for first. This is SpecLynx's most likely failure mode, since the team
  built ApiDOM and the language service from the inside. Worth rechecking
  at review time, not just at the outline stage, since it's easy to drift
  back toward internals while editing.

None of these are fatal on their own, but a draft carrying two or more is
usually not ready, and the fix is almost never "add more detail," it's
narrowing to one honest position and cutting the rest.

## Mindhunting: researching the audience on purpose

Don't start from the product. Start from the list of problems it was built
to solve and the use cases it's already known to be good for, then
deliberately widen the picture:

- Other tools the audience reaches for daily (Swagger Editor and Swagger
  UI, Redocly, Spectral and other linters, Stoplight, Postman, codegen
  tools, CI runners)
- Their common workflows: writing an OpenAPI description in an editor,
  linting it in CI, customizing it per audience or environment with
  overlays, and building internal tooling that has to read it
- Standards and conventions they already know: OpenAPI, AsyncAPI, JSON
  Schema, JSONPath, the Language Server Protocol
- Competitive and open-source alternatives already in their toolbox
- How technical decisions get made on their team, and the titles they hold
  (API designer, backend engineer, platform/DX engineer, technical writer,
  and tool builders who embed a parser or language service in their own
  product)

A few honest prompts surface real angles faster than guessing: What's
genuinely annoying about a day in this work? How do they solve the problem
today, before a tool like this exists for them? Where do they go first for
a technical answer? Answer these for SpecLynx's actual audience before
proposing a topic, not after. Who that audience is lives in
`AUDIENCE-NOTES.md` at the repo root ("Who the audience is": **tool
builders**, the Language Service and ApiDOM consumers, and **spec
practitioners**, the Editor, Toolkit, and CLI users; the same two audiences
as UseArazzo's). The two need different depth and different entry points.
Read it before mindhunting, name which of the two a piece is for, and
record what the research turns up back in that file.

## The Concept Catalog: group topics before they scatter

A single topic reaches an audience once; it doesn't hold them. Group related
topics into durable **concepts**, each large enough to carry several pieces
over time, and keep them in one shared, living list, not a content calendar
that only tracks individual publish dates.

For SpecLynx, the natural concept boundaries are the operations developers
perform on a spec, not the product names: authoring and fixing a document,
validating and linting it, customizing it with overlays, and parsing it
losslessly to build tooling on top. Today "overlays" (the JSONPath dialects
post, `overlay apply` / `overlay diff`, getting-started step 5) and
"lossless parsing" (the ApiDOM post and the four ApiDOM doc pages) have
the most surface; "validating" is next as `validate` matures. Do not build
dereference-, bundle-, or convert-shaped content ahead of those CLI
commands shipping, per the "only shipped CLI commands" discipline in
`CLAUDE.md`.

Keep each Concept Catalog entry short: three sentences answering why the
concept matters, what it will cover, and how it connects to SpecLynx, plus
which of the two audiences it serves.
Expanding an existing concept beats starting a new one: go more specific
(a sub-topic within it), go more broad (the parent problem it sits inside),
or apply the Problem/Angle/Teach test to find a genuinely new branch. The
catalog lives in `CONCEPT-CATALOG.md` at the repo root (with an entry
template); add concepts there.

## Grounding topics in real search terms

Concept Catalog entries and mindhunting prompts produce candidate topics;
search-term data is what tells you which candidates the audience is
actually typing. Keep the process lightweight rather than letting it become
its own project:

1. Pull rough search-volume data for candidate terms.
2. Filter down to the ones that are both relevant to the concept and
   realistic to rank for, given how small and specific this space is.
3. Write or edit toward the terms that survive, rather than backfilling
   keywords into a draft after the fact.

Good seed sources for candidates: broad category terms ("OpenAPI editor",
"OpenAPI overlay", "OpenAPI linting", "OpenAPI parser JavaScript"), the
name of a directly adjacent open-source project, whatever's already
performing on the blog or the product pages, and comparable content from
elsewhere in the space. Treat this as a way to sharpen an angle already
found through mindhunting or the Problem/Angle/Teach test, not a
replacement for either.

## Search Solutions, Not Products: three ways to find an angle

Rather than starting from a feature, start from what the audience is
already searching for.

- **Frame it as an alternative.** People search for alternatives to
  specific tools constantly; most of that attention goes to named
  competitors, not open-source options. SpecLynx's honest angle here is
  the approach rather than an attack: a fully client-side editor instead of
  a hosted one, a lossless parser instead of one that silently rewrites the
  document, standard overlays instead of hand-maintained forks of a spec.
- **Connect to a popular, adjacent project.** Ask why a well-known tool in
  the space was built, who uses and supports it, how people get started
  with it, and how it could be used alongside SpecLynx. The OpenAPI and
  Overlay specifications themselves, VS Code, and widely used linters are
  the natural anchors.
- **Compare honestly.** Why would someone choose one approach over another
  for a given architecture or use case? What changes with team size, CI
  setup, or existing tooling? Comparison content that is actually fair
  outranks comparison content that is a pitch in disguise, and a skeptical
  technical audience can tell the difference immediately.

A practical source of raw material for all three: treat Stack Overflow,
relevant subreddits, the OpenAPI Initiative's GitHub discussions, and
API-tooling forums as a way to see how the audience already talks about
comparing and choosing solutions, then feed what's found back into the
Concept Catalog.

Beyond the blog itself, broader technical publications (the kind that
cover API tooling generally) are a legitimate channel once a piece is
strong enough to stand on its own outside speclynx.com; that's a
distribution decision to make per piece, not a standing commitment. A
program that invites the community to contribute content is a later-stage
move, worth revisiting once there's an actual community of users to draw
from, not before; forcing it early would read as exactly the kind of
inauthentic reach the "lead with the problem" stance is trying to avoid.

## Giving docs three distinct jobs

Documentation content works better when each piece knows which of three
jobs it's doing, rather than trying to do all three at once:

- **Reference** lists functionality, precisely and completely.
- **Samples** package one use case together with working code.
- **Guides** are the connective tissue: the walkthrough that links reference
  and samples into a path a reader can follow.

On speclynx.com, `/docs/` already splits **Guides** and **Tutorials**
(tutorials are the samples: one use case, one tool, finishable in a
sitting). A reference section is planned but does not exist yet; until it
does, the ApiDOM pages (`/apidom/...`) and the product pages carry most of
the reference load, and the sample files in `assets/samples/` are the
nearest thing to downloadable samples. Keep the assignment explicit when
planning new content rather than defaulting to one long page that tries to
explain, demonstrate, and enumerate all at once. When a reference page
starts explaining *why*, or a tutorial starts listing every option instead
of the one path it's showing, that's the signal it's drifted into a
different job than the one it started with.

## Repurposing: from guide to tutorial

A piece of content doesn't have to stay in its original shape. But
repurposing only pays off when it finds a genuinely new angle on the
material; copying the same headline and structure into a new format rarely
earns a second read.

The getting-started guide is the obvious quarry: it follows one document
through all five products, so each of its steps is a tutorial candidate
already half-formed. The move isn't to lift a step's prose into its own
page; it's to find the one use case inside a step that deserves a deeper,
standalone, runnable path (for example, step 4's "validate in CI" grown into
a full CI tutorial, or step 5's overlay grown into "maintain a public and an
internal spec from one source"). The guide's existing sub-headings are
usually where that candidate is already sitting. Likewise, a blog post with
a strong position (the JSONPath dialects post) can seed a guide that teaches
the practical side the post only argued.

## Competing with the DIY instinct honestly

For tooling like this, the biggest competitor is often not another named
product, it's a developer's own script. The concrete forms it takes are
listed under "DIY Competitors" in `AUDIENCE-NOTES.md`; start from there
rather than inventing new ones per piece. Attacking that instinct directly reads as defensive; the
stronger move is to follow its momentum: don't present SpecLynx as an
immediate solution, teach the DIY path fully first. Getting a first version
running is the easy part; the real cost shows up later, in the edge cases a
happy-path script never anticipated (comments and key order lost on
round-trip, `$ref` cycles, source positions that don't map back to the
file, JSONPath dialects that disagree), the one-off adjustments a specific
team eventually needs, and the ongoing work of keeping it correct as usage
grows past what it was written for. That long tail is exactly where
SpecLynx's own hard-won detail belongs, taught like a colleague who has
already been through it, not withheld as a selling point.

Content that follows the DIY instinct this way is a strong example of the
Problem/Angle/Teach pattern: the problem is embedded in the pain of doing
it by hand, the angle is the honest "you can do this yourself" framing, and
the teaching is the hard-won detail SpecLynx already has. It only works if
it's genuinely useful to a reader who ends up not adopting SpecLynx at
all; that's the same test `developer-marketing` applies to every post.

## The Lingua Franca: what the audience already speaks

Write down, once, the tools, standards, and languages SpecLynx's audience
already uses, so future content can be framed in that language rather than
reinvented per piece. The list lives in `AUDIENCE-NOTES.md` under "Lingua
Franca" (one copy only, so it can't drift); read it before framing a piece
and update it there as CLI roadmap items (dereference, bundle, convert)
move from planned to shipped, rather than guessing ahead of the code.

## Measuring what actually matters

Raw views are a weak signal on their own. When reviewing whether content is
working, look for movement up a ladder of next steps instead: does the
reader spend real time with the piece, read a second piece, explore the
docs, or eventually try a product (open the Editor, install the Toolkit,
run `npx @speclynx/cli`, add an `@speclynx/` package)? Chasing raw traffic
pulls topics toward whatever's momentarily popular and away from the
audience's actual problems, which shows up later as visits that never turn
into anything.

## Quick review heuristic

For any headline, draft, or content plan: does it pass Problem/Angle/Teach?
Is it free of the common mistakes above? Does it come from an honest
picture of the audience (mindhunting), not a guess, and does it say whether
it's for spec practitioners or tool builders? Does it belong to a concept that
will get more than one piece, or is it a one-off that will scatter? If it
touches something a reader could build themselves, does it teach that path
honestly before mentioning SpecLynx? When in doubt, the fix is almost
always the same one `developer-marketing` reaches for: earlier problem,
later product.
