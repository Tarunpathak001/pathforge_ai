import { describe, it, expect } from 'vitest';
import prisma from '../src/db/client.js';
import { seedDatabase } from '../prisma/seed.js';

describe('Seed Idempotency & Database Integrity Tests', () => {
  it('runs seedDatabase idempotently without duplicating or throwing', async () => {
    // First run
    const result1 = await seedDatabase();
    expect(result1.careersCount).toBeGreaterThanOrEqual(12);
    expect(result1.skillsCount).toBeGreaterThanOrEqual(60);
    expect(result1.prerequisitesCount).toBeGreaterThan(0);
    expect(result1.careerSkillsCount).toBeGreaterThan(0);

    const initialCareersCount = await prisma.career.count();
    const initialSkillsCount = await prisma.skill.count();
    const initialPrereqCount = await prisma.skillPrerequisite.count();
    const initialCareerSkillsCount = await prisma.careerSkill.count();

    // Second run
    const result2 = await seedDatabase();
    expect(result2.careersCount).toBe(result1.careersCount);
    expect(result2.skillsCount).toBe(result1.skillsCount);

    const secondCareersCount = await prisma.career.count();
    const secondSkillsCount = await prisma.skill.count();
    const secondPrereqCount = await prisma.skillPrerequisite.count();
    const secondCareerSkillsCount = await prisma.careerSkill.count();

    // Verify exact count match (no duplicates created)
    expect(secondCareersCount).toBe(initialCareersCount);
    expect(secondSkillsCount).toBe(initialSkillsCount);
    expect(secondPrereqCount).toBe(initialPrereqCount);
    expect(secondCareerSkillsCount).toBe(initialCareerSkillsCount);
  }, 20000);
});
