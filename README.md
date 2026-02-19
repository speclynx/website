# SpecLynx Website

<img src="https://raw.githubusercontent.com/speclynx/website/main/assets/images/speclynx-logo-full.png" alt="SpecLynx" width="200">

Source code for the [SpecLynx website](https://speclynx.com/) — the home of enterprise-ready API tooling.

## Products

- **[OpenAPI Toolkit](https://speclynx.com/openapi-toolkit/)** — VSCode extension for API specification authoring
- **[Language Service](https://speclynx.com/language-service/)** — LSP-compatible library for API spec intelligence
- **[ApiDOM](https://speclynx.com/apidom/)** — Semantic parser for API specifications

## Development

```bash
bundle install
bundle exec jekyll serve
```

The site will be available at `http://localhost:4000/`.

## Tech Stack

- [Jekyll](https://jekyllrb.com/) static site generator
- [Tailwind CSS](https://tailwindcss.com/) via CDN
- [Prism.js](https://prismjs.com/) for syntax highlighting
- Hosted on [GitHub Pages](https://pages.github.com/)

## License

[Apache 2.0](LICENSE)
