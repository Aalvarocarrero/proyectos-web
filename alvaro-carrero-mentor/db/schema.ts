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
