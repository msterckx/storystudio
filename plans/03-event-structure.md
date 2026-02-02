# Phase 3: Event Structure (Left Pane)

## Goal
Build the left pane that displays and manages the story's event structure. Users can add, remove, reorder, and select events.

---

## Deliverables

### 3.1 Event List Display
- [ ] `EventList` component in left pane
- [ ] `EventListItem` component showing:
  - Order number
  - Event title (truncated if long)
  - State indicators (selected, AI-generated, locked)
- [ ] Scrollable list when events exceed viewport
- [ ] Empty state: "No events yet. Add your first event."

### 3.2 Event Selection
- [ ] Click event to select
- [ ] Selected event highlighted
- [ ] Selection stored in URL or context
- [ ] Middle pane updates when selection changes

### 3.3 Add Event
- [ ] "Add Event" button at bottom of list
- [ ] Creates new event with default title "New Event"
- [ ] New event appended to end
- [ ] New event automatically selected
- [ ] API route: `POST /api/projects/[id]/events`

### 3.4 Delete Event
- [ ] Delete icon on hover/focus
- [ ] Confirmation dialog for deletion
- [ ] API route: `DELETE /api/projects/[id]/events/[eventId]`
- [ ] Select adjacent event after deletion
- [ ] Handle deleting last event (show empty state)

### 3.5 Drag-and-Drop Reordering
- [ ] Install and configure dnd-kit
- [ ] Drag handle visible on hover
- [ ] Visual feedback during drag
- [ ] Drop zones between events
- [ ] API route: `PATCH /api/projects/[id]/events/reorder`
- [ ] Optimistic UI update

### 3.6 Event State Indicators
- [ ] AI badge for AI-generated events
- [ ] Lock icon for locked events
- [ ] Unsaved dot indicator (if applicable)

---

## API Routes

### `POST /api/projects/[id]/events`
Creates a new event.

```typescript
Request: {
  title?: string
  content?: string
  afterEventId?: string  // Insert after this event
}
Response: {
  event: { id, title, orderIndex, ... }
}
```

### `DELETE /api/projects/[id]/events/[eventId]`
Deletes an event.

### `PATCH /api/projects/[id]/events/reorder`
Reorders events.

```typescript
Request: {
  eventIds: string[]  // New order
}
```

---

## Components to Create

```
src/components/features/events/EventList.tsx
src/components/features/events/EventListItem.tsx
src/components/features/events/AddEventButton.tsx
src/components/features/events/EventStateIndicators.tsx
src/hooks/useEvents.ts
src/hooks/useSelectedEvent.ts
src/lib/db/events.ts
```

---

## State Management

### Selected Event
```typescript
// Option A: URL-based (recommended)
/projects/[id]?event=[eventId]

// Option B: Context-based
const EventContext = createContext<{
  selectedEventId: string | null
  selectEvent: (id: string) => void
}>()
```

### Optimistic Updates for Reorder
```typescript
// Use React Query's optimistic updates
const reorderMutation = useMutation({
  mutationFn: reorderEvents,
  onMutate: async (newOrder) => {
    await queryClient.cancelQueries(['events', projectId])
    const previous = queryClient.getQueryData(['events', projectId])
    queryClient.setQueryData(['events', projectId], newOrder)
    return { previous }
  },
  onError: (err, newOrder, context) => {
    queryClient.setQueryData(['events', projectId], context.previous)
  },
})
```

---

## Database Operations

```typescript
// lib/db/events.ts
export async function getEvents(projectId: string): Promise<Event[]>
export async function getEvent(id: string): Promise<Event | null>
export async function createEvent(projectId: string, data?: Partial<Event>): Promise<Event>
export async function updateEvent(id: string, data: Partial<Event>): Promise<Event>
export async function deleteEvent(id: string): Promise<void>
export async function reorderEvents(projectId: string, eventIds: string[]): Promise<void>
```

---

## User Testing Checklist

After this phase, verify:

- [ ] Empty project shows "No events" message
- [ ] Can add a new event
- [ ] New event appears in list with default title
- [ ] New event is automatically selected
- [ ] Can click different events to select them
- [ ] Selected event is visually highlighted
- [ ] Can see order numbers on events
- [ ] Can drag events to reorder
- [ ] Reorder persists after page refresh
- [ ] Can delete an event
- [ ] Confirmation appears before deletion
- [ ] After deletion, adjacent event is selected
- [ ] Long titles are truncated in list

---

## Exit Criteria

Phase 3 is complete when:
1. All deliverables checked off
2. User testing checklist passes
3. Can manage event structure without touching middle pane
4. Drag-and-drop feels smooth and responsive
