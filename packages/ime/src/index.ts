export { default as GeezIME } from "./webGeezIme";
export * from "./webGeezIme";
export type * from "./webGeezIme";

export type { InputMethod, InputMethodSpec, SymbolMap } from "./input-methods/interfaces";

export { TigrinyaEritrean } from "./input-methods";

import * as core from "./webGeezIme";
export const ime = core;