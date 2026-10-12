import * as React from "react";

type PossibleRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T) {
	if (typeof ref === "function") {
		return ref(value);
	} else if (ref !== null && ref !== undefined) {
		(ref as React.MutableRefObject<T>).current = value;
	}
}

/**
 * Merges several refs into a single ref callback, so a component can keep its
 * own internal ref while still honouring a `ref` handed down by the consumer.
 */
export function composeRefs<T>(
	...refs: PossibleRef<T>[]
): React.RefCallback<T> {
	return (node) => {
		for (const ref of refs) setRef(ref, node);
	};
}

/** Hook flavour of {@link composeRefs}. */
export function useComposedRefs<T>(
	...refs: PossibleRef<T>[]
): React.RefCallback<T> {
	// eslint-disable-next-line react-hooks/exhaustive-deps
	return React.useCallback(composeRefs(...refs), refs);
}
