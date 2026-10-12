import * as React from "react";
import type { InputMethodSpec } from "@writegeez/ime";
import { composeEventHandlers } from "../utils/compose-event-handlers";
import { useComposedRefs } from "../utils/compose-refs";
import { createContext } from "../utils/create-context";
import { Primitive } from "../utils/primitive";
import type { PrimitivePropsWithRef } from "../utils/primitive";
import { useControllableState } from "../utils/use-controllable-state";
import { useId } from "../utils/use-id";
import { useComposerContext } from "./context";

const useIsomorphicLayoutEffect =
	typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/* -------------------------------------------------------------------------
 * Context
 * ---------------------------------------------------------------------- */

interface SelectContextValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	activeIndex: number;
	setActiveIndex: (index: number) => void;
	side: "top" | "bottom";
	setSide: (side: "top" | "bottom") => void;
	select: (spec: InputMethodSpec) => void;
	triggerRef: React.RefObject<HTMLButtonElement>;
	contentRef: React.RefObject<HTMLDivElement>;
	triggerId: string;
	contentId: string;
	itemId: (index: number) => string;
}

const [SelectProvider, useSelectContext] =
	createContext<SelectContextValue>("Composer.Select");

/* -------------------------------------------------------------------------
 * Composer.Select
 * ---------------------------------------------------------------------- */

export interface ComposerSelectProps extends PrimitivePropsWithRef<"div"> {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

/**
 * Anchor for the language dropdown. With no children it renders the default
 * trigger and listbox; pass your own `Composer.SelectTrigger` /
 * `Composer.SelectContent` to rebuild it.
 */
export const ComposerSelect = React.forwardRef<
	HTMLDivElement,
	ComposerSelectProps
>(function ComposerSelect(props, forwardedRef) {
	const {
		open: openProp,
		defaultOpen = false,
		onOpenChange,
		children,
		...selectProps
	} = props;
	const composer = useComposerContext("Composer.Select");

	const [open = false, setOpenState] = useControllableState({
		prop: openProp,
		defaultProp: defaultOpen,
		onChange: onOpenChange,
	});
	const [activeIndex, setActiveIndex] = React.useState(-1);
	const [side, setSide] = React.useState<"top" | "bottom">("bottom");

	const triggerRef = React.useRef<HTMLButtonElement>(null);
	const contentRef = React.useRef<HTMLDivElement>(null);
	const baseId = useId();

	const setOpen = React.useCallback(
		(next: boolean) => {
			if (composer.disabled && next) return;
			setOpenState(next);
		},
		[composer.disabled, setOpenState]
	);

	const select = React.useCallback(
		(spec: InputMethodSpec) => {
			composer.setSpec(spec);
			setOpenState(false);
			triggerRef.current?.focus();
		},
		[composer, setOpenState]
	);

	// A press anywhere outside the trigger or the list dismisses it. Capture
	// phase so it still fires when the press target stops propagation.
	React.useEffect(() => {
		if (!open) return;

		const handlePointerDown = (event: Event) => {
			const target = event.target as Node | null;
			if (!target) return;
			if (triggerRef.current?.contains(target)) return;
			if (contentRef.current?.contains(target)) return;
			setOpenState(false);
		};

		document.addEventListener("pointerdown", handlePointerDown, true);
		return () =>
			document.removeEventListener(
				"pointerdown",
				handlePointerDown,
				true
			);
	}, [open, setOpenState]);

	// Nothing to anchor to once the control is disabled mid-flight.
	React.useEffect(() => {
		if (composer.disabled && open) setOpenState(false);
	}, [composer.disabled, open, setOpenState]);

	return (
		<SelectProvider
			open={open}
			setOpen={setOpen}
			activeIndex={activeIndex}
			setActiveIndex={setActiveIndex}
			side={side}
			setSide={setSide}
			select={select}
			triggerRef={triggerRef}
			contentRef={contentRef}
			triggerId={`${baseId}-trigger`}
			contentId={`${baseId}-list`}
			itemId={(index) => `${baseId}-item-${index}`}
		>
			<Primitive.div
				data-wg-part="select"
				data-state={open ? "open" : "closed"}
				data-disabled={composer.disabled ? "" : undefined}
				{...selectProps}
				ref={forwardedRef}
			>
				{children ?? (
					<>
						<ComposerSelectTrigger className="wg-select-trigger" />
						<ComposerSelectContent className="wg-select-content" />
					</>
				)}
			</Primitive.div>
		</SelectProvider>
	);
});

/* -------------------------------------------------------------------------
 * Composer.SelectTrigger
 * ---------------------------------------------------------------------- */

export type ComposerSelectTriggerProps = PrimitivePropsWithRef<"button">;

export const ComposerSelectTrigger = React.forwardRef<
	HTMLButtonElement,
	ComposerSelectTriggerProps
>(function ComposerSelectTrigger(props, forwardedRef) {
	const { children, onClick, onKeyDown, ...triggerProps } = props;
	const composer = useComposerContext("Composer.SelectTrigger");
	const select = useSelectContext("Composer.SelectTrigger");
	const composedRefs = useComposedRefs(forwardedRef, select.triggerRef);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
		if (
			event.key === "ArrowDown" ||
			event.key === "ArrowUp" ||
			event.key === "Enter" ||
			event.key === " "
		) {
			event.preventDefault();
			select.setOpen(true);
		}
	};

	return (
		<Primitive.button
			type="button"
			aria-haspopup="listbox"
			aria-expanded={select.open}
			aria-controls={select.open ? select.contentId : undefined}
			id={select.triggerId}
			data-wg-part="select-trigger"
			data-state={select.open ? "open" : "closed"}
			disabled={composer.disabled}
			{...triggerProps}
			ref={composedRefs}
			onClick={composeEventHandlers(onClick, () =>
				select.setOpen(!select.open)
			)}
			onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
		>
			{children ?? (
				<>
					<span data-wg-part="select-value">
						{composer.spec.name}
					</span>
					<ChevronIcon />
				</>
			)}
		</Primitive.button>
	);
});

