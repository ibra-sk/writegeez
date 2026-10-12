import * as React from "react";

type UseControllableStateParams<T> = {
	prop?: T | undefined;
	defaultProp?: T | undefined;
	onChange?: (state: T) => void;
};

type SetStateFn<T> = (prevState?: T) => T;

/**
 * Lets a component be either controlled (`prop` supplied) or uncontrolled
 * (`defaultProp` supplied) behind one identical setter.
 */
export function useControllableState<T>({
	prop,
	defaultProp,
	onChange = () => {},
}: UseControllableStateParams<T>) {
	const [uncontrolledProp, setUncontrolledProp] = React.useState(defaultProp);
	const isControlled = prop !== undefined;
	const value = (isControlled ? prop : uncontrolledProp) as T;

	const handleChange = useCallbackRef(onChange);
	const prevValueRef = React.useRef(value);

	React.useEffect(() => {
		if (prevValueRef.current !== value) {
			handleChange(value);
			prevValueRef.current = value;
		}
	}, [value, handleChange]);

	const setValue: React.Dispatch<React.SetStateAction<T>> = React.useCallback(
		(nextValue) => {
			if (isControlled) {
				const setter = nextValue as SetStateFn<T>;
				const next =
					typeof nextValue === "function" ? setter(prop) : nextValue;
				if (next !== prop) handleChange(next as T);
			} else {
				setUncontrolledProp(
					nextValue as React.SetStateAction<T | undefined>
				);
			}
		},
		[isControlled, prop, handleChange]
	);

	return [value, setValue] as const;
}

/** Keeps a stable function identity while always calling the latest callback. */
export function useCallbackRef<T extends (...args: never[]) => unknown>(
	callback: T | undefined
): T {
	const callbackRef = React.useRef(callback);

	React.useEffect(() => {
		callbackRef.current = callback;
	});

	// eslint-disable-next-line react-hooks/exhaustive-deps
	return React.useMemo(
		() => ((...args) => callbackRef.current?.(...args)) as T,
		[]
	);
}
