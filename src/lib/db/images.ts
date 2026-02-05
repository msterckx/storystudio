import { db } from './index'
import { images, eventImages } from './schema'
import { eq, and } from 'drizzle-orm'

export interface ImageData {
  id: string
  sourceUrl: string
  thumbnailUrl: string
  fullUrl: string
  source: string
  license: string
  title?: string
  creator?: string
  date?: string
  medium?: string
}

// Upsert image record (may already exist from another event)
export async function upsertImage(data: ImageData) {
  const existing = await db.select().from(images).where(eq(images.id, data.id)).get()

  if (existing) return existing

  const now = new Date()
  const [inserted] = await db
    .insert(images)
    .values({
      id: data.id,
      sourceUrl: data.sourceUrl,
      thumbnailUrl: data.thumbnailUrl,
      fullUrl: data.fullUrl,
      source: data.source,
      license: data.license,
      title: data.title || '',
      creator: data.creator || '',
      date: data.date || '',
      medium: data.medium || '',
      createdAt: now,
    })
    .returning()

  return inserted
}

// Select an image for an event
export async function selectImageForEvent(eventId: string, imageData: ImageData) {
  // Ensure image exists
  await upsertImage(imageData)

  // Check if junction row exists
  const existing = await db
    .select()
    .from(eventImages)
    .where(and(eq(eventImages.eventId, eventId), eq(eventImages.imageId, imageData.id)))
    .get()

  if (existing) {
    // Update to selected
    await db
      .update(eventImages)
      .set({ selected: true, dismissed: false })
      .where(and(eq(eventImages.eventId, eventId), eq(eventImages.imageId, imageData.id)))
  } else {
    // Get next order index
    const maxOrder = await db
      .select()
      .from(eventImages)
      .where(and(eq(eventImages.eventId, eventId), eq(eventImages.selected, true)))
      .all()

    await db.insert(eventImages).values({
      eventId,
      imageId: imageData.id,
      selected: true,
      dismissed: false,
      orderIndex: maxOrder.length,
    })
  }
}

// Remove selected image from event
export async function deselectImageForEvent(eventId: string, imageId: string) {
  await db
    .update(eventImages)
    .set({ selected: false })
    .where(and(eq(eventImages.eventId, eventId), eq(eventImages.imageId, imageId)))
}

// Dismiss an image for an event
export async function dismissImageForEvent(eventId: string, imageData: ImageData) {
  // Ensure image exists
  await upsertImage(imageData)

  const existing = await db
    .select()
    .from(eventImages)
    .where(and(eq(eventImages.eventId, eventId), eq(eventImages.imageId, imageData.id)))
    .get()

  if (existing) {
    await db
      .update(eventImages)
      .set({ dismissed: true, selected: false })
      .where(and(eq(eventImages.eventId, eventId), eq(eventImages.imageId, imageData.id)))
  } else {
    await db.insert(eventImages).values({
      eventId,
      imageId: imageData.id,
      selected: false,
      dismissed: true,
      orderIndex: 0,
    })
  }
}

// Get all event images (selected and dismissed)
export async function getEventImages(eventId: string) {
  const rows = await db
    .select({
      eventId: eventImages.eventId,
      imageId: eventImages.imageId,
      selected: eventImages.selected,
      dismissed: eventImages.dismissed,
      explanation: eventImages.explanation,
      explanationLocked: eventImages.explanationLocked,
      orderIndex: eventImages.orderIndex,
      // Image fields
      sourceUrl: images.sourceUrl,
      thumbnailUrl: images.thumbnailUrl,
      fullUrl: images.fullUrl,
      source: images.source,
      license: images.license,
      title: images.title,
      creator: images.creator,
      date: images.date,
    })
    .from(eventImages)
    .innerJoin(images, eq(eventImages.imageId, images.id))
    .where(eq(eventImages.eventId, eventId))
    .all()

  return rows
}

// Get dismissed image IDs for an event
export async function getDismissedImageIds(eventId: string): Promise<string[]> {
  const rows = await db
    .select({ imageId: eventImages.imageId })
    .from(eventImages)
    .where(and(eq(eventImages.eventId, eventId), eq(eventImages.dismissed, true)))
    .all()

  return rows.map((r) => r.imageId)
}

// Get selected images for an event
export async function getSelectedImages(eventId: string) {
  const rows = await db
    .select({
      imageId: eventImages.imageId,
      selected: eventImages.selected,
      explanation: eventImages.explanation,
      orderIndex: eventImages.orderIndex,
      sourceUrl: images.sourceUrl,
      thumbnailUrl: images.thumbnailUrl,
      fullUrl: images.fullUrl,
      source: images.source,
      license: images.license,
      title: images.title,
      creator: images.creator,
      date: images.date,
    })
    .from(eventImages)
    .innerJoin(images, eq(eventImages.imageId, images.id))
    .where(and(eq(eventImages.eventId, eventId), eq(eventImages.selected, true)))
    .orderBy(eventImages.orderIndex)
    .all()

  return rows
}
