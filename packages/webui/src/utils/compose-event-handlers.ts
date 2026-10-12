/**
 * Calls the consumer's handler first, then our own — unless the consumer
 * prevented the default, which is how a caller opts out of built-in behaviour.
 */
export function composeEventHandlers<E extends { defaultPrevented: boolean }>(
	originalEventHandler?: (event: E) => void,
	ourEventHandler?: (event: E) => void,
	{ checkForDefaultPrevented = true } = {}
) {
	return function handleEvent(event: E) {
		originalEventHandler?.(event);
		if (checkForDefaultPrevented === false || !event.defaultPrevented) {
			return ourEventHandler?.(event);
		}
	};
}
