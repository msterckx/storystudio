import { ApplicationShell } from '@/components/layout/ApplicationShell'
import { TopBar } from '@/components/layout/TopBar'
import { ProjectList } from '@/components/features/projects/ProjectList'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { getAllProjects } from '@/lib/db/projects'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const projects = await getAllProjects()

  const serializedProjects = projects.map((p) => ({
    id: p.id,
    title: p.title,
    eventCount: p.eventCount,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  return (
    <ApplicationShell>
      <TopBar />

      <main className="flex-1 overflow-auto p-8">
        <ErrorBoundary>
          <div className="max-w-4xl mx-auto">
            <ProjectList initialProjects={serializedProjects} />
          </div>
        </ErrorBoundary>
      </main>
    </ApplicationShell>
  )
}
