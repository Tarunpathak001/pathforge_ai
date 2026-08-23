import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { seedDatabase } from '../prisma/seed.js';
import prisma from '../src/db/client.js';

const app = createApp();
const TEST_USER_ID = 'test-path-learner';

describe('Learning Path API Integration Tests', () => {
  beforeAll(async () => {
    await seedDatabase();

    await prisma.learningPath.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.recommendation.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.skillGapAnalysis.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.user.deleteMany({ where: { id: TEST_USER_ID } });

    await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        email: 'path-tester@pathforge.ai',
        name: 'Learning Path Tester',
        profile: {
          create: {
            targetRole: 'Backend Engineer',
            technicalLevel: 'INTERMEDIATE',
            skills: {
              create: [
                { name: 'Java', normalizedName: 'java', selfReportedLevel: 4 },
                { name: 'SQL', normalizedName: 'sql', selfReportedLevel: 3 },
                { name: 'Spring Boot', normalizedName: 'spring boot', selfReportedLevel: 2 },
                { name: 'REST APIs', normalizedName: 'rest apis', selfReportedLevel: 1 },
                { name: 'Docker', normalizedName: 'docker', selfReportedLevel: 2 },
              ],
            },
            preference: {
              create: {
                learningFormat: 'HANDS_ON',
                difficultyPreference: 'CHALLENGING',
                weeklyAvailabilityHours: '10-15',
                projectPreference: 'PRACTICAL_PROJECTS',
              },
            },
          },
        },
      },
    });
  }, 30000);

  it('POST /api/learning-path/generate generates, validates, and persists a roadmap', async () => {
    const res = await request(app)
      .post('/api/learning-path/generate')
      .set('x-user-id', TEST_USER_ID)
      .send({ careerSlug: 'backend-engineer', weeklyHours: 10 });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toBeDefined();

    const path = res.body.data;
    expect(path.id).toBeDefined();
    expect(path.careerSlug).toBe('backend-engineer');
    expect(path.status).toBe('ACTIVE');
    expect(path.estimatedHours).toBeGreaterThan(0);
    expect(path.estimatedWeeks).toBeGreaterThan(0);
    expect(path.milestones.length).toBeGreaterThanOrEqual(3);

    // Verify milestone properties
    const firstMilestone = path.milestones[0];
    expect(firstMilestone.order).toBe(1);
    expect(firstMilestone.title).toBeDefined();
    expect(firstMilestone.description).toBeDefined();
    expect(Array.isArray(firstMilestone.learningObjectives)).toBe(true);
    expect(firstMilestone.learningObjectives.length).toBeGreaterThan(0);
    expect(Array.isArray(firstMilestone.completionCriteria)).toBe(true);
    expect(firstMilestone.completionCriteria.length).toBeGreaterThan(0);
    expect(firstMilestone.whyThisOrder).toBeDefined();
  });

  it('GET /api/learning-path retrieves latest active learning roadmap', async () => {
    const res = await request(app)
      .get('/api/learning-path')
      .set('x-user-id', TEST_USER_ID);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.careerSlug).toBe('backend-engineer');
    expect(res.body.data.status).toBe('ACTIVE');
    expect(res.body.data.milestones.length).toBeGreaterThan(0);
  });

  it('GET /api/learning-path/:id retrieves single learning roadmap by ID', async () => {
    const listRes = await request(app)
      .get('/api/learning-path')
      .set('x-user-id', TEST_USER_ID);

    const pathId = listRes.body.data.id;
    expect(pathId).toBeDefined();

    const res = await request(app)
      .get(`/api/learning-path/${pathId}`)
      .set('x-user-id', TEST_USER_ID);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.id).toBe(pathId);
    expect(res.body.data.milestones.length).toBeGreaterThan(0);
  });

  it('GET /api/learning-path/:id/milestones retrieves path milestones', async () => {
    const listRes = await request(app)
      .get('/api/learning-path')
      .set('x-user-id', TEST_USER_ID);

    const pathId = listRes.body.data.id;

    const res = await request(app)
      .get(`/api/learning-path/${pathId}/milestones`)
      .set('x-user-id', TEST_USER_ID);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/learning-path/:id/regenerate archives old path and creates a new active path', async () => {
    const listRes = await request(app)
      .get('/api/learning-path')
      .set('x-user-id', TEST_USER_ID);

    const oldPathId = listRes.body.data.id;

    const res = await request(app)
      .post(`/api/learning-path/${oldPathId}/regenerate`)
      .set('x-user-id', TEST_USER_ID)
      .send({ weeklyHours: 15 });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.id).not.toBe(oldPathId);
    expect(res.body.data.status).toBe('ACTIVE');

    // Verify old path is now archived in DB
    const oldRecord = await prisma.learningPath.findUnique({ where: { id: oldPathId } });
    expect(oldRecord?.status).toBe('ARCHIVED');
  });

  it('GET /api/learning-path/:id rejects unauthorized access', async () => {
    const listRes = await request(app)
      .get('/api/learning-path')
      .set('x-user-id', TEST_USER_ID);

    const pathId = listRes.body.data.id;

    const res = await request(app)
      .get(`/api/learning-path/${pathId}`)
      .set('x-user-id', 'unauthorized-user-id');

    expect(res.status).toBe(404);
  });
});
