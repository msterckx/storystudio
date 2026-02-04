# Phase 4: Event Editor (Middle Pane)

**Status: Complete**

## Goal
Build the middle pane where users write and edit event content. This includes rich text editing, metadata fields, and auto-save.

---

## Deliverables

### 4.1 Event Editor Layout
- [x] `EventEditor` component in middle pane
- [x] Shows content for selected event
- [x] Empty state when no event selected
- [x] Layout:
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
- [x] Large, editable title field
- [x] Updates event list on change
- [x] Auto-save on blur or after typing pause

### 4.3 Rich Text Editor
- [x] Install and configure Tiptap
- [x] Toolbar with formatting options:
  - Bold, Italic
  - Heading levels (H3, H4)
  - Bullet list, Numbered list
- [x] Keyboard shortcuts (Cmd+B, Cmd+I)
- [x] Placeholder text when empty
- [x] Auto-save content changes

### 4.4 Metadata Panel
- [x] Collapsible metadata section
- [x] Date field (free text input)
- [x] Tags field (comma-separated or chips)
- [x] Notes field (textarea, private notes)
- [x] Auto-save metadata changes

### 4.5 Lock/Unlock Toggle
- [x] Lock button in editor toolbar or metadata
- [x] When locked:
  - Editor becomes read-only
  - Lock icon shown in event list
  - AI actions disabled (Phase 6)
- [x] Toggle updates event state

### 4.6 Auto-Save Integration
- [x] Debounced save for all editable fields
- [x] Save indicator updates in TopBar
- [x] Error handling for failed saves
- [x] API route: `PATCH /api/projects/[id]/events/[eventId]`

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

- [x] Selecting an event shows its content in editor
- [x] Empty editor shows placeholder text
- [x] Can edit event title
- [x] Title change reflects in left pane list
- [x] Can write content with formatting
- [x] Bold shortcut (Cmd+B) works
- [x] Italic shortcut (Cmd+I) works
- [x] Can create bullet lists
- [x] Can create numbered lists
- [x] Can add headings
- [x] Metadata panel expands/collapses
- [x] Can add date, tags, notes
- [x] Save indicator shows "Saving..." then "Saved"
- [x] Content persists after page refresh
- [x] Can lock an event
- [x] Locked event shows lock icon in list
- [x] Locked event editor is read-only

---

## Exit Criteria

Phase 4 is complete when:
1. All deliverables checked off
2. User testing checklist passes
3. Can write formatted content that persists
4. Auto-save works reliably without data loss
