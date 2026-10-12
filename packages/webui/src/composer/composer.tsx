import * as React from "react";
import { inputMethods } from "@writegeez/ime";
import type { InputMethodSpec } from "@writegeez/ime";
import { composeEventHandlers } from "../utils/compose-event-handlers";
import { useComposedRefs } from "../utils/compose-refs";
import { Primitive } from "../utils/primitive";
import type { PrimitivePropsWithRef } from "../utils/primitive";
import {
	useCallbackRef,
	useControllableState,
} from "../utils/use-controllable-state";
import { ScriptGlyph } from "../icons/script-glyph";
import { ComposerProvider, useComposerContext } from "./context";
import {
	ComposerSelect,
	ComposerSelectContent,
	ComposerSelectItem,
	ComposerSelectTrigger,
} from "./select";
import { useGeezIME } from "./use-geez-ime";

const useIsomorphicLayoutEffect =
	typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/* -------------------------------------------------------------------------
 * Composer.Root
 * ---------------------------------------------------------------------- */

export interface ComposerRootProps
	extends Omit<PrimitivePropsWithRef<"div">, "onSubmit" | "defaultValue"> {
	/**
	 * Input methods offered by `Composer.Select`. Defaults to everything
	 * bundled with `@writegeez/ime`. Keep the array referentially stable.
	 */
	specs?: InputMethodSpec[];
	/** Controlled active input method. */
	spec?: InputMethodSpec;
	/** Initial input method when uncontrolled. Defaults to `specs[0]`. */
	defaultSpec?: InputMethodSpec;
	onSpecChange?: (spec: InputMethodSpec) => void;
	/** Controlled text value. */
	value?: string;
	/** Initial text value when uncontrolled. */
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	/** Controlled IME on/off state. */
	enabled?: boolean;
	/** Initial IME state when uncontrolled. Defaults to `true`. */
	defaultEnabled?: boolean;
	onEnabledChange?: (enabled: boolean) => void;
	/** Blocks typing, toggling and submitting. */
	disabled?: boolean;
	/** Called with the current value on Enter or `Composer.Submit`. */
	onSubmit?: (value: string) => void;
	/** Submit on Enter, newline on Shift+Enter. Defaults to `true`. */
	submitOnEnter?: boolean;
	/** Empty the input after a submit. Defaults to `true`. */
	clearOnSubmit?: boolean;
	/** Toggle the IME with Ctrl/Cmd+Space while typing. Defaults to `true`. */
	toggleShortcut?: boolean;
	/**
	 * Colour scheme for the default stylesheet. `"auto"` follows the viewer's
	 * system setting; the other two are fixed. Defaults to `"light"`.
	 */
	theme?: "light" | "dark" | "auto";
}

export const ComposerRoot = React.forwardRef<HTMLDivElement, ComposerRootProps>(
	function ComposerRoot(props, forwardedRef) {
		const {
			specs = inputMethods,
			spec: specProp,
			defaultSpec,
			onSpecChange,
			value: valueProp,
			defaultValue = "",
			onValueChange,
			enabled: enabledProp,
			defaultEnabled = true,
			onEnabledChange,
			disabled = false,
			onSubmit,
			submitOnEnter = true,
			clearOnSubmit = true,
			toggleShortcut = true,
			theme = "light",
			...rootProps
		} = props;

		const [spec = specs[0], setSpec] = useControllableState({
			prop: specProp,
			defaultProp: defaultSpec ?? specs[0],
			onChange: onSpecChange,
		});
		const [value = "", setValue] = useControllableState({
			prop: valueProp,
			defaultProp: defaultValue,
			onChange: onValueChange,
		});
		const [enabled = true, setEnabledState] = useControllableState({
			prop: enabledProp,
			defaultProp: defaultEnabled,
			onChange: onEnabledChange,
		});

		const [inputNode, setInputNode] =
			React.useState<HTMLTextAreaElement | null>(null);

		useGeezIME(inputNode, spec, enabled && !disabled);

		const handleSubmit = useCallbackRef(onSubmit);
		const valueRef = React.useRef(value);
		valueRef.current = value;

		const setEnabled = React.useCallback(
			(next: boolean) => {
				if (disabled) return;
				setEnabledState(next);
			},
			[disabled, setEnabledState]
		);

		const toggleEnabled = React.useCallback(() => {
			if (disabled) return;
			setEnabledState((current) => !current);
		}, [disabled, setEnabledState]);

		const focusInput = React.useCallback(() => {
			inputNode?.focus();
		}, [inputNode]);

		const submit = React.useCallback(() => {
			if (disabled) return;
			const current = valueRef.current;
			if (current.trim() === "") return;
			handleSubmit(current);
			if (clearOnSubmit) setValue("");
		}, [clearOnSubmit, disabled, handleSubmit, setValue]);

		return (
			<ComposerProvider
				spec={spec}
				specs={specs}
				setSpec={setSpec}
				value={value}
				setValue={setValue}
				enabled={enabled}
				setEnabled={setEnabled}
				toggleEnabled={toggleEnabled}
				disabled={disabled}
				submitOnEnter={submitOnEnter}
				toggleShortcut={toggleShortcut}
				submit={submit}
				inputNode={inputNode}
				onInputNodeChange={setInputNode}
				focusInput={focusInput}
			>
				<Primitive.div
					data-wg-part="root"
					data-theme={theme}
					data-state={enabled ? "on" : "off"}
					data-disabled={disabled ? "" : undefined}
					data-script={spec.code}
					{...rootProps}
					ref={forwardedRef}
				/>
			</ComposerProvider>
		);
	}
);

