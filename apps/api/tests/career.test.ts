import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import prisma from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';

const app = createApp();

describe('Career API Integration Tests', () => {
  beforeAll(async () => {
    // Ensure database is seeded with knowledge base
    await seedDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/careers returns list of all seeded careers with core skill preview', async () => {
    const res = await request(app).get('/api/careers');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.results).toBeGreaterThanOrEqual(12);
    expect(Array.isArray(res.body.data)).toBe(true);

    const backendRole = res.body.data.find((c: any) => c.slug === 'backend-engineer');
    expect(backendRole).toBeDefined();
    expect(backendRole.name).toBe('Backend Engineer');
    expect(backendRole.category).toBe('Engineering');
    expect(backendRole.totalSkillsCount).toBeGreaterThan(5);
    expect(backendRole.coreSkillsCount).toBeGreaterThan(0);
    expect(backendRole.coreSkillsPreview.length).toBeGreaterThan(0);
  });

  it('GET /api/careers?category=Engineering filters careers by category', async () => {
    const res = await request(app).get('/api/careers?category=Engineering');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.results).toBeGreaterThan(0);
    for (const career of res.body.data) {
      expect(career.category).toBe('Engineering');
    }
  });

  it('GET /api/careers?search=backend performs case-insensitive search', async () => {
    const res = await request(app).get('/api/careers?search=backend');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.results).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].slug).toBe('backend-engineer');
  });

  it('GET /api/careers/:slug returns career details with grouped skills and graph data', async () => {
    const res = await request(app).get('/api/careers/backend-engineer');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.career.name).toBe('Backend Engineer');
    expect(res.body.data.skillsByImportance).toBeDefined();
    expect(res.body.data.skillsByImportance.core.length).toBeGreaterThan(0);
    expect(res.body.data.skillsByImportance.high.length).toBeGreaterThan(0);

    // Verify REST APIs and SQL are in core or high
    const allSkills = [
      ...res.body.data.skillsByImportance.core,
      ...res.body.data.skillsByImportance.high,
      ...res.body.data.skillsByImportance.medium,
      ...res.body.data.skillsByImportance.optional,
    ];
    const restSkill = allSkills.find((s: any) => s.skill.slug === 'rest-apis');
    expect(restSkill).toBeDefined();
    expect(restSkill.requiredLevel).toBeGreaterThanOrEqual(3);
    expect(restSkill.rationale).toBeDefined();

    // Verify graph structure
    expect(res.body.data.prerequisiteGraph).toBeDefined();
    expect(res.body.data.prerequisiteGraph.nodes.length).toBeGreaterThan(0);
    expect(res.body.data.prerequisiteGraph.edges.length).toBeGreaterThan(0);
  });

  it('GET /api/careers/:slug returns 404 for unknown career', async () => {
    const res = await request(app).get('/api/careers/non-existent-role');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toContain('not found');
  });

  it('GET /api/careers/:slug/skills returns full skills array with rationale and required levels', async () => {
    const res = await request(app).get('/api/careers/backend-engineer/skills');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.results).toBeGreaterThan(0);

    const firstSkill = res.body.data[0];
    expect(firstSkill.name).toBeDefined();
    expect(firstSkill.requiredLevel).toBeGreaterThanOrEqual(1);
    expect(firstSkill.requiredLevel).toBeLessThanOrEqual(5);
    expect(firstSkill.importance).toBeDefined();
  });
});
