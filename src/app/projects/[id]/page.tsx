'use client'

import { use, Suspense, useState, useCallback, useEffect, useRef } from 'react'
import { ApplicationShell } from '@/components/layout/ApplicationShell'
import { TopBar } from '@/components/layout/TopBar'
import { ThreePaneLayout } from '@/components/layout/ThreePaneLayout'
import { EventList } from '@/components/features/events/EventList'
import { EventEditor } from '@/components/features/editor/EventEditor'
import { ImagePanel } from '@/components/features/images/ImagePanel'
import { useProject } from '@/hooks/useProject'
import { useEvents, Event } from '@/hooks/useEvents'
import { useSelectedEvent } from '@/hooks/useSelectedEvent'
import { SaveStatus } from '@/types'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

function ProjectWorkspaceContent({ projectId }: { projectId: string }) {
  const { project, events: initialEvents, isLoading, error, saveStatus: projectSaveStatus, updateTitle, updateSettings } =
    useProject(projectId)
  const { selectedEventId, selectEvent } = useSelectedEvent()
  const {
    events,
    setEvents,
    addEvent,
    deleteEvent,
    reorderEvents,
    updateEvent,
    splitEvent,
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

  // Handle split events from AI action
  const handleSplitEvent = useCallback(
    async (eventId: string, newEvents: { title: string; content: string }[]) => {
      const result = await splitEvent(eventId, newEvents)
      if (result) {
        // Select the first of the new events
        selectEvent(events[0]?.id || null)
      }
      return result
    },
    [splitEvent, selectEvent, events]
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
      allEvents={events}
      onEventUpdate={handleEventUpdate}
      onSplitEvent={handleSplitEvent}
      onSaveStatusChange={setEditorSaveStatus}
    />
  )

  const rightPane = (
    <ImagePanel
      projectId={projectId}
      eventId={selectedEventId}
      eventTitle={selectedEvent?.title || ''}
      eventContent={selectedEvent?.content || ''}
      events={events.map((e) => ({ id: e.id, title: e.title, content: e.content }))}
      projectSettings={project.settings}
      onSettingsChange={updateSettings}
    />
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
