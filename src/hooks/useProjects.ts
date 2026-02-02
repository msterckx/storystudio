'use client'

import { useState, useEffect, useCallback } from 'react'

interface Project {
  id: string
  title: string
  eventCount: number
  createdAt: string
  updatedAt: string
}

interface UseProjectsReturn {
  projects: Project[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createProject: (title?: string) => Promise<Project>
  deleteProject: (id: string) => Promise<void>
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/projects')

      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }

      const data = await response.json()
      setProjects(data.projects)
    } catch (err) {
      console.error('Failed to fetch projects:', err)
      setError('Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const createProject = useCallback(async (title?: string): Promise<Project> => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })

    if (!response.ok) {
      throw new Error('Failed to create project')
    }

    const { project } = await response.json()
    setProjects((prev) => [project, ...prev])
    return project
  }, [])

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete project')
    }

    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
    createProject,
    deleteProject,
  }
}
