# @writegeez/webui

## 0.1.0

### Minor Changes

- [#2](https://github.com/ibra-sk/writegeez/pull/2) [`6595491`](https://github.com/ibra-sk/writegeez/commit/65954918f8a81ff6bd440814277149eaf856299e) Thanks [@ibra-sk](https://github.com/ibra-sk)! - Add `@writegeez/webui`: headless, Radix-style React primitives for the Ge'ez IME.

  `Composer.Root` / `Input` / `Toolbar` / `Toggle` / `Submit` wire `@writegeez/ime`
  to a controlled React field, each part supporting `asChild` and exposing its
  state as data attributes. `GeezComposer` is the styled preset — a rounded prompt
  surface with a round script toggle that reads `ሀ` when the IME is on and `A`
  when it is off — themed entirely through custom properties in
  `@writegeez/webui/styles.css`. The surface is light in every environment
  unless `theme="dark"` or `theme="auto"` is passed.

  `Composer.Select` picks the input language, defaulting to every method bundled
  with `@writegeez/ime`. Switching languages swaps the active engine without
  remounting the field, so the text, caret and focus survive the change. It is a
  custom listbox — trigger, floating panel that flips when short of room,
  highlight, check indicator, typeahead and full keyboard and ARIA support —
  rather than a native `<select>`, and decomposes into `Composer.SelectTrigger`,
  `SelectContent` and `SelectItem`.

### Patch Changes

- Updated dependencies [[`6595491`](https://github.com/ibra-sk/writegeez/commit/65954918f8a81ff6bd440814277149eaf856299e), [`6595491`](https://github.com/ibra-sk/writegeez/commit/65954918f8a81ff6bd440814277149eaf856299e)]:
  - @writegeez/ime@0.1.0
