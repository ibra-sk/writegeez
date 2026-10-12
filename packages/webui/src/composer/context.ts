import * as React from "react";
import type { InputMethodSpec } from "@writegeez/ime";
import { createContext } from "../utils/create-context";

export interface ComposerContextValue {
	spec: InputMethodSpec;
	specs: InputMethodSpec[];
	setSpec: (spec: InputMethodSpec) => void;
	value: string;
	setValue: React.Dispatch<React.SetStateAction<string>>;
	enabled: boolean;
	setEnabled: (enabled: boolean) => void;
	toggleEnabled: () => void;
	disabled: boolean;
	submitOnEnter: boolean;
	toggleShortcut: boolean;
	submit: () => void;
	inputNode: HTMLTextAreaElement | null;
	onInputNodeChange: (node: HTMLTextAreaElement | null) => void;
	focusInput: () => void;
}

export const [ComposerProvider, useComposerContext] =
	createContext<ComposerContextValue>("Composer.Root");

/** Reads the enclosing `Composer.Root` state, for building custom parts. */
export function useComposer(consumerName = "useComposer") {
	return useComposerContext(consumerName);
}
