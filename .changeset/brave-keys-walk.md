---
"@writegeez/ime": minor
---

Split the engine from the DOM and add the hooks suggestions and dictation need.

- `Transliterator`: a DOM-free engine with `feed(prevChar, key)` and
  `transliterate(keys)`. `WebGeezIME` now delegates to it; its public API is unchanged.
- `WebGeezIME.currentWord()` returns the word before the caret, and
  `insertText(text, { replaceWord })` writes at the caret, optionally replacing that
  word. `insertText` does nothing while an OS IME composition is in progress.
- `trailingWord(text)`: the word-boundary rule, splitting on whitespace and Latin or
  Ethiopic punctuation.
- Each bundled input method is now published as JSON at
  `@writegeez/ime/input-methods/<code>.json`, for engines in other languages.
