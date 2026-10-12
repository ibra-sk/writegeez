// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import TigrinyaEritrean from "../src/input-methods/ti-ER";
import WebGeezIME from "../src/webGeezIme";

/** Dispatch beforeinput per key; when the IME lets a key through, insert it as the browser would. */
function type(el: HTMLElement, keys: string) {
	for (const data of keys) {
		const handled = !el.dispatchEvent(
			new InputEvent("beforeinput", { inputType: "insertText", data, cancelable: true, bubbles: true })
		);
		if (handled) continue;
		if (el instanceof HTMLTextAreaElement) {
			el.setRangeText(data, el.selectionStart, el.selectionEnd, "end");
		} else {
			const range = window.getSelection()!.getRangeAt(0);
			const node = document.createTextNode(data);
			range.insertNode(node);
			range.setStartAfter(node);
			range.collapse(true);
		}
	}
}

describe("WebGeezIME on a textarea", () => {
	let el: HTMLTextAreaElement;
	let ime: WebGeezIME;

	beforeEach(() => {
		document.body.innerHTML = "<textarea></textarea>";
		el = document.querySelector("textarea")!;
		el.focus();
		ime = new WebGeezIME(TigrinyaEritrean, el);
	});

	it("transliterates typed keys", () => {
		type(el, "selam");
		expect(el.value).toBe("ሰላም");
	});

	it("currentWord returns the word before the caret", () => {
		el.value = "ከመይ ሰላም";
		el.setSelectionRange(6, 6);
		expect(ime.currentWord()).toBe("ሰላ");
		el.setSelectionRange(3, 3);
		expect(ime.currentWord()).toBe("ከመይ");
		el.setSelectionRange(4, 4);
		expect(ime.currentWord()).toBe("");
	});

	it("insertText with replaceWord swaps the current word and keeps the rest", () => {
		el.value = "ከመይ ሰላ ኢኻ";
		el.setSelectionRange(6, 6);
		expect(ime.insertText("ሰላም", { replaceWord: true })).toBe(true);
		// Not asserting the caret: happy-dom's setRangeText(…, "end") moves it to the end of the value.
		expect(el.value).toBe("ከመይ ሰላም ኢኻ");
	});

	it("insertText without replaceWord inserts at the caret", () => {
		el.value = "ሰላም";
		el.setSelectionRange(3, 3);
		ime.insertText(" ከመይ");
		expect(el.value).toBe("ሰላም ከመይ");
	});

	it("insertText fires an input event", () => {
		const onInput = vi.fn();
		el.addEventListener("input", onInput);
		ime.insertText("ሰላም");
		expect(onInput).toHaveBeenCalledOnce();
		expect(onInput.mock.calls[0][0].inputType).toBe("insertText");
	});

	it("insertText refuses during an OS IME composition", () => {
		el.dispatchEvent(new CompositionEvent("compositionstart"));
		expect(ime.insertText("ሰላም")).toBe(false);
		expect(el.value).toBe("");
		el.dispatchEvent(new CompositionEvent("compositionend"));
		expect(ime.insertText("ሰላም")).toBe(true);
	});

	it("typing continues correctly after an inserted suggestion", () => {
		type(el, "sel");
		ime.insertText("ሰላም", { replaceWord: true });
		type(el, " kemey");
		expect(el.value).toBe("ሰላም ከመይ");
	});
});

describe("WebGeezIME on a contenteditable", () => {
	let el: HTMLDivElement;
	let ime: WebGeezIME;

	beforeEach(() => {
		document.body.innerHTML = '<div contenteditable="true"></div>';
		el = document.querySelector("div")!;
		el.focus();
		// happy-dom's focus() leaves the previous test's selection behind; put the caret in el.
		const range = document.createRange();
		range.selectNodeContents(el);
		window.getSelection()!.removeAllRanges();
		window.getSelection()!.addRange(range);
		ime = new WebGeezIME(TigrinyaEritrean, el);
	});

	it("reads the current word across the text nodes typing creates", () => {
		type(el, "kemey sel");
		expect(el.textContent).toBe("ከመይ ሰል");
		expect(ime.currentWord()).toBe("ሰል");
	});

	it("insertText with replaceWord swaps the current word", () => {
		type(el, "kemey sel");
		ime.insertText("ሰላም", { replaceWord: true });
		expect(el.textContent).toBe("ከመይ ሰላም");
		type(el, "a");
		expect(el.textContent).toBe("ከመይ ሰላማ");
	});

	it("inserts at the end when the selection is outside the element", () => {
		el.textContent = "ሰላም";
		const other = document.createElement("p");
		other.textContent = "x";
		document.body.append(other);
		const range = document.createRange();
		range.selectNodeContents(other);
		window.getSelection()!.removeAllRanges();
		window.getSelection()!.addRange(range);

		expect(ime.currentWord()).toBe("ሰላም");
		ime.insertText(" ከመይ");
		expect(el.textContent).toBe("ሰላም ከመይ");
		expect(other.textContent).toBe("x");
	});
});
