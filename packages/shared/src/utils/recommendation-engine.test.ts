import { describe, it, expect } from 'vitest';
import {
  generateTextEmbedding,
  cosineSimilarity,
  buildResourceEmbeddingText,
  buildQueryEmbeddingText,
} from './embedding-generator.js';
import {
  scoreResource,
  applyDiversityReranking,
  rankRecommendationsForGaps,
} from './recommendation-engine.js';
import type { LearningResource, RecommendationItem } from '../types/recommendation.js';
import type { SkillGapItem } from '../types/skill-gap.js';
import type { LearnerProfile } from '../types/profile.js';

describe('Recommendation Engine Unit Tests', () => {
  const dummyGap: SkillGapItem = {
    skillId: 'rest-apis-id',
    skillName: 'REST APIs',
    skillSlug: 'rest-apis',
    categoryName: 'Backend Development',
    learnerLevel: 1,
    requiredLevel: 4,
    gap: 3,
    gapSeverity: 0.75,
    importance: 'CORE',
    importanceWeight: 1.0,
    priorityScore: 0.91,
    displayPriority: 91,
    readiness: 'READY',
    category: 'DEVELOPING',
    isCritical: true,
    explanation: 'Fundamental API communication gap',
    downstreamImpactCount: 2,
  };

  const dummyProfile: LearnerProfile = {
    id: 'p-1',
    userId: 'u-1',
    targetRole: 'Backend Engineer',
    technicalLevel: 'INTERMEDIATE',
    skills: [
      { name: 'Java', normalizedName: 'java', selfReportedLevel: 4 },
      { name: 'REST APIs', normalizedName: 'rest apis', selfReportedLevel: 1 },
      { name: 'Spring Boot', normalizedName: 'spring boot', selfReportedLevel: 2 },
    ],
  };

  it('calculates semantic similarity accurately with normalization', () => {
    const textA = 'REST API web architecture fundamentals HTTP endpoints JSON';
    const textB = 'RESTful API design and building HTTP services with JSON';
    const textC = 'Quantum physics thermodynamics astrophysics galaxies';

    const vecA = generateTextEmbedding(textA);
    const vecB = generateTextEmbedding(textB);
    const vecC = generateTextEmbedding(textC);

    const simIdentical = cosineSimilarity(vecA, vecA);
    const simSimilar = cosineSimilarity(vecA, vecB);
    const simUnrelated = cosineSimilarity(vecA, vecC);

    expect(simIdentical).toBeCloseTo(1.0, 2);
    expect(simSimilar).toBeGreaterThan(0.35);
    expect(simUnrelated).toBeLessThan(0.3);
  });

  it('rewards PRIMARY skill coverage over SUPPORTING and MENTIONED', () => {
    const resPrimary: LearningResource = {
      id: 'r-1',
      title: 'REST API Mastery',
      slug: 'rest-api-mastery',
      description: 'Complete guide to building RESTful APIs',
      resourceType: 'COURSE',
      provider: 'freeCodeCamp',
      url: 'https://freecodecamp.org/rest-api',
      difficulty: 'BEGINNER',
      estimatedHours: 6,
      language: 'en',
      isFree: true,
      qualityScore: 0.95,
      isActive: true,
      skills: [{ skillId: 'rest-apis-id', coverage: 'PRIMARY' }],
    };

    const resSupporting: LearningResource = {
      ...resPrimary,
      id: 'r-2',
      skills: [{ skillId: 'rest-apis-id', coverage: 'SUPPORTING' }],
    };

    const scoreP = scoreResource({
      resource: resPrimary,
      targetGap: dummyGap,
      careerName: 'Backend Engineer',
      careerImportance: 'CORE',
      learnerProfile: dummyProfile,
      isSemanticFallback: true,
    });

    const scoreS = scoreResource({
      resource: resSupporting,
      targetGap: dummyGap,
      careerName: 'Backend Engineer',
      careerImportance: 'CORE',
      learnerProfile: dummyProfile,
      isSemanticFallback: true,
    });

    expect(scoreP.coverageScore).toBe(1.0);
    expect(scoreS.coverageScore).toBe(0.65);
    expect(scoreP.finalScore).toBeGreaterThan(scoreS.finalScore);
  });

  it('calibrates difficulty fit for beginner vs advanced resources', () => {
    const resBeginner: LearningResource = {
      id: 'r-beg',
      title: 'Beginner REST APIs',
      slug: 'beginner-rest',
      description: 'Introductory API concepts',
      resourceType: 'COURSE',
      provider: 'Coursera',
      url: 'https://coursera.org/rest-intro',
      difficulty: 'BEGINNER',
      estimatedHours: 4,
      language: 'en',
      isFree: true,
      qualityScore: 0.9,
      isActive: true,
      skills: [{ skillId: 'rest-apis-id', coverage: 'PRIMARY' }],
    };

    const resAdvanced: LearningResource = {
      ...resBeginner,
      id: 'r-adv',
      difficulty: 'ADVANCED',
    };

    // Learner is level 1/5 (Beginner)
    const scoreB = scoreResource({
      resource: resBeginner,
      targetGap: dummyGap,
      careerName: 'Backend Engineer',
      careerImportance: 'CORE',
      learnerProfile: dummyProfile,
      isSemanticFallback: true,
    });

    const scoreA = scoreResource({
      resource: resAdvanced,
      targetGap: dummyGap,
      careerName: 'Backend Engineer',
      careerImportance: 'CORE',
      learnerProfile: dummyProfile,
      isSemanticFallback: true,
    });

    expect(scoreB.difficultyScore).toBe(1.0);
    expect(scoreA.difficultyScore).toBe(0.2);
    expect(scoreB.finalScore).toBeGreaterThan(scoreA.finalScore);
  });

  it('penalizes resources when prerequisites are blocked', () => {
    const blockedGap: SkillGapItem = {
      ...dummyGap,
      skillName: 'System Design',
      skillSlug: 'system-design',
      readiness: 'BLOCKED',
    };

    const resSysDesign: LearningResource = {
      id: 'r-sys',
      title: 'Large Scale System Design',
      slug: 'large-scale-system-design',
      description: 'Architecting distributed high-availability systems',
      resourceType: 'COURSE',
      provider: 'MIT OpenCourseWare',
      url: 'https://ocw.mit.edu/sys-design',
      difficulty: 'ADVANCED',
      estimatedHours: 20,
      language: 'en',
      isFree: true,
      qualityScore: 0.95,
      isActive: true,
      skills: [{ skillId: 'sys-design-id', coverage: 'PRIMARY' }],
    };

    const scoreBlocked = scoreResource({
      resource: resSysDesign,
      targetGap: blockedGap,
      careerName: 'Backend Engineer',
      careerImportance: 'HIGH',
      learnerProfile: dummyProfile,
      isSemanticFallback: true,
    });

    expect(scoreBlocked.prerequisiteScore).toBe(0.15);
  });

  it('applies diversity re-ranking to prevent all results having the same format', () => {
    const makeItem = (id: string, type: any, score: number): RecommendationItem => ({
      resourceId: id,
      resource: {
        id,
        title: `Resource ${id}`,
        slug: `resource-${id}`,
        description: 'desc',
        resourceType: type,
        provider: 'Test',
        url: 'https://test.com',
        difficulty: 'BEGINNER',
        estimatedHours: 5,
        language: 'en',
        isFree: true,
        qualityScore: 0.9,
        isActive: true,
        skills: [],
      },
      targetSkillId: 's-1',
      targetSkillName: 'REST APIs',
      targetSkillSlug: 'rest-apis',
      rank: 0,
      scoreBreakdown: {
        semanticScore: score,
        coverageScore: score,
        careerScore: score,
        difficultyScore: score,
        prerequisiteScore: score,
        preferenceScore: score,
        qualityScore: score,
        finalScore: score,
        matchPercentage: Math.round(score * 100),
        isSemanticFallback: false,
      },
      explanation: [],
      algorithmVersion: 'recommendation-v1',
    });

    const candidates = [
      makeItem('1', 'COURSE', 0.95),
      makeItem('2', 'COURSE', 0.94),
      makeItem('3', 'COURSE', 0.93),
      makeItem('4', 'PROJECT', 0.92), // Project should be promoted over 3rd course
      makeItem('5', 'DOCUMENTATION', 0.91),
    ];

    const diversified = applyDiversityReranking(candidates, 3);
    expect(diversified.length).toBe(3);
    const types = diversified.map(d => d.resource.resourceType);
    expect(types).toContain('PROJECT');
  });

  // ============================================================================
  // SECTION 40: GOLDEN RECOMMENDATION TEST CASE
  // ============================================================================
  it('SECTION 40 GOLDEN TEST: Ranks appropriate gap-closing resources ahead of advanced unready courses', () => {
    const goldenProfile: LearnerProfile = {
      id: 'golden-learner',
      userId: 'u-golden',
      targetRole: 'Backend Engineer',
      technicalLevel: 'INTERMEDIATE',
      skills: [
        { name: 'Java', normalizedName: 'java', selfReportedLevel: 4 },
        { name: 'SQL', normalizedName: 'sql', selfReportedLevel: 3 },
        { name: 'Spring Boot', normalizedName: 'spring boot', selfReportedLevel: 2 },
        { name: 'REST APIs', normalizedName: 'rest apis', selfReportedLevel: 1 },
        { name: 'Docker', normalizedName: 'docker', selfReportedLevel: 2 },
      ],
      projects: [],
      learningExperiences: [],
      certifications: [],
      interests: [],
      preference: {
        id: 'pref-golden',
        profileId: 'golden-learner',
        learningFormat: 'HANDS_ON_PROJECTS',
        difficultyPreference: 'BALANCED',
        weeklyAvailabilityHours: '10-15',
        projectPreference: 'PRACTICAL_REAL_WORLD',
      },
    };

    const gaps: SkillGapItem[] = [
      {
        skillId: 'rest-apis-id',
        skillName: 'REST APIs',
        skillSlug: 'rest-apis',
        categoryName: 'Backend Development',
        learnerLevel: 1,
        requiredLevel: 4,
        gap: 3,
        gapSeverity: 0.75,
        importance: 'CORE',
        importanceWeight: 1.0,
        priorityScore: 0.91,
        displayPriority: 91,
        readiness: 'READY',
        category: 'DEVELOPING',
        isCritical: true,
        explanation: 'Core API development gap',
        downstreamImpactCount: 2,
      },
      {
        skillId: 'system-design-id',
        skillName: 'System Design',
        skillSlug: 'system-design',
        categoryName: 'Architecture',
        learnerLevel: 0,
        requiredLevel: 4,
        gap: 4,
        gapSeverity: 1.0,
        importance: 'HIGH',
        importanceWeight: 0.8,
        priorityScore: 0.86,
        displayPriority: 86,
        readiness: 'BLOCKED',
        category: 'MISSING',
        isCritical: true,
        explanation: 'Prerequisites not met',
        downstreamImpactCount: 0,
      },
    ];

    const testResources: LearningResource[] = [
      {
        id: 'res-a',
        title: 'REST API Fundamentals',
        slug: 'rest-api-fundamentals',
        description: 'Comprehensive video course on building standardized RESTful Web Services and HTTP protocols',
        resourceType: 'VIDEO',
        provider: 'freeCodeCamp',
        url: 'https://freecodecamp.org/rest-fundamentals',
        difficulty: 'BEGINNER',
        estimatedHours: 6,
        language: 'en',
        isFree: true,
        qualityScore: 0.95,
        isActive: true,
        skills: [{ skillId: 'rest-apis-id', coverage: 'PRIMARY' }],
      },
      {
        id: 'res-b',
        title: 'Build a REST API with Spring Boot',
        slug: 'build-rest-api-spring-boot',
        description: 'Hands-on practical project creating backend REST services using Spring Boot and Java',
        resourceType: 'PROJECT',
        provider: 'Spring Guides',
        url: 'https://spring.io/guides/tutorials/rest',
        difficulty: 'INTERMEDIATE',
        estimatedHours: 8,
        language: 'en',
        isFree: true,
        qualityScore: 0.98,
        isActive: true,
        skills: [
          { skillId: 'rest-apis-id', coverage: 'PRIMARY' },
          { skillId: 'spring-boot-id', coverage: 'SUPPORTING' },
        ],
      },
      {
        id: 'res-c',
        title: 'Advanced Distributed Systems Design',
        slug: 'advanced-distributed-systems-design',
        description: 'Master class on high-scale distributed consensus, Paxos, and partition fault-tolerance',
        resourceType: 'COURSE',
        provider: 'MIT OCW',
        url: 'https://ocw.mit.edu/distributed-systems',
        difficulty: 'ADVANCED',
        estimatedHours: 30,
        language: 'en',
        isFree: true,
        qualityScore: 0.95,
        isActive: true,
        skills: [{ skillId: 'system-design-id', coverage: 'PRIMARY' }],
      },
    ];

    // Precalculate embeddings for the test resources
    for (const r of testResources) {
      const text = buildResourceEmbeddingText({
        title: r.title,
        description: r.description,
        resourceType: r.resourceType,
        difficulty: r.difficulty,
        skills: r.skills.map(s => ({ name: s.skillId, coverage: s.coverage })),
      });
      r.embedding = generateTextEmbedding(text);
    }

    const groups = rankRecommendationsForGaps({
      gaps,
      resources: testResources,
      careerName: 'Backend Engineer',
      careerId: 'backend-engineer-id',
      careerSlug: 'backend-engineer',
      learnerProfile: goldenProfile,
      learnerPreference: goldenProfile.preference,
      maxPerGap: 3,
    });

    expect(groups.length).toBe(2);

    // Group 1: REST APIs recommendations
    const restGroup = groups.find(g => g.skillSlug === 'rest-apis');
    expect(restGroup).toBeDefined();
    expect(restGroup!.recommendations.length).toBeGreaterThan(0);

    const restTopSlugs = restGroup!.recommendations.map(r => r.resource.slug);
    expect(restTopSlugs).toContain('rest-api-fundamentals');
    expect(restTopSlugs).toContain('build-rest-api-spring-boot');

    // Scores must be high for REST API resources (> 70%)
    const topRestScore = restGroup!.recommendations[0].scoreBreakdown.finalScore;
    expect(topRestScore).toBeGreaterThan(0.7);

    // Group 2: System Design recommendations
    const sysGroup = groups.find(g => g.skillSlug === 'system-design');
    expect(sysGroup).toBeDefined();
    const sysTop = sysGroup!.recommendations[0];
    // Advanced Distributed Systems must be penalized due to BLOCKED readiness and ADVANCED mismatch
    expect(sysTop.scoreBreakdown.prerequisiteScore).toBe(0.15);
    expect(sysTop.scoreBreakdown.difficultyScore).toBe(0.2);
    expect(sysTop.scoreBreakdown.finalScore).toBeLessThan(0.72);
    expect(topRestScore).toBeGreaterThan(sysTop.scoreBreakdown.finalScore + 0.15);
  });
});
