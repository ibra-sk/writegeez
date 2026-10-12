import { InputMethod, InputMethodSpec, SymbolMap } from "./input-methods/interfaces";
import { buildReverseMap, isLatinChar } from "./utils";

/**
 * DOM-free transliteration engine. Feed it the character before the caret
 * and the key just typed; it says what to write and whether that replaces
 * the previous character.
 */
export class Transliterator {
	private inputMap: InputMethod;
	private geezToLatinMap: Record<string, string>;

	constructor(spec: InputMethodSpec) {
		this.inputMap = spec.map;
		this.geezToLatinMap = buildReverseMap(this.inputMap);
	}

	feed(prevChar: string, key: string): { replace: boolean; text: string } {
		let prevLatinChar = prevChar;
		if (!isLatinChar(prevChar))
			prevLatinChar = this.geezToLatinMap[prevChar] || prevChar;

		let currentNode: SymbolMap | null = null;
		let tempNode: InputMethod = this.inputMap;

		for (const char of prevLatinChar) {
			if (tempNode[char]) {
				currentNode = tempNode[char];
				tempNode = currentNode.next || {};
			} else {
				currentNode = null;
				break;
			}
		}

		if (currentNode?.next && currentNode.next[key])
			return { replace: true, text: currentNode.next[key].value || key };

		const newNode = this.inputMap[key];
		if (newNode) return { replace: false, text: newNode.value || key };

		return { replace: false, text: key };
	}

	/** Run a whole key sequence, e.g. `"selam"` → `"ሰላም"`. */
	transliterate(keys: string): string {
		const out: string[] = [];
		for (const key of keys) {
			const { replace, text } = this.feed(out[out.length - 1] ?? "", key);
			if (replace) out.pop();
			out.push(text);
		}
		return out.join("");
	}
}
