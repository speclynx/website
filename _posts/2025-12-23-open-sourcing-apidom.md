---
title: "We just open-sourced SpecLynx ApiDOM"
description: "Think of it as Babel.js, but for API specifications. ApiDOM is the semantic core behind SpecLynx, now Apache-2.0 licensed, fully auditable, and ready to power your own spec tooling."
date: 2025-12-23 10:00:00 +0100
image:
  path: assets/images/blog/open-sourcing-apidom.webp
  social: assets/images/blog/open-sourcing-apidom.png
  width: 1280
  height: 520
  alt: ApiDOM emerging from a broken black box in a burst of light, watched by a crowd
  caption: "Out of the black box: ApiDOM is now open source"
---

We just open-sourced SpecLynx **ApiDOM**.

Think of it as *Babel.js, but for API specifications*.

ApiDOM is the semantic core behind SpecLynx. It powers every layer of the stack: the [Language Service]({{ '/language-service/' | relative_url }}), [VS Code extension]({{ '/openapi-toolkit/' | relative_url }}), [browser editor](https://editor.speclynx.com), and [CLI]({{ '/cli/' | relative_url }}).

It parses OpenAPI, AsyncAPI, JSON Schema, Arazzo, and Overlay specs into a unified semantic tree you can traverse, transform, and serialize back out.

The goal is simple:

> Let developers work with API specs programmatically without losing the structure, style, and intent of the original file.

Because that part matters.

You should be able to modify a spec and get back something that still looks like **your** file, not a machine-generated rewrite.

## What you can build on it

SpecLynx ApiDOM is Apache-2.0 licensed, and you can use it to build your own:

- ✅ Linters
- ✅ Transforms
- ✅ Code generators
- ✅ Migration tools
- ✅ Spec-aware automation

## What we did to make it ready

- **Tree-sitter based parsing**: so tooling stays useful even while specs are incomplete
- A **semantic data model**: not generic objects, but one that understands OpenAPI Operations and Schema Objects
- **Lossless roundtrip**: comments, indentation, and key ordering are preserved across transformations
- Performance and memory efficiency for *large specs*

## Why open source it

We open-sourced ApiDOM to build trust. Every line of source code is now auditable and viewable, which also makes it usable in regulated environments where that's not a nice-to-have but a requirement.

## Try it

```bash
npm install @speclynx/apidom-reference
```

Parse an API specification and access its data model right away:

```javascript
import { parse } from '@speclynx/apidom-reference';
import { toValue } from '@speclynx/apidom-core';

const result = await parse('/path/to/openapi.json');

toValue(result.api.info.title);   // document title
toValue(result.api.info.version); // document version
```

## Get started

- GitHub: [speclynx/apidom](https://github.com/speclynx/apidom)
- Documentation: [speclynx.com/apidom]({{ '/apidom/' | relative_url }})

If you've ever had to parse, rewrite, or generate API specs: *what broke first?* [Tell us in the discussions](https://github.com/orgs/speclynx/discussions) 👇