/* -------------------------------------------------------------------------
 * Composer.Input
 * ---------------------------------------------------------------------- */

export interface ComposerInputProps
	extends Omit<
		PrimitivePropsWithRef<"textarea">,
		"value" | "defaultValue"
	> {
	/** Grow the textarea to fit its content. Defaults to `true`. */
	autoResize?: boolean;
}

export const ComposerInput = React.forwardRef<
	HTMLTextAreaElement,
	ComposerInputProps
>(function ComposerInput(props, forwardedRef) {
	const {
		autoResize = true,
		onChange,
		onKeyDown,
		rows = 1,
		...inputProps
	} = props;
	const context = useComposerContext("Composer.Input");
	const composedRefs = useComposedRefs(
		forwardedRef,
		context.onInputNodeChange
	);

	const measure = React.useCallback(() => {
		const node = context.inputNode;
		if (!node) return;

		if (!autoResize) {
			node.style.height = "";
			return;
		}

		// A collapsed or not-yet-visible container reports a meaningless
		// scrollHeight, and that bogus height would stick. The observer below
		// re-measures as soon as the field actually has layout.
		if (node.clientWidth === 0) return;

		node.style.height = "auto";
		node.style.height = `${node.scrollHeight}px`;
	}, [autoResize, context.inputNode]);

	useIsomorphicLayoutEffect(measure, [measure, context.value]);

	React.useEffect(() => {
		const node = context.inputNode;
		if (!node || !autoResize || typeof ResizeObserver === "undefined") return;

		// Watching the wrapper covers both becoming visible and being resized —
		// width drives wrapping, and the height cap is viewport relative.
		const observer = new ResizeObserver(() => measure());
		observer.observe(node.parentElement ?? node);
		return () => observer.disconnect();
	}, [autoResize, context.inputNode, measure]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		const isSpace = event.code === "Space" || event.key === " ";
		if (
			context.toggleShortcut &&
			(event.ctrlKey || event.metaKey) &&
			isSpace
		) {
			event.preventDefault();
			context.toggleEnabled();
			return;
		}

		if (
			context.submitOnEnter &&
			event.key === "Enter" &&
			!event.shiftKey &&
			!event.nativeEvent.isComposing
		) {
			event.preventDefault();
			context.submit();
		}
	};

	return (
		<Primitive.textarea
			data-wg-part="input"
			rows={rows}
			disabled={context.disabled}
			{...inputProps}
			ref={composedRefs}
			value={context.value}
			onChange={composeEventHandlers(onChange, (event) =>
				context.setValue(event.currentTarget.value)
			)}
			onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
		/>
	);
});

/* -------------------------------------------------------------------------
 * Composer.Toolbar
 * ---------------------------------------------------------------------- */

export type ComposerToolbarProps = PrimitivePropsWithRef<"div">;

export const ComposerToolbar = React.forwardRef<
	HTMLDivElement,
	ComposerToolbarProps
>(function ComposerToolbar(props, forwardedRef) {
	const context = useComposerContext("Composer.Toolbar");
	return (
		<Primitive.div
			data-wg-part="toolbar"
			data-disabled={context.disabled ? "" : undefined}
			{...props}
			ref={forwardedRef}
		/>
	);
});

/* -------------------------------------------------------------------------
 * Composer.Toggle
 * ---------------------------------------------------------------------- */

export type ComposerToggleProps = PrimitivePropsWithRef<"button">;

export const ComposerToggle = React.forwardRef<
	HTMLButtonElement,
	ComposerToggleProps
>(function ComposerToggle(props, forwardedRef) {
	const { children, onClick, ...toggleProps } = props;
	const context = useComposerContext("Composer.Toggle");

	return (
		<Primitive.button
			type="button"
			role="switch"
			aria-checked={context.enabled}
			aria-label={`${context.spec.name} input method`}
			data-wg-part="toggle"
			data-state={context.enabled ? "on" : "off"}
			data-disabled={context.disabled ? "" : undefined}
			disabled={context.disabled}
			{...toggleProps}
			ref={forwardedRef}
			onClick={composeEventHandlers(onClick, () => {
				context.toggleEnabled();
				context.focusInput();
			})}
		>
			{children ?? <ScriptGlyph enabled={context.enabled} />}
		</Primitive.button>
	);
});

/* -------------------------------------------------------------------------
 * Composer.Submit
 * ---------------------------------------------------------------------- */

export type ComposerSubmitProps = PrimitivePropsWithRef<"button">;

export const ComposerSubmit = React.forwardRef<
	HTMLButtonElement,
	ComposerSubmitProps
>(function ComposerSubmit(props, forwardedRef) {
	const { onClick, ...submitProps } = props;
	const context = useComposerContext("Composer.Submit");
	const isEmpty = context.value.trim() === "";

	return (
		<Primitive.button
			type="button"
			data-wg-part="submit"
			data-empty={isEmpty ? "" : undefined}
			disabled={context.disabled || isEmpty}
			{...submitProps}
			ref={forwardedRef}
			onClick={composeEventHandlers(onClick, () => context.submit())}
		/>
	);
});

export const Composer = {
	Root: ComposerRoot,
	Input: ComposerInput,
	Toolbar: ComposerToolbar,
	Toggle: ComposerToggle,
	Select: ComposerSelect,
	SelectTrigger: ComposerSelectTrigger,
	SelectContent: ComposerSelectContent,
	SelectItem: ComposerSelectItem,
	Submit: ComposerSubmit,
};
