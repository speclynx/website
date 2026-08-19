---
title: "One Overlay, three JSONPaths: should a compliant implementation accept dialects?"
description: "OpenAPI Overlay targets are JSONPath expressions, but which JSONPath? The same overlay can apply cleanly in one tool and fail in the next. Here's why, how the dialects diverge in practice, and why a canonical implementation should be strict about what it consumes."
date: 2026-08-19 10:00:00 +0200
image:
  path: assets/images/blog/overlay-jsonpath-dialects.webp
  width: 1280
  height: 520
  alt: Three JSONPath dialect labels (RFC 9535, JSONPath Plus, and Goessner), each firing a line that strikes one of the three stacked layers of the Overlay icon
  caption: "Three JSONPath dialects, one Overlay: which should a compliant implementation accept?"
---

A standards body for the banking industry writes five [OpenAPI Overlays](https://spec.openapis.org/overlay/v1.1.0.html), one per API, to stamp regulatory annotations onto schemas that don't already carry them. The overlays are tested against a popular CLI and produce exactly the expected output. Then someone runs the same five files through a different Overlay tool, and every one of them fails on the first action:

```text
Error: Invalid JSONPath expression:
  "$.components.schemas.*[?(!@.x-fdx-csdf-account-categories && !@.x-fdx-csdf-technical)]".
  Syntax error at position 29, expected "[", "*", "_", "0", "-", ":", "!", "(", "@", "$", "-0", ".", "..", "&&", "||"
```

Nothing about the overlays changed. Nothing about the API descriptions changed. What changed is *which JSONPath* the tool on the other end speaks. That is the subject of this post: when an Overlay implementation is handed an expression written for a different JSONPath dialect, should it try to understand it anyway, or refuse?

Our answer is **refuse, and be helpful about it**. A canonical implementation should be strict about what it consumes. The rest of this post is the reasoning: what the dialects are, what the spec says, what other tools do, the honest case for leniency, and why strictness still wins.

## There is no single JSONPath (until recently)

JSONPath started as a [2007 blog post by Stefan Gössner](https://goessner.net/articles/JsonPath/). It described a syntax, shipped a JavaScript implementation with `eval()` inside, and left plenty unspecified. Every language ecosystem then grew its own interpretation:

- **Goessner-style** libraries (`jsonpath` on npm, most Python and Java ports) are the classic. Filter expressions are small scripts handed to the host language, so anything the host can evaluate, including its regex syntax and its comparison operators, "works".

- **JSONPath Plus** is a popular fork that added selectors the original never had: a parent selector, a property-name selector, and a handful of `@`-prefixed helpers and type selectors. Stoplight's Spectral runs on this dialect: its own Nimma engine supports most JSONPath Plus additions, it falls back to `jsonpath-plus` for compatibility, and its docs say it is [not yet aligned with RFC 9535](https://github.com/stoplightio/spectral/blob/develop/docs/guides/4a-rules.md#given). A lot of developers have muscle memory from writing rulesets against exactly this syntax.

- **RFC 9535** is the [IETF standard](https://www.rfc-editor.org/rfc/rfc9535.html), published February 2024. Names in brackets must be quoted, names after a dot are limited to letters, digits and underscores, filters are a real expression grammar rather than host-language code, and regexes and lengths come from a fixed set of functions. For a compliant implementation in JavaScript, see [`@swaggerexpert/jsonpath`](https://github.com/swaggerexpert/jsonpath).

For everyday paths (a named operation, all schemas under `components`, parameters filtered by `in`) all three agree. Then the edges bite:

<div class="table-scroll" markdown="1">

| You wrote | Goessner | Plus | RFC 9535 |
|---|---|---|---|
| `$..[?(!@.x-fdx-csdf-technical)]` | Silently matches nothing (read as `@.x - fdx - …`); the legacy Go engine in the story accepts it | Error: `fdx is not defined` | Parse error at the `-`; hyphenated names need brackets: `!@['x-fdx-csdf-technical']` |
| `$..[?(@.deprecated === true)]` | OK (JS `===`) | OK | Parse error; only `==` |
| `$..[?(@.name.match(/^x-/))]` | OK (host regex) | OK, if guarded against nodes without `name`; throws otherwise | Parse error; use `match(@.name, "x-.*")` |
| `$..parameters^` | Parse error | OK (parent selector) | Parse error; no parent selector |
| `$.paths[*]~` | Parse error | OK (property-name selector) | Parse error |
| `$.info[?length(@.title) > 40]` | Parse error | Silently matches nothing | OK; standard function |
| `$['paths']['/pets']` | OK | OK | OK; this is RFC's *normalized path* form |

</div>

<small>Goessner and Plus columns checked against `jsonpath` 1.1.1 and `jsonpath-plus` 10.x; the RFC 9535 column against `@swaggerexpert/jsonpath`.</small>

The first row is the shape of the banking overlays from the opening. Position 29 of the original expression is the hyphen in `x-fdx-csdf-account-categories`: a member name that RFC 9535's dot-notation grammar doesn't allow, and that a lenient parser happily reads through. Same file, two meanings of "valid".

## What the Overlay spec actually says

Overlay 1.0.0 (October 2024) defined `target` as "a JSONPath expression selecting nodes in the target document" and cited RFC 9535 as a normative reference. The wording was soft, but the intent was clear, and implementers generally read it the same way: RFC 9535 was the JSONPath the spec meant.

Overlay 1.1.0 (January 2026) closed the gap with a dedicated section, [*RFC9535 Compliance*](https://spec.openapis.org/overlay/v1.1.0.html#rfc9535-compliance):

> A tool or library MUST fully implement RFC9535 when parsing and expanding JSONPath query expressions to be compliant with the Overlay specification.
>
> Interoperable Overlay Documents MUST use RFC9535 JSONPath query expressions and MUST NOT use tool-specific JSONPath extensions.

So the spec answers half the question: a compliant implementation **must** speak RFC 9535, and a portable overlay **must not** rely on anything else. What it doesn't say is whether an implementation *may* also accept other dialects as a courtesy.

## What the ecosystem actually does

A quick survey of open-source Overlay tooling, as of this writing:

- [`openapi-overlays-js`](https://github.com/lornajane/openapi-overlays-js) (Lorna Mitchell's reference-style implementation) depends on the `jsonpath` package: the Goessner dialect.
- [Bump.sh CLI](https://github.com/bump-sh/cli) runs its overlay support on `jsonpathly`, which since version 3 is an RFC 9535 implementation.
- [Speakeasy](https://github.com/speakeasy-api/openapi/tree/main/overlay) picks the dialect by Overlay version: a 1.0.0 document is evaluated with its legacy, Goessner-inspired `yaml-jsonpath` engine by default (with a warning on expressions that aren't valid RFC 9535, and an opt-in `x-speakeasy-jsonpath: rfc9535` extension), while a 1.1.0 document gets RFC 9535 by default with an opt-out back to legacy. It also ships an upgrade helper that moves an overlay from 1.0.0 to 1.1.0.
- [SpecLynx CLI]({{ '/cli/' | relative_url }}) and [`@speclynx/apidom-overlay`](https://github.com/speclynx/apidom/tree/main/packages/apidom-overlay) evaluate targets with `@speclynx/apidom-json-path`, which is RFC 9535-only for every Overlay version.

So the picture isn't simply "Goessner tools vs. RFC tools". The same `target` string can be evaluated by a Goessner engine, an RFC engine, or either one depending on the `overlay:` version field at the top of the file, and the spec says only one of those behaviours is compliant. The banking overlays from the opening were Overlay 1.0.0 documents, so the first CLI read them with its legacy engine, where hyphenated dot-names are fine. The second CLI read them as RFC 9535, where they aren't.

## The case for being lenient: a fair hearing

It's a real case, so let's make it honestly.

**Existing overlays.** People wrote overlays before 1.1.0 made the rule explicit, against whatever their tool accepted. Rejecting those files is friction on day one: five failing overlays and a bug report, in the story above.

**Postel's law.** "Be conservative in what you send, liberal in what you accept" is the oldest instinct in protocol design. Accepting Goessner and Plus syntax alongside RFC 9535 would mean more overlays Just Work.

**Adoption.** Overlays are still early. A tool that says "no" to a working file is a tool people route around.

The strongest form of this argument is the one Speakeasy actually built: don't guess, *version-gate*. Treat the `overlay: 1.0.0` header as permission to use the old engine, warn loudly when an expression wouldn't survive RFC 9535, make the standard the default the moment the author writes `1.1.0`, and give them a one-command upgrade. That is leniency with a migration path designed in, and it's a reasonable way to carry an existing user base across the line.

## Why strict wins

And here's why, for all that, the lenient case loses for a *canonical* implementation, the one meant to define what "correct" means.

**An overlay is a portable artifact, not a script.** Its whole value is that the same file can be applied by your docs tool, your SDK generator, and your CI gate and produce the same result. Every dialect an implementation accepts, even deliberately and with warnings, is a file that will break the moment it meets an implementation that doesn't. Leniency doesn't remove the interoperability problem; it moves it downstream, to someone who didn't write the overlay and can't see why it fails. That's exactly how five overlays that "worked" arrived at a tool that couldn't read them: the version gate kept them working in one place and tool-specific everywhere else.

**Postel's law has a known failure mode.** The IETF itself revisited the robustness principle in [RFC 9413, *Maintaining Robust Protocols*](https://www.rfc-editor.org/rfc/rfc9413.html) (2023): tolerating deviations lets them harden into de-facto requirements, and the ecosystem ossifies around the most lenient implementation instead of the standard. JSONPath's two decades of dialect drift *are* that failure mode. RFC 9535 exists to end it, and an Overlay implementation that re-admits the dialects undoes the work.

**Ambiguity is worse than an error.** Some expressions parse in more than one dialect with different meanings. A lenient implementation has to guess which one the author meant. Guessing wrong doesn't error; it edits the wrong node. For a tool whose job is to modify API contracts, a loud parse error is the kinder outcome.

**"Strict input" still leaves room to help.** Strictness is about what the implementation *applies*, not about how it treats the person. An error that names the offending expression and the exact position, plus a hint toward the RFC form, turns a rejection into a minutes-long fix. A linter or converter for legacy overlays can be a separate, honest tool; it doesn't have to live inside `apply`.

## Where SpecLynx landed

SpecLynx is RFC 9535 only, because the Overlay specification requires it and because we think that's the right answer for a canonical implementation: `@speclynx/apidom-json-path` is fully RFC 9535 compliant, and [SpecLynx CLI]({{ '/cli/' | relative_url }}) evaluates every `target` with it, whatever the overlay's version field says:

```bash
npx @speclynx/cli overlay apply overlay.yaml openapi.yaml
```

An expression that isn't valid RFC 9535 is rejected with a parse error that points at the offending position and lists what the grammar would have accepted there (the message at the top of this post is SpecLynx's) rather than guessed at. The other common way an overlay silently does nothing is a target that matches no nodes at all; `--strict` turns that into a failure too:

```bash
npx @speclynx/cli overlay apply overlay.yaml openapi.yaml --strict
```

The opening story is real: [speclynx-cli#127](https://github.com/speclynx/speclynx-cli/issues/127). The fix on the overlay side was mechanical (bracket the hyphenated names) and the author had all five working the same day.

### Migrating an existing overlay

If you maintain overlays written against a Goessner or JSONPath Plus tool, the migration usually is that mechanical: quote bracketed names and anything with a hyphen, replace host-language regexes with `match()`/`search()`, and rewrite parent/property selectors as explicit paths. The table above covers most of what we've seen. The [`@swaggerexpert/jsonpath` validator](https://github.com/swaggerexpert/jsonpath#validation) and [jsonpath.com](https://jsonpath.com/) (in its RFC 9535 mode; it also offers a JSONPath Plus mode, which is the whole point of this post) will tell you whether an expression is valid RFC 9535 before you run anything.

For a larger batch, the prompt below does the conversion with any AI assistant, and is the one we handed over in that issue:

<details markdown="1">
<summary>Migration prompt for an AI assistant</summary>

```text
You are a JSONPath migration assistant. Convert the JSONPath expression below so that it is valid under RFC 9535 (the standard implemented by @swaggerexpert/jsonpath), while preserving its exact meaning.

Apply these rules:
1. Never write a dot directly before a bracket. `a.[...]` must become `a[...]`.
2. Dot-notation member names may only contain letters, digits, `_` and non-ASCII characters. Any name containing a hyphen, space, or other punctuation must be written in bracket notation with a quoted string, e.g. `@.x-foo-bar` -> `@['x-foo-bar']`, `$.some key` -> `$['some key']`.
3. Filters use `?` inside brackets: `[?<expr>]`. Parentheses around the whole expression are optional (`[?(expr)]` and `[?expr]` are both fine); keep them if present.
4. `!@...` / `@...` are existence tests (key present or not), not truthiness tests. Keep them as existence tests unless the original clearly compares values.
5. Comparisons must be `==`, `!=`, `<`, `<=`, `>`, `>=` between singular queries or literals; use `&&`, `||`, `!` for logic. Replace non-standard operators (`=~`, `in`, `nin`, `size`, `empty`, `contains`) with `match()`, `search()`, `length()`, `value()`, `count()` or equivalent comparisons, and say so explicitly.
6. Replace non-standard shorthands: `$..*` is fine, but script filters `[(@.length-1)]` become `[-1]`, `@.length` becomes `length(@)`, and `$.a.b.[*]` becomes `$.a.b[*]`.
7. Do not change what the expression selects. If a fully equivalent RFC 9535 form does not exist, say so and give the closest alternative with the difference explained.

Output:
- The migrated expression on its own line in a code block.
- A short bullet list of each change and why.
- If possible, a second, shorter equivalent form.

Expression to migrate:
<PASTE EXPRESSION HERE>
```

</details>

## The short version

- Overlay `target` is JSONPath, and since Overlay 1.1.0 that means **RFC 9535**, for tools *and* for overlays that want to be portable.
- Dialects agree on the easy paths and diverge on filters, regexes, hyphenated names, and selector extensions, exactly where copy-pasted expressions live.
- A canonical implementation should be **strict about what it consumes and generous about how it says no**: clear errors and migration help, not silent dialect guessing.

*Further reading:* [Overlay Specification 1.1.0](https://spec.openapis.org/overlay/v1.1.0.html) · [RFC 9535](https://www.rfc-editor.org/rfc/rfc9535.html) · [RFC 9413](https://www.rfc-editor.org/rfc/rfc9413.html) · [SpecLynx CLI]({{ '/cli/' | relative_url }}) · [`@speclynx/apidom-overlay`](https://github.com/speclynx/apidom/tree/main/packages/apidom-overlay)
