import {
	InputMethod,
	InputMethodSpec,
	SymbolMap,
} from "./input-methods/interfaces";
import { buildReverseMap, isLatinChar } from "./utils";

type StaticRangeLike = {
	startContainer: Node;
	startOffset: number;
	endContainer: Node;
	endOffset: number;
};

export default class WebGeezIME {
	private inputMap: InputMethod;
	private geezToLatinMap: Record<string, string>;

	private activeElement: HTMLElement | null = null;
	private elementType: "input" | "div" | null = null;
	private isContentEditable = false;

	private composing = false;
	private enabled = true;

	private boundBeforeInput = (e: InputEvent) => this.handleBeforeInput(e);
	private boundCompositionStart = () => {
		this.composing = true;
	};
	private boundCompositionEnd = () => {
		this.composing = false;
	};

	constructor(
		inputMethodSpec: InputMethodSpec,
		element: HTMLElement,
		options?: { enabled?: boolean }
	) {
		this.inputMap = inputMethodSpec.map;
		this.geezToLatinMap = buildReverseMap(this.inputMap);
		if (typeof options?.enabled === "boolean")
			this.enabled = options.enabled;
		this.attachToElement(element);
	}

	protected enable() {
		this.enabled = true;
		this.activeElement?.setAttribute("data-ime-enabled", "true");
	}
	protected disable() {
		this.enabled = false;
		this.activeElement?.setAttribute("data-ime-enabled", "false");
	}
	setEnabled(flag: boolean) {
		flag ? this.enable() : this.disable();
	}
	isEnabled() {
		return this.enabled;
	}

	protected attachToElement(element: HTMLElement): void {
		if (this.activeElement) {
			this.activeElement.removeEventListener(
				"beforeinput",
				this.boundBeforeInput as EventListener
			);
			this.activeElement.removeEventListener(
				"compositionstart",
				this.boundCompositionStart as EventListener
			);
			this.activeElement.removeEventListener(
				"compositionend",
				this.boundCompositionEnd as EventListener
			);
		}

		this.activeElement = element;
		const tag = element.tagName;
		this.elementType =
			tag === "INPUT" || tag === "TEXTAREA" ? "input" : "div";
		this.isContentEditable =
			this.elementType === "div" &&
			!!(element as HTMLElement).isContentEditable;

		element.addEventListener(
			"beforeinput",
			this.boundBeforeInput as EventListener
		);
		element.addEventListener(
			"compositionstart",
			this.boundCompositionStart as EventListener
		);
		element.addEventListener(
			"compositionend",
			this.boundCompositionEnd as EventListener
		);

		element.setAttribute(
			"data-ime-enabled",
			this.enabled ? "true" : "false"
		);
	}

	processInput(
		prevChar: string,
		newChar: string
	): { output: string; modifiesPrev: boolean } {
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

		if (currentNode?.next && currentNode.next[newChar]) {
			return {
				output: currentNode.next[newChar].value || newChar,
				modifiesPrev: true,
			};
		}

		const newNode = this.inputMap[newChar];
		if (newNode)
			return { output: newNode.value || newChar, modifiesPrev: false };

		return { output: newChar, modifiesPrev: false };
	}

	private handleBeforeInput(event: InputEvent): void {
		if (!this.activeElement) return;

		// If IME is disabled, do nothing—let native behavior pass through.
		if (!this.enabled) return;

		const type = event.inputType;
		if (type === "insertCompositionText") return;
		if (type !== "insertText") return;

		const data = event.data ?? "";
		if (data.length === 0) return;
		if (this.composing) return;

		const byTarget = this.getPreviousCharByTargetRanges(event);
		const { prevChar } = byTarget ?? this.getPreviousChar();

		const { output, modifiesPrev } = this.processInput(prevChar, data);
		if (!modifiesPrev && output === data) return;

		event.preventDefault();

		if (modifiesPrev) {
			this.replaceGeezChar(output);
			this.dispatchSyntheticInput("insertReplacementText");
		} else {
			this.insertGeezChar(output);
			this.dispatchSyntheticInput("insertText");
		}
	}

	private insertGeezChar(char: string): void {
		if (!this.activeElement) return;

		if (this.elementType === "input") {
			const target = this.activeElement as
				| HTMLInputElement
				| HTMLTextAreaElement;
			const start = target.selectionStart ?? target.value.length;
			const end = target.selectionEnd ?? start;
			target.setRangeText(char, start, end, "end");
		} else if (this.isContentEditable) {
			const sel = window.getSelection();
			if (!sel) return;
			if (!sel.rangeCount) {
				const range = document.createRange();
				const lastText =
					this.getLastTextNode(this.activeElement) ||
					this.activeElement;
				range.selectNodeContents(lastText);
				range.collapse(false);
				sel.removeAllRanges();
				sel.addRange(range);
			}
			const range = sel.getRangeAt(0);
			range.deleteContents();
			const textNode = document.createTextNode(char);
			range.insertNode(textNode);
			range.setStartAfter(textNode);
			range.collapse(true);
			sel.removeAllRanges();
			sel.addRange(range);
		}
	}

