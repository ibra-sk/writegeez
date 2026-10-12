import type { InputMethodSpec } from "./interfaces";
import TigrinyaEritrean from "./ti-ER";

export { default as TigrinyaEritrean } from "./ti-ER";

/** Every input method bundled with the package, in menu order. */
export const inputMethods: InputMethodSpec[] = [TigrinyaEritrean];

/** Look one up by its `code`, e.g. `"ti-ER"`. */
export function getInputMethod(code: string): InputMethodSpec | undefined {
	return inputMethods.find((method) => method.code === code);
}