/* -------------------------------------------------------------------------
 * Composer.SelectContent
 * ---------------------------------------------------------------------- */

export type ComposerSelectContentProps = PrimitivePropsWithRef<"div">;

export const ComposerSelectContent = React.forwardRef<
	HTMLDivElement,
	ComposerSelectContentProps
>(function ComposerSelectContent(props, forwardedRef) {
	const { children, onKeyDown, ...contentProps } = props;
	const composer = useComposerContext("Composer.SelectContent");
	const select = useSelectContext("Composer.SelectContent");
	const composedRefs = useComposedRefs(forwardedRef, select.contentRef);

	const { open, setOpen, activeIndex, setActiveIndex, setSide } = select;
	const specs = composer.specs;
	const selectedIndex = specs.findIndex(
		(candidate) => candidate.code === composer.spec.code
	);

	const searchRef = React.useRef("");
	const searchTimerRef = React.useRef<ReturnType<typeof setTimeout>>();

	// Opening starts on the current language and hands the list keyboard focus.
	useIsomorphicLayoutEffect(() => {
		if (!open) return;
		const node = select.contentRef.current;
		if (!node) return;

		setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
		node.focus({ preventScroll: true });

		const trigger = select.triggerRef.current;
		if (!trigger) return;
		const rect = trigger.getBoundingClientRect();
		const spaceBelow = window.innerHeight - rect.bottom;
		const needed = node.offsetHeight + 8;
		setSide(
			spaceBelow < needed && rect.top > spaceBelow ? "top" : "bottom"
		);
		// Only when the list opens; later renders must not steal focus back.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	React.useEffect(() => {
		if (!open) return;
		const node = select.contentRef.current?.querySelector(
			"[data-highlighted]"
		);
		node?.scrollIntoView({ block: "nearest" });
	}, [activeIndex, open, select.contentRef]);

	React.useEffect(() => () => clearTimeout(searchTimerRef.current), []);

	const move = (index: number) => {
		if (specs.length === 0) return;
		setActiveIndex(Math.min(specs.length - 1, Math.max(0, index)));
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				move(activeIndex + 1);
				return;
			case "ArrowUp":
				event.preventDefault();
				move(activeIndex - 1);
				return;
			case "Home":
				event.preventDefault();
				move(0);
				return;
			case "End":
				event.preventDefault();
				move(specs.length - 1);
				return;
			case "Enter":
			case " ": {
				event.preventDefault();
				const spec = specs[activeIndex];
				if (spec) select.select(spec);
				return;
			}
			case "Escape":
				event.preventDefault();
				setOpen(false);
				select.triggerRef.current?.focus();
				return;
			case "Tab":
				setOpen(false);
				return;
		}

		// Typeahead: jump to the next language starting with what was typed.
		if (event.key.length !== 1 || event.metaKey || event.ctrlKey) return;
		clearTimeout(searchTimerRef.current);
		searchRef.current += event.key.toLowerCase();
		searchTimerRef.current = setTimeout(() => {
			searchRef.current = "";
		}, 500);

		const search = searchRef.current;
		const order = specs
			.map((_, index) => (activeIndex + 1 + index) % specs.length)
			.concat(activeIndex);
		const match = order.find((index) =>
			specs[index]?.name.toLowerCase().startsWith(search)
		);
		if (match !== undefined) setActiveIndex(match);
	};

	if (!open) return null;

	return (
		<Primitive.div
			role="listbox"
			aria-label="Input language"
			aria-activedescendant={
				activeIndex >= 0 ? select.itemId(activeIndex) : undefined
			}
			id={select.contentId}
			tabIndex={-1}
			data-wg-part="select-content"
			data-state="open"
			data-side={select.side}
			{...contentProps}
			ref={composedRefs}
			onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
		>
			{children ??
				specs.map((candidate) => (
					<ComposerSelectItem
						key={candidate.code}
						spec={candidate}
						className="wg-select-item"
					/>
				))}
		</Primitive.div>
	);
});

