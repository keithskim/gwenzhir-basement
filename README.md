# Gwenzhir Basement

Shared design foundation for Gwenzhir projects. The main package is **Basement UI** — tokens, typography, and reusable CSS components with a live reference page.

**App home:** [Basement UI reference](https://keithskim.github.io/gwenzhir-basement/packages/basement-ui/)

## Quick start

```bash
cd packages/basement-ui
npm install
npm run dev
```

Open http://localhost:5173 for the token and component reference.

## Packages

| Path | Description |
|---|---|
| [`packages/basement-ui`](packages/basement-ui) | Design system: tokens, components, icons, reference |

## Use in an app

```html
<link rel="stylesheet" href="path/to/basement-ui/vendor/source-han/fonts.css">
<link rel="stylesheet" href="path/to/basement-ui/vendor/phosphor/regular/style.css">
<link rel="stylesheet" href="path/to/basement-ui/src/index.css">
```

Subset exports (`tokens`, `components`, `typography`, `fonts`) and optional scripts are documented in the [package README](packages/basement-ui/README.md).

Base type is Inter over Pretendard at weight 500; Serif is Source Han Serif (slightly smaller than Sans); Mono is Roboto Mono over Pretendard. All load from `vendor/source-han/fonts.css`.

## License

ISC. Typefaces are SIL OFL 1.1 (Inter, Pretendard, Source Han Serif, Roboto Mono). Icons are [Phosphor](https://phosphoricons.com/) (MIT), vendored under `packages/basement-ui/vendor/phosphor/`.
