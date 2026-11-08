# Migrating from 0.0.x to 0.1.0

0.1.0 is a rewrite in TypeScript with a promise-based API.

## Import

```diff
- import { Dialog } from 'html-dialog/dist/html-dialog.esm'
+ import { createDialog } from 'html-dialog'
```

Browser global: `HtmlDialog.Dialog(...)` → `HtmlDialog.createDialog(...)` (script: `dist/html-dialog.iife.js`, formerly `html-dialog.min.js`).

## Create and open

`create()` is gone. The dialog is added to the DOM on the first `open()`, which returns a promise.

```diff
- const dialog = Dialog({ title, content, buttons }).create({ appendTo: el })
- dialog.open()
+ const dialog = createDialog({ title, content, buttons, appendTo: el })
+ const result = await dialog.open()
```

## Renamed and changed options

| 0.0.x                          | 0.1.0                                                   |
| ------------------------------ | ------------------------------------------------------- |
| `Dialog(...)`                  | `createDialog(...)`                                     |
| `.create({ appendTo })`        | `appendTo` option                                       |
| `getDialog()` / `getForm()`    | `dialog.element` / `dialog.form`                        |
| button `classNames`            | button `className`                                      |
| button `focus: true`           | button `autofocus: true`                                |
| button `onclick`, `onmouseup`… | `onClick`, other events via `on: { mouseup() {} }`      |
| callback `this` = dialog       | callbacks get `(event, dialog)`; `this` is not bound    |
| `title`, `buttons` required    | only `content` is required                              |
| `content` / `title` as HTML    | inserted as **text**; use a DOM node or `html: true`    |
| `type` default `'button'`      | default `'submit'` (closes natively, sets return value) |

## Behaviour changes

- **Closing**: a submit button closes the dialog by itself. Where you called `this.close()` in an `onclick`, you can usually drop the handler and use `value` + `await dialog.open()`. Use `type: 'button'` for the old behaviour.
- **Forms**: submit is no longer blocked with `preventDefault`, so `<form method="dialog">` and native validation work. Use `event.preventDefault()` in `onClick` to keep the dialog open.
- **`destroy()`** closes an open dialog, resolves its pending promise and makes the instance unusable (`open()` throws). Use `destroyOnClose: true` for one-off dialogs.
- **`classNames`** are merged per key; missing keys no longer render `class="undefined"`.
- **Errors**: `open()` no longer replaces errors with "Dialog is not created or removed from DOM."

## Example

```diff
- HtmlDialog.Dialog({
-     title: 'Example',
-     content: 'Hello World!',
-     buttons: [
-         { text: 'OK', focus: true, classNames: 'btn', onclick() { this.close() } },
-         { text: 'Cancel', onmouseup() { this.close() } },
-     ],
- }).create().open()
+ const result = await HtmlDialog.createDialog({
+     title: 'Example',
+     content: 'Hello World!',
+     destroyOnClose: true,
+     buttons: [
+         { text: 'OK', value: 'ok', autofocus: true, className: 'btn' },
+         { text: 'Cancel', value: 'cancel' },
+     ],
+ }).open()
```

## New in 0.1.0

`alert()`, `confirm()`, `prompt()` helpers, `modal: false`, `closeOnEscape`, `closeOnBackdrop`, `destroyOnClose`, `beforeClose` / `onOpen` / `onClose`, `role`, ARIA labelling, TypeScript types.
