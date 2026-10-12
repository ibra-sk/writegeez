# @writegeez/ime

[![npm version](https://img.shields.io/npm/v/@writegeez/ime.svg)](https://www.npmjs.com/package/@writegeez/ime)
[![npm downloads](https://img.shields.io/npm/dt/@writegeez/ime.svg)](https://www.npmjs.com/package/@writegeez/ime)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> A modern **Web Input Method Editor (IME)** for typing **Geʽez-script languages** such as Tigrinya, Amharic, and Tigre — built for the web, open source, and written in TypeScript.

---

## ✨ Features

- 🪶 **Lightweight** – pure TypeScript, no framework dependencies.  
- ⚙️ **Works anywhere** – supports `<input>`, `<textarea>`, and `contenteditable` elements.  
- 🧠 **Smart transliteration** – converts Latin input to Geʽez script in real time.  
- 💻 **Framework-agnostic** – works with vanilla JS, React, Vue, or any frontend stack.  
- 🧩 **Extensible design** – customize mappings, or build your own input method spec.  
- 💬 **TypeScript ready** – full typings and autocomplete out of the box.

---

## 🚀 Installation

```bash
npm install @writegeez/ime
# or
yarn add @writegeez/ime
```

---

## 🧰 Basic Usage (Vanilla JS / TS)

```ts
import { WriteGeezIME } from "@writegeez/ime";

// Define a minimal input map for demo
const inputMap = {
  h: { value: "ህ", next: { a: { value: "ሀ" } } },
  b: { value: "ብ" },
};

const inputSpec = { map: inputMap };

const textarea = document.querySelector("textarea");

// Attach IME
const ime = new WriteGeezIME(inputSpec, textarea!, { enabled: true });

// Optional: toggle
ime.disable();
ime.enable();
```

Try typing **“h” → “a”** — it should become **ሀ**.

---

## ⚛️ React Example

Here’s a minimal React component demo (like the one in `examples/basic`):

```tsx
import React, { useEffect, useRef, useMemo } from "react";
import { WriteGeezIME } from "@writegeez/ime";

export function App() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const spec = useMemo(
    () => ({
      map: {
        h: { value: "ህ", next: { a: { value: "ሀ" } } },
        b: { value: "ብ" },
      },
    }),
    []
  );

  useEffect(() => {
    if (!textareaRef.current) return;
    new WriteGeezIME(spec, textareaRef.current, { enabled: true });
  }, [spec]);

  return (
    <div style={{ padding: 16 }}>
      <h1>@writegeez/ime demo</h1>
      <textarea ref={textareaRef} placeholder="Type 'h' then 'a' → ሀ" rows={4} />
    </div>
  );
}
```

---

## 📘 API Reference

### `class WriteGeezIME`

#### **constructor**
```ts
new WriteGeezIME(
  spec: InputMethodSpec,
  element: HTMLElement,
  options?: { enabled?: boolean }
)
```

- `spec` — defines your transliteration mapping tree.  
- `element` — `<input>`, `<textarea>`, or contenteditable element to attach to.  
- `options.enabled` — whether to start active.

#### **Methods**

| Method | Description |
|--------|--------------|
| `enable()` | Enables the IME |
| `disable()` | Disables the IME |
| `setEnabled(flag: boolean)` | Enables or disables based on a boolean |
| `isEnabled(): boolean` | Returns whether the IME is active |
| `processInput(prevChar: string, newChar: string)` | Returns `{ output, modifiesPrev }` — used for testing or custom logic |

---

## 🧩 Extending the Input Map

Define your own transliteration rules easily:

```ts
const inputMap = {
  s: { value: "ስ", next: { a: { value: "ሳ" }, e: { value: "ሴ" } } },
};

new WriteGeezIME({ map: inputMap }, element);
```

---

## 🎛️ UI Components

Prefer not to wire the engine to a field yourself? `@writegeez/webui` ships
headless, Radix-style React primitives plus a styled composer:

```bash
npm install @writegeez/webui @writegeez/ime
```

```tsx
import { GeezComposer } from "@writegeez/webui";
import "@writegeez/webui/styles.css";

<GeezComposer placeholder="Ask a Question.." onSubmit={(value) => send(value)} />;
```

Enter submits, Shift+Enter adds a newline, and Ctrl/Cmd+Space toggles the IME.
Every part also ships unstyled with `asChild` support — see
[`packages/webui/README.md`](packages/webui/README.md).

---

## 🧪 Development

Clone the repo and run locally:

```bash
git clone https://github.com/ibra-sk/writegeez.git
cd writegeez
npm i
npm run dev -w @writegeez/ime
npm run dev -w @writegeez/webui
npm run dev -w writegeez-example-basic
```

This will watch-build the IME and the UI package, and open the live example app.

---

## 📦 Monorepo Structure

| Package | Description | Status |
|----------|--------------|--------|
| `@writegeez/ime` | Core Input Method Engine | ✅ Published |
| `@writegeez/webui` | React UI primitives + styled composer | ✅ Available |
| `@writegeez/sentiment` | (Planned) Sentiment analysis module | 🚧 Coming soon |

---

## 🔗 Links

- **NPM** → https://www.npmjs.com/package/@writegeez/ime  
- **GitHub** → https://github.com/ibra-sk/writegeez

---

## 📄 License

MIT © 2025 Ibrahim Kekia
