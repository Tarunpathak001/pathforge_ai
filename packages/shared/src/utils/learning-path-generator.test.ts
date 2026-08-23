import { describe, it, expect } from 'vitest';
import { generateLearningPath } from './learning-path-generator.js';
import { validateLearningPath } from './learning-path-validator.js';
import type { SkillGapAnalysisReport, SkillGapItem } from '../types/skill-gap.js';
import type { LearningResource } from '../types/recommendation.js';

describe('Learning Path Generator & Validator Unit Tests (Phase 5)', () => {
  const dummyPrerequisites = [
    { skillId: 'spring-boot', prerequisiteSkillId: 'rest-apis', skillSlug: 'spring-boot', prerequisiteSlug: 'rest-apis' },
    { skillId: 'rest-apis', prerequisiteSkillId: 'programming-fundamentals', skillSlug: 'rest-apis', prerequisiteSlug: 'programming-fundamentals' },
    { skillId: 'distributed-systems', prerequisiteSkillId: 'spring-boot', skillSlug: 'distributed-systems', prerequisiteSlug: 'spring-boot' },
    { skillId: 'distributed-systems', prerequisiteSkillId: 'redis', skillSlug: 'distributed-systems', prerequisiteSlug: 'redis' },
    { skillId: 'system-design', prerequisiteSkillId: 'distributed-systems', skillSlug: 'system-design', prerequisiteSlug: 'distributed-systems' },
    { skillId: 'system-design', prerequisiteSkillId: 'database-design', skillSlug: 'system-design', prerequisiteSlug: 'database-design' },
  ];

  const dummyResources: LearningResource[] = [
    {
      id: 'res-rest-1',
      title: 'REST API Guide',
      slug: 'rest-api-guide',
      description: 'HTTP and REST fundamentals',
      resourceType: 'DOCUMENTATION',
      provider: 'MDN',
      url: 'https://developer.mozilla.org',
      difficulty: 'BEGINNER',
      estimatedHours: 6,
      isFree: true,
      qualityScore: 0.95,
      isActive: true,
      skills: [{ id: '1', resourceId: 'res-rest-1', skillId: 'rest-apis', skillName: 'REST APIs', skillSlug: 'rest-apis', coverage: 'PRIMARY' }],
    },
    {
      id: 'res-spring-1',
      title: 'Spring Boot REST Project',
      slug: 'spring-boot-rest-project',
      description: 'Building microservices in Spring Boot',
      resourceType: 'PROJECT',
      provider: 'Spring.io',
      url: 'https://spring.io',
      difficulty: 'INTERMEDIATE',
      estimatedHours: 10,
      isFree: true,
      qualityScore: 0.98,
      isActive: true,
      skills: [{ id: '2', resourceId: 'res-spring-1', skillId: 'spring-boot', skillName: 'Spring Boot', skillSlug: 'spring-boot', coverage: 'PRIMARY' }],
    },
    {
      id: 'res-redis-1',
      title: 'Redis Caching Fundamentals',
      slug: 'redis-caching-fundamentals',
      description: 'In-memory caching with Redis',
      resourceType: 'COURSE',
      provider: 'Redis University',
      url: 'https://university.redis.io',
      difficulty: 'BEGINNER',
      estimatedHours: 8,
      isFree: true,
      qualityScore: 0.96,
      isActive: true,
      skills: [{ id: '3', resourceId: 'res-redis-1', skillId: 'redis', skillName: 'Redis', skillSlug: 'redis', coverage: 'PRIMARY' }],
    },
    {
      id: 'res-sys-1',
      title: 'System Design Primer',
      slug: 'system-design-primer',
      description: 'Scalable distributed systems',
      resourceType: 'DOCUMENTATION',
      provider: 'GitHub',
      url: 'https://github.com',
      difficulty: 'ADVANCED',
      estimatedHours: 20,
      isFree: true,
      qualityScore: 0.99,
      isActive: true,
      skills: [{ id: '4', resourceId: 'res-sys-1', skillId: 'system-design', skillName: 'System Design', skillSlug: 'system-design', coverage: 'PRIMARY' }],
    },
  ];

  it('generates a prerequisite-aware learning roadmap respecting topological dependencies', () => {
    const dummyGapReport: SkillGapAnalysisReport = {
      analysisId: 'test-analysis',
      userId: 'test-user',
      learnerProfileId: 'test-profile',
      career: { id: 'backend-eng', name: 'Backend Engineer', slug: 'backend-engineer' },
      readinessScore: 55,
      readinessBand: 'READY_WITH_GAPS',
      criticalGaps: [
        {
          skillId: 'rest-apis',
          skillName: 'REST APIs',
          skillSlug: 'rest-apis',
          categoryName: 'Backend',
          learnerLevel: 1,
          requiredLevel: 4,
          gap: 3,
          gapSeverity: 0.75,
          importance: 'CORE',
          importanceWeight: 1.0,
          priorityScore: 0.95,
          displayPriority: 95,
          readiness: 'READY',
          category: 'DEVELOPING',
          isCritical: true,
          explanation: 'Core API requirement',
          downstreamImpactCount: 3,
        },
        {
          skillId: 'system-design',
          skillName: 'System Design',
          skillSlug: 'system-design',
          categoryName: 'Architecture',
          learnerLevel: 0,
          requiredLevel: 4,
          gap: 4,
          gapSeverity: 1.0,
          importance: 'CORE',
          importanceWeight: 1.0,
          priorityScore: 0.9,
          displayPriority: 90,
          readiness: 'NOT_READY',
          category: 'MISSING',
          isCritical: true,
          explanation: 'Advanced architecture gap',
          downstreamImpactCount: 0,
        },
      ],
      developingSkills: [
        {
          skillId: 'spring-boot',
          skillName: 'Spring Boot',
          skillSlug: 'spring-boot',
          categoryName: 'Frameworks',
          learnerLevel: 2,
          requiredLevel: 4,
          gap: 2,
          gapSeverity: 0.5,
          importance: 'HIGH',
          importanceWeight: 0.8,
          priorityScore: 0.85,
          displayPriority: 85,
          readiness: 'PARTIALLY_READY',
          category: 'DEVELOPING',
          isCritical: false,
          explanation: 'Framework gap',
          downstreamImpactCount: 2,
        },
      ],
      missingSkills: [
        {
          skillId: 'redis',
          skillName: 'Redis',
          skillSlug: 'redis',
          categoryName: 'Database',
          learnerLevel: 0,
          requiredLevel: 3,
          gap: 3,
          gapSeverity: 1.0,
          importance: 'MEDIUM',
          importanceWeight: 0.5,
          priorityScore: 0.7,
          displayPriority: 70,
          readiness: 'READY',
          category: 'MISSING',
          isCritical: false,
          explanation: 'Caching gap',
          downstreamImpactCount: 1,
        },
      ],
      strengths: [
        {
          skillId: 'java',
          skillName: 'Java',
          skillSlug: 'java',
          categoryName: 'Programming',
          learnerLevel: 4,
          requiredLevel: 4,
          gap: 0,
          gapSeverity: 0,
          importance: 'CORE',
          importanceWeight: 1.0,
          priorityScore: 0,
          displayPriority: 0,
          readiness: 'READY',
          category: 'STRENGTH',
          isCritical: false,
          explanation: 'Mastered Java',
          downstreamImpactCount: 4,
        },
      ],
      allResults: [],
      stats: { totalRequiredSkills: 5, strengthsCount: 1, developingCount: 2, missingCount: 2, criticalGapsCount: 2, coreGapsCount: 2, averageGapSeverity: 0.65 },
      actionQueue: [],
      summaryText: 'Ready with gaps summary',
      algorithmVersion: 'v1',
      generatedAt: new Date(),
    };

    const path = generateLearningPath({
      userId: 'test-user',
      learnerProfileId: 'test-profile',
      career: { id: 'backend-eng', name: 'Backend Engineer', slug: 'backend-engineer' },
      gapReport: dummyGapReport,
      allPrerequisites: dummyPrerequisites,
      candidateResources: dummyResources,
      learnerProfile: {
        skills: [{ name: 'Java', normalizedName: 'java', selfReportedLevel: 4 }],
      },
      learnerPreference: {
        weeklyAvailabilityHours: '10-15',
      },
    });

    expect(path).toBeDefined();
    expect(path.milestones.length).toBeGreaterThanOrEqual(3);
    expect(path.estimatedHours).toBeGreaterThan(0);
    expect(path.estimatedWeeks).toBeGreaterThan(0);

    // REST APIs must come before Spring Boot and System Design
    const restMilestoneIndex = path.milestones.findIndex(m => m.skills.some(s => s.skillSlug === 'rest-apis'));
    const springMilestoneIndex = path.milestones.findIndex(m => m.skills.some(s => s.skillSlug === 'spring-boot'));
    const systemDesignMilestoneIndex = path.milestones.findIndex(m => m.skills.some(s => s.skillSlug === 'system-design'));

    expect(restMilestoneIndex).toBeGreaterThanOrEqual(0);
    expect(springMilestoneIndex).toBeGreaterThan(restMilestoneIndex);
    expect(systemDesignMilestoneIndex).toBeGreaterThan(springMilestoneIndex);

    // Java (mastered) should NOT be a new skill gap learning step
    const hasJavaSkill = path.milestones.some(m => m.skills.some(s => s.skillSlug === 'java'));
    expect(hasJavaSkill).toBe(false);

    // Validation engine check
    const validation = validateLearningPath(path, {
      prerequisites: dummyPrerequisites,
      learnerSkills: [{ name: 'Java', normalizedName: 'java', selfReportedLevel: 4 }],
    });
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('scales estimated duration proportionally with weekly availability', () => {
    const dummyGapReport: any = {
      analysisId: 'test-analysis',
      userId: 'test-user',
      learnerProfileId: 'test-profile',
      career: { id: 'backend-eng', name: 'Backend Engineer', slug: 'backend-engineer' },
      readinessScore: 50,
      criticalGaps: [
        {
          skillId: 'rest-apis',
          skillName: 'REST APIs',
          skillSlug: 'rest-apis',
          learnerLevel: 1,
          requiredLevel: 4,
          gap: 3,
          priorityScore: 0.9,
          readiness: 'READY',
          importance: 'CORE',
        },
      ],
      developingSkills: [],
      missingSkills: [],
      strengths: [],
      allResults: [],
      stats: { totalRequiredSkills: 1, strengthsCount: 0, developingCount: 1, missingCount: 0, criticalGapsCount: 1, coreGapsCount: 1, averageGapSeverity: 0.75 },
    };

    const pathPartTime = generateLearningPath({
      userId: 'test-user',
      learnerProfileId: 'test-profile',
      career: { id: 'backend-eng', name: 'Backend Engineer', slug: 'backend-engineer' },
      gapReport: dummyGapReport,
      allPrerequisites: dummyPrerequisites,
      candidateResources: dummyResources,
      learnerProfile: {},
      weeklyHoursOverride: 5,
    });

    const pathFullTime = generateLearningPath({
      userId: 'test-user',
      learnerProfileId: 'test-profile',
      career: { id: 'backend-eng', name: 'Backend Engineer', slug: 'backend-engineer' },
      gapReport: dummyGapReport,
      allPrerequisites: dummyPrerequisites,
      candidateResources: dummyResources,
      learnerProfile: {},
      weeklyHoursOverride: 20,
    });

    expect(pathPartTime.estimatedHours).toBe(pathFullTime.estimatedHours);
    expect(pathPartTime.estimatedWeeks).toBeGreaterThan(pathFullTime.estimatedWeeks);
  });
});
