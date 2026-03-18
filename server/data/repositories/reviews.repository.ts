import { injectable, inject } from 'inversify';
import { eq, and } from 'drizzle-orm';
import { DatabaseConnection } from '../database/connection';
import {
  reviewTemplates, reviewParticipants, reviews,
} from '../models/reviews.schema';
import type {
  ReviewTemplate, NewReviewTemplate,
  ReviewParticipant, NewReviewParticipant,
  Review, NewReview,
} from '../models/reviews.schema';

@injectable()
export class ReviewsRepository {
  constructor(@inject('DatabaseConnection') private readonly db: DatabaseConnection) {}

  // ── Templates ─────────────────────────────────────────────────────────────

  async findAllTemplates(): Promise<ReviewTemplate[]> {
    return this.db.db.select().from(reviewTemplates);
  }

  async findTemplateById(id: string): Promise<ReviewTemplate | undefined> {
    const [row] = await this.db.db.select().from(reviewTemplates).where(eq(reviewTemplates.id, id));
    return row;
  }

  async createTemplate(data: NewReviewTemplate): Promise<ReviewTemplate> {
    const [row] = await this.db.db.insert(reviewTemplates).values(data).returning();
    return row;
  }

  // ── Participants ──────────────────────────────────────────────────────────

  async findParticipantsByCycle(cycleId: string): Promise<ReviewParticipant[]> {
    return this.db.db.select().from(reviewParticipants)
      .where(eq(reviewParticipants.cycleId, cycleId));
  }

  async findParticipantsByReviewer(reviewerId: string): Promise<ReviewParticipant[]> {
    return this.db.db.select().from(reviewParticipants)
      .where(eq(reviewParticipants.reviewerId, reviewerId));
  }

  async findParticipantById(id: string): Promise<ReviewParticipant | undefined> {
    const [row] = await this.db.db.select().from(reviewParticipants)
      .where(eq(reviewParticipants.id, id));
    return row;
  }

  async createParticipant(data: NewReviewParticipant): Promise<ReviewParticipant> {
    const [row] = await this.db.db.insert(reviewParticipants).values(data).returning();
    return row;
  }

  async updateParticipantStatus(id: string, status: ReviewParticipant['status']): Promise<void> {
    await this.db.db.update(reviewParticipants)
      .set({ status })
      .where(eq(reviewParticipants.id, id));
  }

  // ── Reviews ───────────────────────────────────────────────────────────────

  async findReviewByParticipant(participantId: string): Promise<Review | undefined> {
    const [row] = await this.db.db.select().from(reviews)
      .where(eq(reviews.participantId, participantId));
    return row;
  }

  async findReviewById(id: string): Promise<Review | undefined> {
    const [row] = await this.db.db.select().from(reviews).where(eq(reviews.id, id));
    return row;
  }

  async upsertReview(participantId: string, data: Partial<NewReview>): Promise<Review> {
    const existing = await this.findReviewByParticipant(participantId);
    if (existing) {
      const [row] = await this.db.db.update(reviews)
        .set(data)
        .where(eq(reviews.id, existing.id))
        .returning();
      return row;
    }
    const [row] = await this.db.db.insert(reviews)
      .values({ participantId, ...data } as NewReview)
      .returning();
    return row;
  }

  async lockReview(id: string, lockedBy: string): Promise<Review | undefined> {
    const [row] = await this.db.db.update(reviews)
      .set({ status: 'locked', lockedAt: new Date(), lockedBy })
      .where(eq(reviews.id, id))
      .returning();
    return row;
  }

  async acknowledgeReview(id: string): Promise<Review | undefined> {
    const [row] = await this.db.db.update(reviews)
      .set({ status: 'acknowledged', acknowledgedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return row;
  }

  async findReviewsByCycle(cycleId: string): Promise<Review[]> {
    return this.db.db
      .select({ review: reviews })
      .from(reviews)
      .innerJoin(reviewParticipants, eq(reviews.participantId, reviewParticipants.id))
      .where(eq(reviewParticipants.cycleId, cycleId))
      .then((rows) => rows.map((r) => r.review));
  }
}