	private replaceGeezChar(char: string): void {
		if (!this.activeElement) return;

		if (this.elementType === "input") {
			const target = this.activeElement as
				| HTMLInputElement
				| HTMLTextAreaElement;
			const caret = target.selectionStart ?? 0;
			const start = this.findPrevGraphemeStart(target.value, caret);
			target.setRangeText(char, start, caret, "end");
		} else if (this.isContentEditable) {
			const sel = window.getSelection();
			if (!sel || !sel.rangeCount) return;

			const range = sel.getRangeAt(0);
			const { node, offset } = this.resolveTextPosition(
				range.startContainer,
				range.startOffset
			);
			if (node) {
				const text = node.textContent ?? "";
				const start = this.findPrevGraphemeStart(text, offset);
				const r = document.createRange();
				r.setStart(node, start);
				r.setEnd(node, offset);
				r.deleteContents();

				const textNode = document.createTextNode(char);
				r.insertNode(textNode);

				const after = document.createRange();
				after.setStartAfter(textNode);
				after.collapse(true);
				sel.removeAllRanges();
				sel.addRange(after);
			} else {
				this.insertGeezChar(char);
			}
		}
	}

	private dispatchSyntheticInput(inputType: string) {
		if (!this.activeElement) return;
		const evt = new InputEvent("input", {
			bubbles: true,
			inputType,
		} as any);
		(evt as any).isIMEEvent = true;
		this.activeElement.dispatchEvent(evt);
	}

	private getPreviousCharByTargetRanges(
		event: InputEvent
	): { prevChar: string; cursorPos: number } | null {
		// @ts-ignore
		const ranges: StaticRangeLike[] | undefined = (
			event as any
		).getTargetRanges?.();
		if (!ranges || ranges.length === 0) return null;

		const r = ranges[0];
		const pos = this.resolveTextPosition(r.startContainer, r.startOffset);
		if (!pos.node) return null;

		const text = pos.node.textContent ?? "";
		const start = this.findPrevGraphemeStart(text, pos.offset);
		const prevChar = text.slice(start, pos.offset);
		return { prevChar, cursorPos: pos.offset };
	}

	private getPreviousChar(): { prevChar: string; cursorPos: number } {
		if (!this.activeElement) return { prevChar: "", cursorPos: 0 };

		if (this.elementType === "input") {
			const inputElem = this.activeElement as
				| HTMLInputElement
				| HTMLTextAreaElement;
			const cursorPos = inputElem.selectionStart ?? 0;
			const start = this.findPrevGraphemeStart(
				inputElem.value,
				cursorPos
			);
			const prevChar = inputElem.value.slice(start, cursorPos);
			return { prevChar, cursorPos };
		} else if (this.isContentEditable) {
			const sel = window.getSelection();
			if (sel && sel.rangeCount > 0) {
				const range = sel.getRangeAt(0);
				const { node, offset } = this.resolveTextPosition(
					range.startContainer,
					range.startOffset
				);
				if (node) {
					const text = node.textContent ?? "";
					const start = this.findPrevGraphemeStart(text, offset);
					const prevChar = text.slice(start, offset);
					return { prevChar, cursorPos: offset };
				}
			}
		}
		return { prevChar: "", cursorPos: 0 };
	}

	private findPrevGraphemeStart(text: string, caret: number): number {
		try {
			// @ts-ignore
			if (typeof Intl !== "undefined" && Intl.Segmenter) {
				// @ts-ignore
				const seg = new Intl.Segmenter(undefined, {
					granularity: "grapheme",
				});
				const segments = Array.from(seg.segment(text));
				for (let i = segments.length - 1; i >= 0; i--) {
					const s = segments[i] as any;
					const start = s.index as number;
					const end = start + (s.segment as string).length;
					if (caret > start && caret <= end) return start;
					if (end < caret) return start >= 0 ? start : 0;
				}
				return 0;
			}
		} catch {}
		return Math.max(0, caret - 1);
	}

	private resolveTextPosition(
		node: Node,
		offset: number
	): { node: Text | null; offset: number } {
		if (node.nodeType === Node.TEXT_NODE)
			return { node: node as Text, offset };
		const container =
			node.childNodes[offset - 1] ||
			node.childNodes[offset] ||
			node.lastChild ||
			node.firstChild;
		const textNode = this.getNearestTextNode(container || node);
		if (!textNode) return { node: null, offset: 0 };
		return { node: textNode, offset: textNode.textContent?.length ?? 0 };
	}

	private getNearestTextNode(n: Node): Text | null {
		if (n.nodeType === Node.TEXT_NODE) return n as Text;
		const search = (root: Node, forward = false): Text | null => {
			const kids = Array.from(root.childNodes);
			const arr = forward ? kids : kids.reverse();
			for (const k of arr) {
				const t = this.getNearestTextNode(k);
				if (t) return t;
			}
			return null;
		};
		return search(n, false) || search(n, true);
	}

	private getLastTextNode(root: Node): Text | null {
		if (root.nodeType === Node.TEXT_NODE) return root as Text;
		for (let i = root.childNodes.length - 1; i >= 0; i--) {
			const t = this.getLastTextNode(root.childNodes[i]);
			if (t) return t;
		}
		return null;
	}
}
