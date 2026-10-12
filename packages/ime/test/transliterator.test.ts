import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import TigrinyaEritrean from "../src/input-methods/ti-ER";
import { Transliterator } from "../src/transliterator";
import { buildReverseMap, isLatinChar } from "../src/utils";

const rows: { keys: string; text: string }[] = readFileSync(
	new URL("../fixtures/ti-ER.jsonl", import.meta.url),
	"utf8"
)
	.split("\n")
	.filter(Boolean)
	.map((line) => JSON.parse(line));

describe("ti-ER fixtures", () => {
	const t = new Transliterator(TigrinyaEritrean);
	it.each(rows)("$keys → $text", ({ keys, text }) => {
		expect(t.transliterate(keys)).toBe(text);
	});
});

describe("Transliterator.feed", () => {
	const t = new Transliterator(TigrinyaEritrean);

	it("inserts a sixth-order fidel with no previous char", () => {
		expect(t.feed("", "s")).toEqual({ replace: false, text: "ስ" });
	});

	it("replaces the previous fidel when the key extends it", () => {
		expect(t.feed("ስ", "e")).toEqual({ replace: true, text: "ሰ" });
		expect(t.feed("ሱ", "a")).toEqual({ replace: true, text: "ሷ" });
		expect(t.feed("፡", ":")).toEqual({ replace: true, text: "።" });
	});

	it("inserts when the key does not extend the previous fidel", () => {
		expect(t.feed("ሰ", "s")).toEqual({ replace: false, text: "ስ" });
		expect(t.feed("ሳ", "a")).toEqual({ replace: false, text: "አ" });
	});

	it("walks a Latin previous char through the trie", () => {
		expect(t.feed("s", "e")).toEqual({ replace: true, text: "ሰ" });
	});

	it("passes unmapped keys through unchanged", () => {
		expect(t.feed("", "1")).toEqual({ replace: false, text: "1" });
		expect(t.feed("ስ", " ")).toEqual({ replace: false, text: " " });
	});

	it("ignores a previous char the map does not know", () => {
		expect(t.feed("ß", "e")).toEqual({ replace: false, text: "እ" });
	});
});

describe("Transliterator.transliterate", () => {
	const t = new Transliterator(TigrinyaEritrean);

	it("returns an empty string for no keys", () => {
		expect(t.transliterate("")).toBe("");
	});

	it("matches a manual feed loop", () => {
		let out = "";
		for (const key of "kemey") {
			const { replace, text } = t.feed(out.slice(-1), key);
			out = (replace ? out.slice(0, -1) : out) + text;
		}
		expect(t.transliterate("kemey")).toBe(out);
	});
});

describe("utils", () => {
	const map = {
		s: { value: "ስ", next: { e: { value: "ሰ", next: null } } },
		".": { value: "።", next: null },
	};

	it("buildReverseMap maps each value to its key path", () => {
		expect(buildReverseMap(map)).toEqual({ ስ: "s", ሰ: "se", "።": "." });
	});

	it("isLatinChar accepts only ASCII letters", () => {
		expect(["a", "Z"].every(isLatinChar)).toBe(true);
		expect(["ስ", "1", " ", "é", ""].some(isLatinChar)).toBe(false);
	});
});
