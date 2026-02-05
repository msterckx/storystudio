import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  settings: text('settings').notNull().default('{}'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  orderIndex: integer('order_index').notNull(),
  title: text('title').notNull(),
  content: text('content').default(''),
  metadata: text('metadata').notNull().default('{}'),
  source: text('source', { enum: ['ai', 'user'] }).notNull().default('user'),
  locked: integer('locked', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const images = sqliteTable('images', {
  id: text('id').primaryKey(),
  sourceUrl: text('source_url').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  fullUrl: text('full_url').notNull(),
  source: text('source').notNull(),
  license: text('license').notNull().default(''),
  title: text('title').default(''),
  creator: text('creator').default(''),
  date: text('date').default(''),
  medium: text('medium').default(''),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const eventImages = sqliteTable('event_images', {
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  imageId: text('image_id')
    .notNull()
    .references(() => images.id, { onDelete: 'cascade' }),
  explanation: text('explanation').default(''),
  explanationLocked: integer('explanation_locked', { mode: 'boolean' }).notNull().default(false),
  selected: integer('selected', { mode: 'boolean' }).notNull().default(false),
  dismissed: integer('dismissed', { mode: 'boolean' }).notNull().default(false),
  orderIndex: integer('order_index').notNull().default(0),
})

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type Image = typeof images.$inferSelect
export type EventImage = typeof eventImages.$inferSelect
