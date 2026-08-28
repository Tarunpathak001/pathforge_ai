import { PrismaClient } from '@prisma/client';
import { SEED_CAREERS, SEED_SKILLS, SEED_PREREQUISITES, SEED_CAREER_SKILLS } from './seed-data.js';
import { SEED_RESOURCES } from './seed-resources.js';
import { seedAssessments } from './seed-assessments.js';
import {
  validateFullGraph,
  generateTextEmbedding,
  buildResourceEmbeddingText,
} from '@pathforge/shared';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('🌱 Starting PathForge AI Career & Skill Database Seeding...');

  // 1. Validate Prerequisite Graph before doing any DB insertions
  console.log('🔍 Validating Prerequisite Dependency Graph...');
  const graphEdges = SEED_PREREQUISITES.map(p => ({
    skillId: p.skillSlug,
    prerequisiteSkillId: p.prerequisiteSlug,
  }));

  const graphValidation = validateFullGraph(graphEdges);
  if (!graphValidation.isValid) {
    console.error('❌ Prerequisite graph validation FAILED:', graphValidation.error);
    throw new Error(`Graph validation failed: ${graphValidation.error}`);
  }
  console.log(
    `✅ Prerequisite graph verified: Acyclic DAG with ${graphEdges.length} validated edges.`
  );

  // 2. Seed Skills (Idempotent upsert by unique slug)
  console.log(`📦 Seeding ${SEED_SKILLS.length} curated skills...`);
  const skillSlugToIdMap = new Map<string, string>();

  for (const skillData of SEED_SKILLS) {
    const record = await prisma.skill.upsert({
      where: { slug: skillData.slug },
      update: {
        name: skillData.name,
        category: skillData.category,
        skillType: skillData.skillType,
        description: skillData.description,
        aliases: JSON.stringify(skillData.aliases),
        isActive: true,
      },
      create: {
        slug: skillData.slug,
        name: skillData.name,
        category: skillData.category,
        skillType: skillData.skillType,
        description: skillData.description,
        aliases: JSON.stringify(skillData.aliases),
        isActive: true,
      },
    });
    skillSlugToIdMap.set(skillData.slug, record.id);
  }
  console.log(`✅ Seeded ${skillSlugToIdMap.size} skills.`);

  // 3. Seed Skill Prerequisites (Idempotent upsert by unique [skillId, prerequisiteSkillId])
  console.log(`🔗 Seeding ${SEED_PREREQUISITES.length} prerequisite relationships...`);
  let prereqCount = 0;

  for (const prereq of SEED_PREREQUISITES) {
    const skillId = skillSlugToIdMap.get(prereq.skillSlug);
    const prerequisiteSkillId = skillSlugToIdMap.get(prereq.prerequisiteSlug);

    if (!skillId) {
      throw new Error(`Skill with slug '${prereq.skillSlug}' not found in seeded skills.`);
    }
    if (!prerequisiteSkillId) {
      throw new Error(
        `Prerequisite skill with slug '${prereq.prerequisiteSlug}' not found in seeded skills.`
      );
    }

    await prisma.skillPrerequisite.upsert({
      where: {
        skillId_prerequisiteSkillId: {
          skillId,
          prerequisiteSkillId,
        },
      },
      update: {
        strength: prereq.strength,
        rationale: prereq.rationale,
      },
      create: {
        skillId,
        prerequisiteSkillId,
        strength: prereq.strength,
        rationale: prereq.rationale,
      },
    });
    prereqCount++;
  }
  console.log(`✅ Seeded ${prereqCount} prerequisite relationships.`);

  // 4. Seed Careers (Idempotent upsert by unique slug)
  console.log(`💼 Seeding ${SEED_CAREERS.length} curated careers...`);
  const careerSlugToIdMap = new Map<string, string>();

  for (const careerData of SEED_CAREERS) {
    const record = await prisma.career.upsert({
      where: { slug: careerData.slug },
      update: {
        name: careerData.name,
        category: careerData.category,
        description: careerData.description,
        difficulty: careerData.difficulty,
        typicalExperience: careerData.typicalExperience,
        demandLevel: careerData.demandLevel,
        isActive: true,
      },
      create: {
        slug: careerData.slug,
        name: careerData.name,
        category: careerData.category,
        description: careerData.description,
        difficulty: careerData.difficulty,
        typicalExperience: careerData.typicalExperience,
        demandLevel: careerData.demandLevel,
        isActive: true,
      },
    });
    careerSlugToIdMap.set(careerData.slug, record.id);
  }
  console.log(`✅ Seeded ${careerSlugToIdMap.size} careers.`);

  // 5. Seed Career-Skill Mappings (Idempotent upsert by unique [careerId, skillId])
  console.log(`🎯 Seeding ${SEED_CAREER_SKILLS.length} career-skill mappings...`);
  let careerSkillCount = 0;

  for (const mapping of SEED_CAREER_SKILLS) {
    const careerId = careerSlugToIdMap.get(mapping.careerSlug);
    const skillId = skillSlugToIdMap.get(mapping.skillSlug);

    if (!careerId) {
      throw new Error(`Career with slug '${mapping.careerSlug}' not found in seeded careers.`);
    }
    if (!skillId) {
      throw new Error(`Skill with slug '${mapping.skillSlug}' not found in seeded skills.`);
    }

    await prisma.careerSkill.upsert({
      where: {
        careerId_skillId: {
          careerId,
          skillId,
        },
      },
      update: {
        importance: mapping.importance,
        requiredLevel: mapping.requiredLevel,
        priority: mapping.priority,
        rationale: mapping.rationale,
        isCore: mapping.isCore,
      },
      create: {
        careerId,
        skillId,
        importance: mapping.importance,
        requiredLevel: mapping.requiredLevel,
        priority: mapping.priority,
        rationale: mapping.rationale,
        isCore: mapping.isCore,
      },
    });
    careerSkillCount++;
  }
  console.log(`✅ Seeded ${careerSkillCount} career-skill mappings.`);

  // 6. Seed Learning Resources & Precalculate Vector Embeddings
  console.log(`📚 Seeding ${SEED_RESOURCES.length} curated learning resources...`);
  let resourceCount = 0;
  let resourceSkillCount = 0;
  let resourcePrereqCount = 0;

  for (const res of SEED_RESOURCES) {
    // Generate text representation and semantic embedding
    const embeddingText = buildResourceEmbeddingText({
      title: res.title,
      description: res.description,
      resourceType: res.resourceType,
      difficulty: res.difficulty,
      skills: res.skills.map(s => ({ name: s.skillSlug, coverage: s.coverage })),
    });
    const embeddingVector = generateTextEmbedding(embeddingText);

    const resourceRecord = await prisma.learningResource.upsert({
      where: { slug: res.slug },
      update: {
        title: res.title,
        description: res.description,
        resourceType: res.resourceType,
        provider: res.provider,
        url: res.url,
        difficulty: res.difficulty,
        estimatedHours: res.estimatedHours,
        language: res.language || 'en',
        isFree: res.isFree,
        qualityScore: res.qualityScore,
        embedding: JSON.stringify(embeddingVector),
        isActive: true,
      },
      create: {
        title: res.title,
        slug: res.slug,
        description: res.description,
        resourceType: res.resourceType,
        provider: res.provider,
        url: res.url,
        difficulty: res.difficulty,
        estimatedHours: res.estimatedHours,
        language: res.language || 'en',
        isFree: res.isFree,
        qualityScore: res.qualityScore,
        embedding: JSON.stringify(embeddingVector),
        isActive: true,
      },
    });

    resourceCount++;

    // Seed Resource-Skill mappings
    for (const s of res.skills) {
      const skillId = skillSlugToIdMap.get(s.skillSlug);
      if (skillId) {
        await prisma.resourceSkill.upsert({
          where: {
            resourceId_skillId: {
              resourceId: resourceRecord.id,
              skillId,
            },
          },
          update: {
            coverage: s.coverage,
          },
          create: {
            resourceId: resourceRecord.id,
            skillId,
            coverage: s.coverage,
          },
        });
        resourceSkillCount++;
      }
    }

    // Seed Resource-Prerequisites
    if (res.prerequisites) {
      for (const p of res.prerequisites) {
        const prereqSkillId = skillSlugToIdMap.get(p.skillSlug);
        if (prereqSkillId) {
          await prisma.resourcePrerequisite.upsert({
            where: {
              resourceId_skillId: {
                resourceId: resourceRecord.id,
                skillId: prereqSkillId,
              },
            },
            update: {
              requiredLevel: p.requiredLevel,
            },
            create: {
              resourceId: resourceRecord.id,
              skillId: prereqSkillId,
              requiredLevel: p.requiredLevel,
            },
          });
          resourcePrereqCount++;
        }
      }
    }
  }

  console.log(`✅ Seeded ${resourceCount} learning resources with precomputed semantic vector embeddings.`);
  console.log(`✅ Seeded ${resourceSkillCount} resource-skill coverage mappings.`);
  if (resourcePrereqCount > 0) {
    console.log(`✅ Seeded ${resourcePrereqCount} resource prerequisite requirements.`);
  }

  // 6. Seed Assessments & Curated Questions
  await seedAssessments();

  console.log('🎉 PathForge AI Career, Skill & Learning Database Seeding Completed Successfully!');

  return {
    careersCount: careerSlugToIdMap.size,
    skillsCount: skillSlugToIdMap.size,
    prerequisitesCount: prereqCount,
    careerSkillsCount: careerSkillCount,
    resourcesCount: resourceCount,
    resourceSkillsCount: resourceSkillCount,
  };
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase()
    .catch(error => {
      console.error('❌ Seeding error:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
