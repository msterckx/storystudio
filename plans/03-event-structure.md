# Phase 3: Event Structure (Left Pane)

**Status: Complete**

## Goal
Build the left pane that displays and manages the story's event structure. Users can add, remove, reorder, and select events.

---

## Deliverables

### 3.1 Event List Display
- [x] `EventList` component in left pane
- [x] `EventListItem` component showing:
  - Order number
  - Event title (truncated if long)
  - State indicators (selected, AI-generated, locked)
- [x] Scrollable list when events exceed viewport
- [x] Empty state: "No events yet. Add your first event."

### 3.2 Event Selection
- [x] Click event to select
- [x] Selected event highlighted
- [x] Selection stored in URL or context
- [x] Middle pane updates when selection changes

### 3.3 Add Event
- [x] "Add Event" button at bottom of list
- [x] Creates new event with default title "New Event"
- [x] New event appended to end
- [x] New event automatically selected
- [x] API route: `POST /api/projects/[id]/events`

### 3.4 Delete Event
- [x] Delete icon on hover/focus
- [x] Confirmation dialog for deletion
- [x] API route: `DELETE /api/projects/[id]/events/[eventId]`
- [x] Select adjacent event after deletion
- [x] Handle deleting last event (show empty state)

### 3.5 Drag-and-Drop Reordering
- [x] Install and configure dnd-kit
- [x] Drag handle visible on hover
- [x] Visual feedback during drag
- [x] Drop zones between events
- [x] API route: `PATCH /api/projects/[id]/events/reorder`
- [x] Optimistic UI update

### 3.6 Event State Indicators
- [x] AI badge for AI-generated events
- [x] Lock icon for locked events
- [x] Unsaved dot indicator (if applicable)

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

- [x] Empty project shows "No events" message
- [x] Can add a new event
- [x] New event appears in list with default title
- [x] New event is automatically selected
- [x] Can click different events to select them
- [x] Selected event is visually highlighted
- [x] Can see order numbers on events
- [x] Can drag events to reorder
- [x] Reorder persists after page refresh
- [x] Can delete an event
- [x] Confirmation appears before deletion
- [x] After deletion, adjacent event is selected
- [x] Long titles are truncated in list

---

## Exit Criteria

Phase 3 is complete when:
1. All deliverables checked off
2. User testing checklist passes
3. Can manage event structure without touching middle pane
4. Drag-and-drop feels smooth and responsive
