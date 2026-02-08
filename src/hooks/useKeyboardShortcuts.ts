'use client'

import { useEffect } from 'react'

interface UseKeyboardShortcutsOptions {
  events: { id: string }[]
  selectedEventId: string | null
  onSelectEvent: (eventId: string | null) => void
}

export function useKeyboardShortcuts({
  events,
  selectedEventId,
  onSelectEvent,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip when focused on text inputs
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()

        if (events.length === 0) return

        const currentIndex = events.findIndex((ev) => ev.id === selectedEventId)

        if (e.key === 'ArrowUp') {
          const newIndex = currentIndex <= 0 ? events.length - 1 : currentIndex - 1
          onSelectEvent(events[newIndex].id)
        } else {
          const newIndex = currentIndex >= events.length - 1 ? 0 : currentIndex + 1
          onSelectEvent(events[newIndex].id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [events, selectedEventId, onSelectEvent])
}
