import * as React from "react";
import { composeRefs } from "./compose-refs";

type AnyProps = Record<string, unknown>;

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
	children?: React.ReactNode;
}

/**
 * Renders its child element instead of a DOM node of its own, merging its own
 * props onto it. This is what powers `asChild` on every part in this package.
 */
export const Slot = React.forwardRef<HTMLElement, SlotProps>(
	function Slot(props, forwardedRef) {
		const { children, ...slotProps } = props;
		const childrenArray = React.Children.toArray(children);
		const slottable = childrenArray.find(isSlottable);

		if (slottable) {
			// The new element to render is the one passed as a child of `Slottable`.
			const newElement = slottable.props.children;
			const newChildren = childrenArray.map((child): React.ReactNode => {
				if (child !== slottable) return child;
				// Because the new element will be the one rendered, we are only
				// interested in grabbing its children (`newElement.props.children`).
				if (React.Children.count(newElement) > 1) {
					return React.Children.only(null);
				}
				return React.isValidElement(newElement)
					? ((newElement.props as AnyProps)
							.children as React.ReactNode)
					: null;
			});

			return (
				<SlotClone {...slotProps} ref={forwardedRef}>
					{React.isValidElement(newElement)
						? React.cloneElement(
								newElement,
								undefined,
								newChildren
						  )
						: null}
				</SlotClone>
			);
		}

		return (
			<SlotClone {...slotProps} ref={forwardedRef}>
				{children}
			</SlotClone>
		);
	}
);

const SlotClone = React.forwardRef<HTMLElement, SlotProps>(
	function SlotClone(props, forwardedRef) {
		const { children, ...slotProps } = props;

		if (React.isValidElement(children)) {
			const childRef = getElementRef(children);
			return React.cloneElement(children, {
				...mergeProps(slotProps, children.props as AnyProps),
				ref: forwardedRef
					? composeRefs(forwardedRef, childRef)
					: childRef,
			} as never);
		}

		return React.Children.count(children) > 1
			? React.Children.only(null)
			: null;
	}
);

export interface SlottableProps {
	children: React.ReactNode;
}

/** Marks which child of a `Slot` is the element to merge props onto. */
export function Slottable({ children }: SlottableProps) {
	return <>{children}</>;
}

function isSlottable(
	child: React.ReactNode
): child is React.ReactElement<SlottableProps> {
	return React.isValidElement(child) && child.type === Slottable;
}

function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
	// All child props should override, except for the ones handled below.
	const overrideProps: AnyProps = { ...childProps };

	for (const propName in childProps) {
		const slotPropValue = slotProps[propName];
		const childPropValue = childProps[propName];

		const isHandler = /^on[A-Z]/.test(propName);
		if (isHandler) {
			// Both defined -> chain them, ours first so the child can react last.
			if (slotPropValue && childPropValue) {
				overrideProps[propName] = (...args: unknown[]) => {
					(childPropValue as (...a: unknown[]) => void)(...args);
					(slotPropValue as (...a: unknown[]) => void)(...args);
				};
			} else if (slotPropValue) {
				overrideProps[propName] = slotPropValue;
			}
		} else if (propName === "style") {
			overrideProps[propName] = {
				...(slotPropValue as object),
				...(childPropValue as object),
			};
		} else if (propName === "className") {
			overrideProps[propName] = [slotPropValue, childPropValue]
				.filter(Boolean)
				.join(" ");
		}
	}

	return { ...slotProps, ...overrideProps };
}

function getElementRef(element: React.ReactElement) {
	// React 19 moved `ref` onto props; React <=18 keeps it on the element.
	const propsRef = (element.props as AnyProps).ref;
	if (propsRef !== undefined) return propsRef as React.Ref<unknown>;
	return (element as unknown as { ref?: React.Ref<unknown> }).ref;
}
