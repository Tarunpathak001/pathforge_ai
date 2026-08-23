import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { seedDatabase } from '../prisma/seed.js';
import prisma from '../src/db/client.js';

const app = createApp();
const TEST_USER_ID = 'test-rec-learner';

describe('Recommendation API Integration Tests', () => {
  beforeAll(async () => {
    // Seed careers, skills, prerequisites, and resources
    await seedDatabase();

    // Clean test user data
    await prisma.recommendation.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.skillGapAnalysis.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.user.deleteMany({ where: { id: TEST_USER_ID } });

    // Create test user with learner profile
    await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        email: 'rec-tester@pathforge.ai',
        name: 'Recommendation Tester',
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
                learningFormat: 'HANDS_ON_PROJECTS',
                difficultyPreference: 'BALANCED',
                weeklyAvailabilityHours: '10-15',
                projectPreference: 'PRACTICAL_REAL_WORLD',
              },
            },
          },
        },
      },
    });
  }, 30000);

  it('POST /api/recommendations/generate generates and persists recommendations grouped by gap', async () => {
    const res = await request(app)
      .post('/api/recommendations/generate')
      .set('x-user-id', TEST_USER_ID)
      .send({ careerSlug: 'backend-engineer', maxPerGap: 3 });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toBeDefined();

    const report = res.body.data;
    expect(report.careerSlug).toBe('backend-engineer');
    expect(report.totalRecommendations).toBeGreaterThan(0);
    expect(Array.isArray(report.groups)).toBe(true);
    expect(report.groups.length).toBeGreaterThan(0);

    // Verify REST APIs gap group
    const restGroup = report.groups.find((g: any) => g.skillSlug === 'rest-apis');
    expect(restGroup).toBeDefined();
    expect(restGroup.recommendations.length).toBeGreaterThan(0);

    const topRec = restGroup.recommendations[0];
    expect(topRec.scoreBreakdown).toBeDefined();
    expect(topRec.scoreBreakdown.finalScore).toBeGreaterThan(0.5);
    expect(topRec.scoreBreakdown.matchPercentage).toBeGreaterThan(50);
    expect(Array.isArray(topRec.explanation)).toBe(true);
    expect(topRec.explanation.length).toBeGreaterThan(0);
  });

  it('GET /api/recommendations retrieves latest saved recommendations', async () => {
    const res = await request(app)
      .get('/api/recommendations')
      .set('x-user-id', TEST_USER_ID);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.careerSlug).toBe('backend-engineer');
    expect(res.body.data.groups.length).toBeGreaterThan(0);
  });

  it('GET /api/recommendations/:id retrieves single recommendation with full score breakdown', async () => {
    const listRes = await request(app)
      .get('/api/recommendations')
      .set('x-user-id', TEST_USER_ID);

    const firstRecId = listRes.body.data.groups[0].recommendations[0].id;
    expect(firstRecId).toBeDefined();

    const res = await request(app)
      .get(`/api/recommendations/${firstRecId}`)
      .set('x-user-id', TEST_USER_ID);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.id).toBe(firstRecId);
    expect(res.body.data.finalScore).toBeDefined();
    expect(res.body.data.coverageScore).toBeDefined();
    expect(res.body.data.careerScore).toBeDefined();
  });

  it('POST /api/recommendations/generate operates cleanly in semantic fallback mode', async () => {
    const res = await request(app)
      .post('/api/recommendations/generate')
      .set('x-user-id', TEST_USER_ID)
      .send({ careerSlug: 'backend-engineer', includeSemantic: false });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.isSemanticFallback).toBe(true);
    expect(res.body.data.totalRecommendations).toBeGreaterThan(0);
  });

  it('GET /api/recommendations/:id rejects unauthorized access', async () => {
    const listRes = await request(app)
      .get('/api/recommendations')
      .set('x-user-id', TEST_USER_ID);

    const firstRecId = listRes.body.data.groups[0].recommendations[0].id;

    const res = await request(app)
      .get(`/api/recommendations/${firstRecId}`)
      .set('x-user-id', 'unauthorized-user-id');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });
});
