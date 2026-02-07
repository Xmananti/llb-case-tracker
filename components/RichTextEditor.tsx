"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write here...",
  className = "",
  minHeight = "140px",
}) => {
  // Client-only: create editor synchronously so it appears reliably (component is dynamic with ssr: false)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    immediatelyRender: true,
    editorProps: {
      attributes: {
        class: "rich-text-editor-content focus:outline-none min-h-[120px] px-3 py-2 text-sm text-slate-800",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync when value changes externally (e.g. form load/reset)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div
        className={`rounded-lg border border-slate-300 bg-slate-50 flex items-center justify-center text-slate-500 text-sm ${className}`}
        style={{ minHeight }}
      >
        Loading editor...
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-slate-300 bg-white overflow-hidden ${className}`}
      style={{ minHeight }}
    >
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
