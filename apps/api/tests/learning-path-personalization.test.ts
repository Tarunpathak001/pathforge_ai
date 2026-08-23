import { describe, it, expect, beforeAll } from 'vitest';
import prisma from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';
import { learningPathService } from '../src/services/learning-path-service.js';
import { validateLearningPath } from '@pathforge/shared';

describe('Learning Path Personalization & Validation Tests (Sections 32-35)', () => {
  const LEARNER_A_ID = 'learner-a-experienced';
  const LEARNER_B_ID = 'learner-b-beginner';
  const GOLDEN_USER_ID = 'golden-learner-backend';

  beforeAll(async () => {
    await seedDatabase();

    // Clean up test users
    const testIds = [LEARNER_A_ID, LEARNER_B_ID, GOLDEN_USER_ID];
    await prisma.learningPath.deleteMany({ where: { userId: { in: testIds } } });
    await prisma.recommendation.deleteMany({ where: { userId: { in: testIds } } });
    await prisma.skillGapAnalysis.deleteMany({ where: { userId: { in: testIds } } });
    await prisma.user.deleteMany({ where: { id: { in: testIds } } });

    // 1. Golden Learner
    await prisma.user.create({
      data: {
        id: GOLDEN_USER_ID,
        email: 'golden@pathforge.ai',
        name: 'Golden Learner',
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
                weeklyAvailabilityHours: '10-15',
                projectPreference: 'PRACTICAL_PROJECTS',
              },
            },
          },
        },
      },
    });

    // 2. Learner A (Experienced: Java 5, Spring Boot 4, REST APIs 4, SQL 4)
    await prisma.user.create({
      data: {
        id: LEARNER_A_ID,
        email: 'learner-a@pathforge.ai',
        name: 'Learner A (Experienced)',
        profile: {
          create: {
            targetRole: 'Backend Engineer',
            technicalLevel: 'ADVANCED',
            skills: {
              create: [
                { name: 'Java', normalizedName: 'java', selfReportedLevel: 5 },
                { name: 'Spring Boot', normalizedName: 'spring boot', selfReportedLevel: 4 },
                { name: 'REST APIs', normalizedName: 'rest apis', selfReportedLevel: 4 },
                { name: 'SQL', normalizedName: 'sql', selfReportedLevel: 4 },
                { name: 'Docker', normalizedName: 'docker', selfReportedLevel: 2 },
              ],
            },
            preference: {
              create: {
                learningFormat: 'HANDS_ON',
                weeklyAvailabilityHours: '10-15',
              },
            },
          },
        },
      },
    });

    // 3. Learner B (Beginner: Java 2, Spring Boot 0, REST APIs 0, SQL 2)
    await prisma.user.create({
      data: {
        id: LEARNER_B_ID,
        email: 'learner-b@pathforge.ai',
        name: 'Learner B (Beginner)',
        profile: {
          create: {
            targetRole: 'Backend Engineer',
            technicalLevel: 'BEGINNER',
            skills: {
              create: [
                { name: 'Java', normalizedName: 'java', selfReportedLevel: 2 },
                { name: 'SQL', normalizedName: 'sql', selfReportedLevel: 2 },
              ],
            },
            preference: {
              create: {
                learningFormat: 'MIXED',
                weeklyAvailabilityHours: '10-15',
              },
            },
          },
        },
      },
    });
  }, 30000);

  // Section 33: Golden Test Case
  it('Golden Test Case (Section 33): generates prerequisite-correct backend roadmap for standard learner', async () => {
    const path = await learningPathService.generateLearningPath(GOLDEN_USER_ID, {
      careerSlug: 'backend-engineer',
      weeklyHours: 10,
    });

    expect(path.careerSlug).toBe('backend-engineer');
    expect(path.status).toBe('ACTIVE');
    expect(path.milestones.length).toBeGreaterThanOrEqual(4);

    // Verify REST APIs appears before System Design
    const restIdx = path.milestones.findIndex(m => m.skills.some(s => s.skillSlug === 'rest-apis'));
    const sysDesignIdx = path.milestones.findIndex(m => m.skills.some(s => s.skillSlug === 'system-design'));

    expect(restIdx).toBeGreaterThanOrEqual(0);
    if (sysDesignIdx >= 0) {
      expect(sysDesignIdx).toBeGreaterThan(restIdx);
    }

    // Mastered Java (4/5) must not be in the roadmap skills
    const hasJavaAsNewSkill = path.milestones.some(m => m.skills.some(s => s.skillSlug === 'java'));
    expect(hasJavaAsNewSkill).toBe(false);

    // Verify objectives, completion criteria, and whyThisOrder
    for (const m of path.milestones) {
      expect(m.learningObjectives.length).toBeGreaterThan(0);
      expect(m.completionCriteria.length).toBeGreaterThan(0);
      expect(m.whyThisOrder.length).toBeGreaterThan(0);
    }
  });

  // Section 34: Two-Learner Personalization Test
  it('Two-Learner Personalization Test (Section 34): Experienced vs Beginner produce meaningfully different roadmaps', async () => {
    const pathA = await learningPathService.generateLearningPath(LEARNER_A_ID, {
      careerSlug: 'backend-engineer',
      weeklyHours: 10,
    });

    const pathB = await learningPathService.generateLearningPath(LEARNER_B_ID, {
      careerSlug: 'backend-engineer',
      weeklyHours: 10,
    });

    // Learner A already knows Java, Spring Boot, REST APIs, SQL -> should have fewer foundational milestones
    const pathASkillSlugs = pathA.milestones.flatMap(m => m.skills.map(s => s.skillSlug));
    const pathBSkillSlugs = pathB.milestones.flatMap(m => m.skills.map(s => s.skillSlug));

    expect(pathASkillSlugs).not.toContain('rest-apis');
    expect(pathASkillSlugs).not.toContain('spring-boot');

    expect(pathBSkillSlugs).toContain('rest-apis');

    // Total learning hours for Learner B should be higher than Learner A
    expect(pathB.estimatedHours).toBeGreaterThan(pathA.estimatedHours);
  });

  // Section 35: Workload Personalization Test
  it('Workload Personalization Test (Section 35): 5 hrs/wk vs 15 hrs/wk scales duration without changing content', async () => {
    const pathPartTime = await learningPathService.generateLearningPath(GOLDEN_USER_ID, {
      careerSlug: 'backend-engineer',
      weeklyHours: 5,
    });

    const pathFullTime = await learningPathService.generateLearningPath(GOLDEN_USER_ID, {
      careerSlug: 'backend-engineer',
      weeklyHours: 15,
    });

    // Content and milestone hours should be identical
    expect(pathPartTime.estimatedHours).toBe(pathFullTime.estimatedHours);
    expect(pathPartTime.milestones.length).toBe(pathFullTime.milestones.length);

    // Duration in weeks should be significantly longer for part-time (5 hrs/wk)
    expect(pathPartTime.estimatedWeeks).toBeGreaterThan(pathFullTime.estimatedWeeks);
  });

  // Section 32: Path Validation Engine Tests
  it('Path Validation Engine (Section 32): detects dependency ordering violations and invalid paths', () => {
    const validPathReport: any = {
      title: 'Valid Path',
      description: 'Valid roadmap description',
      weeklyHours: 10,
      estimatedHours: 40,
      estimatedWeeks: 4,
      milestones: [
        {
          title: 'Milestone 1: Foundations',
          description: 'REST APIs',
          order: 1,
          estimatedHours: 20,
          estimatedWeeks: 2,
          learningObjectives: ['Learn HTTP', 'Build REST API'],
          completionCriteria: ['Deploy CRUD endpoint'],
          whyThisOrder: 'First step',
          status: 'NOT_STARTED',
          skills: [{ skillSlug: 'rest-apis', skillName: 'REST APIs', targetLevel: 4 }],
          resources: [{ resourceId: 'res-1', role: 'PRIMARY', estimatedHours: 10 }],
        },
        {
          title: 'Milestone 2: Frameworks',
          description: 'Spring Boot',
          order: 2,
          estimatedHours: 20,
          estimatedWeeks: 2,
          learningObjectives: ['Learn Spring Boot'],
          completionCriteria: ['Build Spring service'],
          whyThisOrder: 'Second step',
          status: 'NOT_STARTED',
          skills: [{ skillSlug: 'spring-boot', skillName: 'Spring Boot', targetLevel: 4 }],
          resources: [{ resourceId: 'res-2', role: 'PRIMARY', estimatedHours: 10 }],
        },
      ],
    };

    const prereqs = [
      { skillSlug: 'spring-boot', prerequisiteSlug: 'rest-apis', skillId: 'spring-boot', prerequisiteSkillId: 'rest-apis' },
    ];

    // 1. Valid path passes
    const validResult = validateLearningPath(validPathReport, { prerequisites: prereqs });
    expect(validResult.isValid).toBe(true);

    // 2. Inverted prerequisite violation: Milestone 1 has Spring Boot, Milestone 2 has REST APIs
    const invertedPathReport = {
      ...validPathReport,
      milestones: [
        {
          ...validPathReport.milestones[1],
          order: 1,
          skills: [{ skillSlug: 'spring-boot', skillName: 'Spring Boot', targetLevel: 4 }],
        },
        {
          ...validPathReport.milestones[0],
          order: 2,
          skills: [{ skillSlug: 'rest-apis', skillName: 'REST APIs', targetLevel: 4 }],
        },
      ],
    };

    const invalidResult = validateLearningPath(invertedPathReport, { prerequisites: prereqs });
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.some(e => e.includes('Prerequisite ordering violation'))).toBe(true);
  });
});
