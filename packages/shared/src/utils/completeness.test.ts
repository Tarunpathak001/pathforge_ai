import { describe, it, expect } from 'vitest';
import { calculateProfileCompleteness } from './completeness.js';
import type { LearnerProfile } from '../types/profile.js';

describe('ProfileCompleteness', () => {
  it('returns 0 for empty or null profile', () => {
    const res = calculateProfileCompleteness(null);
    expect(res.score).toBe(0);
    expect(res.breakdown.careerGoal).toBe(false);
  });

  it('calculates partial completeness accurately', () => {
    const partialProfile: Partial<LearnerProfile> = {
      targetRole: 'Backend Engineer',
      skills: [{ name: 'Java', normalizedName: 'Java', selfReportedLevel: 3 }],
    };
    const res = calculateProfileCompleteness(partialProfile);
    expect(res.breakdown.careerGoal).toBe(true); // 20
    expect(res.breakdown.skills).toBe(true); // 25
    expect(res.breakdown.projects).toBe(false);
    expect(res.score).toBe(45);
  });

  it('calculates 100% for full profile', () => {
    const fullProfile: Partial<LearnerProfile> = {
      targetRole: 'Full Stack Engineer',
      educationLevel: 'Bachelor of Computer Science',
      technicalLevel: 'INTERMEDIATE',
      skills: [{ name: 'TypeScript', normalizedName: 'TypeScript', selfReportedLevel: 4 }],
      projects: [
        { name: 'PathForge', description: 'Career SaaS', technologies: ['React', 'Node'] },
      ],
      interests: [{ category: 'TECHNICAL', topic: 'Cloud' }],
      preference: {
        learningFormat: 'MIXED',
        difficultyPreference: 'CHALLENGING',
        weeklyAvailabilityHours: '10-15',
        projectPreference: 'BALANCED',
      },
    };
    const res = calculateProfileCompleteness(fullProfile);
    expect(res.score).toBe(100);
    expect(res.summary).toContain('100%');
  });
});
