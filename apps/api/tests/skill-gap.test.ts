import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { seedDatabase } from '../prisma/seed.js';
import prisma from '../src/db/client.js';

const app = createApp();
const TEST_USER_ID = 'test-skill-gap-learner';

describe('Skill Gap API Integration Tests', () => {
  beforeAll(async () => {
    // Seed careers, skills, prerequisites
    await seedDatabase();

    // Clean test user and profile
    await prisma.skillGapAnalysis.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.user.deleteMany({ where: { id: TEST_USER_ID } });

    // Create test user with learner profile
    await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        email: 'gap-tester@pathforge.ai',
        name: 'Gap Tester',
        profile: {
          create: {
            targetRole: 'Backend Engineer',
            technicalLevel: 'INTERMEDIATE',
            skills: {
              create: [
                { name: 'SQL', normalizedName: 'sql', selfReportedLevel: 4 }, // Required: 4 -> Strength
                { name: 'Docker', normalizedName: 'docker', selfReportedLevel: 2 }, // Required: 3 -> Developing
                { name: 'REST APIs', normalizedName: 'rest apis', selfReportedLevel: 1 }, // Required: 4 -> Developing / Critical
                { name: 'Redis', normalizedName: 'redis', selfReportedLevel: 1 }, // Required: 3 -> Developing
              ],
            },
          },
        },
      },
    });
  }, 20000);

  it('POST /api/skill-gap/analyze runs deterministic gap analysis for Backend Engineer', async () => {
    const res = await request(app)
      .post('/api/skill-gap/analyze')
      .set('x-user-id', TEST_USER_ID)
      .send({ careerSlug: 'backend-engineer' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toBeDefined();

    const report = res.body.data;
    expect(report.career.slug).toBe('backend-engineer');
    expect(typeof report.readinessScore).toBe('number');
    expect(report.readinessScore).toBeGreaterThan(0);
    expect(report.readinessScore).toBeLessThanOrEqual(100);
    expect(report.readinessBand).toBeDefined();
    expect(report.algorithmVersion).toBe('v1');

    // Strengths
    const strengthSlugs = report.strengths.map((s: any) => s.skillSlug);
    expect(strengthSlugs).toContain('sql');

    // Developing
    const developingSlugs = report.developingSkills.map((s: any) => s.skillSlug);
    expect(developingSlugs).toContain('docker');
    expect(developingSlugs).toContain('rest-apis');
    expect(developingSlugs).toContain('redis');

    // Critical Gaps
    const criticalSlugs = report.criticalGaps.map((s: any) => s.skillSlug);
    expect(criticalSlugs).toContain('rest-apis');

    // Action Queue
    expect(Array.isArray(report.actionQueue)).toBe(true);
    expect(report.actionQueue.length).toBeGreaterThan(0);
  });

  it('GET /api/skill-gap/latest retrieves the latest saved analysis', async () => {
    const res = await request(app).get('/api/skill-gap/latest').set('x-user-id', TEST_USER_ID);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.career.slug).toBe('backend-engineer');
    expect(res.body.data.id).toBeDefined();
  });

  it('GET /api/skill-gap/:id retrieves analysis by ID', async () => {
    const latestRes = await request(app)
      .get('/api/skill-gap/latest')
      .set('x-user-id', TEST_USER_ID);

    const analysisId = latestRes.body.data.id;

    const res = await request(app)
      .get(`/api/skill-gap/${analysisId}`)
      .set('x-user-id', TEST_USER_ID);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.id).toBe(analysisId);
  });

  it('GET /api/skill-gap lists analysis history', async () => {
    const res = await request(app).get('/api/skill-gap').set('x-user-id', TEST_USER_ID);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/skill-gap/analyze returns 404 for invalid career slug', async () => {
    const res = await request(app)
      .post('/api/skill-gap/analyze')
      .set('x-user-id', TEST_USER_ID)
      .send({ careerSlug: 'non-existent-career-slug' });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  it('GET /api/skill-gap/:id rejects access from unauthorized user', async () => {
    const latestRes = await request(app)
      .get('/api/skill-gap/latest')
      .set('x-user-id', TEST_USER_ID);

    const analysisId = latestRes.body.data.id;

    const res = await request(app)
      .get(`/api/skill-gap/${analysisId}`)
      .set('x-user-id', 'other-unauthorized-user');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });
});
