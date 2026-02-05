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
import { useCommandBar } from '@/hooks/useCommandBar'
import { CommandBar } from '@/components/features/command-bar/CommandBar'
import { CommandAction } from '@/lib/commands/actions'
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

  const { isOpen: commandBarOpen, open: openCommandBar, close: closeCommandBar } = useCommandBar()
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

  // Handle command bar actions
  const handleCommandExecute = useCallback(
    async (action: CommandAction): Promise<boolean> => {
      switch (action.type) {
        case 'remove_events': {
          for (const eventId of action.eventIds) {
            const success = await deleteEvent(eventId)
            if (!success) return false
          }
          return true
        }
        case 'add_event': {
          const newEvent = await addEvent(action.afterEventId)
          if (newEvent && action.topic) {
            await updateEvent(newEvent.id, { title: action.topic })
          }
          if (newEvent) selectEvent(newEvent.id)
          return !!newEvent
        }
        case 'reorder_event': {
          const currentIds = events.map((e) => e.id)
          const idx = currentIds.indexOf(action.eventId)
          if (idx === -1) return false
          const newIds = [...currentIds]
          newIds.splice(idx, 1)
          const targetPos = Math.max(0, Math.min(action.newPosition, newIds.length))
          newIds.splice(targetPos, 0, action.eventId)
          return reorderEvents(newIds)
        }
        case 'merge_events': {
          if (action.eventIds.length < 2) return false
          const toMerge = action.eventIds
            .map((id) => events.find((e) => e.id === id))
            .filter((e): e is Event => !!e)
          if (toMerge.length < 2) return false
          const mergedTitle = toMerge[0].title
          const mergedContent = toMerge.map((e) => e.content).join('\n\n')
          await updateEvent(toMerge[0].id, { title: mergedTitle, content: mergedContent })
          for (let i = 1; i < toMerge.length; i++) {
            await deleteEvent(toMerge[i].id)
          }
          selectEvent(toMerge[0].id)
          return true
        }
        case 'expand_event': {
          const event = events.find((e) => e.id === action.eventId)
          if (!event) return false
          try {
            const response = await fetch('/api/ai/expand', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                eventTitle: event.title,
                currentContent: event.content,
              }),
            })
            if (!response.ok) return false
            const data = await response.json()
            await updateEvent(event.id, { content: data.expandedContent })
            selectEvent(event.id)
            return true
          } catch {
            return false
          }
        }
        case 'expand_all': {
          for (const event of events) {
            try {
              const response = await fetch('/api/ai/expand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  eventTitle: event.title,
                  currentContent: event.content,
                }),
              })
              if (response.ok) {
                const data = await response.json()
                await updateEvent(event.id, { content: data.expandedContent })
              }
            } catch {
              // Continue with other events
            }
          }
          return true
        }
        case 'rewrite_event': {
          const event = events.find((e) => e.id === action.eventId)
          if (!event) return false
          try {
            const response = await fetch('/api/ai/rewrite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                eventTitle: event.title,
                currentContent: event.content,
                style: action.style,
              }),
            })
            if (!response.ok) return false
            const data = await response.json()
            await updateEvent(event.id, { content: data.rewrittenContent })
            selectEvent(event.id)
            return true
          } catch {
            return false
          }
        }
        case 'rewrite_all': {
          for (const event of events) {
            try {
              const response = await fetch('/api/ai/rewrite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  eventTitle: event.title,
                  currentContent: event.content,
                  style: action.style,
                }),
              })
              if (response.ok) {
                const data = await response.json()
                await updateEvent(event.id, { content: data.rewrittenContent })
              }
            } catch {
              // Continue with other events
            }
          }
          return true
        }
        case 'update_settings': {
          updateSettings(action.settings)
          return true
        }
        default:
          return false
      }
    },
    [events, addEvent, deleteEvent, reorderEvents, updateEvent, selectEvent, updateSettings]
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
        onCommandBarClick={openCommandBar}
      />

      <div className="flex-1 overflow-hidden">
        <ThreePaneLayout
          leftPane={leftPane}
          middlePane={middlePane}
          rightPane={rightPane}
        />
      </div>

      <CommandBar
        isOpen={commandBarOpen}
        onClose={closeCommandBar}
        projectId={projectId}
        events={events.map((e) => ({
          id: e.id,
          title: e.title,
          orderIndex: e.orderIndex,
        }))}
        selectedEventId={selectedEventId}
        onExecute={handleCommandExecute}
      />
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
