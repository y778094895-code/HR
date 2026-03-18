import {
  pgTable, uuid, varchar, timestamp, smallint, boolean, jsonb,
  numeric, pgEnum, unique,
} from 'drizzle-orm/pg-core';
import { employeesLocal } from './employees-local.schema';
import { performanceCycles } from './performance-goals.schema';
import { users } from './users.schema';

export const cycleTypeEnum = pgEnum('cycle_type', ['annual', 'mid_year', 'quarterly']);
export const cycleStatusEnum = pgEnum('cycle_status', ['scheduled', 'active', 'calibration', 'closed']);
export const reviewerTypeEnum = pgEnum('reviewer_type', ['self', 'manager', 'peer']);
export const participantStatusEnum = pgEnum('participant_status', ['pending', 'in_progress', 'submitted', 'overdue']);
export const reviewStatusEnum = pgEnum('review_status', ['draft', 'submitted', 'calibrated', 'locked', 'acknowledged']);

// Review templates — define competency sections and rating scale per cycle
export const reviewTemplates = pgTable('review_templates', {
  id:               uuid('id').defaultRandom().primaryKey(),
  name:             varchar('name', { length: 255 }).notNull(),
  ratingScale:      smallint('rating_scale').notNull().default(5),
  // [{ key, label_en, label_ar, weight }]
  sections:         jsonb('sections').notNull().default([]),
  openTextEnabled:  boolean('open_text_enabled').notNull().default(true),
  createdAt:        timestamp('created_at').defaultNow().notNull(),
});

// Participants — who reviews whom in a cycle
export const reviewParticipants = pgTable('review_participants', {
  id:           uuid('id').defaultRandom().primaryKey(),
  cycleId:      uuid('cycle_id').references(() => performanceCycles.id, { onDelete: 'cascade' }).notNull(),
  revieweeId:   uuid('reviewee_id').references(() => employeesLocal.id).notNull(),
  reviewerId:   uuid('reviewer_id').references(() => employeesLocal.id).notNull(),
  reviewerType: reviewerTypeEnum('reviewer_type').notNull(),
  status:       participantStatusEnum('status').notNull().default('pending'),
  assignedAt:   timestamp('assigned_at').defaultNow().notNull(),
}, (t) => ({
  uqParticipant: unique().on(t.cycleId, t.revieweeId, t.reviewerId),
}));

// Reviews — the actual form submission for one participant slot
export const reviews = pgTable('reviews', {
  id:                 uuid('id').defaultRandom().primaryKey(),
  participantId:      uuid('participant_id').references(() => reviewParticipants.id, { onDelete: 'cascade' }).notNull().unique(),
  ratings:            jsonb('ratings').notNull().default({}),
  comments:           jsonb('comments').notNull().default({}),
  goalAttainmentPct:  numeric('goal_attainment_pct', { precision: 5, scale: 2 }),
  compositeScore:     numeric('composite_score', { precision: 5, scale: 2 }),
  status:             reviewStatusEnum('status').notNull().default('draft'),
  submittedAt:        timestamp('submitted_at'),
  lockedAt:           timestamp('locked_at'),
  lockedBy:           uuid('locked_by').references(() => users.id),
  acknowledgedAt:     timestamp('acknowledged_at'),
});

export type ReviewTemplate     = typeof reviewTemplates.$inferSelect;
export type NewReviewTemplate  = typeof reviewTemplates.$inferInsert;
export type ReviewParticipant  = typeof reviewParticipants.$inferSelect;
export type NewReviewParticipant = typeof reviewParticipants.$inferInsert;
export type Review             = typeof reviews.$inferSelect;
export type NewReview          = typeof reviews.$inferInsert;
