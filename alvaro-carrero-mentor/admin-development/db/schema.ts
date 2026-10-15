import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const feedback = sqliteTable('feedback', {
 id: text('id').primaryKey(),
 createdAt: integer('created_at').notNull(),
 language: text('language').notNull(),
 useful: text('useful').notNull(),
 improve: text('improve').notNull(),
 support: text('support').notNull(),
 replyRequested: integer('reply_requested',{mode:'boolean'}).notNull(),
 name: text('name'),
 email: text('email'),
}, (table)=>[index('feedback_created_at_idx').on(table.createdAt)]);
export const feedbackRateLimits = sqliteTable('feedback_rate_limits', {
 bucket: text('bucket').primaryKey(),
 expiresAt: integer('expires_at').notNull(),
 requests: integer('requests').notNull(),
}, (table)=>[index('feedback_rate_limits_expiry_idx').on(table.expiresAt)]);
export const learningNotes = sqliteTable('learning_notes', {
 id: text('id').primaryKey(),
 createdAt: integer('created_at').notNull(),
 reviewedAt: integer('reviewed_at').notNull(),
 summary: text('summary').notNull(),
});
export const retentionRuns = sqliteTable('retention_runs', {
 ranAt: integer('ran_at').primaryKey(),
 feedbackDeleted: integer('feedback_deleted').notNull(),
 countersDeleted: integer('counters_deleted').notNull(),
});

// Additive homepage CMS. Existing feedback, learning and retention records remain unchanged.
export const contentState = sqliteTable('content_state', {
 id: text('id').primaryKey(),
 schemaVersion: integer('schema_version').notNull(),
 version: integer('version').notNull(),
 draft: text('draft').notNull(),
 published: text('published'),
 publishedVersion: integer('published_version'),
 updatedAt: integer('updated_at').notNull(),
 updatedBy: text('updated_by').notNull(),
 operationId: text('operation_id').notNull(),
});
export const contentRevisions = sqliteTable('content_revisions', {
 id: text('id').primaryKey(),
 action: text('action').notNull(),
 version: integer('version').notNull(),
 snapshot: text('snapshot').notNull(),
 actorId: text('actor_id').notNull(),
 createdAt: integer('created_at').notNull(),
}, (table) => [index('content_revisions_created_at_idx').on(table.createdAt)]);
