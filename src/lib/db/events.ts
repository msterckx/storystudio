import { eq, and, sql, gt, max } from 'drizzle-orm'
import { db, schema } from '.'
import { v4 as uuid } from 'uuid'

export async function getEvents(projectId: string) {
  const events = await db
    .select()
    .from(schema.events)
    .where(eq(schema.events.projectId, projectId))
    .orderBy(schema.events.orderIndex)

  return events
}

export async function getEvent(id: string) {
  const event = await db.query.events.findFirst({
    where: eq(schema.events.id, id),
  })
  return event ?? null
}

export async function createEvent(
  projectId: string,
  data?: {
    title?: string
    content?: string
    metadata?: string
    source?: 'ai' | 'user'
    afterEventId?: string
  }
) {
  const now = new Date()
  const id = uuid()

  // Get the max order index for this project
  const [result] = await db
    .select({ maxOrder: max(schema.events.orderIndex) })
    .from(schema.events)
    .where(eq(schema.events.projectId, projectId))

  let orderIndex = (result?.maxOrder ?? -1) + 1

  // If afterEventId is specified, insert after that event
  if (data?.afterEventId) {
    const afterEvent = await getEvent(data.afterEventId)
    if (afterEvent) {
      orderIndex = afterEvent.orderIndex + 1
      // Shift all events after the insertion point
      await db
        .update(schema.events)
        .set({
          orderIndex: sql`${schema.events.orderIndex} + 1`,
        })
        .where(
          and(
            eq(schema.events.projectId, projectId),
            gt(schema.events.orderIndex, afterEvent.orderIndex)
          )
        )
    }
  }

  const [event] = await db
    .insert(schema.events)
    .values({
      id,
      projectId,
      orderIndex,
      title: data?.title || 'New Event',
      content: data?.content || '',
      metadata: data?.metadata || '{}',
      source: data?.source || 'user',
      locked: false,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  // Update project's updatedAt
  await db
    .update(schema.projects)
    .set({ updatedAt: now })
    .where(eq(schema.projects.id, projectId))

  return event
}

export async function updateEvent(
  id: string,
  data: { title?: string; content?: string; locked?: boolean }
) {
  const [event] = await db
    .update(schema.events)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schema.events.id, id))
    .returning()

  if (event) {
    // Update project's updatedAt
    await db
      .update(schema.projects)
      .set({ updatedAt: new Date() })
      .where(eq(schema.projects.id, event.projectId))
  }

  return event ?? null
}

export async function deleteEvent(id: string): Promise<void> {
  const event = await getEvent(id)
  if (!event) return

  await db.delete(schema.events).where(eq(schema.events.id, id))

  // Reindex remaining events
  const remainingEvents = await getEvents(event.projectId)
  for (let i = 0; i < remainingEvents.length; i++) {
    if (remainingEvents[i].orderIndex !== i) {
      await db
        .update(schema.events)
        .set({ orderIndex: i })
        .where(eq(schema.events.id, remainingEvents[i].id))
    }
  }

  // Update project's updatedAt
  await db
    .update(schema.projects)
    .set({ updatedAt: new Date() })
    .where(eq(schema.projects.id, event.projectId))
}

export async function reorderEvents(
  projectId: string,
  eventIds: string[]
): Promise<void> {
  const now = new Date()

  // Update each event's orderIndex based on its position in the array
  for (let i = 0; i < eventIds.length; i++) {
    await db
      .update(schema.events)
      .set({ orderIndex: i, updatedAt: now })
      .where(
        and(eq(schema.events.id, eventIds[i]), eq(schema.events.projectId, projectId))
      )
  }

  // Update project's updatedAt
  await db
    .update(schema.projects)
    .set({ updatedAt: now })
    .where(eq(schema.projects.id, projectId))
}
