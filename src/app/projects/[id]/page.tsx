'use client'

import { use } from 'react'
import { ApplicationShell } from '@/components/layout/ApplicationShell'
import { TopBar } from '@/components/layout/TopBar'
import { ThreePaneLayout } from '@/components/layout/ThreePaneLayout'
import { useProject } from '@/hooks/useProject'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ProjectWorkspacePage({ params }: PageProps) {
  const { id } = use(params)
  const { project, isLoading, error, saveStatus, updateTitle } = useProject(id)

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

  // Placeholder pane contents
  const leftPane = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Events</h2>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <p className="text-sm text-gray-500 mb-4">
          Event management will be added in Phase 3.
        </p>
        <button className="w-full p-2 text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50">
          + Add Event
        </button>
      </div>
    </div>
  )

  const middlePane = (
    <div className="h-full flex flex-col">
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
