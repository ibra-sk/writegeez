import { InputMethod } from "./input-methods/interfaces";

export function buildReverseMap(
    inputMethod: InputMethod,
    prefix = ""
): Record<string, string> {
    const map: Record<string, string> = {};

    for (const key in inputMethod) {
        const node = inputMethod[key];
        const currentKey = prefix + key;

        if (node.value) {
            map[node.value] = currentKey;
        }

        if (node.next) {
            Object.assign(map, buildReverseMap(node.next, currentKey));
        }
    }

    return map;
}

export function isLatinChar(char: string): boolean {
    return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z");
}
/** The word at the end of `text`: everything after the last space or punctuation mark. */
export function trailingWord(text: string): string {
    return /[^\s\p{P}]*$/u.exec(text)![0];
}
