'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'
import { EditorToolbar } from './EditorToolbar'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  disabled?: boolean
  placeholder?: string
}

export function RichTextEditor({
  content,
  onChange,
  disabled = false,
  placeholder = 'Start writing about this event...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [3, 4] },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px]',
      },
    },
  })

  // Update content when prop changes (e.g., switching events)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${disabled ? 'bg-gray-50' : 'bg-white'}`}>
      <EditorToolbar editor={editor} disabled={disabled} />
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
