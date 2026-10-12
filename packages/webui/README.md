# @writegeez/webui

> Headless React UI for [`@writegeez/ime`](https://www.npmjs.com/package/@writegeez/ime) — Radix-style primitives plus one styled composer, with no third-party UI dependency.

---

## Install

```bash
npm install @writegeez/webui @writegeez/ime
```

`react` and `react-dom` (18 or 19) are peer dependencies.

---

## Quick start

```tsx
import { GeezComposer } from "@writegeez/webui";
import "@writegeez/webui/styles.css";

export function Ask() {
	return (
		<GeezComposer
			placeholder="Ask a Question.."
			onSubmit={(value) => console.log(value)}
		/>
	);
}
```

That renders the default composer: a rounded surface with a large prompt
field and a round script toggle. Typing `s` `e` `l` `a` `m` produces `ሰላም`.

- **Enter** submits, **Shift+Enter** adds a newline.
- **Ctrl/Cmd+Space** toggles the IME without leaving the keyboard.
- The language select lists every input method bundled with
  `@writegeez/ime` — one entry today, and it grows on its own as the
  engine adds more.
- The field grows with its content up to `40vh`.

### `GeezComposer` props

Every `Composer.Root` prop is accepted, plus:

| Prop          | Default              | Description                                        |
| ------------- | -------------------- | -------------------------------------------------- |
| `placeholder` | `"Ask a Question.."` | Shown while the field is empty.                    |
| `label`       | `"Message"`          | Accessible name for the field.                     |
| `showToggle`  | `true`               | Render the IME enable/disable button.              |
| `showSelect`  | `true`               | Render the input language select.                  |
| `actions`     | —                    | Extra controls at the trailing edge of the toolbar. |
| `inputProps`  | —                    | Forwarded to `Composer.Input`.                      |

With `showToggle={false}` the toolbar disappears entirely unless `actions` are
given — the IME keeps running, and Ctrl/Cmd+Space still toggles it.

```tsx
<GeezComposer showToggle={false} placeholder="Ask a Question.." />
```

---

## Composing it yourself

`GeezComposer` is a thin preset over the primitives. Drop it and assemble the
parts when you want a different layout — they ship without styles, so the
class names above are yours to replace.

```tsx
import { Composer } from "@writegeez/webui";

<Composer.Root spec={TigrinyaEritrean} onSubmit={send} className="my-card">
	<Composer.Input placeholder="Ask a Question.." className="my-field" />
	<Composer.Toolbar className="my-row">
		<Composer.Toggle className="my-toggle" />
		<Composer.Submit className="my-send">Send</Composer.Submit>
	</Composer.Toolbar>
</Composer.Root>;
```

### Parts

| Part               | Element    | Notes                                                                    |
| ------------------ | ---------- | ------------------------------------------------------------------------ |
| `Composer.Root`    | `div`      | Owns the value, the IME instance and the on/off state.                    |
| `Composer.Input`   | `textarea` | Attaches the IME, auto-resizes, handles Enter and the toggle shortcut.    |
| `Composer.Toolbar` | `div`      | Layout slot for controls.                                                 |
| `Composer.Toggle`  | `button`   | `role="switch"` over the IME; renders `ScriptGlyph` unless given children. |
| `Composer.Select`  | `div`      | Language dropdown root — anchors the trigger and the list.                |
| `Composer.SelectTrigger` | `button` | Pill showing the active language, with a chevron.                     |
| `Composer.SelectContent` | `div`  | The floating `role="listbox"` panel; unmounted while closed.            |
| `Composer.SelectItem` | `div`     | One `role="option"` row, with a check on the active language.           |
| `Composer.Submit`  | `button`   | Disabled while the value is blank.                                        |

Every part accepts `asChild` to render your own element instead:

```tsx
<Composer.Toggle asChild>
	<MyIconButton />
</Composer.Toggle>
```

Parts expose their state as data attributes, so CSS never needs a class
toggle: `data-state="on" | "off"`, `data-disabled`, `data-script="ti-ER"`, plus
`data-ime-enabled` which the engine itself writes onto the field.

### `Composer.Root` props

| Prop                                       | Default            | Description                                    |
| ------------------------------------------ | ------------------ | ---------------------------------------------- |
| `specs`                                    | `inputMethods`     | Input methods offered by `Composer.Select`.    |
| `spec` / `defaultSpec` / `onSpecChange`    | `specs[0]`         | Controlled or uncontrolled active input method. |
| `value` / `defaultValue` / `onValueChange` | `""`               | Controlled or uncontrolled text.               |
| `enabled` / `defaultEnabled` / `onEnabledChange` | `true`       | Controlled or uncontrolled IME state.          |
| `onSubmit(value)`                          | —                  | Fired on Enter or `Composer.Submit`.           |
| `submitOnEnter`                            | `true`             | Enter submits, Shift+Enter inserts a newline.  |
| `clearOnSubmit`                            | `true`             | Empty the field after a submit.                |
| `toggleShortcut`                           | `true`             | Ctrl/Cmd+Space toggles the IME.                |
| `theme`                                    | `"light"`          | `"light"`, `"dark"`, or `"auto"` to follow the system. |
| `disabled`                                 | `false`            | Blocks typing, toggling and submitting.        |

Build a custom part with `useComposer()`, which reads the enclosing
`Composer.Root` state:

```tsx
function ScriptLabel() {
	const { spec, enabled } = useComposer("ScriptLabel");
	return <span>{enabled ? spec.name : "Latin"}</span>;
}
```

---

## Theming

`styles.css` drives everything from custom properties on `.wg-composer`, so
overriding one token reskins the control.

**The composer is light in every environment by default.** Dark is opt in per
instance, so a dark host page never flips the surface behind your back:

```tsx
<GeezComposer theme="dark" />  {/* fixed dark   */}
<GeezComposer theme="auto" />  {/* follow the system */}
```

```css
.wg-composer {
	--wg-radius: 16px;
	--wg-surface: #fffdf7;
	--wg-accent: #1d4ed8;
	--wg-font: "Noto Sans Ethiopic", system-ui, sans-serif;
}
```

| Token                              | Purpose                       |
| ---------------------------------- | ----------------------------- |
| `--wg-radius`, `--wg-padding`      | Surface shape                 |
| `--wg-surface`, `--wg-border`, `--wg-shadow` | Surface paint        |
| `--wg-text`, `--wg-placeholder`    | Field type                    |
| `--wg-control`, `--wg-control-hover` | Round button background     |
| `--wg-icon`, `--wg-accent`         | Icon and its badge            |
| `--wg-focus`                       | Focus ring                    |
| `--wg-menu`, `--wg-menu-border`, `--wg-menu-shadow` | Dropdown panel |
| `--wg-menu-highlight`              | Highlighted dropdown row      |
| `--wg-font`                        | Font stack                    |

Skipping the stylesheet entirely is a supported path — the primitives render
no class names of their own.

---

## Languages

`specs` defaults to `inputMethods` from `@writegeez/ime`, so the select stays
current without a change here. Narrow or extend it per instance:

```tsx
import { inputMethods, getInputMethod } from "@writegeez/ime";

// only some of them
<GeezComposer specs={[getInputMethod("ti-ER")!]} />

// your own spec alongside the bundled ones
const MINE = { name: "My layout", code: "xx-MINE", map: { /* … */ } };
<GeezComposer specs={[...inputMethods, MINE]} />
```

Pass `spec` to control the active language yourself, and handle `onSpecChange`
— otherwise the select cannot move it, exactly like `value` and `enabled`. Keep
the `specs` array referentially stable (module constant or `useMemo`).

### The dropdown

`Composer.Select` is a real listbox rather than a native `<select>`, so it can
be styled and animated: a pill trigger, a floating panel that flips above the
trigger when there is no room below, and a check on the active language.

- **Mouse** — click to open, click an item to choose, click anywhere outside to
  dismiss.
- **Keyboard** — `Enter`, `Space`, `↑` or `↓` opens it; `↑`/`↓`, `Home` and
  `End` move the highlight; typing letters jumps to a language by name; `Enter`
  selects; `Escape` or `Tab` dismisses and returns focus to the trigger.
- **Screen readers** — `aria-haspopup`, `aria-expanded` and `aria-controls` on
  the trigger; `role="listbox"` with `aria-activedescendant` on the panel; each
  row is a `role="option"` carrying `aria-selected`.

Rebuild it from the parts when the default markup is not what you want:

```tsx
<Composer.Select className="my-anchor">
	<Composer.SelectTrigger className="my-pill">
		{spec.name}
	</Composer.SelectTrigger>
	<Composer.SelectContent className="my-panel">
		{specs.map((candidate) => (
			<Composer.SelectItem key={candidate.code} spec={candidate} />
		))}
	</Composer.SelectContent>
</Composer.Select>
```

State reaches CSS as data attributes: `data-state="open" | "closed"` on the
root and trigger, `data-side="top" | "bottom"` on the panel, and
`data-state="checked"` plus `data-highlighted` on items.

---

## Utilities

The Radix-style helpers the parts are built on are exported too, so custom
parts can behave like the built-in ones: `Slot`, `Slottable`, `Primitive`,
`composeRefs` / `useComposedRefs`, `composeEventHandlers`, `createContext`,
`useControllableState`, `useCallbackRef`, `useId`.

---

## Notes

- The IME engine has no detach API, so switching languages cannot tear the old
  engine down. One engine is cached per spec instead, and only the active one is
  enabled — the rest stay attached but inert. The textarea is never remounted, so
  a language change keeps the text, the caret and focus exactly where they were.
- `ScriptGlyph` shows `ሀ` while the IME is on and `A` while it is off, so the
  toggle needs no legend. Both glyphs inherit `color` and `font-size` from the
  button; pass `geez` / `latin` to use different characters, or give
  `Composer.Toggle` children to replace the mark entirely.

---

## License

MIT © Ibrahim Kekia
