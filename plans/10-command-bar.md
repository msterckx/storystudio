# Phase 10: Command Bar

## Goal
Build the natural language command interface that lets users edit their project with text commands.

---

## Deliverables

### 10.1 Command Bar UI
- [ ] Command bar trigger in TopBar
- [ ] Modal overlay with search-style input
- [ ] Keyboard shortcut: Cmd/Ctrl + K
- [ ] Focus input immediately on open
- [ ] Close with Escape

### 10.2 Recent Commands
- [ ] Show last 5 commands below input
- [ ] Click to re-run command
- [ ] Store in localStorage per project

### 10.3 Command Suggestions
- [ ] Static suggestions when input empty:
  - "Expand this event"
  - "Add a new event"
  - "Rewrite for high school audience"
  - "Remove the last event"
- [ ] Click suggestion to execute

### 10.4 Command Parsing
- [ ] AI interprets natural language
- [ ] Returns structured action
- [ ] Handles ambiguous commands with clarification
- [ ] API route: `POST /api/ai/parse-command`

### 10.5 Action Preview
- [ ] Show interpreted action before execution
- [ ] Highlight affected events in list
- [ ] "Execute" and "Cancel" buttons
- [ ] Clear description of what will happen

### 10.6 Command Execution
- [ ] Execute parsed action
- [ ] Update project state
- [ ] Show success feedback
- [ ] Create undo entry

### 10.7 Supported Commands
- [ ] Event operations:
  - Remove events ("remove event 3", "delete events 1-3")
  - Add events ("add event after 2", "add event about X")
  - Reorder ("move event 5 to position 2")
  - Merge ("merge events 3 and 4")
- [ ] Content operations:
  - Expand ("expand event 2", "expand all")
  - Rewrite ("rewrite for elementary", "make more engaging")
- [ ] Project operations:
  - Settings ("change audience to college")

---

## API Routes

### `POST /api/ai/parse-command`
Parses natural language into structured action.

```typescript
Request: {
  command: string
  projectContext: {
    events: Array<{ id: string, title: string, orderIndex: number }>
    selectedEventId?: string
  }
}

Response: {
  action: CommandAction
  confidence: number
  clarificationNeeded?: boolean
  clarificationOptions?: string[]
}

type CommandAction =
  | { type: 'remove_events', eventIds: string[] }
  | { type: 'add_event', afterEventId?: string, topic?: string }
  | { type: 'reorder_event', eventId: string, newPosition: number }
  | { type: 'merge_events', eventIds: string[] }
  | { type: 'expand_event', eventId: string }
  | { type: 'expand_all' }
  | { type: 'rewrite_event', eventId: string, style: string }
  | { type: 'rewrite_all', style: string }
  | { type: 'update_settings', settings: Partial<ProjectSettings> }
```

---

## Components to Create

```
src/components/features/command-bar/CommandBar.tsx
src/components/features/command-bar/CommandInput.tsx
src/components/features/command-bar/RecentCommands.tsx
src/components/features/command-bar/CommandSuggestions.tsx
src/components/features/command-bar/ActionPreview.tsx
src/components/features/command-bar/ClarificationDialog.tsx
src/lib/commands/parser.ts
src/lib/commands/executor.ts
src/lib/commands/actions.ts
src/hooks/useCommandBar.ts
src/hooks/useCommandHistory.ts
```

---

## Command Parser Prompt

```
You are a command parser for an educational story editor.

Parse the user's command into a structured action.

Available actions:
- remove_events: Delete events by number or range
- add_event: Insert a new event
- reorder_event: Move an event to a new position
- merge_events: Combine multiple events into one
- expand_event: Add more detail to an event
- expand_all: Expand all events
- rewrite_event: Rewrite with different style
- rewrite_all: Rewrite all events
- update_settings: Change project settings

Current project:
{{eventList}}

Selected event: {{selectedEvent}}

User command: "{{command}}"

Return JSON:
{
  "action": { "type": "...", ... },
  "confidence": 0.0-1.0,
  "clarificationNeeded": boolean,
  "clarificationOptions": ["...", "..."]
}
```

---

## Command Executor

```typescript
// lib/commands/executor.ts
export async function executeCommand(
  action: CommandAction,
  projectId: string
): Promise<ExecutionResult> {
  switch (action.type) {
    case 'remove_events':
      return removeEvents(projectId, action.eventIds)
    case 'add_event':
      return addEvent(projectId, action.afterEventId, action.topic)
    case 'expand_event':
      return expandEvent(projectId, action.eventId)
    // ... other cases
  }
}
```

---

## Keyboard Handling

```typescript
// hooks/useCommandBar.ts
export function useCommandBar() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }
}
```

---

## User Testing Checklist

After this phase, verify:

- [ ] Cmd/Ctrl + K opens command bar
- [ ] Command bar shows in center of screen
- [ ] Input is focused immediately
- [ ] Recent commands show below input
- [ ] Suggestions show when input empty
- [ ] Typing command shows loading state
- [ ] **Test commands:**
  - [ ] "Remove event 1" → shows preview → executes
  - [ ] "Add event after 2" → creates new event
  - [ ] "Expand this event" → triggers expand action
  - [ ] "Rewrite for high school" → rewrites content
- [ ] Preview shows what will happen
- [ ] Affected events highlighted in list
- [ ] Can cancel before executing
- [ ] Escape closes command bar
- [ ] Click outside closes command bar
- [ ] Command history persists across sessions
- [ ] Can click recent command to re-run
- [ ] Ambiguous commands ask for clarification

---

## Exit Criteria

Phase 10 is complete when:
1. All deliverables checked off
2. User testing checklist passes
3. Common commands work reliably
4. Preview system prevents accidental changes
