import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import prisma from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';

const app = createApp();

describe('Phase 6 Assessment Engine API Tests', () => {
  const testUserId = 'test-assessment-user-' + Date.now();
  let createdProfileId: string;
  let restAssessment: any;

  beforeAll(async () => {
    await seedDatabase();

    const user = await prisma.user.create({
      data: {
        id: testUserId,
        email: `${testUserId}@example.com`,
        name: 'Assessment Test User',
      },
    });

    const profile = await prisma.learnerProfile.create({
      data: {
        userId: user.id,
        targetRole: 'Backend Engineer',
        technicalLevel: 'BEGINNER',
        skills: {
          create: [{ name: 'REST APIs', normalizedName: 'rest-apis', selfReportedLevel: 1 }],
        },
      },
    });
    createdProfileId = profile.id;

    restAssessment = await prisma.assessment.findUnique({
      where: { slug: 'rest-api-assessment' },
      include: { questions: true },
    });
  });

  afterAll(async () => {
    await prisma.assessmentAnswer.deleteMany({
      where: { attempt: { learnerProfileId: createdProfileId } },
    });
    await prisma.assessmentAttempt.deleteMany({
      where: { learnerProfileId: createdProfileId },
    });
    await prisma.skillEvidence.deleteMany({ where: { learnerProfileId: createdProfileId } });
    await prisma.skillState.deleteMany({ where: { learnerProfileId: createdProfileId } });
    await prisma.learnerProfile.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
  });

  it('GET /api/assessments returns active assessment list', async () => {
    const res = await request(app).get('/api/assessments');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(5);
  });

  it('GET /api/assessments/:id returns questions with sanitized answers', async () => {
    const res = await request(app).get(`/api/assessments/${restAssessment.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.questions.length).toBeGreaterThan(0);
    // Correct answers and explanations MUST NOT be exposed before taking
    expect(res.body.data.questions[0].correctAnswer).toBeUndefined();
    expect(res.body.data.questions[0].explanation).toBeUndefined();
  });

  it('POST /api/assessments/:id/attempt performs server-side grading and records evidence', async () => {
    // Build answers matching correct answers
    const answers = restAssessment.questions.map((q: any) => ({
      questionId: q.id,
      selectedAnswer: q.correctAnswer,
    }));

    const res = await request(app)
      .post(`/api/assessments/${restAssessment.id}/attempt`)
      .set('x-user-id', testUserId)
      .send({
        assessmentId: restAssessment.id,
        answers,
        timeSpentSeconds: 120,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.score).toBe(100);
    expect(res.body.data.passed).toBe(true);
    expect(res.body.data.correctCount).toBe(restAssessment.questions.length);

    // Verify SkillEvidence was created
    const evidence = await prisma.skillEvidence.findMany({
      where: { learnerProfileId: createdProfileId, evidenceType: 'ASSESSMENT' },
    });
    expect(evidence.length).toBeGreaterThan(0);
    expect(evidence[0].score).toBe(100);

    // Verify SkillState was updated with high confidence
    const state = await prisma.skillState.findFirst({
      where: { learnerProfileId: createdProfileId },
    });
    expect(state).not.toBeNull();
    expect(state!.inferredLevel).toBeGreaterThanOrEqual(4);
    expect(state!.confidence).toBeGreaterThanOrEqual(0.8);
  });
});
