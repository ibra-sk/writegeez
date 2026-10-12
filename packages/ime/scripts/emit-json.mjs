// Writes every bundled input method to dist/input-methods/<code>.json,
// the shared source for the web, Swift and Kotlin engines. Run after tsup.
import { mkdirSync, writeFileSync } from "node:fs";
import { inputMethods } from "../dist/index.mjs";

const outDir = new URL("../dist/input-methods/", import.meta.url);
mkdirSync(outDir, { recursive: true });
for (const spec of inputMethods)
	writeFileSync(new URL(`${spec.code}.json`, outDir), JSON.stringify(spec));
