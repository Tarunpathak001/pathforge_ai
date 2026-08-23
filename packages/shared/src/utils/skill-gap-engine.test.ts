import { describe, it, expect } from 'vitest';
import { calculateSkillGap } from './skill-gap-engine.js';
import type { Career } from '../types/career.js';

const MOCK_BACKEND_CAREER: Career = {
  id: 'career-backend-1',
  name: 'Backend Engineer',
  slug: 'backend-engineer',
  description: 'Specializes in server-side architecture, APIs, and databases.',
  category: 'Engineering',
  difficulty: 'INTERMEDIATE',
  typicalExperience: '2-4 years',
  demandLevel: 'VERY_HIGH',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MOCK_CAREER_SKILLS = [
  {
    skillId: 's-java',
    skill: {
      id: 's-java',
      name: 'Java',
      slug: 'java',
      category: 'Programming',
      skillType: 'Technical',
      aliases: '["Java SE"]',
    },
    importance: 'CORE',
    requiredLevel: 4,
    priority: 1,
    isCore: true,
  },
  {
    skillId: 's-sql',
    skill: {
      id: 's-sql',
      name: 'SQL',
      slug: 'sql',
      category: 'Database',
      skillType: 'Technical',
      aliases: '["Structured Query Language"]',
    },
    importance: 'CORE',
    requiredLevel: 4,
    priority: 2,
    isCore: true,
  },
  {
    skillId: 's-spring',
    skill: {
      id: 's-spring',
      name: 'Spring Boot',
      slug: 'spring-boot',
      category: 'Backend',
      skillType: 'Technical',
      aliases: '["Spring"]',
    },
    importance: 'HIGH',
    requiredLevel: 4,
    priority: 3,
    isCore: false,
  },
  {
    skillId: 's-rest',
    skill: {
      id: 's-rest',
      name: 'REST APIs',
      slug: 'rest-apis',
      category: 'Backend',
      skillType: 'Concept',
      aliases: '["REST", "RESTful"]',
    },
    importance: 'CORE',
    requiredLevel: 4,
    priority: 4,
    isCore: true,
  },
  {
    skillId: 's-redis',
    skill: {
      id: 's-redis',
      name: 'Redis',
      slug: 'redis',
      category: 'Database',
      skillType: 'Tool',
      aliases: '["Redis Cache"]',
    },
    importance: 'MEDIUM',
    requiredLevel: 3,
    priority: 5,
    isCore: false,
  },
  {
    skillId: 's-docker',
    skill: {
      id: 's-docker',
      name: 'Docker',
      slug: 'docker',
      category: 'DevOps',
      skillType: 'Tool',
      aliases: '["Containers"]',
    },
    importance: 'MEDIUM',
    requiredLevel: 3,
    priority: 6,
    isCore: false,
  },
  {
    skillId: 's-sysdes',
    skill: {
      id: 's-sysdes',
      name: 'System Design',
      slug: 'system-design',
      category: 'Architecture',
      skillType: 'Concept',
      aliases: '["Distributed Systems Design"]',
    },
    importance: 'HIGH',
    requiredLevel: 4,
    priority: 7,
    isCore: false,
  },
];

const MOCK_PREREQUISITES = [
  { skillId: 's-spring', prerequisiteSkillId: 's-java', strength: 'REQUIRED' },
  { skillId: 's-rest', prerequisiteSkillId: 's-java', strength: 'RECOMMENDED' },
  { skillId: 's-sysdes', prerequisiteSkillId: 's-rest', strength: 'REQUIRED' },
];

describe('Skill Gap Engine — Unit Tests & Golden Test Case', () => {
  // Section 32 Golden Test Case
  it('passes the Section 32 Golden Test Case for Backend Engineer', () => {
    const learnerSkills = [
      { name: 'Java', selfReportedLevel: 4 },
      { name: 'SQL', selfReportedLevel: 3 },
      { name: 'Spring Boot', selfReportedLevel: 2 },
      { name: 'REST APIs', selfReportedLevel: 1 },
      { name: 'Redis', selfReportedLevel: 0 },
      { name: 'Docker', selfReportedLevel: 2 },
      { name: 'System Design', selfReportedLevel: 0 },
    ];

    const report = calculateSkillGap({
      userId: 'user-golden-1',
      learnerProfileId: 'profile-golden-1',
      career: MOCK_BACKEND_CAREER,
      careerSkills: MOCK_CAREER_SKILLS,
      allPrerequisites: MOCK_PREREQUISITES,
      learnerSkills,
    });

    // 1. Verify Qualitative Classifications
    const strengthNames = report.strengths.map(s => s.skillName);
    const developingNames = report.developingSkills.map(s => s.skillName);
    const missingNames = report.missingSkills.map(s => s.skillName);
    const criticalNames = report.criticalGaps.map(s => s.skillName);

    expect(strengthNames).toContain('Java');
    expect(strengthNames).toHaveLength(1);

    expect(developingNames).toEqual(
      expect.arrayContaining(['SQL', 'Spring Boot', 'Docker', 'REST APIs'])
    );
    expect(developingNames).toHaveLength(4);

    expect(missingNames).toEqual(expect.arrayContaining(['Redis', 'System Design']));
    expect(missingNames).toHaveLength(2);

    expect(criticalNames).toContain('REST APIs');
    expect(criticalNames).toContain('System Design');

    // 2. Verify Prerequisite-aware Priority
    // REST APIs has higher readiness (Java=4 meets prereq) and downstream influence on System Design,
    // whereas System Design is BLOCKED because REST APIs is only level 1.
    const restItem = report.allResults.find(s => s.skillName === 'REST APIs')!;
    const sysdesItem = report.allResults.find(s => s.skillName === 'System Design')!;

    expect(restItem.readiness).toBe('READY');
    expect(sysdesItem.readiness).toBe('BLOCKED');
    expect(restItem.priorityScore).toBeGreaterThan(sysdesItem.priorityScore);

    // 3. Verify Deterministic Career Alignment Score (0..100)
    // Hand calculation:
    // Java: 4/4 * 1.0 (CORE) = 1.0
    // SQL: 3/4 * 1.0 (CORE) = 0.75
    // Spring Boot: 2/4 * 0.8 (HIGH) = 0.4
    // REST APIs: 1/4 * 1.0 (CORE) = 0.25
    // Redis: 0/3 * 0.5 (MEDIUM) = 0.0
    // Docker: 2/3 * 0.5 (MEDIUM) = 0.3333
    // System Design: 0/4 * 0.8 (HIGH) = 0.0
    // Sum weighted achievement = 1.0 + 0.75 + 0.4 + 0.25 + 0.0 + 0.3333 + 0.0 = 2.7333
    // Sum total weights = 1.0 + 1.0 + 0.8 + 1.0 + 0.5 + 0.5 + 0.8 = 5.6
    // Alignment = (2.7333 / 5.6) * 100 = 48.8% -> Math.round = 49%
    expect(report.readinessScore).toBe(49);
    expect(report.readinessBand).toBe('Early Development');
  });

  it('handles empty / zero learner skills with 0 readiness score and all missing', () => {
    const report = calculateSkillGap({
      userId: 'user-zero-1',
      learnerProfileId: 'profile-zero-1',
      career: MOCK_BACKEND_CAREER,
      careerSkills: MOCK_CAREER_SKILLS,
      allPrerequisites: MOCK_PREREQUISITES,
      learnerSkills: [],
    });

    expect(report.readinessScore).toBe(0);
    expect(report.readinessBand).toBe('Starting Point');
    expect(report.strengths).toHaveLength(0);
    expect(report.developingSkills).toHaveLength(0);
    expect(report.missingSkills).toHaveLength(MOCK_CAREER_SKILLS.length);
  });

  it('handles perfect profile with 100 readiness score and zero gaps', () => {
    const perfectLearner = MOCK_CAREER_SKILLS.map(cs => ({
      name: cs.skill.name,
      selfReportedLevel: 5,
    }));

    const report = calculateSkillGap({
      userId: 'user-perfect-1',
      learnerProfileId: 'profile-perfect-1',
      career: MOCK_BACKEND_CAREER,
      careerSkills: MOCK_CAREER_SKILLS,
      allPrerequisites: MOCK_PREREQUISITES,
      learnerSkills: perfectLearner,
    });

    expect(report.readinessScore).toBe(100);
    expect(report.readinessBand).toBe('Career Ready');
    expect(report.strengths).toHaveLength(MOCK_CAREER_SKILLS.length);
    expect(report.criticalGaps).toHaveLength(0);
    expect(report.actionQueue).toHaveLength(0);
  });

  it('clamps learner levels exceeding required levels with gap = 0', () => {
    const learnerSkills = [{ name: 'Java', selfReportedLevel: 5 }];
    const report = calculateSkillGap({
      userId: 'user-exceed-1',
      learnerProfileId: 'profile-exceed-1',
      career: MOCK_BACKEND_CAREER,
      careerSkills: [MOCK_CAREER_SKILLS[0]!], // Java required=4
      allPrerequisites: [],
      learnerSkills,
    });

    const javaResult = report.allResults[0]!;
    expect(javaResult.gap).toBe(0);
    expect(javaResult.gapSeverity).toBe(0);
    expect(javaResult.category).toBe('STRENGTH');
    expect(javaResult.priorityScore).toBe(0);
  });

  it('produces structured, explainable text for critical gaps', () => {
    const learnerSkills = [{ name: 'Java', selfReportedLevel: 4 }];
    const report = calculateSkillGap({
      userId: 'user-exp-1',
      learnerProfileId: 'profile-exp-1',
      career: MOCK_BACKEND_CAREER,
      careerSkills: MOCK_CAREER_SKILLS,
      allPrerequisites: MOCK_PREREQUISITES,
      learnerSkills,
    });

    const rest = report.allResults.find(r => r.skillName === 'REST APIs')!;
    expect(rest.explanation).toContain('REST APIs');
    expect(rest.explanation).toContain('4/5');
    expect(rest.explanation).toContain('Prerequisite check: READY');
  });
});
