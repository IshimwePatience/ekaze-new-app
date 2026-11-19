"use client";

import { useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline"],
  [{ align: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "clean"],
];

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Write something...",
  className,
  minHeight = 200,
}: RichTextEditorProps) => {
  const quillRef = useRef(null);

  const plainText = value.replace(/<[^>]*>/g, "").trim();
  const wordCount = plainText === "" ? 0 : plainText.split(/\s+/).length;
  const charCount = plainText.length;

  return (
    <div className={cn("rich-text-editor-wrapper", className)}>
      <style>{`
        .rich-text-editor-wrapper .ql-toolbar {
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
          border-color: hsl(var(--input));
          background: hsl(var(--muted) / 0.4);
          padding: 6px 8px;
        }
        .rich-text-editor-wrapper .ql-container {
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
          border-color: hsl(var(--input));
          font-size: 0.875rem;
          font-family: inherit;
        }
        .rich-text-editor-wrapper .ql-editor {
          min-height: ${minHeight}px;
          padding: 12px 16px;
          color: hsl(var(--foreground));
          line-height: 1.6;
        }
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
          font-size: 0.875rem;
        }
        .rich-text-editor-wrapper:focus-within .ql-toolbar,
        .rich-text-editor-wrapper:focus-within .ql-container {
          border-color: hsl(var(--ring));
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-stroke {
          stroke: hsl(var(--muted-foreground));
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-fill {
          fill: hsl(var(--muted-foreground));
        }
        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor-wrapper .ql-toolbar .ql-active .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-fill,
        .rich-text-editor-wrapper .ql-toolbar .ql-active .ql-fill {
          fill: hsl(var(--foreground));
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-label {
          color: hsl(var(--muted-foreground));
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-label:hover,
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-label.ql-active {
          color: hsl(var(--foreground));
        }
        .rich-text-editor-wrapper .ql-editor h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
        .rich-text-editor-wrapper .ql-editor h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.2rem; }
        .rich-text-editor-wrapper .ql-editor h3 { font-size: 1.05rem; font-weight: 600; margin-bottom: 0.15rem; }
        .rich-text-editor-wrapper .ql-editor ul,
        .rich-text-editor-wrapper .ql-editor ol { padding-left: 1.5rem; margin: 0.3rem 0; }
        .rich-text-editor-wrapper .ql-editor blockquote {
          border-left: 3px solid hsl(var(--border));
          padding-left: 1rem;
          color: hsl(var(--muted-foreground));
          margin: 0.5rem 0;
        }
      `}</style>

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={{ toolbar: TOOLBAR_OPTIONS }}
      />

      <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
        <span>Supports headings, bold, italic, lists &amp; alignment</span>
        <span>{wordCount} words · {charCount} chars</span>
      </div>
    </div>
  );
};