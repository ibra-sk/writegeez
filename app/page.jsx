import Image from "next/image";
import QuillEditorBlock from "@/components/Editor/QuillEditorBlock";
import TiptapEditor from "@/components/Editor/TiptapEditor";
import GeezEditor from "@/components/Editor/GeezEditor";

export default function Home() {
  return (
    <>
      <div className="mx-auto max-w-7xl w-full">
        {/* <QuillEditorBlock /> */}
        {/* <TiptapEditor /> */}
        <GeezEditor />
      </div>
    </>
  )
}