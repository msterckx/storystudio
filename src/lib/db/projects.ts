import { eq, desc, sql } from 'drizzle-orm'
import { db, schema } from '.'
import { v4 as uuid } from 'uuid'

export type ProjectWithEventCount = {
  id: string
  title: string
  settings: string
  createdAt: Date
  updatedAt: Date
  eventCount: number
}

export async function getAllProjects(): Promise<ProjectWithEventCount[]> {
  const projects = await db
    .select({
      id: schema.projects.id,
      title: schema.projects.title,
      settings: schema.projects.settings,
      createdAt: schema.projects.createdAt,
      updatedAt: schema.projects.updatedAt,
      eventCount: sql<number>`(
        SELECT COUNT(*) FROM events WHERE events.project_id = projects.id
      )`.as('event_count'),
    })
    .from(schema.projects)
    .orderBy(desc(schema.projects.updatedAt))

  return projects
}

export async function getProject(id: string) {
  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, id),
  })
  return project ?? null
}

export async function getProjectWithEvents(id: string) {
  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, id),
  })

  if (!project) return null

  const events = await db
    .select()
    .from(schema.events)
    .where(eq(schema.events.projectId, id))
    .orderBy(schema.events.orderIndex)

  return { project, events }
}

export async function createProject(title?: string) {
  const now = new Date()
  const id = uuid()

  const [project] = await db
    .insert(schema.projects)
    .values({
      id,
      title: title || 'Untitled Project',
      settings: '{}',
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  return project
}

export async function updateProject(
  id: string,
  data: { title?: string; settings?: string }
) {
  const [project] = await db
    .update(schema.projects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schema.projects.id, id))
    .returning()

  return project ?? null
}

export async function deleteProject(id: string): Promise<void> {
  // Events are cascade deleted due to foreign key constraint
  await db.delete(schema.projects).where(eq(schema.projects.id, id))
}
