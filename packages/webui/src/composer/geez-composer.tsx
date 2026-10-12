import * as React from "react";
import {
	ComposerInput,
	ComposerRoot,
	ComposerToggle,
	ComposerToolbar,
} from "./composer";
import { ComposerSelect } from "./select";
import type { ComposerInputProps, ComposerRootProps } from "./composer";

export interface GeezComposerProps extends ComposerRootProps {
	/** Placeholder shown while the input is empty. */
	placeholder?: string;
	/** Accessible name for the text area. */
	label?: string;
	/** Render the IME enable/disable button. Defaults to `true`. */
	showToggle?: boolean;
	/** Render the input language select. Defaults to `true`. */
	showSelect?: boolean;
	/** Forwarded to `Composer.Input`. */
	inputProps?: Omit<ComposerInputProps, "placeholder">;
	/** Extra controls rendered at the trailing edge of the toolbar. */
	actions?: React.ReactNode;
}

/**
 * The styled composer: a single rounded surface with a large prompt field and
 * a round script toggle. Import `@writegeez/webui/styles.css` to pick up the
 * default look, or drop the class names and compose `Composer.*` yourself.
 */
export const GeezComposer = React.forwardRef<HTMLDivElement, GeezComposerProps>(
	function GeezComposer(props, forwardedRef) {
		const {
			placeholder = "Ask a Question..",
			label = "Message",
			showToggle = true,
			showSelect = true,
			inputProps,
			actions,
			className,
			...rootProps
		} = props;

		return (
			<ComposerRoot
				className={["wg-composer", className]
					.filter(Boolean)
					.join(" ")}
				{...rootProps}
				ref={forwardedRef}
			>
				<ComposerInput
					aria-label={label}
					placeholder={placeholder}
					{...inputProps}
					className={["wg-composer-input", inputProps?.className]
						.filter(Boolean)
						.join(" ")}
				/>
				{showToggle || showSelect || actions ? (
					<ComposerToolbar className="wg-composer-toolbar">
						<div className="wg-composer-controls">
							{showToggle ? (
								<ComposerToggle className="wg-composer-toggle" />
							) : null}
							{showSelect ? (
								<ComposerSelect className="wg-select" />
							) : null}
						</div>
						{actions ? (
							<div className="wg-composer-actions">{actions}</div>
						) : null}
					</ComposerToolbar>
				) : null}
			</ComposerRoot>
		);
	}
);
