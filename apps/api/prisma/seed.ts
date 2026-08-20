import { PrismaClient } from '@prisma/client';
import { SEED_CAREERS, SEED_SKILLS, SEED_PREREQUISITES, SEED_CAREER_SKILLS } from './seed-data.js';
import { validateFullGraph } from '@pathforge/shared';

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

  console.log('🎉 PathForge AI Career & Skill Database Seeding Completed Successfully!');

  return {
    careersCount: careerSlugToIdMap.size,
    skillsCount: skillSlugToIdMap.size,
    prerequisitesCount: prereqCount,
    careerSkillsCount: careerSkillCount,
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
