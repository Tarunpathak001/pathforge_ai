import { describe, it, expect } from 'vitest';
import { calculateProfileCompleteness, deduplicateSkills } from '@pathforge/shared';

describe('Frontend Onboarding Logic & Calculations', () => {
  it('calculates 0% completeness for empty onboarding state', () => {
    const completeness = calculateProfileCompleteness(null);
    expect(completeness.score).toBe(0);
    expect(completeness.breakdown.careerGoal).toBe(false);
  });

  it('updates completeness as learner fills in steps', () => {
    const step1 = calculateProfileCompleteness({
      targetRole: 'Backend Engineer',
    });
    expect(step1.score).toBe(20);
    expect(step1.breakdown.careerGoal).toBe(true);

    const step3 = calculateProfileCompleteness({
      targetRole: 'Backend Engineer',
      technicalLevel: 'INTERMEDIATE',
      educationLevel: 'Bachelor Degree',
      skills: [{ name: 'Java', normalizedName: 'java', selfReportedLevel: 4 }],
    });
    expect(step3.score).toBe(60); // 20 (goal) + 15 (exp) + 25 (skills)
  });

  it('normalizes and deduplicates user entered skills in frontend wizard', () => {
    const rawSkills = [
      { name: 'react js', selfReportedLevel: 3 },
      { name: 'React', selfReportedLevel: 4 },
      { name: 'node', selfReportedLevel: 3 },
      { name: 'Node.js', selfReportedLevel: 3 },
    ];
    const deduplicated = deduplicateSkills(rawSkills);
    expect(deduplicated).toHaveLength(2);
    expect(deduplicated.find(s => s.name === 'React')?.selfReportedLevel).toBe(4);
    expect(deduplicated.find(s => s.name === 'Node.js')).toBeDefined();
  });
});
