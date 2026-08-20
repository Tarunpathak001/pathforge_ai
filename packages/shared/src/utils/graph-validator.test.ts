import { describe, it, expect } from 'vitest';
import {
  validatePrerequisiteEdge,
  validateFullGraph,
  topologicalSortSkills,
  findPath,
} from './graph-validator.js';

describe('Graph Validator Tests', () => {
  it('rejects self-prerequisite (A -> A)', () => {
    const result = validatePrerequisiteEdge({ skillId: 'java', prerequisiteSkillId: 'java' }, []);

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Self-prerequisite is invalid');
  });

  it('rejects duplicate prerequisite relationship', () => {
    const existing = [{ skillId: 'spring-boot', prerequisiteSkillId: 'java' }];
    const result = validatePrerequisiteEdge(
      { skillId: 'spring-boot', prerequisiteSkillId: 'java' },
      existing
    );

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Duplicate prerequisite');
  });

  it('rejects direct 2-node cycle (A -> B, B -> A)', () => {
    // Existing: A requires B (A -> B)
    const existing = [{ skillId: 'skill-a', prerequisiteSkillId: 'skill-b' }];

    // Attempt: B requires A (B -> A)
    const result = validatePrerequisiteEdge(
      { skillId: 'skill-b', prerequisiteSkillId: 'skill-a' },
      existing
    );

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Circular dependency detected');
  });

  it('rejects indirect 3-node cycle (A -> B -> C -> A)', () => {
    // Existing: A requires B, B requires C
    const existing = [
      { skillId: 'skill-a', prerequisiteSkillId: 'skill-b' },
      { skillId: 'skill-b', prerequisiteSkillId: 'skill-c' },
    ];

    // Attempt: C requires A (C -> A)
    const result = validatePrerequisiteEdge(
      { skillId: 'skill-c', prerequisiteSkillId: 'skill-a' },
      existing
    );

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Circular dependency detected');
    expect(result.cycle).toContain('skill-a');
    expect(result.cycle).toContain('skill-b');
    expect(result.cycle).toContain('skill-c');
  });

  it('accepts valid prerequisite edges in a DAG', () => {
    const existing = [
      { skillId: 'rest-apis', prerequisiteSkillId: 'http' },
      { skillId: 'http', prerequisiteSkillId: 'networking-basics' },
      { skillId: 'spring-boot', prerequisiteSkillId: 'java' },
    ];

    // New valid edge: spring-boot requires rest-apis
    const result = validatePrerequisiteEdge(
      { skillId: 'spring-boot', prerequisiteSkillId: 'rest-apis' },
      existing
    );

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('accepts diamond pattern (A requires B & C, B & C require D)', () => {
    const existing = [
      { skillId: 'b', prerequisiteSkillId: 'd' },
      { skillId: 'c', prerequisiteSkillId: 'd' },
      { skillId: 'a', prerequisiteSkillId: 'b' },
    ];

    // Add a requires c -> Valid diamond DAG!
    const result = validatePrerequisiteEdge({ skillId: 'a', prerequisiteSkillId: 'c' }, existing);

    expect(result.isValid).toBe(true);
  });

  it('findPath correctly identifies existing paths', () => {
    const edges = [
      { skillId: 'system-design', prerequisiteSkillId: 'microservices' },
      { skillId: 'microservices', prerequisiteSkillId: 'rest-apis' },
      { skillId: 'rest-apis', prerequisiteSkillId: 'http' },
    ];

    const path = findPath('system-design', 'http', edges);
    expect(path).toEqual(['system-design', 'microservices', 'rest-apis', 'http']);

    const noPath = findPath('http', 'system-design', edges);
    expect(noPath).toBeNull();
  });

  it('validateFullGraph passes on valid DAG and catches cycles', () => {
    const validEdges = [
      { skillId: 'b', prerequisiteSkillId: 'a' },
      { skillId: 'c', prerequisiteSkillId: 'b' },
      { skillId: 'd', prerequisiteSkillId: 'a' },
    ];
    expect(validateFullGraph(validEdges).isValid).toBe(true);

    const cyclicEdges = [
      { skillId: 'b', prerequisiteSkillId: 'a' },
      { skillId: 'c', prerequisiteSkillId: 'b' },
      { skillId: 'a', prerequisiteSkillId: 'c' },
    ];
    expect(validateFullGraph(cyclicEdges).isValid).toBe(false);
  });

  it('topologicalSortSkills orders prerequisites before dependent skills', () => {
    const skillIds = ['system-design', 'networking-basics', 'http', 'rest-apis'];
    const edges = [
      { skillId: 'system-design', prerequisiteSkillId: 'rest-apis' },
      { skillId: 'rest-apis', prerequisiteSkillId: 'http' },
      { skillId: 'http', prerequisiteSkillId: 'networking-basics' },
    ];

    const sorted = topologicalSortSkills(skillIds, edges);
    // In learning order: networking-basics -> http -> rest-apis -> system-design
    expect(sorted.indexOf('networking-basics')).toBeLessThan(sorted.indexOf('http'));
    expect(sorted.indexOf('http')).toBeLessThan(sorted.indexOf('rest-apis'));
    expect(sorted.indexOf('rest-apis')).toBeLessThan(sorted.indexOf('system-design'));
  });
});
