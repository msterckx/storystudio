'use client'

import { useState, useCallback } from 'react'

export interface Event {
  id: string
  projectId: string
  orderIndex: number
  title: string
  content: string
  metadata: string
  source: 'ai' | 'user'
  locked: boolean
  createdAt: string
  updatedAt: string
}

interface UseEventsReturn {
  events: Event[]
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>
  isLoading: boolean
  error: string | null
  addEvent: (afterEventId?: string) => Promise<Event | null>
  deleteEvent: (eventId: string) => Promise<boolean>
  reorderEvents: (eventIds: string[]) => Promise<boolean>
  updateEvent: (eventId: string, data: { title?: string; content?: string }) => Promise<Event | null>
}

export function useEvents(
  projectId: string,
  initialEvents: Event[] = []
): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addEvent = useCallback(
    async (afterEventId?: string): Promise<Event | null> => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/projects/${projectId}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ afterEventId }),
        })

        if (!response.ok) {
          throw new Error('Failed to create event')
        }

        const { event } = await response.json()

        // Insert event at correct position
        setEvents((prev) => {
          if (afterEventId) {
            const afterIndex = prev.findIndex((e) => e.id === afterEventId)
            if (afterIndex !== -1) {
              const newEvents = [...prev]
              newEvents.splice(afterIndex + 1, 0, event)
              // Update orderIndex for display consistency
              return newEvents.map((e, i) => ({ ...e, orderIndex: i }))
            }
          }
          return [...prev, event]
        })

        return event
      } catch (err) {
        console.error('Failed to add event:', err)
        setError('Failed to add event')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [projectId]
  )

  const deleteEventFn = useCallback(
    async (eventId: string): Promise<boolean> => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(
          `/api/projects/${projectId}/events/${eventId}`,
          { method: 'DELETE' }
        )

        if (!response.ok) {
          throw new Error('Failed to delete event')
        }

        setEvents((prev) => {
          const filtered = prev.filter((e) => e.id !== eventId)
          // Update orderIndex for display consistency
          return filtered.map((e, i) => ({ ...e, orderIndex: i }))
        })

        return true
      } catch (err) {
        console.error('Failed to delete event:', err)
        setError('Failed to delete event')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [projectId]
  )

  const reorderEventsFn = useCallback(
    async (eventIds: string[]): Promise<boolean> => {
      // Optimistic update
      const previousEvents = events
      setEvents((prev) => {
        const eventMap = new Map(prev.map((e) => [e.id, e]))
        return eventIds
          .map((id, index) => {
            const event = eventMap.get(id)
            return event ? { ...event, orderIndex: index } : null
          })
          .filter((e): e is Event => e !== null)
      })

      try {
        const response = await fetch(`/api/projects/${projectId}/events`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventIds }),
        })

        if (!response.ok) {
          throw new Error('Failed to reorder events')
        }

        return true
      } catch (err) {
        console.error('Failed to reorder events:', err)
        setError('Failed to reorder events')
        // Rollback on error
        setEvents(previousEvents)
        return false
      }
    },
    [projectId, events]
  )

  const updateEventFn = useCallback(
    async (
      eventId: string,
      data: { title?: string; content?: string }
    ): Promise<Event | null> => {
      try {
        const response = await fetch(
          `/api/projects/${projectId}/events/${eventId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          }
        )

        if (!response.ok) {
          throw new Error('Failed to update event')
        }

        const { event } = await response.json()

        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, ...event } : e))
        )

        return event
      } catch (err) {
        console.error('Failed to update event:', err)
        setError('Failed to update event')
        return null
      }
    },
    [projectId]
  )

  return {
    events,
    setEvents,
    isLoading,
    error,
    addEvent,
    deleteEvent: deleteEventFn,
    reorderEvents: reorderEventsFn,
    updateEvent: updateEventFn,
  }
}
