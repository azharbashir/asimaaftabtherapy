import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const content = sqliteTable('content', { id: text('id').primaryKey(), value: text('value').notNull() });
export const appointments = sqliteTable('appointments', { id: text('id').primaryKey(), name: text('name').notNull(), email: text('email').notNull(), phone: text('phone'), sessionType: text('session_type'), message: text('message'), service: text('service').notNull(), date: text('date').notNull(), timezone: text('timezone').notNull(), status: text('status').notNull().default('New'), createdAt: text('created_at').notNull() });
// Uploaded images (base64), served by /api/images/[id]. Small by design: the dashboard resizes before upload.
export const images = sqliteTable('images', { id: text('id').primaryKey(), mime: text('mime').notNull(), data: text('data').notNull(), createdAt: text('created_at').notNull() });

export const users = sqliteTable('users', { id: text('id').primaryKey(), authId: text('auth_id').unique(), passwordHash: text('password_hash'), name: text('name').notNull(), email: text('email').notNull().unique(), role: text('role', {enum:['admin','user']}).notNull().default('user'), createdAt: text('created_at').notNull() });

export const sessions = sqliteTable('sessions', {id:text('id').primaryKey(),userId:text('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}),expiresAt:text('expires_at').notNull()});
export const loginAttempts = sqliteTable('login_attempts', {email:text('email').primaryKey(),count:text('count').notNull(),resetAt:text('reset_at').notNull()});
