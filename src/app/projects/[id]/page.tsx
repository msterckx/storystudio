'use client'

import { use, Suspense, useState, useCallback, useEffect, useRef } from 'react'
import { ApplicationShell } from '@/components/layout/ApplicationShell'
import { TopBar } from '@/components/layout/TopBar'
import { ThreePaneLayout } from '@/components/layout/ThreePaneLayout'
import { EventList } from '@/components/features/events/EventList'
import { EventEditor } from '@/components/features/editor/EventEditor'
import { useProject } from '@/hooks/useProject'
import { useEvents, Event } from '@/hooks/useEvents'
import { useSelectedEvent } from '@/hooks/useSelectedEvent'
import { SaveStatus } from '@/types'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

function ProjectWorkspaceContent({ projectId }: { projectId: string }) {
  const { project, events: initialEvents, isLoading, error, saveStatus: projectSaveStatus, updateTitle } =
    useProject(projectId)
  const { selectedEventId, selectEvent } = useSelectedEvent()
  const {
    events,
    setEvents,
    addEvent,
    deleteEvent,
    reorderEvents,
    updateEvent,
    isLoading: eventsLoading,
  } = useEvents(projectId, initialEvents as Event[])

  const [editorSaveStatus, setEditorSaveStatus] = useState<SaveStatus>('idle')
  const hasInitializedEvents = useRef(false)

  // Combine save statuses - show the most "active" one
  const combinedSaveStatus: SaveStatus =
    editorSaveStatus === 'saving' || projectSaveStatus === 'saving'
      ? 'saving'
      : editorSaveStatus === 'error' || projectSaveStatus === 'error'
        ? 'error'
        : editorSaveStatus === 'saved' || projectSaveStatus === 'saved'
          ? 'saved'
          : 'idle'

  // Sync events when initial data loads
  useEffect(() => {
    if (initialEvents.length > 0 && !hasInitializedEvents.current) {
      hasInitializedEvents.current = true
      setEvents(initialEvents as Event[])
    }
  }, [initialEvents, setEvents])

  // Auto-select first event if none selected
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      selectEvent(events[0].id)
    }
  }, [events, selectedEventId, selectEvent])

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null

  // Handle event updates from the editor
  const handleEventUpdate = useCallback(
    async (eventId: string, data: { title?: string; content?: string; locked?: boolean; metadata?: string }) => {
      await updateEvent(eventId, data)
    },
    [updateEvent]
  )

  if (isLoading) {
    return (
      <ApplicationShell>
        <TopBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading project...</div>
        </div>
      </ApplicationShell>
    )
  }

  if (error || !project) {
    return (
      <ApplicationShell>
        <TopBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Project not found'}
            </h2>
            <Link href="/projects" className="text-blue-600 hover:underline">
              Back to projects
            </Link>
          </div>
        </div>
      </ApplicationShell>
    )
  }

  const leftPane = (
    <EventList
      events={events}
      selectedEventId={selectedEventId}
      onSelectEvent={selectEvent}
      onAddEvent={addEvent}
      onDeleteEvent={deleteEvent}
      onReorderEvents={reorderEvents}
      isLoading={eventsLoading}
    />
  )

  const middlePane = (
    <EventEditor
      event={selectedEvent}
      onEventUpdate={handleEventUpdate}
      onSaveStatusChange={setEditorSaveStatus}
    />
  )

  const rightPane = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md">
            Images
          </button>
          <button className="flex-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
            Preview
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <p className="text-sm text-gray-500">
          Image discovery will appear here in Phase 7.
        </p>
      </div>
    </div>
  )

  return (
    <ApplicationShell>
      <TopBar
        title={project.title}
        onTitleChange={updateTitle}
        saveStatus={combinedSaveStatus}
        showExport
        showCommandBar
      />

      <div className="flex-1 overflow-hidden">
        <ThreePaneLayout
          leftPane={leftPane}
          middlePane={middlePane}
          rightPane={rightPane}
        />
      </div>
    </ApplicationShell>
  )
}

export default function ProjectWorkspacePage({ params }: PageProps) {
  const { id } = use(params)

  return (
    <Suspense
      fallback={
        <ApplicationShell>
          <TopBar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        </ApplicationShell>
      }
    >
      <ProjectWorkspaceContent projectId={id} />
    </Suspense>
  )
}
