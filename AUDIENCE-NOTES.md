# Audience Notes

Reference notes about SpecLynx's audience, kept separate from
[`CONCEPT-CATALOG.md`](./CONCEPT-CATALOG.md) on purpose: this file is
research input (what the audience already knows and is up against), the
catalog is content output (what to write about). Update this file as
research turns up more; pull from it when writing or reviewing a brief in
the catalog.

See the `content-strategy` skill (`.claude/skills/content-strategy/`) for
the reasoning behind this structure (its "Mindhunting" and "Lingua Franca"
sections in particular).

---

## Who the audience is

Two audiences, the same two as UseArazzo's (usearazzo.com is built on
SpecLynx and speaks to the same people). Unlike UseArazzo, both are served
by shipped products today. A piece names which one it is for before it gets
an angle. A piece that tries to reach both usually reaches neither.

**These definitions are hypotheses** (adopted 2026-10-18 from UseArazzo's
audience notes, before there was much of an audience to observe on
speclynx.com). Revise them as real people interact with the content: log
each signal under "Observed" below, and change a definition when several
independent signals agree, not on one data point.

### 1. Tool builders

Developers writing code *against* API description documents: editor
plugins, linters, generators, documentation renderers, agents.

- **Roles:** tooling, platform, and DX engineers; open-source maintainers
  of API tooling. Experienced, individual contributors, comfortable
  reading a spec.
- **What they are trying to get out of the way:** reading an OpenAPI,
  AsyncAPI, or Arazzo document and everything it references into a
  structure they can trust (with positions, comments, and errors intact),
  so they can get on with the tool they actually set out to build.
- **How they solve it today:** `yaml.parse` or `JSON.parse` plus
  hand-rolled handling of `$ref`s, source positions, and errors; or a
  validator-shaped library that was never meant to be a foundation for
  editor tooling.
- **Served by:** ApiDOM (`@speclynx/apidom-*`), the Language Service
  (`@speclynx/api-languageservice`), the ApiDOM doc pages, step 6 of the
  getting-started guide.
- **Assume they know:** OpenAPI, JSON Schema, TypeScript, Node.js. Assume
  they do not know SpecLynx exists.

### 2. Spec practitioners

Engineers who already maintain an OpenAPI (or AsyncAPI) description and
keep it correct, linted, and customized by hand. UseArazzo calls the same
people "workflow practitioners"; on speclynx.com the workflow is the
spec's own lifecycle: author, validate, customize, ship.

- **Roles:** backend, QA/test, and platform engineers; API designers;
  technical writers. Often a lead choosing tooling for a team and a CI
  pipeline.
- **What they are trying to get out of the way:** keeping the API
  description correct and consistent across editors, CI, and audiences
  without maintaining a pile of scripts or forked copies.
- **How they solve it today:** the DIY Competitors list below, plus
  hosted editors and linters.
- **Served by:** the Editor, the OpenAPI Toolkit, the CLI, their product
  pages, and steps 1 to 5 of the getting-started guide.
- **Assume they know:** OpenAPI, VS Code, CI. Assume they do not know the
  Overlay specification well, if at all.

### Not the audience (yet)

- **Agent and MCP builders:** nothing SpecLynx ships targets them
  directly. Revisit when it does.
- **People learning OpenAPI as a specification:** the site does not teach
  the spec from zero.
- **Non-technical buyers:** there is nothing to buy.

### Observed

One line per signal: date, where (issue, Discussion, social reply,
analytics), who (role, not name), which audience they fit or that they fit
neither. Empty so far.

### Open, to fill from real people rather than guesses

- Who has actually engaged so far (issues on the SpecLynx repos,
  Discussions, Toolkit marketplace reviews, replies to social posts), and
  which of the two audiences were they?
- Company size and whether the chooser is the user.
- Where each audience goes first for a technical answer.

---

## Lingua Franca

The tools, standards, and languages SpecLynx's audience already speaks.
Framing future content in these terms, rather than reinventing vocabulary
per piece, is the point of keeping this list.

- **Standards:** OpenAPI (2.0, 3.0, 3.1), AsyncAPI, Arazzo, the OpenAPI
  Overlay specification, JSON Schema, JSONPath (RFC 9535 and its older
  dialects), YAML and JSON.
- **Language and runtime:** TypeScript and JavaScript, Node.js, the
  browser.
- **Protocols and interfaces:** the Language Server Protocol (the
  Language Service implements LSP-aligned features as a library, not a
  server; an LSP server can wrap it).
- **Adjacent tools:** VS Code, Swagger Editor and Swagger UI, Redocly,
  Spectral and other linters, Postman, codegen tools, CI runners (GitHub
  Actions first).

Update this list as CLI roadmap items (dereference, bundle, convert) move
from planned to shipped, rather than guessing ahead of the code.

---

## DIY Competitors

What SpecLynx is actually up against for most of its audience isn't a
named competing product, it's a developer's own script. Naming these
explicitly is what makes it possible to teach that path honestly instead
of vaguely gesturing at "doing it yourself."

- **A YAML or JSON load plus custom traversal code**, written to pull
  something out of a spec, which loses comments, key order, and source
  positions on the way.
- **Ad hoc checks in CI** (grep, `jq`, a small script) standing in for
  validation and linting.
- **Hand-maintained copies of a spec** per audience or environment, or
  `sed`/`jq` patches applied at build time, instead of overlays.
- **In-house editor integrations** stitched together from a JSON Schema
  and a generic YAML language server, without spec-aware completion,
  hover, or `$ref` navigation.

This list is the honest starting point for DIY-instinct content in
`CONCEPT-CATALOG.md`, not a set of competitors to argue against.
