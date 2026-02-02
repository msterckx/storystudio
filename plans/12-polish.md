# Phase 12: Polish & Accessibility

## Goal
Complete the application with keyboard navigation, accessibility, error handling improvements, and performance optimization.

---

## Deliverables

### 12.1 Keyboard Navigation
- [ ] Event list navigation with ↑/↓
- [ ] Enter to select event
- [ ] Tab navigation through UI elements
- [ ] Focus indicators on all interactive elements
- [ ] Skip links for main content areas

### 12.2 Global Keyboard Shortcuts
- [ ] Implement all documented shortcuts:
  - `Cmd/Ctrl + K` — Command bar
  - `Cmd/Ctrl + S` — Force save
  - `Cmd/Ctrl + Z` — Undo
  - `Cmd/Ctrl + Shift + Z` — Redo
  - `Escape` — Close modal/panel
- [ ] Shortcut help overlay (Cmd/Ctrl + ?)

### 12.3 Undo/Redo System
- [ ] Undo stack for content changes
- [ ] Undo for event operations (delete, reorder)
- [ ] Undo for AI actions
- [ ] Redo support
- [ ] Undo toast notification with "Redo" button

### 12.4 Accessibility Improvements
- [ ] ARIA labels on all interactive elements
- [ ] Role attributes for custom components
- [ ] Screen reader announcements for:
  - Save status changes
  - AI action completion
  - Error messages
- [ ] Focus management in modals
- [ ] Reduced motion support

### 12.5 Error Handling Polish
- [ ] Global error boundary
- [ ] Friendly error messages for all failure states
- [ ] Retry buttons where appropriate
- [ ] Offline banner with reconnection
- [ ] Error logging (console + optional service)

### 12.6 Performance Optimization
- [ ] Image lazy loading
- [ ] Virtual scrolling for long event lists
- [ ] Debounced search/filter
- [ ] Memoization of expensive computations
- [ ] Database query optimization

### 12.7 Loading States
- [ ] Skeleton loaders for:
  - Project list
  - Event list
  - Image grid
- [ ] Spinner states for:
  - AI actions
  - Export generation
  - Save operations

### 12.8 Empty States
- [ ] No projects: Welcome message + CTA
- [ ] No events: Prompt to add or generate
- [ ] No images: Explanation + retry
- [ ] No search results: Suggestion to broaden

### 12.9 Mobile Responsiveness
- [ ] Responsive three-pane layout
- [ ] Collapsible panes on smaller screens
- [ ] Touch-friendly targets (44px minimum)
- [ ] Mobile navigation menu

### 12.10 Final Polish
- [ ] Consistent spacing throughout
- [ ] Animation/transition refinement
- [ ] Loading state consistency
- [ ] Error state consistency
- [ ] Copy/text review

---

## Components to Create/Update

```
src/components/ui/SkipLinks.tsx
src/components/ui/ShortcutHelp.tsx
src/components/ui/Skeleton.tsx
src/components/ui/OfflineBanner.tsx
src/components/ui/ErrorBoundary.tsx
src/components/ui/Toast.tsx
src/hooks/useUndo.ts
src/hooks/useKeyboardShortcuts.ts
src/hooks/useReducedMotion.ts
src/hooks/useOnlineStatus.ts
src/lib/undo/index.ts
```

---

## Undo System

```typescript
// lib/undo/index.ts
interface UndoEntry {
  id: string
  description: string
  undo: () => Promise<void>
  redo: () => Promise<void>
  timestamp: number
}

class UndoManager {
  private undoStack: UndoEntry[] = []
  private redoStack: UndoEntry[] = []

  push(entry: Omit<UndoEntry, 'id' | 'timestamp'>) {
    this.undoStack.push({
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    })
    this.redoStack = [] // Clear redo on new action
  }

  async undo(): Promise<UndoEntry | null> {
    const entry = this.undoStack.pop()
    if (!entry) return null
    await entry.undo()
    this.redoStack.push(entry)
    return entry
  }

  async redo(): Promise<UndoEntry | null> {
    const entry = this.redoStack.pop()
    if (!entry) return null
    await entry.redo()
    this.undoStack.push(entry)
    return entry
  }
}
```

---

## Accessibility Checklist

### Screen Reader
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Buttons have accessible names
- [ ] Links have descriptive text
- [ ] Headings follow hierarchy
- [ ] Live regions for dynamic content

### Keyboard
- [ ] All interactive elements focusable
- [ ] Focus order is logical
- [ ] No keyboard traps
- [ ] Focus visible at all times
- [ ] Shortcuts don't conflict with assistive tech

### Visual
- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Color contrast ≥ 3:1 for UI elements
- [ ] Information not conveyed by color alone
- [ ] Text resizable to 200%
- [ ] No horizontal scroll at 320px width

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Initial load | < 3 seconds |
| Event selection | < 100ms |
| Rich text input | < 16ms (60fps) |
| Image search | < 2 seconds |
| Export generation | < 30 seconds |

---

## User Testing Checklist

After this phase, verify:

### Keyboard
- [ ] Can navigate entire app with keyboard only
- [ ] ↑/↓ navigates event list
- [ ] Enter selects event
- [ ] Tab moves through controls logically
- [ ] Escape closes modals
- [ ] Cmd+K opens command bar
- [ ] Cmd+Z undoes last action
- [ ] Shortcut help shows with Cmd+?

### Accessibility
- [ ] Screen reader announces page changes
- [ ] Screen reader reads event content
- [ ] All buttons have accessible names
- [ ] Focus visible on all elements
- [ ] Can complete all tasks without mouse

### Error Handling
- [ ] Network error shows retry option
- [ ] AI timeout shows helpful message
- [ ] Save failure shows persistent warning
- [ ] App doesn't crash on errors

### Performance
- [ ] App loads quickly
- [ ] Typing in editor is smooth
- [ ] Long lists don't lag
- [ ] Images load progressively

### Responsive
- [ ] Works on tablet (768px)
- [ ] Works on mobile (375px)
- [ ] Touch targets are tappable

---

## Exit Criteria

Phase 12 is complete when:
1. All deliverables checked off
2. User testing checklist passes
3. Accessibility audit passes
4. Performance targets met
5. Application feels polished and complete
