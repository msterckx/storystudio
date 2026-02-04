'use client'

import { use, Suspense } from 'react'
import { ApplicationShell } from '@/components/layout/ApplicationShell'
import { TopBar } from '@/components/layout/TopBar'
import { ThreePaneLayout } from '@/components/layout/ThreePaneLayout'
import { EventList } from '@/components/features/events/EventList'
import { useProject } from '@/hooks/useProject'
import { useEvents, Event } from '@/hooks/useEvents'
import { useSelectedEvent } from '@/hooks/useSelectedEvent'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

function ProjectWorkspaceContent({ projectId }: { projectId: string }) {
  const { project, events: initialEvents, isLoading, error, saveStatus, updateTitle } =
    useProject(projectId)
  const { selectedEventId, selectEvent } = useSelectedEvent()
  const {
    events,
    setEvents,
    addEvent,
    deleteEvent,
    reorderEvents,
    isLoading: eventsLoading,
  } = useEvents(projectId, initialEvents as Event[])

  // Sync events when initial data loads
  if (initialEvents.length > 0 && events.length === 0) {
    setEvents(initialEvents as Event[])
  }

  // Auto-select first event if none selected
  if (events.length > 0 && !selectedEventId) {
    selectEvent(events[0].id)
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId)

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
    <div className="h-full flex flex-col">
      {selectedEvent ? (
        <>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedEvent.title}
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="prose max-w-none">
              {selectedEvent.content ? (
                <p className="text-gray-600">{selectedEvent.content}</p>
              ) : (
                <p className="text-gray-400 italic">
                  No content yet. The event editor will be available in Phase 4.
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="p-6 border-b border-gray-200">
            <p className="text-gray-400 text-sm">Select an event to edit</p>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="prose max-w-none">
              <p className="text-gray-600">
                The event editor will be available in Phase 4.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
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
        saveStatus={saveStatus}
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
