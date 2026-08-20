import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import prisma from '../src/db/client.js';

const app = createApp();
const testUserId = 'test-learner-123';

describe('Profile API Integration Tests', () => {
  beforeAll(async () => {
    // Ensure clean state for test user
    const existing = await prisma.user.findUnique({ where: { id: testUserId } });
    if (existing) {
      await prisma.user.delete({ where: { id: testUserId } });
    }
  });

  afterAll(async () => {
    try {
      await prisma.user.delete({ where: { id: testUserId } });
    } catch {}
    await prisma.$disconnect();
  });

  it('GET /api/profile returns 404 when profile does not exist', async () => {
    const res = await request(app).get('/api/profile').set('x-user-id', testUserId);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('fail');
  });

  it('POST /api/profile validates input and rejects empty targetRole', async () => {
    const res = await request(app).post('/api/profile').set('x-user-id', testUserId).send({
      targetRole: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.errors[0].field).toBe('targetRole');
  });

  it('POST /api/profile creates a complete learner profile with normalized skills', async () => {
    const payload = {
      userId: testUserId,
      targetRole: 'Backend Engineer',
      careerGoalDescription: 'Aspiring senior backend developer building distributed systems',
      targetIndustry: 'Technology',
      targetTimeline: '6-12 months',
      educationLevel: 'Bachelor of Computer Science',
      technicalLevel: 'INTERMEDIATE',
      skills: [
        { name: 'java', selfReportedLevel: 4 },
        { name: 'SQL', selfReportedLevel: 3 },
        { name: 'react js', selfReportedLevel: 3 },
        { name: 'Node', selfReportedLevel: 3 },
        { name: 'JAVA', selfReportedLevel: 4 }, // duplicate of java
      ],
      projects: [
        {
          name: 'Task Management SaaS',
          description: 'Full stack project with React and Node',
          technologies: ['React', 'Node.js', 'PostgreSQL'],
        },
      ],
      learningExperiences: [
        {
          courseName: 'Data Structures and Algorithms',
          provider: 'Coursera',
          status: 'COMPLETED',
        },
      ],
      certifications: [
        {
          name: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
        },
      ],
      interests: [
        { category: 'TECHNICAL', topic: 'Distributed Systems' },
        { category: 'TECHNICAL', topic: 'Cloud Computing' },
      ],
      preference: {
        learningFormat: 'MIXED',
        difficultyPreference: 'CHALLENGING',
        weeklyAvailabilityHours: '10-15',
        projectPreference: 'BALANCED',
      },
    };

    const res = await request(app).post('/api/profile').set('x-user-id', testUserId).send(payload);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.targetRole).toBe('Backend Engineer');

    // Deduplication check: Java should appear only once with normalized name
    const skills = res.body.data.skills;
    const javaSkills = skills.filter((s: any) => s.normalizedName === 'java');
    expect(javaSkills.length).toBe(1);
    expect(javaSkills[0].name).toBe('Java');

    // React JS should be normalized to React
    const reactSkill = skills.find((s: any) => s.normalizedName === 'react');
    expect(reactSkill).toBeDefined();
    expect(reactSkill.name).toBe('React');
  });

  it('GET /api/profile retrieves the created profile with all sub-entities', async () => {
    const res = await request(app).get('/api/profile').set('x-user-id', testUserId);

    expect(res.status).toBe(200);
    expect(res.body.data.targetRole).toBe('Backend Engineer');
    expect(res.body.data.skills.length).toBeGreaterThan(0);
    expect(res.body.data.projects.length).toBe(1);
    expect(res.body.data.projects[0].technologies).toContain('React');
    expect(res.body.data.interests.length).toBe(2);
    expect(res.body.data.preference.weeklyAvailabilityHours).toBe('10-15');
  });

  it('GET /api/profile/completeness calculates accurate percentage and breakdown', async () => {
    const res = await request(app).get('/api/profile/completeness').set('x-user-id', testUserId);

    expect(res.status).toBe(200);
    expect(res.body.data.percentage).toBe(100);
    expect(res.body.data.breakdown.careerGoal).toBe(true);
    expect(res.body.data.breakdown.skills).toBe(true);
    expect(res.body.data.breakdown.projects).toBe(true);
  });

  it('POST /api/profile/skills adds individual or batch skills and updates', async () => {
    const res = await request(app).post('/api/profile/skills').set('x-user-id', testUserId).send({
      name: 'docker',
      selfReportedLevel: 2,
      evidence: 'Basic containerization experiments',
    });

    expect(res.status).toBe(201);
    const addedSkill = res.body.data[0];
    expect(addedSkill.name).toBe('Docker');
    expect(addedSkill.selfReportedLevel).toBe(2);

    // Update skill level
    const updateRes = await request(app)
      .patch(`/api/profile/skills/${addedSkill.id}`)
      .send({ selfReportedLevel: 4 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.selfReportedLevel).toBe(4);

    // Delete skill
    const deleteRes = await request(app).delete(`/api/profile/skills/${addedSkill.id}`);
    expect(deleteRes.status).toBe(200);
  });

  it('POST /api/profile/projects adds, updates, and deletes projects', async () => {
    const res = await request(app)
      .post('/api/profile/projects')
      .set('x-user-id', testUserId)
      .send({
        name: 'AI Path Finder',
        description: 'Recommendation graph engine',
        technologies: ['FastAPI', 'Python', 'React'],
      });

    expect(res.status).toBe(201);
    const projId = res.body.data.id;
    expect(res.body.data.technologies).toContain('FastAPI');

    // Update project
    const updateRes = await request(app)
      .patch(`/api/profile/projects/${projId}`)
      .send({ name: 'PathForge AI Platform' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('PathForge AI Platform');

    // Delete project
    const deleteRes = await request(app).delete(`/api/profile/projects/${projId}`);
    expect(deleteRes.status).toBe(200);
  });

  it('POST /api/profile/ai-extract extracts structured profile with fallback', async () => {
    const res = await request(app).post('/api/profile/ai-extract').send({
      text: 'I want to become a Backend Engineer. I know Java and SQL and built projects in React and Node.',
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.skills.length).toBeGreaterThan(0);
  });
});
