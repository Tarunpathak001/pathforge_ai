import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import prisma from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';

describe('Phase 9 End-to-End Golden User Journey Integration Test', () => {
  const app = createApp();
  const journeyUserId = 'e2e-competition-learner-id';
  let journeyProfileId: string;
  let journeyCareerSlug = 'backend-engineer';
  let testResourceId: string;
  let restAssessment: any;
  let journeyConversationId: string;

  beforeAll(async () => {
    // Ensure clean database seed state
    await seedDatabase();

    // Fetch REST API assessment with questions
    restAssessment = await prisma.assessment.findUnique({
      where: { slug: 'rest-api-assessment' },
      include: { questions: true },
    });

    // Pick a test resource
    const res = await prisma.learningResource.findFirst({
      where: { isActive: true },
    });
    testResourceId = res!.id;
  });

  afterAll(async () => {
    try {
      await prisma.assessmentAnswer.deleteMany({
        where: { attempt: { learnerProfile: { userId: journeyUserId } } },
      });
      await prisma.assessmentAttempt.deleteMany({
        where: { learnerProfile: { userId: journeyUserId } },
      });
      await prisma.learningFeedback.deleteMany({
        where: { learnerProfile: { userId: journeyUserId } },
      });
      await prisma.skillEvidence.deleteMany({
        where: { learnerProfile: { userId: journeyUserId } },
      });
      await prisma.skillState.deleteMany({
        where: { learnerProfile: { userId: journeyUserId } },
      });
      await prisma.skillGapResult.deleteMany({
        where: { analysis: { learnerProfile: { userId: journeyUserId } } },
      });
      await prisma.skillGapAnalysis.deleteMany({
        where: { learnerProfile: { userId: journeyUserId } },
      });
      await prisma.learningPath.deleteMany({
        where: { userId: journeyUserId },
      });
      await prisma.recommendation.deleteMany({
        where: { learnerProfile: { userId: journeyUserId } },
      });
      await prisma.resourceProgress.deleteMany({
        where: { learnerProfile: { userId: journeyUserId } },
      });
      await prisma.learnerProfile.deleteMany({
        where: { userId: journeyUserId },
      });
      await prisma.user.deleteMany({
        where: { id: journeyUserId },
      });
    } catch {}
  });

  it('Step 1: Onboarding & Profile Creation', async () => {
    // Clean up existing user if needed
    await prisma.user.deleteMany({ where: { id: journeyUserId } });

    // Create User record first
    await prisma.user.create({
      data: {
        id: journeyUserId,
        email: 'e2e-learner@pathforge.ai',
        name: 'Jordan Lee (E2E Competition Demo)',
      },
    });

    // Create Learner Profile
    const profilePayload = {
      userId: journeyUserId,
      targetRole: 'Backend Engineer',
      careerGoalDescription: 'Aspiring senior backend developer building distributed systems',
      targetIndustry: 'Technology',
      targetTimeline: '6-12 months',
      educationLevel: 'Bachelor of Computer Science',
      technicalLevel: 'INTERMEDIATE',
      skills: [
        { name: 'Java', selfReportedLevel: 4 },
        { name: 'SQL', selfReportedLevel: 3 },
        { name: 'Spring Boot', selfReportedLevel: 2 },
        { name: 'REST APIs', selfReportedLevel: 1 },
      ],
      projects: [
        {
          name: 'Task Manager API',
          description: 'Basic REST services',
          technologies: ['Java', 'SQL'],
        },
      ],
      learningExperiences: [
        {
          courseName: 'Core Java Programming',
          provider: 'Coursera',
          status: 'COMPLETED',
        },
      ],
      interests: [
        { category: 'TECHNICAL', topic: 'Distributed Systems' },
      ],
      preference: {
        learningFormat: 'PROJECTS',
        difficultyPreference: 'CHALLENGING',
        weeklyAvailabilityHours: '10-15',
        projectPreference: 'PROJECTS',
      },
    };

    const profileRes = await request(app)
      .post('/api/profile')
      .set('x-user-id', journeyUserId)
      .send(profilePayload);

    expect(profileRes.status).toBe(201);
    expect(profileRes.body.status).toBe('success');
    expect(profileRes.body.data.targetRole).toBe('Backend Engineer');
    journeyProfileId = profileRes.body.data.id;
  });

  it('Step 2: Career Analysis & Skill Gap Intelligence', async () => {
    const gapRes = await request(app)
      .post('/api/skill-gap/analyze')
      .set('x-user-id', journeyUserId)
      .send({
        careerSlug: journeyCareerSlug,
      });

    expect(gapRes.status).toBe(200);
    expect(gapRes.body.status).toBe('success');
    expect(gapRes.body.data.readinessScore).toBeGreaterThan(0);
    expect(gapRes.body.data.readinessScore).toBeLessThanOrEqual(100);
    expect(gapRes.body.data.criticalGaps.length).toBeGreaterThan(0);

    const criticalSlugs = gapRes.body.data.criticalGaps.map((g: any) => g.skillSlug);
    expect(criticalSlugs).toContain('rest-apis');
  });

  it('Step 3: Intelligent Learning Resource Recommendations', async () => {
    const recRes = await request(app)
      .post('/api/recommendations/generate')
      .set('x-user-id', journeyUserId)
      .send({
        careerSlug: journeyCareerSlug,
        maxPerGap: 3,
        includeSemantic: true,
      });

    expect(recRes.status).toBe(200);
    expect(recRes.body.status).toBe('success');
    expect(recRes.body.data.groups.length).toBeGreaterThan(0);

    const restGroup = recRes.body.data.groups.find((g: any) => g.skillSlug === 'rest-apis');
    expect(restGroup).toBeDefined();
    expect(restGroup.recommendations.length).toBeGreaterThan(0);
  });

  it('Step 4: Personalized Learning Path & Roadmap Generator', async () => {
    const pathRes = await request(app)
      .post('/api/learning-path/generate')
      .set('x-user-id', journeyUserId)
      .send({
        careerSlug: journeyCareerSlug,
        weeklyHours: 10,
        regenerate: true,
      });

    expect(pathRes.status).toBe(200);
    expect(pathRes.body.status).toBe('success');
    expect(pathRes.body.data.milestones.length).toBeGreaterThan(0);

    const milestone1 = pathRes.body.data.milestones[0];
    expect(milestone1.order).toBe(1);
    expect(milestone1.status).toBe('IN_PROGRESS');
    expect(milestone1.skills.length).toBeGreaterThan(0);
  });

  it('Step 5: Resource Progress Tracking', async () => {
    const startRes = await request(app)
      .post(`/api/progress/resources/${testResourceId}/start`)
      .set('x-user-id', journeyUserId);

    expect(startRes.status).toBe(200);
    expect(startRes.body.status).toBe('success');
    expect(startRes.body.data.status).toBe('IN_PROGRESS');

    const updateRes = await request(app)
      .patch(`/api/progress/resources/${testResourceId}`)
      .set('x-user-id', journeyUserId)
      .send({ progressPercent: 100 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('COMPLETED');
  });

  it('Step 6: Assessment Submission & Evidence Logging', async () => {
    expect(restAssessment).toBeDefined();
    const perfectAnswers = restAssessment.questions.map((q: any) => ({
      questionId: q.id,
      selectedAnswer: q.correctAnswer,
    }));

    const attemptRes = await request(app)
      .post(`/api/assessments/${restAssessment.id}/attempt`)
      .set('x-user-id', journeyUserId)
      .send({
        assessmentId: restAssessment.id,
        answers: perfectAnswers,
        timeSpentSeconds: 150,
      });

    expect(attemptRes.status).toBe(200);
    expect(attemptRes.body.data.score).toBe(100);
    expect(attemptRes.body.data.passed).toBe(true);
  });

  it('Step 7: Adaptive Recalculation & Milestone Progression', async () => {
    const adaptRes = await request(app)
      .post('/api/adaptive/recalculate')
      .set('x-user-id', journeyUserId)
      .send({
        careerSlug: journeyCareerSlug,
      });

    expect(adaptRes.status).toBe(200);
    expect(adaptRes.body.status).toBe('success');

    const changeSummary = adaptRes.body.data;
    expect(changeSummary.gapsResolved).toContain('REST APIs');
    expect(changeSummary.careerAlignment.after).toBeGreaterThanOrEqual(changeSummary.careerAlignment.before);
  });

  it('Step 8: Unified Dashboard Aggregator Endpoint', async () => {
    const dashRes = await request(app)
      .get(`/api/dashboard?careerSlug=${journeyCareerSlug}`)
      .set('x-user-id', journeyUserId);

    expect(dashRes.status).toBe(200);
    expect(dashRes.body.status).toBe('success');

    const d = dashRes.body.data;
    expect(d.hasProfile).toBe(true);
    expect(d.hasRoadmap).toBe(true);
    expect(d.hasGapAnalysis).toBe(true);
    expect(d.nextAction).not.toBeNull();
    expect(d.currentMilestone).not.toBeNull();
  });

  it('Step 9: Grounded Career Copilot Conversation & Budget Reasoning', async () => {
    // 1. Create conversation
    const convRes = await request(app)
      .post('/api/copilot/conversations')
      .set('x-user-id', journeyUserId)
      .send({
        title: 'E2E Demo Chat',
      });

    expect(convRes.status).toBe(201);
    expect(convRes.body.status).toBe('success');
    journeyConversationId = convRes.body.data.conversationId;

    // 2. Ask Next Action Query
    const msgRes1 = await request(app)
      .post(`/api/copilot/conversations/${journeyConversationId}/messages`)
      .set('x-user-id', journeyUserId)
      .send({
        content: 'What should I learn today?',
      });

    expect(msgRes1.status).toBe(200);
    expect(msgRes1.body.status).toBe('success');
    expect(msgRes1.body.data.role).toBe('ASSISTANT');
    expect(msgRes1.body.data.intent).toBe('NEXT_ACTION');
    expect(msgRes1.body.data.groundingSources.length).toBeGreaterThan(0);

    // 3. Ask Budget Planning Query
    const msgRes2 = await request(app)
      .post(`/api/copilot/conversations/${journeyConversationId}/messages`)
      .set('x-user-id', journeyUserId)
      .send({
        content: 'I only have 5 hours this week. What should I focus on?',
      });

    expect(msgRes2.status).toBe(200);
    expect(msgRes2.body.data.intent).toBe('PLANNING');
    expect(msgRes2.body.data.content).toContain('5');

    // 4. Ask Roadmap Change Query
    const msgRes3 = await request(app)
      .post(`/api/copilot/conversations/${journeyConversationId}/messages`)
      .set('x-user-id', journeyUserId)
      .send({
        content: 'Why did my roadmap change?',
      });

    expect(msgRes3.status).toBe(200);
    expect(msgRes3.body.data.intent).toBe('ROADMAP');
    expect(msgRes3.body.data.content.length).toBeGreaterThan(30);
  });

  it('Step 10: Health & Readiness Production Endpoints', async () => {
    // Health Liveness
    const healthRes = await request(app).get('/health');
    expect(healthRes.status).toBe(200);
    expect(healthRes.body.status).toBe('ok');

    // Health Readiness
    const readyRes = await request(app).get('/health/ready');
    expect(readyRes.status).toBe(200);
    expect(readyRes.body.status).toBe('ready');
    expect(readyRes.body.database).toBe('connected');
    expect(readyRes.body.dataset.seeded).toBe(true);
    expect(readyRes.body.dataset.skills).toBeGreaterThan(0);
    expect(readyRes.body.dataset.careers).toBeGreaterThan(0);
  });
});
