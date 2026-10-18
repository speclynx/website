---
title: "Your overlay changed one field. Why does the diff touch half the file?"
description: "Applying an OpenAPI Overlay to a hand-written YAML document often rewrites far more than the overlay asked for. Why YAML makes this hard, a one-minute test you can run on your own document, and how four overlay CLIs did on it."
date: 2026-10-18 10:00:00 +0200
image:
  path: assets/images/blog/overlay-yaml-round-tripping.webp
  social: assets/images/blog/overlay-yaml-round-tripping.png
  width: 1280
  height: 520
  alt: Two YAML documents side by side with identical line shapes, joined by faint matching lines, with a translucent overlay sheet between them and only a band of new lines on the right document glowing green
  caption: "Same document in, same document out: only the lines the overlay targets change."
---

Here is a workflow I see a lot. You keep your OpenAPI description in YAML, written by hand, reviewed in pull requests. You don't want to fork it for every audience, so you write an [OpenAPI Overlay](https://spec.openapis.org/overlay/v1.2.0.html) (a separate file that lists changes to apply to the document) that adds a summary here, removes an internal path there. CI applies the overlay and opens a pull request with the result. You open it and see that the overlay added one field, but the diff touches half the file. Descriptions are re-wrapped, quotes have changed, comments are gone, and a Markdown list in a description is now one long line.

If you work design-first, that document isn't build output. You wrote it by hand, and the formatting is part of the work: descriptions wrapped where they read well, Markdown lists that render in your docs, comments that explain why an endpoint looks the way it does. Design-first people tend to be proud of their OpenAPI documents, and rightly so. Adding a single field with an overlay shouldn't undo any of that.

There's a second, practical problem: nobody can review a diff that touches half the file. In practice, people either stop reading the overlay output, or they stop using overlays and go back to maintaining copies by hand. Both are bad outcomes, and both have the same root cause: the tool didn't round-trip the document.

Below I explain why this happens, give you two tests to run on your own tool, and show how four overlay CLIs did on them.

## What is round-tripping?

Let's first define it:

> Round-tripping is reading a document, changing it, and writing it back so that everything you didn't change comes out exactly as it went in.

For an Overlay tool, I'd split this into two rules:

1. **Everything the overlay doesn't target is kept byte for byte.** Comments, quoting, indentation, block scalars, anchors, flow collections, line breaks. If the overlay didn't ask for it, the output shouldn't change it.
2. **Everything the overlay adds keeps the overlay's own style.** If the overlay author wrote `summary: "Fetch one account"` with double quotes, or `x-audience: [public]` as a flow sequence, that's how it should land in the result.

With both rules in place, the diff of an overlay run contains only what the overlay did, and you can review it again.

## Why YAML makes this hard

JSON gives you few ways to write a given value. YAML gives you many:

