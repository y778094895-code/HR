import { injectable, inject } from 'inversify';
import { ReviewsRepository } from '../../data/repositories/reviews.repository';

interface SubmitReviewDto { ratings: Record<string, number>; comments?: Record<string, string>; }

@injectable()
export class ReviewsService {
  constructor(@inject(ReviewsRepository) private readonly repo: ReviewsRepository) {}

  // ── Templates ──────────────────────────────────────────────────────────────

  async getTemplates() {
    return this.repo.findAllTemplates();
  }

  async createTemplate(data: {
    name: string;
    ratingScale?: number;
    sections: Array<{ key: string; labelEn: string; labelAr: string; weight: number }>;
    openTextEnabled?: boolean;
  }) {
    return this.repo.createTemplate({
      name: data.name,
      ratingScale: data.ratingScale ?? 5,
      sections: data.sections,
      openTextEnabled: data.openTextEnabled ?? true,
    });
  }

  // ── Participants ────────────────────────────────────────────────────────────

  async getParticipantsByCycle(cycleId: string) {
    return this.repo.findParticipantsByCycle(cycleId);
  }

  async getMyTasks(reviewerId: string) {
    return this.repo.findParticipantsByReviewer(reviewerId);
  }

  async assignParticipant(data: {
    cycleId: string;
    revieweeId: string;
    reviewerId: string;
    reviewerType: 'self' | 'manager' | 'peer';
  }) {
    return this.repo.createParticipant({ ...data, status: 'pending' });
  }

  // ── Review form ─────────────────────────────────────────────────────────────

  async saveDraft(participantId: string, dto: SubmitReviewDto) {
    return this.repo.upsertReview(participantId, {
      ratings: dto.ratings,
      comments: dto.comments ?? {},
      status: 'draft',
    });
  }

  async submit(participantId: string, dto: SubmitReviewDto, _submittedBy: string) {
    const participant = await this.repo.findParticipantById(participantId);
    if (!participant) throw new Error('Participant not found');

    // Compute composite score from ratings average (template weights would be applied here)
    const ratingValues = Object.values(dto.ratings) as number[];
    const compositeScore = ratingValues.length
      ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length
      : null;

    const review = await this.repo.upsertReview(participantId, {
      ratings: dto.ratings,
      comments: dto.comments ?? {},
      compositeScore: compositeScore ? String(compositeScore.toFixed(2)) : null,
      status: 'submitted',
      submittedAt: new Date(),
    });

    await this.repo.updateParticipantStatus(participantId, 'submitted');
    return review;
  }

  async lock(reviewId: string, lockedBy: string) {
    const review = await this.repo.findReviewById(reviewId);
    if (!review) throw new Error('Review not found');
    if (review.status !== 'submitted' && review.status !== 'calibrated') {
      throw new Error('Only submitted or calibrated reviews can be locked');
    }
    return this.repo.lockReview(reviewId, lockedBy);
  }

  async acknowledge(reviewId: string) {
    const review = await this.repo.findReviewById(reviewId);
    if (!review) throw new Error('Review not found');
    if (review.status !== 'locked') throw new Error('Only locked reviews can be acknowledged');
    return this.repo.acknowledgeReview(reviewId);
  }

  async getReport(cycleId: string, revieweeId: string) {
    const participants = await this.repo.findParticipantsByCycle(cycleId);
    const revieweeParticipants = participants.filter((p) => p.revieweeId === revieweeId);

    const reviewData = await Promise.all(
      revieweeParticipants.map(async (p) => ({
        participant: p,
        review: await this.repo.findReviewByParticipant(p.id),
      })),
    );

    const submitted = reviewData.filter((r) => r.review?.status === 'submitted' || r.review?.status === 'locked' || r.review?.status === 'acknowledged');
    if (!submitted.length) return null;

    // Aggregate composite scores
    const scores = submitted.map((r) => Number(r.review?.compositeScore ?? 0)).filter(Boolean);
    const avgComposite = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    // Peer comments (anonymised — no reviewer identity)
    const peerComments = submitted
      .filter((r) => r.participant.reviewerType === 'peer')
      .flatMap((r) => Object.values((r.review?.comments ?? {}) as Record<string, string>))
      .filter(Boolean);

    return {
      revieweeId,
      cycleId,
      compositeScore: Number(avgComposite.toFixed(2)),
      peerComments,
      reviewCount: submitted.length,
    };
  }
}
