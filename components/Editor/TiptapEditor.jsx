"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";


export default function TiptapEditor() {
	const editor = useEditor({
		extensions: [
			StarterKit,
			TextStyle,
			FontFamily.configure({
				types: ["textStyle"],
			}),
		],
		content: `
            <p><span >Hello World! 🌎️ የሰውል</span></p>
        `,
	});

	const setFontFamily = (fontFamily) => {
		editor.chain().focus().setFontFamily(fontFamily).run();
	};

	return (
		<div>
			<h1>My Tigrinya Editor</h1>
			<button onClick={() => setFontFamily("Noto Sans Ethiopic")}>
				Set Tigrinya Font
			</button>
			<EditorContent  editor={editor} />
		</div>
	);
}
