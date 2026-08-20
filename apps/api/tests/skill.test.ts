import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import prisma from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';

const app = createApp();

describe('Skill API Integration Tests', () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/skills returns all skills with parsed aliases', async () => {
    const res = await request(app).get('/api/skills');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.results).toBeGreaterThanOrEqual(60);

    const jsSkill = res.body.data.find((s: any) => s.slug === 'javascript');
    expect(jsSkill).toBeDefined();
    expect(Array.isArray(jsSkill.aliases)).toBe(true);
    expect(jsSkill.aliases).toContain('JS');
  });

  it('GET /api/skills?search=node finds Node.js by alias/name', async () => {
    const res = await request(app).get('/api/skills?search=node');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    const nodeSkill = res.body.data.find((s: any) => s.slug === 'nodejs');
    expect(nodeSkill).toBeDefined();
    expect(nodeSkill.name).toBe('Node.js');
  });

  it('GET /api/skills?search=postgres finds PostgreSQL by alias', async () => {
    const res = await request(app).get('/api/skills?search=postgres');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    const psqlSkill = res.body.data.find((s: any) => s.slug === 'postgresql');
    expect(psqlSkill).toBeDefined();
    expect(psqlSkill.name).toBe('PostgreSQL');
  });

  it('GET /api/skills?category=Frontend filters by category', async () => {
    const res = await request(app).get('/api/skills?category=Frontend');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    for (const skill of res.body.data) {
      expect(skill.category).toBe('Frontend');
    }
  });

  it('GET /api/skills/:slug returns skill with prerequisites, dependents, and careers', async () => {
    const res = await request(app).get('/api/skills/rest-apis');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.skill.name).toBe('REST APIs');

    // Prerequisites should include HTTP & Web Fundamentals
    const prereqs = res.body.data.prerequisites;
    expect(prereqs.length).toBeGreaterThan(0);
    const httpPrereq = prereqs.find((p: any) => p.skill.slug === 'http-protocols');
    expect(httpPrereq).toBeDefined();

    // Dependents should include skills like API Design or Microservices
    const dependents = res.body.data.dependents;
    expect(dependents.length).toBeGreaterThan(0);

    // Used in careers should include Backend Engineer
    const careers = res.body.data.usedInCareers;
    expect(careers.length).toBeGreaterThan(0);
    const backendRole = careers.find((c: any) => c.careerSlug === 'backend-engineer');
    expect(backendRole).toBeDefined();
    expect(backendRole.requiredLevel).toBeGreaterThanOrEqual(3);
  });

  it('GET /api/skills/:slug/prerequisites returns hierarchical tree', async () => {
    const res = await request(app).get('/api/skills/system-design/prerequisites');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.skill.slug).toBe('system-design');
    expect(res.body.data.prerequisites.length).toBeGreaterThan(0);
  });

  it('GET /api/skills/:slug/dependents returns skills dependent on this skill', async () => {
    const res = await request(app).get('/api/skills/programming-fundamentals/dependents');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.results).toBeGreaterThan(0);
  });

  it('POST /api/skills/prerequisites rejects self-prerequisite', async () => {
    const javaSkill = await prisma.skill.findUnique({ where: { slug: 'java' } });

    const res = await request(app).post('/api/skills/prerequisites').send({
      skillId: javaSkill!.id,
      prerequisiteSkillId: javaSkill!.id,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Self-prerequisite is invalid');
  });

  it('POST /api/skills/prerequisites rejects circular dependency', async () => {
    // In our seed: REST APIs requires HTTP Protocols, and HTTP Protocols requires Networking Basics.
    // Attempting to make Networking Basics require REST APIs would create a 3-node cycle!
    const restSkill = await prisma.skill.findUnique({ where: { slug: 'rest-apis' } });
    const netSkill = await prisma.skill.findUnique({ where: { slug: 'networking-basics' } });

    const res = await request(app).post('/api/skills/prerequisites').send({
      skillId: netSkill!.id,
      prerequisiteSkillId: restSkill!.id,
      strength: 'REQUIRED',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Circular dependency detected');
  });
});