- The same string can be [plain](https://yaml.org/spec/1.2.2/#733-plain-style) (no quotes), [single-quoted](https://yaml.org/spec/1.2.2/#732-single-quoted-style) (`'…'`), [double-quoted](https://yaml.org/spec/1.2.2/#731-double-quoted-style) (`"…"`), or a block that spans several lines: a [literal block](https://yaml.org/spec/1.2.2/#812-literal-style) (`|`) keeps the line breaks, a [folded block](https://yaml.org/spec/1.2.2/#813-folded-style) (`>`) joins lines with spaces.
- A block can carry small markers: a [chomping indicator](https://yaml.org/spec/1.2.2/#8112-block-chomping-indicator) (`-`, `+`) controls the trailing line break, and an [indentation indicator](https://yaml.org/spec/1.2.2/#8111-block-indentation-indicator) (`|2-`) fixes the indentation.
- A list can be indented lines starting with `-` (a [block sequence](https://yaml.org/spec/1.2.2/#821-block-sequences)), or written inline as `[a, b]` (a [flow sequence](https://yaml.org/spec/1.2.2/#741-flow-sequences)).
- A node can be named with an [anchor](https://yaml.org/spec/1.2.2/#692-node-anchors) (`&account`) and reused elsewhere with an [alias](https://yaml.org/spec/1.2.2/#71-alias-nodes) (`*account`).
- And [comments](https://yaml.org/spec/1.2.2/#66-comments) aren't part of the data at all.

Most tools parse YAML into ordinary data (objects, arrays, strings) and throw all of that away. `{ title: "The user's accounts API" }` doesn't remember that it was written as `'The user''s accounts API'`. When the tool serializes the value back, it picks its own style, and the document changes even where nothing was changed.

Sometimes it's worse than style: the parser reads the *value* wrong. Here are three YAML edge cases where that happens:

- **Escaped quotes.** Inside a single-quoted string, an apostrophe is written twice: `'The user''s API'` means `The user's API`. A parser that doesn't turn `''` back into `'` stores `The user''s API`. When the serializer writes it out, it escapes both quotes again, giving `'The user''''s API'`.
- **Block indicators in either order.** `|2-` and `|-2` mean the same thing: content indented 2 spaces deeper than its parent, final line break and any trailing empty lines removed. A parser that only recognizes one order gets the indentation wrong, and the text comes back shifted.
- **More-indented lines in folded blocks.** In a `>` block, ordinary lines are joined into one paragraph, but lines indented further than the rest are kept exactly as written. That is how Markdown bullet lists and tables survive inside a `description`. A parser that joins those lines too merges the list into the surrounding prose.

In all three cases the damage happens while reading. Switching the output to JSON doesn't help: the value is already wrong.

## A small document that exercises all of it

Here is an OpenAPI document I'll use for the rest of the article. It's small on purpose, but every construct in it has a real bug report behind it:

```yaml
openapi: 3.1.0
info:
  title: 'The user''s accounts API'
  version: 1.0.0
paths:
  # Read-only for now; writes land in v2.
  /accounts/{id}:
    get:
      operationId: getAccount
      tags: [accounts, read]
      responses:
        '200':
          description: >-
            Account details. If the response contains unmasked identifiers
            this is sensitive data which should only be exchanged if encrypted.
              * Routing number: identifies the institution;
              * Account number: identifies the customer account.
          content:
            application/json:
              schema: &account
                type: object
        '404':
          description: |2-

            No account with this id.
  /me:
    get:
      operationId: getMe
      responses:
        '200':
          description: The signed-in user's account.
          content:
            application/json:
              schema: *account
```

## What you get when you build it yourself

If you're tempted to write your own overlay script, the first step is a YAML library. This is what the round trip looks like with the two most popular ones in JavaScript, [`js-yaml`](https://github.com/nodeca/js-yaml) and [`yaml`](https://eemeli.org/yaml/). I parsed the document above and wrote it back **without changing anything**:

<div class="table-scroll" markdown="1">

| Approach | What changed with zero edits |
|---|---|
| `js-yaml` 4: `dump(load(src))` | Quotes dropped from the title, comment removed, flow sequence turned into a block sequence, `>-` description re-wrapped, anchor and alias renamed to `&ref_0` and `*ref_0`, <code>&#124;2-</code> written as <code>&#124;-</code> |
| `yaml` 2 Document API: `parseDocument(src).toString({ lineWidth: 0 })` | Values identical, but the flow sequence gains padding (`[ accounts, read ]`), the `>-` description is joined into one long line, and <code>&#124;2-</code> is written as <code>&#124;-</code> |
| `yaml` 2 CST API: `Parser` + `CST.stringify()` | Nothing, byte for byte |

</div>

A value-level load and dump has nowhere to keep the style. The Document API keeps comments, quotes, and flow collections, but writes them back in its own layout: block scalars are re-folded and flow brackets get padding. The CST API (concrete syntax tree: the parser's token-by-token view of the file) really round-trips: it keeps every token. `CST.setScalarValue()` changes a value in place and keeps its type (quoted stays quoted, folded stays folded), although block scalar headers and line breaks are regenerated. If all you need is to change existing single-line values, that is a great foundation.

An overlay engine needs more than that. JSONPath targets have to be mapped onto a tree of tokens. An `update` merges whole objects into the document, so you build new nodes by hand, indent them to fit, and keep the overlay's style. A `remove` has to take the right comments and blank lines with it. The first version of such a script is easy. Keeping it correct on a real-world description tens of thousands of lines long is where the time goes.

## How to check your overlay tool

You don't have to take any tool's word for it. Two quick tests tell you most of what you need to know.

### The one-line test

Apply an overlay that adds a single extension field:

```yaml
overlay: 1.0.0
info:
  title: Round-trip check
  version: 1.0.0
actions:
  - target: $.info
    update:
      x-round-trip-check: true
```

Apply it to your real document and diff the result against the input. The diff should be **exactly one added line**. Every other line that shows up is a line your tool will rewrite on every run, whatever your overlay does.

Why not an empty `update: {}`? A tool can notice there's nothing to do and return the input untouched, so the empty diff proves nothing. A real change, however small, forces the full round trip.

### The style test

Apply an overlay that adds values written in specific styles. Point the target at any operation in your own document; here it's the sample's `/accounts/{id}`:

```yaml
overlay: 1.0.0
info:
  title: Add public description
  version: 1.0.0
actions:
  - target: $.paths['/accounts/{id}'].get
    update:
      summary: "Fetch one account"
      description: |
        Returns a single account.

        Requires the `accounts:read` scope.
      x-audience: [public]
```

The diff should contain exactly these lines, written the way they are written here: the double quotes, the literal block, the flow sequence.

When you read your diffs, look first at the constructs that break most often:

- escaped quotes (`'it''s'`)
- comments
- Markdown lists and tables in `>` blocks
- block indicators (`|2-`, `|+`, `>-`)
- anchors and aliases
- flow collections (`[a, b]`)
- Windows line breaks (CRLF)

## How four overlay CLIs compare

I ran the one-line test and the style test on the sample document above, through four overlay CLIs at their latest versions on 18 October 2026: [Speakeasy CLI](https://github.com/speakeasy-api/speakeasy) 1.802.0, [Bump.sh CLI](https://github.com/bump-sh/cli) 2.11.0, [openapi-format](https://github.com/thim81/openapi-format) 1.34.0, and [SpecLynx CLI]({{ '/cli/' | relative_url }}) 1.5.1. Every tool ran with its default options. Full disclosure: I maintain SpecLynx CLI.

<div class="table-scroll" markdown="1">

| Check | Speakeasy CLI | Bump.sh CLI | openapi-format | SpecLynx CLI |
|---|---|---|---|---|
| **One-line test: lines changed** (should be 1) | 6 | 21 | 20 | 1 |
| Escaped quote kept | yes | no | no | yes |
| Comment kept | yes | yes | no | yes |
| Flow sequence kept | yes | no | no | yes |
| Folded block kept | no | no | no | yes |
| <code>&#124;2-</code> block kept | no | no | no | yes |
| Anchor and alias kept | yes | no | no | yes |
| Key order kept | yes | yes | no | yes |
| Overlay's own style kept | yes | no | no | yes |
| **<abbr title="Parsing the result gives exactly the same data as the input plus the overlay's changes. Only the formatting may differ.">All values unchanged</abbr>** | **<abbr title="Two descriptions changed: the 200 description gained an empty line, and the 404 description lost its leading line break.">no</abbr>** | yes | yes | yes |

</div>

*All values unchanged* means that parsing the result gives exactly the input data plus the overlay's changes; only the formatting may differ.

The commands I ran:

```bash
# Speakeasy CLI
$ speakeasy overlay apply -s openapi.yaml -o overlay.yaml --out result.yaml

# Bump.sh CLI
$ bump overlay openapi.yaml overlay.yaml -o result.yaml

# openapi-format
$ openapi-format openapi.yaml --overlayFile overlay.yaml -o result.yaml

# SpecLynx CLI
$ speclynx overlay apply overlay.yaml openapi.yaml -o result.yaml
```

Bump.sh CLI and openapi-format keep every value, but they rewrite most of the file, much like the `js-yaml` row above. Quotes, flow collections, and the anchor are gone. Bump.sh CLI rewrites both block scalars; openapi-format keeps the `>-` indicator but re-wraps its text and loses `|2-`. With its default options, openapi-format also drops the comment and reorders keys. Speakeasy CLI and Bump.sh CLI have no output formatting options, but openapi-format does, so I tried them all. Its best combination, `--no-sort --keepComments --no-bundle`, keeps the comment and key order and gets the one-line test down to 18 lines. The quotes, flow sequence, block scalars, and the overlay's own style still change, and the anchor is kept but renamed to `&a1`.

Speakeasy CLI keeps nearly all of the style, which is impressive. But it re-wraps the folded description and adds an empty line to it, and it drops the empty first line of the <code>&#124;2-</code> block. Both of those change the value. That's the worst kind of change, because a reviewer reads it as formatting noise.

If I misused any of these tools, tell me and I'll update the table.

## How SpecLynx CLI got there

Until recently, SpecLynx CLI failed most of these checks too. Here is the style test applied to the sample document with [SpecLynx CLI 1.5.1](https://github.com/speclynx/speclynx-cli/releases/tag/v1.5.1):

```bash
$ npx @speclynx/cli overlay apply overlay.yaml openapi.yaml -o result.yaml
```

The input is on the left and the result on the right, with changed lines shaded.

<div class="code-compare">
<span class="cmp-head cmp-head-l">openapi.yaml</span><span class="cmp-head cmp-head-g" aria-hidden="true"></span><span class="cmp-head cmp-head-r">result.yaml with 1.5.1</span>
<span class="cmp-l">openapi: 3.1.0</span><span class="cmp-g"></span><span class="cmp-r">openapi: 3.1.0</span>
<span class="cmp-l">info:</span><span class="cmp-g"></span><span class="cmp-r">info:</span>
<span class="cmp-l" style="--i:2">title: &#x27;The user&#x27;&#x27;s accounts API&#x27;</span><span class="cmp-g"></span><span class="cmp-r" style="--i:2">title: &#x27;The user&#x27;&#x27;s accounts API&#x27;</span>
<span class="cmp-l" style="--i:2">version: 1.0.0</span><span class="cmp-g"></span><span class="cmp-r" style="--i:2">version: 1.0.0</span>
<span class="cmp-l">paths:</span><span class="cmp-g"></span><span class="cmp-r">paths:</span>
<span class="cmp-l" style="--i:2"># Read-only for now; writes land in v2.</span><span class="cmp-g"></span><span class="cmp-r" style="--i:2"># Read-only for now; writes land in v2.</span>
<span class="cmp-l" style="--i:2">/accounts/{id}:</span><span class="cmp-g"></span><span class="cmp-r" style="--i:2">/accounts/{id}:</span>
<span class="cmp-l" style="--i:4">get:</span><span class="cmp-g"></span><span class="cmp-r" style="--i:4">get:</span>
<span class="cmp-l" style="--i:6">operationId: getAccount</span><span class="cmp-g"></span><span class="cmp-r" style="--i:6">operationId: getAccount</span>
<span class="cmp-l" style="--i:6">tags: [accounts, read]</span><span class="cmp-g"></span><span class="cmp-r" style="--i:6">tags: [accounts, read]</span>
<span class="cmp-l" style="--i:6">responses:</span><span class="cmp-g"></span><span class="cmp-r" style="--i:6">responses:</span>
<span class="cmp-l" style="--i:8">&#x27;200&#x27;:</span><span class="cmp-g"></span><span class="cmp-r" style="--i:8">&#x27;200&#x27;:</span>
<span class="cmp-l" style="--i:10">description: &gt;-</span><span class="cmp-g"></span><span class="cmp-r" style="--i:10">description: &gt;-</span>
<span class="cmp-l" style="--i:12">Account details. If the response contains unmasked identifiers</span><span class="cmp-g"></span><span class="cmp-r" style="--i:12">Account details. If the response contains unmasked identifiers</span>
<span class="cmp-l" style="--i:12">this is sensitive data which should only be exchanged if encrypted.</span><span class="cmp-g"></span><span class="cmp-r" style="--i:12">this is sensitive data which should only be exchanged if encrypted.</span>
<span class="cmp-l" style="--i:14">* Routing number: identifies the institution;</span><span class="cmp-g"></span><span class="cmp-r" style="--i:14">* Routing number: identifies the institution;</span>
<span class="cmp-l" style="--i:14">* Account number: identifies the customer account.</span><span class="cmp-g"></span><span class="cmp-r" style="--i:14">* Account number: identifies the customer account.</span>
<span class="cmp-l" style="--i:10">content:</span><span class="cmp-g"></span><span class="cmp-r" style="--i:10">content:</span>
<span class="cmp-l" style="--i:12">application/json:</span><span class="cmp-g"></span><span class="cmp-r" style="--i:12">application/json:</span>
<span class="cmp-l" style="--i:14">schema: &amp;account</span><span class="cmp-g"></span><span class="cmp-r" style="--i:14">schema: &amp;account</span>
<span class="cmp-l" style="--i:16">type: object</span><span class="cmp-g"></span><span class="cmp-r" style="--i:16">type: object</span>
<span class="cmp-l" style="--i:8">&#x27;404&#x27;:</span><span class="cmp-g"></span><span class="cmp-r" style="--i:8">&#x27;404&#x27;:</span>
<span class="cmp-l" style="--i:10">description: |2-</span><span class="cmp-g"></span><span class="cmp-r" style="--i:10">description: |2-</span>
<span class="cmp-l"> </span><span class="cmp-g"></span><span class="cmp-r"> </span>
<span class="cmp-l" style="--i:12">No account with this id.</span><span class="cmp-g"></span><span class="cmp-r" style="--i:12">No account with this id.</span>
<span class="cmp-l cmp-gap" aria-hidden="true"></span><span class="cmp-g"></span><span class="cmp-r cmp-add" style="--i:6">summary: &quot;Fetch one account&quot;</span>
<span class="cmp-l cmp-gap" aria-hidden="true"></span><span class="cmp-g"></span><span class="cmp-r cmp-add" style="--i:6">description: |</span>
<span class="cmp-l cmp-gap" aria-hidden="true"></span><span class="cmp-g"></span><span class="cmp-r cmp-add" style="--i:8">Returns a single account.</span>
<span class="cmp-l cmp-gap" aria-hidden="true"></span><span class="cmp-g"></span><span class="cmp-r cmp-add"> </span>
<span class="cmp-l cmp-gap" aria-hidden="true"></span><span class="cmp-g"></span><span class="cmp-r cmp-add" style="--i:8">Requires the `accounts:read` scope.</span>
<span class="cmp-l cmp-gap" aria-hidden="true"></span><span class="cmp-g"></span><span class="cmp-r cmp-add" style="--i:6">x-audience: [public]</span>
<span class="cmp-l" style="--i:2">/me:</span><span class="cmp-g"></span><span class="cmp-r" style="--i:2">/me:</span>
<span class="cmp-l" style="--i:4">get:</span><span class="cmp-g"></span><span class="cmp-r" style="--i:4">get:</span>
<span class="cmp-l" style="--i:6">operationId: getMe</span><span class="cmp-g"></span><span class="cmp-r" style="--i:6">operationId: getMe</span>
<span class="cmp-l" style="--i:6">responses:</span><span class="cmp-g"></span><span class="cmp-r" style="--i:6">responses:</span>
<span class="cmp-l" style="--i:8">&#x27;200&#x27;:</span><span class="cmp-g"></span><span class="cmp-r" style="--i:8">&#x27;200&#x27;:</span>
<span class="cmp-l" style="--i:10">description: The signed-in user&#x27;s account.</span><span class="cmp-g"></span><span class="cmp-r" style="--i:10">description: The signed-in user&#x27;s account.</span>
<span class="cmp-l" style="--i:10">content:</span><span class="cmp-g"></span><span class="cmp-r" style="--i:10">content:</span>
<span class="cmp-l" style="--i:12">application/json:</span><span class="cmp-g"></span><span class="cmp-r" style="--i:12">application/json:</span>
<span class="cmp-l" style="--i:14">schema: *account</span><span class="cmp-g"></span><span class="cmp-r" style="--i:14">schema: *account</span>
</div>

The only shaded lines are the ones the overlay added. Everything the overlay didn't target is byte for byte identical, and everything it added is written the way the overlay author wrote it.

### What changed under the hood

SpecLynx CLI applies overlays with [SpecLynx ApiDOM](https://github.com/speclynx/apidom), an open source parser for API descriptions. The fixes landed in [ApiDOM 6.1.0](https://github.com/speclynx/apidom/releases/tag/v6.1.0) and fall into three groups:

**The parser computes the right value.** The three edge cases above are fixed, along with nearly twenty related ones.

**Style preservation writes back what was written.** Block scalars, flow scalars, anchors, aliases, and CRLF line breaks come back exactly as they were in the source.

**Style survives the overlay itself.** Values added by an overlay keep their YAML style, and objects and arrays merged by an `update` action keep theirs.

If you build tools on ApiDOM, all of this is opt-in (`style: true` when parsing, `preserveStyle: true` when writing YAML); see the [Parsing guide]({{ '/apidom/parsing/' | relative_url }}#style-preservation).

### What isn't perfect yet

One edge I found while writing this: extra spaces before a comment get collapsed, so `title: 'API'   # note` comes back as `title: 'API' # note`. It doesn't change a value, but it shows up in a diff, and it's tracked in [apidom#682](https://github.com/speclynx/apidom/issues/682).

### Thank you, Clyde Cutting

None of this would exist without Clyde Cutting ([@cuttingclyde](https://github.com/cuttingclyde)), who reported three issues against SpecLynx CLI between August and October:

- [#138](https://github.com/speclynx/speclynx-cli/issues/138) showed Financial Data Exchange (FDX) descriptions with Markdown lists and tables being re-wrapped. It looked like a formatting preference and turned out to be a parser bug.
- [#174](https://github.com/speclynx/speclynx-cli/issues/174) pointed at `|2-` blocks in the 75,000-line OpenAPI description of Plaid, a financial data API, with a "bonus" overlay proving that values coming *from* the overlay broke too. Its CRLF attachments became a test case of their own.
- [#177](https://github.com/speclynx/speclynx-cli/issues/177) covered almost every quoting variant in one small file, which narrowed the bug down immediately.

Each report came with real files and a clear expected result. While fixing them, I kept finding related problems and fixed those in ApiDOM too. Thank you, Clyde. Issue reports like these are the most valuable contribution an open source project can get.

## Closing words

An overlay is a promise: change these nodes and leave everything else alone. A tool that doesn't leave the rest alone makes you choose between overlays and readable diffs. Whatever tool you use, run the one-line test on your own documents. It takes a minute and tells you whether your overlay diffs can be trusted.

If you want to try SpecLynx CLI, run the latest version:

```bash
$ npx @speclynx/cli@latest overlay apply overlay.yaml openapi.yaml
```

If anything outside your overlay's targets changes, please [open an issue](https://github.com/speclynx/speclynx-cli/issues) with an example. That's exactly how this release happened.

*Further reading:* [Overlay Specification 1.2.0](https://spec.openapis.org/overlay/v1.2.0.html) · [YAML 1.2.2 specification](https://yaml.org/spec/1.2.2/) · [SpecLynx CLI 1.5.1 release notes](https://github.com/speclynx/speclynx-cli/releases/tag/v1.5.1) · [ApiDOM 6.1.0 release notes](https://github.com/speclynx/apidom/releases/tag/v6.1.0) · [ApiDOM parsing guide]({{ '/apidom/parsing/' | relative_url }})
