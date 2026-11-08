# Changelog

## 0.1.0 - unreleased

Rewrite in TypeScript. **Breaking**, see [MIGRATION.md](MIGRATION.md).

### Added

- `createDialog()` with promise-based `open()` that resolves with the dialog's return value
- `alert()`, `confirm()`, `prompt()` helpers
- Options `modal`, `closeOnEscape`, `closeOnBackdrop`, `destroyOnClose`, `role`, `onOpen`, `beforeClose`, `onClose`
- Button options `value`, `onClick`, `on` (any DOM event)
- `aria-labelledby` / `aria-describedby`, `role="alertdialog"` for `alert()` / `confirm()`
- TypeScript types, `exports` map, CDN builds (`html-dialog.iife.js`, `html-dialog.js`)
- Tests in real Chromium (Vitest + Playwright), CI and tag-based release workflow

### Changed

- License changed from GPL-3.0 to MIT

- Strings are rendered as text; HTML requires `html: true` (fixes an XSS risk)
- Submit buttons close the dialog natively; native form validation now works
- `classNames` are merged instead of replaced
- Dialog elements are held by reference instead of looked up in `document` (works in shadow roots)

### Removed

- `create()`, `getDialog()`, `getForm()` (use `element` / `form`), `this`-bound callbacks, `dist/` in the repository, Rollup / Babel tooling

## 0.0.10

Last release of the previous API.
