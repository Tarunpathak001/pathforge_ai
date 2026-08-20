import { describe, it, expect } from 'vitest';
import { normalizeSkill, deduplicateSkills } from './skill-normalizer.js';

describe('SkillNormalizer', () => {
  it('normalizes common aliases to canonical names', () => {
    expect(normalizeSkill('js').normalizedName).toBe('JavaScript');
    expect(normalizeSkill('javascript').normalizedName).toBe('JavaScript');
    expect(normalizeSkill('reactjs').normalizedName).toBe('React');
    expect(normalizeSkill('react js').normalizedName).toBe('React');
    expect(normalizeSkill('react.js').normalizedName).toBe('React');
    expect(normalizeSkill('node').normalizedName).toBe('Node.js');
    expect(normalizeSkill('nodejs').normalizedName).toBe('Node.js');
    expect(normalizeSkill('postgres').normalizedName).toBe('PostgreSQL');
    expect(normalizeSkill('postgresql').normalizedName).toBe('PostgreSQL');
    expect(normalizeSkill('k8s').normalizedName).toBe('Kubernetes');
    expect(normalizeSkill('springboot').normalizedName).toBe('Spring Boot');
    expect(normalizeSkill('spring boot').normalizedName).toBe('Spring Boot');
  });

  it('handles custom / unrecognized skills with clean capitalization', () => {
    expect(normalizeSkill('solidity').normalizedName).toBe('Solidity');
    expect(normalizeSkill('unreal engine').normalizedName).toBe('Unreal Engine');
  });

  it('handles empty / whitespace input gracefully', () => {
    expect(normalizeSkill('').normalizedName).toBe('');
    expect(normalizeSkill('   ').normalizedName).toBe('');
  });

  it('deduplicates skills and merges highest self-reported level', () => {
    const raw = [
      { name: 'Java', selfReportedLevel: 3 },
      { name: 'java', selfReportedLevel: 4 },
      { name: 'JAVA', selfReportedLevel: 2 },
      { name: 'node', selfReportedLevel: 3 },
      { name: 'Node.js', selfReportedLevel: 4 },
    ];
    const result = deduplicateSkills(raw);
    expect(result).toHaveLength(2);
    const javaSkill = result.find(s => s.name === 'Java');
    expect(javaSkill?.selfReportedLevel).toBe(4);
    const nodeSkill = result.find(s => s.name === 'Node.js');
    expect(nodeSkill?.selfReportedLevel).toBe(4);
  });
});
