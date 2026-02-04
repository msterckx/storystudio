'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { EventTitleInput } from './EventTitleInput'
import { RichTextEditor } from './RichTextEditor'
import { MetadataPanel, EventMetadata } from './MetadataPanel'
import { LockToggle } from './LockToggle'
import { useAutoSave } from '@/hooks/useAutoSave'
import { SaveStatus } from '@/types'

interface Event {
  id: string
  title: string
  content: string
  metadata: string
  locked: boolean
  source: 'ai' | 'user'
}

interface EventEditorProps {
  event: Event | null
  onEventUpdate: (eventId: string, data: { title?: string; content?: string; locked?: boolean; metadata?: string }) => Promise<void>
  onSaveStatusChange?: (status: SaveStatus) => void
}

// Parse metadata from JSON string
function parseMetadata(metadataStr: string): EventMetadata {
  try {
    return JSON.parse(metadataStr) || {}
  } catch {
    return {}
  }
}

// Inner component that handles a single event - keyed by event ID
function EventEditorInner({
  event,
  onEventUpdate,
  onSaveStatusChange,
}: {
  event: Event
  onEventUpdate: (eventId: string, data: { title?: string; content?: string; locked?: boolean; metadata?: string }) => Promise<void>
  onSaveStatusChange?: (status: SaveStatus) => void
}) {
  // Use refs to track pending changes without triggering re-renders
  const pendingChanges = useRef<{
    title?: string
    content?: string
    metadata?: string
  }>({})

  // Local state for UI - initialized from event props
  const [localTitle, setLocalTitle] = useState(event.title)
  const [localContent, setLocalContent] = useState(event.content || '')
  const [localMetadata, setLocalMetadata] = useState<EventMetadata>(() =>
    parseMetadata(event.metadata)
  )
  const [localLocked, setLocalLocked] = useState(event.locked)

  // Memoize the save function
  const saveEvent = useCallback(async () => {
    if (Object.keys(pendingChanges.current).length === 0) return

    const changes = { ...pendingChanges.current }
    pendingChanges.current = {}

    await onEventUpdate(event.id, changes)
  }, [event.id, onEventUpdate])

  const { status, triggerSave } = useAutoSave({
    delay: 1500,
    onSave: saveEvent,
  })

  // Report save status to parent
  useEffect(() => {
    onSaveStatusChange?.(status)
  }, [status, onSaveStatusChange])

  // Handle title change
  const handleTitleChange = useCallback((newTitle: string) => {
    setLocalTitle(newTitle)
    pendingChanges.current.title = newTitle
    triggerSave()
  }, [triggerSave])

  // Handle content change
  const handleContentChange = useCallback((newContent: string) => {
    setLocalContent(newContent)
    pendingChanges.current.content = newContent
    triggerSave()
  }, [triggerSave])

  // Handle metadata change
  const handleMetadataChange = useCallback((newMetadata: EventMetadata) => {
    setLocalMetadata(newMetadata)
    pendingChanges.current.metadata = JSON.stringify(newMetadata)
    triggerSave()
  }, [triggerSave])

  // Handle lock toggle
  const handleLockToggle = useCallback(async () => {
    const newLocked = !localLocked
    setLocalLocked(newLocked)

    // Save immediately when toggling lock
    await onEventUpdate(event.id, { locked: newLocked })
  }, [event.id, localLocked, onEventUpdate])

  return (
    <div className="h-full flex flex-col">
      {/* Header with title and lock toggle */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <EventTitleInput
              value={localTitle}
              onChange={handleTitleChange}
              disabled={localLocked}
            />
          </div>
          <LockToggle isLocked={localLocked} onToggle={handleLockToggle} />
        </div>
      </div>

      {/* Editor content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Rich text editor */}
        <RichTextEditor
          content={localContent}
          onChange={handleContentChange}
          disabled={localLocked}
        />

        {/* Metadata panel */}
        <MetadataPanel
          metadata={localMetadata}
          onChange={handleMetadataChange}
          disabled={localLocked}
        />
      </div>

      {/* AI Actions placeholder */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-500 text-center">
          AI actions will be available in Phase 6
        </p>
      </div>
    </div>
  )
}

// Main component that handles empty state and keys the inner component
export function EventEditor({ event, onEventUpdate, onSaveStatusChange }: EventEditorProps) {
  // Memoize empty state component
  const emptyState = useMemo(() => (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <p className="text-gray-400 text-sm">Select an event to edit</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <p className="text-gray-500">Select an event from the list to start editing</p>
        </div>
      </div>
    </div>
  ), [])

  if (!event) {
    return emptyState
  }

  // Key by event ID to reset state when switching events
  return (
    <EventEditorInner
      key={event.id}
      event={event}
      onEventUpdate={onEventUpdate}
      onSaveStatusChange={onSaveStatusChange}
    />
  )
}
