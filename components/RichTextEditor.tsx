"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";

// WYSIWYG editor for blog bodies. The current HTML is mirrored into a hidden
// input so the surrounding <form> submits it like any other field; the server
// action sanitizes it before storage. StarterKit v3 already bundles the Link
// extension, so it is configured here rather than added separately.

function ToolbarButton({
  label,
  title,
  onClick,
  isActive
}: {
  label: string;
  title: string;
  onClick: () => void;
  isActive?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn("rte-btn", isActive && "rte-btn-active")}
    >
      {label}
    </button>
  );
}

export function RichTextEditor({ name, defaultValue = "" }: { name: string; defaultValue?: string }) {
  const [html, setHtml] = useState(defaultValue);
  const editor = useEditor({
    immediatelyRender: false, // required under Next SSR to avoid hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" }
        }
      })
    ],
    content: defaultValue,
    editorProps: { attributes: { class: "article rte-content", "data-placeholder": "Write the post…" } },
    onUpdate: ({ editor }) => setHtml(editor.getHTML())
  });

  if (!editor) {
    return <div className="rte-shell"><div className="rte-content text-steel">Loading editor…</div></div>;
  }

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="rte-shell">
      <div className="rte-toolbar">
        <ToolbarButton label="B" title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} />
        <ToolbarButton label="I" title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} />
        <ToolbarButton label="H2" title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} />
        <ToolbarButton label="H3" title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} />
        <ToolbarButton label="• List" title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} />
        <ToolbarButton label="1. List" title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} />
        <ToolbarButton label="❝" title="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} />
        <ToolbarButton label="Link" title="Add link" onClick={setLink} isActive={editor.isActive("link")} />
        <ToolbarButton label="Unlink" title="Remove link" onClick={() => editor.chain().focus().unsetLink().run()} />
        <ToolbarButton label="Clear" title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} />
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
