import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const content = sqliteTable('content', { id: text('id').primaryKey(), value: text('value').notNull() });
export const appointments = sqliteTable('appointments', { id: text('id').primaryKey(), name: text('name').notNull(), email: text('email').notNull(), service: text('service').notNull(), date: text('date').notNull(), timezone: text('timezone').notNull(), status: text('status').notNull().default('New'), createdAt: text('created_at').notNull() });
