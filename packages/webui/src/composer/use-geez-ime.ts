import * as React from "react";
import { GeezIME } from "@writegeez/ime";
import type { InputMethodSpec } from "@writegeez/ime";

export type GeezIMEInstance = InstanceType<typeof GeezIME>;

/**
 * Binds a `GeezIME` to `element` for the given spec.
 *
 * The engine attaches its listeners in the constructor and offers no detach,
 * so switching languages cannot mean building a second engine over the first.
 * Instead one instance is cached per spec and only ever one is enabled — a
 * disabled instance ignores every event, so the inactive ones sit inert. That
 * keeps the textarea itself untouched across a language change, which is what
 * preserves the caret and focus.
 */
export function useGeezIME(
	element: HTMLElement | null,
	spec: InputMethodSpec,
	enabled: boolean
) {
	const cacheRef = React.useRef<{
		element: HTMLElement | null;
		instances: Map<InputMethodSpec, GeezIMEInstance>;
	}>({ element: null, instances: new Map() });
	const activeRef = React.useRef<GeezIMEInstance | null>(null);

	React.useEffect(() => {
		if (!element) return;

		const cache = cacheRef.current;
		if (cache.element !== element) {
			cache.element = element;
			cache.instances = new Map();
		}

		let instance = cache.instances.get(spec);
		if (!instance) {
			instance = new GeezIME(spec, element, { enabled: false });
			cache.instances.set(spec, instance);
		}

		if (activeRef.current && activeRef.current !== instance) {
			activeRef.current.setEnabled(false);
		}
		activeRef.current = instance;
		instance.setEnabled(enabled);

		return () => {
			instance?.setEnabled(false);
		};
	}, [element, spec, enabled]);

	return activeRef;
}
