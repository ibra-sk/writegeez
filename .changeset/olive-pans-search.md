---
"@writegeez/ime": minor
---

Export the bundled input methods as a list: `inputMethods` (an `InputMethodSpec[]`)
and `getInputMethod(code)`. This replaces an unexported, unused registry that
was keyed by name and held maps rather than specs, and it lets consumers
enumerate the available languages instead of hard-coding them.
