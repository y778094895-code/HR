import { pgTable, uuid, varchar, text, timestamp, integer, jsonb, primaryKey } from 'drizzle-orm/pg-core';
import { employeesLocal } from './employees-local.schema';

export const skillCatalog = pgTable('skill_catalog', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    category: varchar('category', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const employeeSkills = pgTable('employee_skills', {
    employeeId: uuid('employee_id').references(() => employeesLocal.id).notNull(),
    skillId: uuid('skill_id').references(() => skillCatalog.id).notNull(),
    level: integer('level').default(1), // 1-5 scale
    acquiredAt: timestamp('acquired_at').defaultNow(),
}, (t) => ({
    pk: primaryKey({ columns: [t.employeeId, t.skillId] }),
}));

export const trainingPrograms = pgTable('training_programs', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    provider: varchar('provider', { length: 100 }),
    durationHours: integer('duration_hours'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const trainingEnrollments = pgTable('training_enrollments', {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id').references(() => employeesLocal.id).notNull(),
    programId: uuid('program_id').references(() => trainingPrograms.id).notNull(),
    status: varchar('status', { length: 50 }).default('enrolled'), // enrolled, in_progress, completed, cancelled
    enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
});

export const trainingNeedPredictions = pgTable('training_need_predictions', {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id').references(() => employeesLocal.id).notNull(),
    predictedSkillGaps: jsonb('predicted_skill_gaps'), // { "skill_name": gap_score, ... }
    modelVersion: varchar('model_version', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Skill = typeof skillCatalog.$inferSelect;
export type NewSkill = typeof skillCatalog.$inferInsert;

export type EmployeeSkill = typeof employeeSkills.$inferSelect;
export type NewEmployeeSkill = typeof employeeSkills.$inferInsert;

export type TrainingProgram = typeof trainingPrograms.$inferSelect;
export type NewTrainingProgram = typeof trainingPrograms.$inferInsert;

export type TrainingEnrollment = typeof trainingEnrollments.$inferSelect;
export type NewTrainingEnrollment = typeof trainingEnrollments.$inferInsert;

export type TrainingNeedPrediction = typeof trainingNeedPredictions.$inferSelect;
export type NewTrainingNeedPrediction = typeof trainingNeedPredictions.$inferInsert;
