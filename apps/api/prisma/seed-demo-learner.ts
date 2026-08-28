import prisma from '../src/db/client.js';
import { skillGapService } from '../src/services/skill-gap-service.js';
import { learningPathService } from '../src/services/learning-path-service.js';
import { recommendationService } from '../src/services/recommendation-service.js';
import { skillInferenceService } from '../src/services/skill-inference-service.js';

export const DEMO_USER_ID = 'demo-learner-id';

/**
 * Seeds a realistic, deterministic competition demo profile for PathForge AI.
 */
export async function seedDemoLearner() {
  console.log('👤 Seeding Realistic Demo Learner Profile (Alex Chen)...');

  // 1. Create or upsert Demo User
  const user = await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {
      name: 'Alex Chen',
      email: 'alex.chen@pathforge.ai',
    },
    create: {
      id: DEMO_USER_ID,
      name: 'Alex Chen',
      email: 'alex.chen@pathforge.ai',
    },
  });

  // 2. Clear old demo data for clean idempotency
  await prisma.learningFeedback.deleteMany({ where: { learnerProfile: { userId: user.id } } });
  await prisma.assessmentAnswer.deleteMany({ where: { attempt: { learnerProfile: { userId: user.id } } } });
  await prisma.assessmentAttempt.deleteMany({ where: { learnerProfile: { userId: user.id } } });
  await prisma.resourceProgress.deleteMany({ where: { learnerProfile: { userId: user.id } } });
  await prisma.skillEvidence.deleteMany({ where: { learnerProfile: { userId: user.id } } });
  await prisma.skillState.deleteMany({ where: { learnerProfile: { userId: user.id } } });
  await prisma.skillGapResult.deleteMany({ where: { analysis: { learnerProfile: { userId: user.id } } } });
  await prisma.skillGapAnalysis.deleteMany({ where: { learnerProfile: { userId: user.id } } });
  await prisma.recommendation.deleteMany({ where: { learnerProfile: { userId: user.id } } });
  await prisma.learningPath.deleteMany({ where: { userId: user.id } });
  await prisma.learnerProfile.deleteMany({ where: { userId: user.id } });

  // 3. Create Learner Profile
  const profile = await prisma.learnerProfile.create({
    data: {
      userId: user.id,
      targetRole: 'Backend Engineer',
      technicalLevel: 'INTERMEDIATE',
      targetIndustry: 'Cloud Software & FinTech',
      targetTimeline: '3 months',
      professionalSummary:
        'Software developer with solid Java and SQL foundation looking to transition into high-scale Backend Engineering.',
      skills: {
        create: [
          { name: 'Programming Fundamentals (Java)', normalizedName: 'programming-fundamentals', selfReportedLevel: 4, yearsExperience: 2 },
          { name: 'SQL', normalizedName: 'sql', selfReportedLevel: 4, yearsExperience: 2 },
          { name: 'Database Design', normalizedName: 'database-design', selfReportedLevel: 4, yearsExperience: 2 },
          { name: 'Git & Version Control', normalizedName: 'git', selfReportedLevel: 4, yearsExperience: 2 },
          { name: 'Unit & Integration Testing', normalizedName: 'unit-integration-testing', selfReportedLevel: 4, yearsExperience: 2 },
          { name: 'Spring Boot', normalizedName: 'spring-boot', selfReportedLevel: 3, yearsExperience: 1 },
          { name: 'Docker', normalizedName: 'docker', selfReportedLevel: 3, yearsExperience: 1 },
          { name: 'Redis Caching', normalizedName: 'redis', selfReportedLevel: 3, yearsExperience: 1 },
          { name: 'REST APIs', normalizedName: 'rest-apis', selfReportedLevel: 1, yearsExperience: 0.2 },
          { name: 'Microservices Architecture', normalizedName: 'microservices', selfReportedLevel: 3, yearsExperience: 1 },
          { name: 'CI/CD Pipelines', normalizedName: 'ci-cd-pipelines', selfReportedLevel: 3, yearsExperience: 1 },
          { name: 'PostgreSQL', normalizedName: 'postgresql', selfReportedLevel: 1, yearsExperience: 0.5 },
          { name: 'Authentication & Authorization', normalizedName: 'authentication-authorization', selfReportedLevel: 1, yearsExperience: 0.5 },
          { name: 'System Design', normalizedName: 'system-design', selfReportedLevel: 1, yearsExperience: 0.2 },
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
  });

  // 4. Initial Skill Gap Analysis (Baseline)
  await skillGapService.analyzeCareerGap(user.id, { careerSlug: 'backend-engineer' });

  // 5. Seed Assessment Evidence for REST APIs (Score: 90%)
  const restAssessment = await prisma.assessment.findUnique({
    where: { slug: 'rest-api-assessment' },
    include: { questions: true },
  });

  if (restAssessment) {
    const attempt = await prisma.assessmentAttempt.create({
      data: {
        learnerProfileId: profile.id,
        assessmentId: restAssessment.id,
        score: 90,
        passed: true,
        timeSpentSeconds: 420,
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      },
    });

    const restSkill = await prisma.skill.findUnique({ where: { slug: 'rest-apis' } });
    if (restSkill) {
      await skillInferenceService.recordEvidence(profile.id, {
        skillId: restSkill.id,
        evidenceType: 'ASSESSMENT',
        sourceId: attempt.id,
        score: 90,
        confidence: 0.9,
        notes: 'Passed REST API Architecture Assessment with 90%',
      });
    }
  }

  // 6. Generate Recommendations & Active Learning Roadmap
  await recommendationService.generateRecommendations(user.id, {
    careerSlug: 'backend-engineer',
  });

  const path = await learningPathService.generateLearningPath(user.id, {
    careerSlug: 'backend-engineer',
  });

  // 7. Seed Progress on Active Path
  if (path && path.milestones && path.milestones.length >= 2) {
    const m1 = path.milestones[0];
    const m2 = path.milestones[1];

    // Mark M1 resources completed
    if (m1.resources) {
      for (const mr of m1.resources) {
        await prisma.resourceProgress.upsert({
          where: {
            learnerProfileId_resourceId: {
              learnerProfileId: profile.id,
              resourceId: mr.resourceId,
            },
          },
          update: { status: 'COMPLETED', progressPercent: 100, timeSpentMinutes: 180 },
          create: {
            learnerProfileId: profile.id,
            resourceId: mr.resourceId,
            status: 'COMPLETED',
            progressPercent: 100,
            timeSpentMinutes: 180,
            completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          },
        });
      }
    }

    // Mark M2 first resource in progress
    if (m2.resources && m2.resources.length > 0) {
      const activeRes = m2.resources[0];
      await prisma.resourceProgress.upsert({
        where: {
          learnerProfileId_resourceId: {
            learnerProfileId: profile.id,
            resourceId: activeRes.resourceId,
          },
        },
        update: { status: 'IN_PROGRESS', progressPercent: 40, timeSpentMinutes: 75 },
        create: {
          learnerProfileId: profile.id,
          resourceId: activeRes.resourceId,
          status: 'IN_PROGRESS',
          progressPercent: 40,
          timeSpentMinutes: 75,
          startedAt: new Date(),
        },
      });
    }
  }

  // 8. Seed Feedback
  const sampleRes = await prisma.learningResource.findFirst();
  if (sampleRes) {
    await prisma.learningFeedback.create({
      data: {
        learnerProfileId: profile.id,
        resourceId: sampleRes.id,
        feedbackType: 'VERY_USEFUL',
        rating: 5,
        comment: 'Clear practical guide with great real-world examples.',
      },
    });
  }

  // 9. Re-run Skill Gap Analysis after Evidence (captures alignment gain)
  await skillGapService.analyzeCareerGap(user.id, { careerSlug: 'backend-engineer' });

  console.log('✅ Demo learner profile (Alex Chen) seeded with ~72% alignment and active roadmap.');
}
