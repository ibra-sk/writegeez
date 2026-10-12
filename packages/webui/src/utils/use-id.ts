import * as React from "react";

let count = 0;

/**
 * `React.useId` when available, with a deterministic fallback for React 17.
 */
export function useId(deterministicId?: string): string {
	const useReactId = (React as { useId?: () => string }).useId;
	const reactId = useReactId ? useReactId() : undefined;
	const [fallback, setFallback] = React.useState<string | undefined>(
		reactId
	);

	React.useEffect(() => {
		if (!reactId) setFallback((id) => id ?? String(count++));
	}, [reactId]);

	return deterministicId ?? reactId ?? `wg-${fallback ?? ""}`;
}
