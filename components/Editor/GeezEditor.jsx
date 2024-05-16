"use client";
import { useEffect, useRef } from "react";
import KeywriteWeb from "@keywrite/web";
import { Amharic } from "@keywrite/ethiopic-input-methods";
export default function GeezEditor() {
	const textArea = useRef(null);

	useEffect(() => {
		const inputInstance = new KeywriteWeb(textArea.current, {
			Amharic: Amharic.inputMethod,
		});
		console.log(inputInstance);
	}, []);
	return (
		<div className="w-full p-4 border border-gray-200 rounded-md">
			<textarea
				ref={textArea}
				className="w-full focus:outline-none focus:ring-0 focus:border-transparent resize-none"
				placeholder="Type here..."
			></textarea>
		</div>
	);
}
