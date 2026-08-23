import { describe, it, expect, beforeAll } from 'vitest';
import prisma from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';
import {
  evaluateBenchmark,
  type BenchmarkScenario,
  rankRecommendationsForGaps,
  type LearningResource,
  type SkillGapItem,
} from '@pathforge/shared';

describe('Recommendation Quality Evaluation Benchmark (Section 41)', () => {
  let loadedResources: LearningResource[] = [];

  beforeAll(async () => {
    await seedDatabase();

    const rawResources = await prisma.learningResource.findMany({
      where: { isActive: true },
      include: {
        skills: { include: { skill: true } },
        prerequisites: { include: { skill: true } },
      },
    });

    loadedResources = rawResources.map(r => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      description: r.description,
      resourceType: r.resourceType as any,
      provider: r.provider,
      url: r.url,
      difficulty: r.difficulty as any,
      estimatedHours: r.estimatedHours,
      language: r.language,
      isFree: r.isFree,
      qualityScore: r.qualityScore,
      embedding: r.embedding ? JSON.parse(r.embedding) : null,
      isActive: r.isActive,
      skills: r.skills.map(s => ({
        id: s.id,
        resourceId: s.resourceId,
        skillId: s.skillId,
        skillName: s.skill.name,
        skillSlug: s.skill.slug,
        coverage: s.coverage as any,
      })),
      prerequisites: r.prerequisites.map(p => ({
        id: p.id,
        resourceId: p.resourceId,
        skillId: p.skillId,
        skillName: p.skill.name,
        skillSlug: p.skill.slug,
        requiredLevel: p.requiredLevel,
      })),
    }));
  }, 30000);

  // 20 Curated Benchmark Scenarios covering various careers and gap profiles
  const BENCHMARK_SCENARIOS: BenchmarkScenario[] = [
    {
      id: 'sc-01-backend-rest',
      careerName: 'Backend Engineer',
      targetSkillSlug: 'rest-apis',
      learnerProfile: {
        targetRole: 'Backend Engineer',
        skills: [{ normalizedName: 'java', selfReportedLevel: 4 }, { normalizedName: 'sql', selfReportedLevel: 3 }],
      },
      relevantResourceSlugs: ['mdn-restful-web-apis-guide', 'fcc-rest-api-design-course', 'spring-boot-rest-api-project', 'fastapi-official-tutorial'],
      relevanceGrades: {
        'spring-boot-rest-api-project': 3,
        'mdn-restful-web-apis-guide': 3,
        'fcc-rest-api-design-course': 2,
        'fastapi-official-tutorial': 2,
      },
    },
    {
      id: 'sc-02-backend-spring-boot',
      careerName: 'Backend Engineer',
      targetSkillSlug: 'spring-boot',
      learnerProfile: {
        targetRole: 'Backend Engineer',
        skills: [{ normalizedName: 'java', selfReportedLevel: 3 }],
      },
      relevantResourceSlugs: ['spring-boot-rest-api-project', 'spring-core-technologies-doc', 'spring-boot-microservice-docker-project'],
    },
    {
      id: 'sc-03-backend-redis-caching',
      careerName: 'Backend Engineer',
      targetSkillSlug: 'redis',
      learnerProfile: {
        targetRole: 'Backend Engineer',
        skills: [{ normalizedName: 'java', selfReportedLevel: 4 }, { normalizedName: 'sql', selfReportedLevel: 3 }],
      },
      relevantResourceSlugs: ['redis-university-caching-course', 'distributed-rate-limiter-project'],
    },
    {
      id: 'sc-04-database-postgresql',
      careerName: 'Database Administrator',
      targetSkillSlug: 'postgresql',
      learnerProfile: {
        targetRole: 'Database Administrator',
        skills: [{ normalizedName: 'sql', selfReportedLevel: 2 }],
      },
      relevantResourceSlugs: ['postgresql-official-tutorial', 'use-the-index-luke-indexing-guide'],
    },
    {
      id: 'sc-05-devops-docker',
      careerName: 'DevOps Engineer',
      targetSkillSlug: 'docker',
      learnerProfile: {
        targetRole: 'DevOps Engineer',
        skills: [{ normalizedName: 'linux', selfReportedLevel: 3 }],
      },
      relevantResourceSlugs: ['docker-official-getting-started', 'kubernetes-official-basics-tutorial', 'spring-boot-microservice-docker-project'],
    },
    {
      id: 'sc-06-devops-kubernetes',
      careerName: 'DevOps Engineer',
      targetSkillSlug: 'kubernetes',
      learnerProfile: {
        targetRole: 'DevOps Engineer',
        skills: [{ normalizedName: 'docker', selfReportedLevel: 3 }, { normalizedName: 'linux', selfReportedLevel: 3 }],
      },
      relevantResourceSlugs: ['kubernetes-official-basics-tutorial'],
    },
    {
      id: 'sc-07-ai-deep-learning',
      careerName: 'AI Engineer',
      targetSkillSlug: 'deep-learning',
      learnerProfile: {
        targetRole: 'AI Engineer',
        skills: [{ normalizedName: 'python', selfReportedLevel: 3 }, { normalizedName: 'machine-learning', selfReportedLevel: 2 }],
      },
      relevantResourceSlugs: ['fastai-practical-deep-learning', 'hugging-face-nlp-transformers-course'],
    },
    {
      id: 'sc-08-ai-llms-rag',
      careerName: 'AI Engineer',
      targetSkillSlug: 'llms-and-prompt-engineering',
      learnerProfile: {
        targetRole: 'AI Engineer',
        skills: [{ normalizedName: 'python', selfReportedLevel: 3 }],
      },
      relevantResourceSlugs: ['deeplearning-ai-langchain-course', 'production-rag-vector-db-project', 'hugging-face-nlp-transformers-course'],
    },
    {
      id: 'sc-09-frontend-react',
      careerName: 'Frontend Engineer',
      targetSkillSlug: 'react',
      learnerProfile: {
        targetRole: 'Frontend Engineer',
        skills: [{ normalizedName: 'javascript', selfReportedLevel: 3 }, { normalizedName: 'html-css', selfReportedLevel: 3 }],
      },
      relevantResourceSlugs: ['react-dev-official-documentation', 'nextjs-official-dashboard-course', 'full-stack-open-helsinki'],
    },
    {
      id: 'sc-10-frontend-tailwind',
      careerName: 'Frontend Engineer',
      targetSkillSlug: 'tailwind-css',
      learnerProfile: {
        targetRole: 'Frontend Engineer',
        skills: [{ normalizedName: 'html-css', selfReportedLevel: 2 }],
      },
      relevantResourceSlugs: ['tailwind-css-official-guide'],
    },
    {
      id: 'sc-11-security-auth',
      careerName: 'Security Engineer',
      targetSkillSlug: 'authentication-authorization',
      learnerProfile: {
        targetRole: 'Security Engineer',
        skills: [{ normalizedName: 'rest-apis', selfReportedLevel: 3 }],
      },
      relevantResourceSlugs: ['auth0-oauth2-jwt-guide', 'owasp-top-10-security-guide', 'portswigger-web-security-academy'],
    },
    {
      id: 'sc-12-security-web',
      careerName: 'Security Engineer',
      targetSkillSlug: 'web-security',
      learnerProfile: {
        targetRole: 'Security Engineer',
        skills: [{ normalizedName: 'html-css', selfReportedLevel: 3 }, { normalizedName: 'javascript', selfReportedLevel: 3 }],
      },
      relevantResourceSlugs: ['owasp-top-10-security-guide', 'portswigger-web-security-academy'],
    },
    {
      id: 'sc-13-qa-testing',
      careerName: 'Quality Assurance Engineer',
      targetSkillSlug: 'unit-integration-testing',
      learnerProfile: {
        targetRole: 'Quality Assurance Engineer',
        skills: [{ normalizedName: 'javascript', selfReportedLevel: 3 }],
      },
      relevantResourceSlugs: ['martin-fowler-practical-test-pyramid', 'testing-javascript-typescript-course'],
    },
    {
      id: 'sc-14-architecture-system-design',
      careerName: 'Solutions Architect',
      targetSkillSlug: 'system-design',
      learnerProfile: {
        targetRole: 'Solutions Architect',
        skills: [{ normalizedName: 'rest-apis', selfReportedLevel: 4 }, { normalizedName: 'sql', selfReportedLevel: 4 }],
      },
      relevantResourceSlugs: ['system-design-primer-github', 'designing-data-intensive-applications-book', 'distributed-rate-limiter-project'],
    },
    {
      id: 'sc-15-cloud-aws',
      careerName: 'Cloud Solutions Architect',
      targetSkillSlug: 'aws',
      learnerProfile: {
        targetRole: 'Cloud Solutions Architect',
        skills: [{ normalizedName: 'linux', selfReportedLevel: 3 }],
      },
      relevantResourceSlugs: ['aws-cloud-practitioner-essentials', 'aws-serverless-backend-project'],
    },
    {
      id: 'sc-16-data-pandas',
      careerName: 'Data Scientist',
      targetSkillSlug: 'pandas',
      learnerProfile: {
        targetRole: 'Data Scientist',
        skills: [{ normalizedName: 'python', selfReportedLevel: 2 }],
      },
      relevantResourceSlugs: ['kaggle-pandas-interactive-course'],
    },
    {
      id: 'sc-17-data-engineering-spark',
      careerName: 'Data Engineer',
      targetSkillSlug: 'data-engineering',
      learnerProfile: {
        targetRole: 'Data Engineer',
        skills: [{ normalizedName: 'python', selfReportedLevel: 3 }, { normalizedName: 'sql', selfReportedLevel: 3 }],
      },
      relevantResourceSlugs: ['apache-spark-pyspark-data-engineering'],
    },
    {
      id: 'sc-18-dsa-fundamentals',
      careerName: 'Software Engineer',
      targetSkillSlug: 'data-structures-algorithms',
      learnerProfile: {
        targetRole: 'Software Engineer',
        skills: [{ normalizedName: 'java', selfReportedLevel: 2 }],
      },
      relevantResourceSlugs: ['mit-ocw-6006-algorithms-course', 'neetcode-150-dsa-practice'],
    },
    {
      id: 'sc-19-programming-go',
      careerName: 'Backend Engineer',
      targetSkillSlug: 'go',
      learnerProfile: {
        targetRole: 'Backend Engineer',
        skills: [{ normalizedName: 'programming-fundamentals', selfReportedLevel: 2 }],
      },
      relevantResourceSlugs: ['tour-of-go-interactive', 'go-by-example-recipes'],
    },
    {
      id: 'sc-20-clean-code-patterns',
      careerName: 'Senior Software Engineer',
      targetSkillSlug: 'clean-code',
      learnerProfile: {
        targetRole: 'Senior Software Engineer',
        skills: [{ normalizedName: 'java', selfReportedLevel: 3 }],
      },
      relevantResourceSlugs: ['refactoring-guru-design-patterns', 'clean-code-book'],
    },
  ];

  it('evaluates Precision@5, Recall@5, and NDCG@5 across 20 benchmark scenarios', () => {
    const report = evaluateBenchmark(BENCHMARK_SCENARIOS, scenario => {
      const dummyGap: SkillGapItem = {
        skillId: scenario.targetSkillSlug,
        skillName: scenario.targetSkillSlug,
        skillSlug: scenario.targetSkillSlug,
        categoryName: 'General',
        learnerLevel: 1,
        requiredLevel: 4,
        gap: 3,
        gapSeverity: 0.75,
        importance: 'CORE',
        importanceWeight: 1.0,
        priorityScore: 0.9,
        displayPriority: 90,
        readiness: 'READY',
        category: 'DEVELOPING',
        isCritical: true,
        explanation: 'Benchmark evaluation gap',
        downstreamImpactCount: 1,
      };

      const groups = rankRecommendationsForGaps({
        gaps: [dummyGap],
        resources: loadedResources,
        careerName: scenario.careerName,
        careerId: 'test-career',
        careerSlug: scenario.careerName.toLowerCase().replace(/\s+/g, '-'),
        learnerProfile: scenario.learnerProfile,
        maxPerGap: 5,
        minScore: 0.35,
      });

      if (groups.length === 0) return [];
      return groups[0].recommendations.map(r => r.resource.slug);
    }, 5);

    console.log('=== RECOMMENDATION BENCHMARK EVALUATION RESULTS ===');
    console.log(`Total Benchmark Scenarios: ${report.totalScenarios}`);
    console.log(`Mean Precision@5: ${(report.meanPrecisionAt5 * 100).toFixed(2)}%`);
    console.log(`Mean Recall@5: ${(report.meanRecallAt5 * 100).toFixed(2)}%`);
    console.log(`Mean NDCG@5: ${report.meanNDCGAt5.toFixed(4)}`);

    // High quality standards for prototype
    expect(report.totalScenarios).toBe(20);
    expect(report.meanPrecisionAt5).toBeGreaterThan(0.35); // Since relevant sets are 1-4 items per scenario
    expect(report.meanRecallAt5).toBeGreaterThan(0.70); // High coverage of ground truth
    expect(report.meanNDCGAt5).toBeGreaterThan(0.75); // Strong ranking quality
  });
});
