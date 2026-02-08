'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { EventListItem } from './EventListItem'
import { AddEventButton } from './AddEventButton'
import { Dialog } from '@/components/ui/Dialog'
import { Event } from '@/hooks/useEvents'

interface EventListProps {
  events: Event[]
  selectedEventId: string | null
  onSelectEvent: (eventId: string | null) => void
  onAddEvent: () => Promise<Event | null>
  onDeleteEvent: (eventId: string) => Promise<boolean>
  onReorderEvents: (eventIds: string[]) => Promise<boolean>
  isLoading?: boolean
}

export function EventList({
  events,
  selectedEventId,
  onSelectEvent,
  onAddEvent,
  onDeleteEvent,
  onReorderEvents,
  isLoading,
}: EventListProps) {
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = events.findIndex((e) => e.id === active.id)
      const newIndex = events.findIndex((e) => e.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = [...events]
        const [removed] = newOrder.splice(oldIndex, 1)
        newOrder.splice(newIndex, 0, removed)

        await onReorderEvents(newOrder.map((e) => e.id))
      }
    }
  }

  const handleAddEvent = async () => {
    const newEvent = await onAddEvent()
    if (newEvent) {
      onSelectEvent(newEvent.id)
    }
  }

  const handleDeleteClick = (event: Event) => {
    setDeleteTarget(event)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)
    const success = await onDeleteEvent(deleteTarget.id)
    setIsDeleting(false)

    if (success) {
      // Select adjacent event after deletion
      if (selectedEventId === deleteTarget.id) {
        const currentIndex = events.findIndex((e) => e.id === deleteTarget.id)
        const remainingEvents = events.filter((e) => e.id !== deleteTarget.id)

        if (remainingEvents.length > 0) {
          // Select the event at the same index, or the last one if we deleted the last
          const newIndex = Math.min(currentIndex, remainingEvents.length - 1)
          onSelectEvent(remainingEvents[newIndex].id)
        } else {
          onSelectEvent(null)
        }
      }
      setDeleteTarget(null)
    }
  }

  // Loading skeleton
  if (isLoading && events.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Events</h2>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-6 h-6 bg-gray-200 rounded" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                <div className="h-2.5 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Events</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            No events yet.
            <br />
            Add your first event.
          </p>
          <AddEventButton onClick={handleAddEvent} disabled={isLoading} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Events</h2>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={events.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {events.map((event) => (
                <EventListItem
                  key={event.id}
                  id={event.id}
                  orderIndex={event.orderIndex}
                  title={event.title}
                  source={event.source}
                  locked={event.locked}
                  isSelected={event.id === selectedEventId}
                  onSelect={() => onSelectEvent(event.id)}
                  onDelete={() => handleDeleteClick(event)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <AddEventButton onClick={handleAddEvent} disabled={isLoading} />
      </div>

      <Dialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Event"
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
      >
        <p>
          Delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.
        </p>
      </Dialog>
    </div>
  )
}
