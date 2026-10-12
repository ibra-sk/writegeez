import * as React from "react";

/**
 * Creates a typed context with a Provider that takes the context value as
 * props, and a consumer hook that throws a readable error when used outside it.
 */
export function createContext<ContextValueType extends object | null>(
	rootComponentName: string,
	defaultContext?: ContextValueType
) {
	const Context = React.createContext<ContextValueType | undefined>(
		defaultContext
	);

	function Provider(
		props: ContextValueType & { children: React.ReactNode }
	) {
		const { children, ...context } = props;
		// Only re-provide when one of the values actually changed.
		const value = React.useMemo(
			() => context,
			Object.values(context)
		) as ContextValueType;
		return React.createElement(Context.Provider, { value }, children);
	}

	function useNamedContext(consumerName: string): ContextValueType {
		const context = React.useContext(Context);
		if (context !== undefined) return context;
		if (defaultContext !== undefined) return defaultContext;
		throw new Error(
			`\`${consumerName}\` must be used within \`${rootComponentName}\``
		);
	}

	Provider.displayName = rootComponentName + "Provider";
	return [Provider, useNamedContext] as const;
}
