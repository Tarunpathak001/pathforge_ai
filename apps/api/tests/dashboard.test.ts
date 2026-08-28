import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import prisma from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';
import { DEMO_USER_ID } from '../prisma/seed-demo-learner.js';

const app = createApp();

describe('Phase 7 Dashboard Aggregator API Tests', () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  it('GET /api/dashboard returns full aggregated dashboard schema for seeded demo learner', async () => {
    const startTime = Date.now();
    const res = await request(app)
      .get('/api/dashboard')
      .set('x-user-id', DEMO_USER_ID);
    const latency = Date.now() - startTime;

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');

    const data = res.body.data;
    expect(data.user.name).toBe('Alex Chen');
    expect(data.career.slug).toBe('backend-engineer');
    expect(data.alignment.score).toBeGreaterThanOrEqual(60);
    expect(data.alignment.explanation).toContain('Backend Engineer');
    expect(data.hasProfile).toBe(true);
    expect(data.hasGapAnalysis).toBe(true);
    expect(data.hasRoadmap).toBe(true);

    // Next best action
    expect(data.nextAction).not.toBeNull();
    expect(data.nextAction.title).toBeDefined();
    expect(data.nextAction.reason).toBeDefined();

    // Current milestone
    expect(data.currentMilestone).not.toBeNull();
    expect(data.currentMilestone.order).toBeGreaterThanOrEqual(1);

    // Roadmap preview
    expect(data.roadmap).not.toBeNull();
    expect(data.roadmap.milestones.length).toBeGreaterThan(0);

    // Skill summary
    expect(data.skillSummary.strong.length).toBeGreaterThan(0);
    expect(data.skillSummary.criticalGaps.length).toBeGreaterThan(0);

    // Recent activity
    expect(data.recentActivity.length).toBeGreaterThan(0);

    // Performance target: initial dashboard load under normal prototype execution
    console.log(`⏱ Dashboard API Latency: ${latency}ms`);
    expect(latency).toBeLessThan(1000);
  });

  it('GET /api/dashboard gracefully handles new un-onboarded user with clean empty states', async () => {
    const newUserId = 'brand-new-user-' + Date.now();
    const res = await request(app)
      .get('/api/dashboard')
      .set('x-user-id', newUserId);

    expect(res.status).toBe(200);
    expect(res.body.data.hasProfile).toBe(false);
    expect(res.body.data.hasRoadmap).toBe(false);
    expect(res.body.data.alignment).toBeNull();
    expect(res.body.data.nextAction).toBeNull();
  });

  it('POST /api/dashboard/switch-career switches target career and recalibrates alignment', async () => {
    const res = await request(app)
      .post('/api/dashboard/switch-career')
      .set('x-user-id', DEMO_USER_ID)
      .send({ careerSlug: 'devops-engineer' });

    expect(res.status).toBe(200);
    expect(res.body.data.career.slug).toBe('devops-engineer');
    expect(res.body.data.alignment.explanation).toContain('DevOps Engineer');

    // Switch back to backend-engineer for demo stability
    await request(app)
      .post('/api/dashboard/switch-career')
      .set('x-user-id', DEMO_USER_ID)
      .send({ careerSlug: 'backend-engineer' });
  });
});
