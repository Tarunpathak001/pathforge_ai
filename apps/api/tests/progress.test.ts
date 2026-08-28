import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import prisma from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';

const app = createApp();

describe('Phase 6 Progress Engine API Tests', () => {
  const testUserId = 'test-progress-user-' + Date.now();
  let createdProfileId: string;
  let testResourceId: string;
  let testPathId: string;

  beforeAll(async () => {
    await seedDatabase();

    // Create a test user with a learner profile
    const user = await prisma.user.create({
      data: {
        id: testUserId,
        email: `${testUserId}@example.com`,
        name: 'Progress Test User',
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
            { name: 'REST APIs', normalizedName: 'rest-apis', selfReportedLevel: 1 },
          ],
        },
      },
    });
    createdProfileId = profile.id;

    // Pick a test resource
    const res = await prisma.learningResource.findFirst({
      where: { isActive: true },
    });
    testResourceId = res!.id;

    // Generate an initial learning path
    const pathRes = await request(app)
      .post('/api/learning-path/generate')
      .set('x-user-id', testUserId)
      .send({ careerSlug: 'backend-engineer' });

    testPathId = pathRes.body.data.id;
  });

  afterAll(async () => {
    await prisma.learningPath.deleteMany({ where: { userId: testUserId } });
    await prisma.resourceProgress.deleteMany({ where: { learnerProfileId: createdProfileId } });
    await prisma.skillState.deleteMany({ where: { learnerProfileId: createdProfileId } });
    await prisma.skillEvidence.deleteMany({ where: { learnerProfileId: createdProfileId } });
    await prisma.learnerProfile.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
  });

  it('POST /api/progress/resources/:id/start initializes progress to IN_PROGRESS', async () => {
    const res = await request(app)
      .post(`/api/progress/resources/${testResourceId}/start`)
      .set('x-user-id', testUserId);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.status).toBe('IN_PROGRESS');
    expect(res.body.data.resourceId).toBe(testResourceId);
  });

  it('PATCH /api/progress/resources/:id updates progress percentage with bounds checking', async () => {
    // Update to 50%
    const res = await request(app)
      .patch(`/api/progress/resources/${testResourceId}`)
      .set('x-user-id', testUserId)
      .send({ progressPercent: 50, timeSpentMinutes: 30 });

    expect(res.status).toBe(200);
    expect(res.body.data.progressPercent).toBe(50);
    expect(res.body.data.status).toBe('IN_PROGRESS');

    // Bounds check: 100% transitions to COMPLETED
    const completeRes = await request(app)
      .patch(`/api/progress/resources/${testResourceId}`)
      .set('x-user-id', testUserId)
      .send({ progressPercent: 100 });

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.progressPercent).toBe(100);
    expect(completeRes.body.data.status).toBe('COMPLETED');
  });

  it('POST /api/progress/resources/:id/complete marks resource completed', async () => {
    const res = await request(app)
      .post(`/api/progress/resources/${testResourceId}/complete`)
      .set('x-user-id', testUserId);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
    expect(res.body.data.progressPercent).toBe(100);
  });

  it('GET /api/progress/summary returns weighted path progress', async () => {
    const res = await request(app)
      .get('/api/progress/summary')
      .set('x-user-id', testUserId);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.overallProgressPercent).toBeGreaterThanOrEqual(0);
    expect(res.body.data.milestones.length).toBeGreaterThan(0);
  });
});
