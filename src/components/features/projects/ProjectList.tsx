'use client'

import { useState } from 'react'
import { ProjectCard } from './ProjectCard'
import { CreateProjectModal } from './CreateProjectModal'
import { DeleteProjectDialog } from './DeleteProjectDialog'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'

export interface Project {
  id: string
  title: string
  eventCount: number
  createdAt: string
  updatedAt: string
}

interface ProjectListProps {
  initialProjects: Project[]
}

export function ProjectList({ initialProjects }: ProjectListProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const handleCreate = async (title: string) => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })

    if (!response.ok) {
      throw new Error('Failed to create project')
    }

    const { project } = await response.json()
    router.push(`/projects/${project.id}`)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    const response = await fetch(`/api/projects/${deleteTarget.id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete project')
    }

    setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const handleDeleteClick = (id: string) => {
    const project = projects.find((p) => p.id === id)
    if (project) {
      setDeleteTarget(project)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>+ New Project</Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              No projects yet
            </h2>
            <p className="text-gray-500 mb-6">
              Create your first story to get started with StoryStudio.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              eventCount={project.eventCount}
              updatedAt={new Date(project.updatedAt)}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />

      <DeleteProjectDialog
        isOpen={deleteTarget !== null}
        projectTitle={deleteTarget?.title ?? ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}
