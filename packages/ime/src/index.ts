export { default as GeezIME } from "./webGeezIme";
export * from "./webGeezIme";
export type * from "./webGeezIme";

export type { InputMethod, InputMethodSpec, SymbolMap } from "./input-methods/interfaces";

export { TigrinyaEritrean, inputMethods, getInputMethod } from "./input-methods";

import * as core from "./webGeezIme";
export const ime = core;
export { Transliterator } from "./transliterator";
