import * as React from "react";

export interface ScriptGlyphProps
	extends React.HTMLAttributes<HTMLSpanElement> {
	/** Show the Ge'ez glyph rather than the Latin one. Defaults to `true`. */
	enabled?: boolean;
	/** Glyph shown while the IME is on. Defaults to `"ሀ"`. */
	geez?: string;
	/** Glyph shown while the IME is off. Defaults to `"A"`. */
	latin?: string;
}

/**
 * The mark on the composer's script toggle: the Ge'ez glyph while the IME is
 * on, the Latin letter while it is off, so the state needs no legend. It
 * inherits `color` and `font-size` from the button around it.
 */
export const ScriptGlyph = React.forwardRef<HTMLSpanElement, ScriptGlyphProps>(
	function ScriptGlyph(
		{ enabled = true, geez = "ሀ", latin = "A", ...props },
		forwardedRef
	) {
		return (
			<span
				ref={forwardedRef}
				aria-hidden="true"
				data-wg-part="script-glyph"
				data-state={enabled ? "on" : "off"}
				{...props}
			>
				{enabled ? geez : latin}
			</span>
		);
	}
);
