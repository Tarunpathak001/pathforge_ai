import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import prisma from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';

const app = createApp();

describe('Phase 6 Adaptive Learning & Closed-Loop Engine Tests', () => {
  const goldenUserId = 'golden-adaptive-user-' + Date.now();
  let goldenProfileId: string;
  let restAssessment: any;

  beforeAll(async () => {
    await seedDatabase();

    // Setup Golden Learner: Target Backend Engineer, Java: 4, SQL: 3, Spring Boot: 2, REST APIs: 1
    const user = await prisma.user.create({
      data: {
        id: goldenUserId,
        email: `${goldenUserId}@example.com`,
        name: 'Golden Adaptation Learner',
      },
    });

    const profile = await prisma.learnerProfile.create({
      data: {
        userId: user.id,
        targetRole: 'Backend Engineer',
        technicalLevel: 'BEGINNER',
        skills: {
          create: [
            { name: 'Java', normalizedName: 'java', selfReportedLevel: 4 },
            { name: 'SQL', normalizedName: 'sql', selfReportedLevel: 3 },
            { name: 'Spring Boot', normalizedName: 'spring-boot', selfReportedLevel: 2 },
            { name: 'REST APIs', normalizedName: 'rest-apis', selfReportedLevel: 1 },
          ],
        },
      },
    });
    goldenProfileId = profile.id;

    restAssessment = await prisma.assessment.findUnique({
      where: { slug: 'rest-api-assessment' },
      include: { questions: true },
    });
  });

  afterAll(async () => {
    await prisma.assessmentAnswer.deleteMany({
      where: { attempt: { learnerProfileId: goldenProfileId } },
    });
    await prisma.assessmentAttempt.deleteMany({
      where: { learnerProfileId: goldenProfileId },
    });
    await prisma.learningFeedback.deleteMany({
      where: { learnerProfileId: goldenProfileId },
    });
    await prisma.skillEvidence.deleteMany({ where: { learnerProfileId: goldenProfileId } });
    await prisma.skillState.deleteMany({ where: { learnerProfileId: goldenProfileId } });
    await prisma.skillGapResult.deleteMany({
      where: { analysis: { learnerProfileId: goldenProfileId } },
    });
    await prisma.skillGapAnalysis.deleteMany({ where: { learnerProfileId: goldenProfileId } });
    await prisma.learningPath.deleteMany({ where: { userId: goldenUserId } });
    await prisma.learnerProfile.deleteMany({ where: { userId: goldenUserId } });
    await prisma.user.deleteMany({ where: { id: goldenUserId } });
  });

  it('Section 46: Golden Adaptation Test — High Assessment Score Resolves Gap and Unlocks Roadmap', async () => {
    // 1. Initial Skill Gap & Learning Path Generation
    const initialGapRes = await request(app)
      .post('/api/skill-gap/analyze')
      .set('x-user-id', goldenUserId)
      .send({ careerSlug: 'backend-engineer' });

    expect(initialGapRes.status).toBe(200);
    const initialReadiness = initialGapRes.body.data.readinessScore;
    const initialRestGap = initialGapRes.body.data.allResults.find(
      (r: any) => r.skillSlug === 'rest-apis'
    );
    expect(initialRestGap.learnerLevel).toBe(1);
    expect(initialRestGap.gap).toBeGreaterThan(0);

    // Initial Path
    const initialPathRes = await request(app)
      .post('/api/learning-path/generate')
      .set('x-user-id', goldenUserId)
      .send({ careerSlug: 'backend-engineer' });
    expect(initialPathRes.status).toBe(200);

    // 2. Learner takes REST API Assessment and scores 100%
    const perfectAnswers = restAssessment.questions.map((q: any) => ({
      questionId: q.id,
      selectedAnswer: q.correctAnswer,
    }));

    const attemptRes = await request(app)
      .post(`/api/assessments/${restAssessment.id}/attempt`)
      .set('x-user-id', goldenUserId)
      .send({
        assessmentId: restAssessment.id,
        answers: perfectAnswers,
        timeSpentSeconds: 150,
      });

    expect(attemptRes.status).toBe(200);
    expect(attemptRes.body.data.score).toBe(100);
    expect(attemptRes.body.data.passed).toBe(true);

    // 3. Trigger Closed-Loop Adaptation
    const adaptRes = await request(app)
      .post('/api/adaptive/recalculate')
      .set('x-user-id', goldenUserId)
      .send({ careerSlug: 'backend-engineer' });

    expect(adaptRes.status).toBe(200);
    expect(adaptRes.body.status).toBe('success');

    const changeSummary = adaptRes.body.data;
    expect(changeSummary.gapsResolved).toContain('REST APIs');
    expect(changeSummary.careerAlignment.after).toBeGreaterThan(changeSummary.careerAlignment.before);
    expect(changeSummary.explanationNarrative.length).toBeGreaterThan(0);

    // Verify SkillState record
    const skillState = await prisma.skillState.findFirst({
      where: { learnerProfileId: goldenProfileId, skill: { slug: 'rest-apis' } },
    });
    expect(skillState).not.toBeNull();
    expect(skillState!.inferredLevel).toBeGreaterThanOrEqual(4);
    expect(skillState!.confidence).toBeGreaterThanOrEqual(0.85);

    // 4. Verify Next Best Action moves forward
    const nextActionRes = await request(app)
      .get('/api/adaptive/next-action?careerSlug=backend-engineer')
      .set('x-user-id', goldenUserId);

    expect(nextActionRes.status).toBe(200);
    expect(nextActionRes.body.data).not.toBeNull();
    expect(nextActionRes.body.data.title).toBeDefined();
  });

  it('Section 47: Low-Score Adaptation Test — Low score preserves critical gap', async () => {
    const lowUserId = 'low-score-user-' + Date.now();

    const u = await prisma.user.create({
      data: { id: lowUserId, email: `${lowUserId}@example.com`, name: 'Low Score User' },
    });

    const p = await prisma.learnerProfile.create({
      data: {
        userId: u.id,
        targetRole: 'Backend Engineer',
        skills: { create: [{ name: 'REST APIs', normalizedName: 'rest-apis', selfReportedLevel: 1 }] },
      },
    });

    // Submit low score attempt (0% or 20%)
    const wrongAnswers = restAssessment.questions.map((q: any) => ({
      questionId: q.id,
      selectedAnswer: (q.correctAnswer + 1) % 4,
    }));

    const attemptRes = await request(app)
      .post(`/api/assessments/${restAssessment.id}/attempt`)
      .set('x-user-id', lowUserId)
      .send({
        assessmentId: restAssessment.id,
        answers: wrongAnswers,
        timeSpentSeconds: 60,
      });

    expect(attemptRes.status).toBe(200);
    expect(attemptRes.body.data.score).toBe(0);
    expect(attemptRes.body.data.passed).toBe(false);

    // Recalculate
    const adaptRes = await request(app)
      .post('/api/adaptive/recalculate')
      .set('x-user-id', lowUserId)
      .send({ careerSlug: 'backend-engineer' });

    expect(adaptRes.status).toBe(200);
    expect(adaptRes.body.data.gapsResolved).not.toContain('REST APIs');

    // Cleanup low user
    await prisma.assessmentAnswer.deleteMany({ where: { attempt: { learnerProfileId: p.id } } });
    await prisma.assessmentAttempt.deleteMany({ where: { learnerProfileId: p.id } });
    await prisma.skillEvidence.deleteMany({ where: { learnerProfileId: p.id } });
    await prisma.skillState.deleteMany({ where: { learnerProfileId: p.id } });
    await prisma.learningPath.deleteMany({ where: { userId: lowUserId } });
    await prisma.learnerProfile.deleteMany({ where: { userId: lowUserId } });
    await prisma.user.deleteMany({ where: { id: lowUserId } });
  });

  it('Section 48: Feedback Collection & Querying', async () => {
    const feedbackRes = await request(app)
      .post('/api/feedback')
      .set('x-user-id', goldenUserId)
      .send({
        feedbackType: 'VERY_USEFUL',
        rating: 5,
        comment: 'Excellent interactive assessment!',
      });

    expect(feedbackRes.status).toBe(201);
    expect(feedbackRes.body.data.feedbackType).toBe('VERY_USEFUL');

    const getFeedbackRes = await request(app)
      .get('/api/feedback')
      .set('x-user-id', goldenUserId);

    expect(getFeedbackRes.status).toBe(200);
    expect(getFeedbackRes.body.data.length).toBeGreaterThan(0);
  });
});
