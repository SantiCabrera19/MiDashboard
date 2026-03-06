"use client";

// ─── TipTap Rich Text Editor ─────────────────────────────
// Client Component — full-featured WYSIWYG editor for notes.
//
// ARCHITECTURE:
// - StarterKit.configure() explicitly enables all needed extensions
//   with proper heading levels configuration
// - Custom CSS (tiptap-editor.css) handles all visual styling
//   for ProseMirror elements (headings, lists, code blocks, etc.)
// - The .tiptap class on the ProseMirror container scopes all styles
// - immediatelyRender: false prevents SSR hydration mismatch

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import "./tiptap-editor.css";

interface TipTapEditorProps {
    initialContent?: string;
    onChange: (html: string) => void;
}

export default function TipTapEditor({
    initialContent = "",
    onChange,
}: TipTapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                bulletList: {},
                orderedList: {},
                blockquote: {},
                codeBlock: {},
                horizontalRule: {},
                bold: {},
                italic: {},
                strike: {},
            }),
            Placeholder.configure({
                placeholder: "Start writing your note...",
            }),
        ],
        immediatelyRender: false,
        content: initialContent,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: {
                // The "tiptap" class scopes our custom CSS styles
                class: "tiptap min-h-[400px] outline-none focus:outline-none text-base leading-relaxed",
            },
        },
    });

    if (!editor) {
        return (
            <div className="border border-[var(--color-border)] rounded-md bg-[var(--color-surface-1)] p-4 min-h-[400px] flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-[var(--color-brand-primary)]" />
            </div>
        );
    }

    // Word & character count
    const text = editor.getText();
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const charCount = text.length;

    return (
        <div className="border border-[var(--color-border)] rounded-md focus-within:ring-2 ring-[var(--color-brand-primary)] overflow-hidden bg-[var(--color-surface-1)]">
            {/* Toolbar — sticky at top */}
            <div className="sticky top-0 z-10 flex flex-wrap gap-1 p-2 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                {/* Text formatting */}
                <ToolbarButton
                    onAction={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                    title="Bold — apply to selected text (Ctrl+B)"
                >
                    <b>B</b>
                </ToolbarButton>
                <ToolbarButton
                    onAction={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                    title="Italic — apply to selected text (Ctrl+I)"
                >
                    <i>I</i>
                </ToolbarButton>
                <ToolbarButton
                    onAction={() => editor.chain().focus().toggleStrike().run()}
                    disabled={!editor.can().chain().focus().toggleStrike().run()}
                    active={editor.isActive("strike")}
                    title="Strikethrough — apply to selected text"
                >
                    <s>S</s>
                </ToolbarButton>

                <Separator />

                {/* Headings */}
                <ToolbarButton
                    onAction={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive("heading", { level: 1 })}
                    title="Heading 1 — applies to current paragraph"
                >
                    H1
                </ToolbarButton>
                <ToolbarButton
                    onAction={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive("heading", { level: 2 })}
                    title="Heading 2 — applies to current paragraph"
                >
                    H2
                </ToolbarButton>
                <ToolbarButton
                    onAction={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive("heading", { level: 3 })}
                    title="Heading 3 — applies to current paragraph"
                >
                    H3
                </ToolbarButton>

                <Separator />

                {/* Lists */}
                <ToolbarButton
                    onAction={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive("bulletList")}
                    title="Bullet List — applies to current paragraph"
                >
                    • List
                </ToolbarButton>
                <ToolbarButton
                    onAction={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive("orderedList")}
                    title="Numbered List — applies to current paragraph"
                >
                    1.
                </ToolbarButton>

                <Separator />

                {/* Block elements */}
                <ToolbarButton
                    onAction={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive("blockquote")}
                    title="Blockquote — applies to current paragraph"
                >
                    Quote
                </ToolbarButton>
                <ToolbarButton
                    onAction={() => editor.chain().focus().toggleCodeBlock().run()}
                    active={editor.isActive("codeBlock")}
                    title="Code Block — applies to current paragraph"
                >
                    Code
                </ToolbarButton>
                <ToolbarButton
                    onAction={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Insert horizontal rule"
                >
                    ―
                </ToolbarButton>

                <Separator />

                {/* Undo / Redo */}
                <ToolbarButton
                    onAction={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    title="Undo (Ctrl+Z)"
                >
                    ↩
                </ToolbarButton>
                <ToolbarButton
                    onAction={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    title="Redo (Ctrl+Shift+Z)"
                >
                    ↪
                </ToolbarButton>
            </div>

            {/* Editor Content */}
            <div className="p-4 text-[var(--color-text-primary)]">
                <EditorContent editor={editor} />
            </div>

            {/* Footer — word & character count */}
            <div className="flex justify-end gap-4 px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <span className="text-xs text-[var(--color-text-muted)]">
                    {wordCount} {wordCount === 1 ? "word" : "words"}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                    {charCount} {charCount === 1 ? "char" : "chars"}
                </span>
            </div>
        </div>
    );
}

// ─── Toolbar Sub-components ──────────────────────────────

interface ToolbarButtonProps {
    onAction: () => void;
    disabled?: boolean;
    active?: boolean;
    title: string;
    children: React.ReactNode;
}

function ToolbarButton({ onAction, disabled, active, title, children }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            // onMouseDown + preventDefault = preserves editor selection before command runs.
            // onClick would cause blur → loss of selection → formatting applied to wrong node.
            onMouseDown={(e) => {
                e.preventDefault();
                onAction();
            }}
            disabled={disabled}
            title={title}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors ${active
                ? "bg-[var(--color-brand-primary)] text-white"
                : "hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]"
                } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
        >
            {children}
        </button>
    );
}

function Separator() {
    return <div className="w-px h-6 bg-[var(--color-border)] mx-1 self-center" />;
}
