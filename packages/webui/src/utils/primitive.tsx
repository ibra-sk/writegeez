import * as React from "react";
import { Slot } from "./slot";

const NODES = ["button", "div", "select", "span", "textarea"] as const;

type PrimitivePropsWithRef<E extends React.ElementType> =
	React.ComponentPropsWithoutRef<E> & { asChild?: boolean };

type Primitives = {
	[E in (typeof NODES)[number]]: React.ForwardRefExoticComponent<
		PrimitivePropsWithRef<E> & React.RefAttributes<React.ElementRef<E>>
	>;
};

/**
 * Thin DOM wrappers that add `asChild`: pass `asChild` and the part renders
 * your element (merging its props) instead of its own tag.
 */
export const Primitive = NODES.reduce((primitives, node) => {
	const Node = React.forwardRef<HTMLElement, PrimitivePropsWithRef<"div">>(
		function PrimitiveNode(props, forwardedRef) {
			const { asChild, ...primitiveProps } = props;
			const Comp = (asChild ? Slot : node) as React.ElementType;
			return <Comp {...primitiveProps} ref={forwardedRef} />;
		}
	);
	Node.displayName = `Primitive.${node}`;
	return { ...primitives, [node]: Node };
}, {} as Primitives);

export type { PrimitivePropsWithRef };