/* -------------------------------------------------------------------------
 * Composer.SelectItem
 * ---------------------------------------------------------------------- */

export interface ComposerSelectItemProps
	extends PrimitivePropsWithRef<"div"> {
	spec: InputMethodSpec;
}

export const ComposerSelectItem = React.forwardRef<
	HTMLDivElement,
	ComposerSelectItemProps
>(function ComposerSelectItem(props, forwardedRef) {
	const { spec, children, onClick, onPointerMove, ...itemProps } = props;
	const composer = useComposerContext("Composer.SelectItem");
	const select = useSelectContext("Composer.SelectItem");

	const index = composer.specs.indexOf(spec);
	const isSelected = composer.spec.code === spec.code;
	const isHighlighted = select.activeIndex === index;

	return (
		<Primitive.div
			role="option"
			aria-selected={isSelected}
			id={select.itemId(index)}
			data-wg-part="select-item"
			data-state={isSelected ? "checked" : "unchecked"}
			data-highlighted={isHighlighted ? "" : undefined}
			{...itemProps}
			ref={forwardedRef}
			onClick={composeEventHandlers(onClick, () => select.select(spec))}
			onPointerMove={composeEventHandlers(onPointerMove, () => {
				if (index >= 0) select.setActiveIndex(index);
			})}
		>
			<span data-wg-part="select-indicator">
				{isSelected ? <CheckIcon /> : null}
			</span>
			{children ?? spec.name}
		</Primitive.div>
	);
});

/* -------------------------------------------------------------------------
 * Icons
 * ---------------------------------------------------------------------- */

function ChevronIcon() {
	return (
		<svg
			width="10"
			height="6"
			viewBox="0 0 10 6"
			fill="none"
			aria-hidden="true"
			focusable="false"
			data-wg-part="select-chevron"
		>
			<path
				d="M1 1l4 4 4-4"
				stroke="currentColor"
				strokeWidth="1.6"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function CheckIcon() {
	return (
		<svg
			width="12"
			height="9"
			viewBox="0 0 12 9"
			fill="none"
			aria-hidden="true"
			focusable="false"
		>
			<path
				d="M1 4.5l3.2 3.2L11 1"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
