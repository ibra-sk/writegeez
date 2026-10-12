# @writegeez/ime

## 0.1.0

### Minor Changes

- [#2](https://github.com/ibra-sk/writegeez/pull/2) [`6595491`](https://github.com/ibra-sk/writegeez/commit/65954918f8a81ff6bd440814277149eaf856299e) Thanks [@ibra-sk](https://github.com/ibra-sk)! - Split the engine from the DOM and add the hooks suggestions and dictation need.

  - `Transliterator`: a DOM-free engine with `feed(prevChar, key)` and
    `transliterate(keys)`. `WebGeezIME` now delegates to it; its public API is unchanged.
  - `WebGeezIME.currentWord()` returns the word before the caret, and
    `insertText(text, { replaceWord })` writes at the caret, optionally replacing that
    word. `insertText` does nothing while an OS IME composition is in progress.
  - `trailingWord(text)`: the word-boundary rule, splitting on whitespace and Latin or
    Ethiopic punctuation.
  - Each bundled input method is now published as JSON at
    `@writegeez/ime/input-methods/<code>.json`, for engines in other languages.

- [#2](https://github.com/ibra-sk/writegeez/pull/2) [`6595491`](https://github.com/ibra-sk/writegeez/commit/65954918f8a81ff6bd440814277149eaf856299e) Thanks [@ibra-sk](https://github.com/ibra-sk)! - Export the bundled input methods as a list: `inputMethods` (an `InputMethodSpec[]`)
  and `getInputMethod(code)`. This replaces an unexported, unused registry that
  was keyed by name and held maps rather than specs, and it lets consumers
  enumerate the available languages instead of hard-coding them.

## 0.0.2

### Patch Changes

- [`79661e0`](https://github.com/ibra-sk/writegeez/commit/79661e0f57c63bcdab753bb46541ca4983aaec3d) Thanks [@ibra-sk](https://github.com/ibra-sk)! - add provenance to the package
