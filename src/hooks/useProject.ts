'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSaveStatus } from './useSaveStatus'

interface Event {
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

interface Project {
  id: string
  title: string
  settings: string
  createdAt: string
  updatedAt: string
}

interface UseProjectReturn {
  project: Project | null
  events: Event[]
  isLoading: boolean
  error: string | null
  saveStatus: ReturnType<typeof useSaveStatus>['status']
  updateTitle: (title: string) => void
  updateSettings: (settings: Record<string, unknown>) => void
}

export function useProject(projectId: string): UseProjectReturn {
  const [project, setProject] = useState<Project | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { status: saveStatus, save } = useSaveStatus()

  useEffect(() => {
    async function fetchProject() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/projects/${projectId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('Project not found')
          } else {
            setError('Failed to load project')
          }
          return
        }

        const data = await response.json()
        setProject(data.project)
        setEvents(data.events)
      } catch (err) {
        console.error('Failed to fetch project:', err)
        setError('Failed to load project')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  const updateTitle = useCallback(
    (title: string) => {
      if (!project) return

      // Optimistic update
      setProject((prev) => (prev ? { ...prev, title } : null))

      // Debounced save
      save(async () => {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        })

        if (!response.ok) {
          throw new Error('Failed to save')
        }
      })
    },
    [project, projectId, save]
  )

  const updateSettings = useCallback(
    (settings: Record<string, unknown>) => {
      if (!project) return

      const settingsStr = JSON.stringify(settings)
      // Optimistic update
      setProject((prev) => (prev ? { ...prev, settings: settingsStr } : null))

      save(async () => {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings }),
        })

        if (!response.ok) {
          throw new Error('Failed to save settings')
        }
      })
    },
    [project, projectId, save]
  )

  return {
    project,
    events,
    isLoading,
    error,
    saveStatus,
    updateTitle,
    updateSettings,
  }
}
