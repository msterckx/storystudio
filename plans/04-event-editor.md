# Phase 4: Event Editor (Middle Pane)

## Goal
Build the middle pane where users write and edit event content. This includes rich text editing, metadata fields, and auto-save.

---

## Deliverables

### 4.1 Event Editor Layout
- [ ] `EventEditor` component in middle pane
- [ ] Shows content for selected event
- [ ] Empty state when no event selected
- [ ] Layout:
  ```
  ┌─────────────────────────────────┐
  │ Event Title (editable)          │
  ├─────────────────────────────────┤
  │ Metadata bar (collapsed)        │
  ├─────────────────────────────────┤
  │                                 │
  │ Rich text editor                │
  │                                 │
  ├─────────────────────────────────┤
  │ AI Actions (placeholder)        │
  └─────────────────────────────────┘
  ```

### 4.2 Event Title Editing
- [ ] Large, editable title field
- [ ] Updates event list on change
- [ ] Auto-save on blur or after typing pause

### 4.3 Rich Text Editor
- [ ] Install and configure Tiptap
- [ ] Toolbar with formatting options:
  - Bold, Italic
  - Heading levels (H3, H4)
  - Bullet list, Numbered list
- [ ] Keyboard shortcuts (Cmd+B, Cmd+I)
- [ ] Placeholder text when empty
- [ ] Auto-save content changes

### 4.4 Metadata Panel
- [ ] Collapsible metadata section
- [ ] Date field (free text input)
- [ ] Tags field (comma-separated or chips)
- [ ] Notes field (textarea, private notes)
- [ ] Auto-save metadata changes

### 4.5 Lock/Unlock Toggle
- [ ] Lock button in editor toolbar or metadata
- [ ] When locked:
  - Editor becomes read-only
  - Lock icon shown in event list
  - AI actions disabled (Phase 6)
- [ ] Toggle updates event state

### 4.6 Auto-Save Integration
- [ ] Debounced save for all editable fields
- [ ] Save indicator updates in TopBar
- [ ] Error handling for failed saves
- [ ] API route: `PATCH /api/projects/[id]/events/[eventId]`

---

## API Routes

### `PATCH /api/projects/[id]/events/[eventId]`
Updates event fields.

```typescript
Request: {
  title?: string
  content?: string
  metadata?: {
    date?: string
    tags?: string[]
    notes?: string
  }
  locked?: boolean
}
```

---

## Components to Create

```
src/components/features/editor/EventEditor.tsx
src/components/features/editor/EventTitleInput.tsx
src/components/features/editor/RichTextEditor.tsx
src/components/features/editor/EditorToolbar.tsx
src/components/features/editor/MetadataPanel.tsx
src/components/features/editor/MetadataField.tsx
src/components/features/editor/LockToggle.tsx
src/components/ui/Collapsible.tsx
src/hooks/useAutoSave.ts
```

---

## Tiptap Configuration

```typescript
// lib/editor/extensions.ts
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

export const editorExtensions = [
  StarterKit.configure({
    heading: { levels: [3, 4] },
  }),
  Placeholder.configure({
    placeholder: 'Start writing about this event...',
  }),
]
```

---

## Auto-Save Hook

```typescript
// hooks/useAutoSave.ts
export function useAutoSave<T>(
  value: T,
  onSave: (value: T) => Promise<void>,
  delay: number = 2000
) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    const timer = setTimeout(async () => {
      setStatus('saving')
      try {
        await onSave(value)
        setStatus('saved')
      } catch {
        setStatus('error')
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return status
}
```

---

## User Testing Checklist

After this phase, verify:

- [ ] Selecting an event shows its content in editor
- [ ] Empty editor shows placeholder text
- [ ] Can edit event title
- [ ] Title change reflects in left pane list
- [ ] Can write content with formatting
- [ ] Bold shortcut (Cmd+B) works
- [ ] Italic shortcut (Cmd+I) works
- [ ] Can create bullet lists
- [ ] Can create numbered lists
- [ ] Can add headings
- [ ] Metadata panel expands/collapses
- [ ] Can add date, tags, notes
- [ ] Save indicator shows "Saving..." then "Saved"
- [ ] Content persists after page refresh
- [ ] Can lock an event
- [ ] Locked event shows lock icon in list
- [ ] Locked event editor is read-only

---

## Exit Criteria

Phase 4 is complete when:
1. All deliverables checked off
2. User testing checklist passes
3. Can write formatted content that persists
4. Auto-save works reliably without data loss
