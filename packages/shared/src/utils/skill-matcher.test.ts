import { describe, it, expect } from 'vitest';
import { matchSkillToCanonical, type CanonicalSkillReference } from './skill-matcher.js';

const SAMPLE_CANONICAL_SKILLS: CanonicalSkillReference[] = [
  { id: '1', name: 'Java', slug: 'java', aliases: ['Java SE', 'Core Java', 'JDK'] },
  {
    id: '2',
    name: 'JavaScript',
    slug: 'javascript',
    aliases: ['JS', 'ES6', 'ECMAScript', 'Javascript'],
  },
  { id: '3', name: 'Node.js', slug: 'nodejs', aliases: ['Node', 'NodeJS', 'Node JS'] },
  { id: '4', name: 'PostgreSQL', slug: 'postgresql', aliases: ['Postgres', 'Postgre SQL', 'psql'] },
  { id: '5', name: 'Python', slug: 'python', aliases: ['Py', 'Python 3', 'Python3'] },
  { id: '6', name: 'C', slug: 'c', aliases: ['C Language'] },
  { id: '7', name: 'C++', slug: 'cpp', aliases: ['C plus plus', 'C/C++'] },
  { id: '8', name: 'C#', slug: 'csharp', aliases: ['CSharp', '.NET C#'] },
];

describe('Skill Matcher Tests', () => {
  it('matches exact name and slug', () => {
    const res = matchSkillToCanonical({ name: 'Java' }, SAMPLE_CANONICAL_SKILLS);
    expect(res.matched).toBe(true);
    expect(res.canonicalSkillId).toBe('1');
    expect(res.canonicalName).toBe('Java');
  });

  it('matches common aliases (e.g. "node" -> "Node.js", "postgres" -> "PostgreSQL", "js" -> "JavaScript")', () => {
    const nodeRes = matchSkillToCanonical({ name: 'node' }, SAMPLE_CANONICAL_SKILLS);
    expect(nodeRes.matched).toBe(true);
    expect(nodeRes.canonicalName).toBe('Node.js');

    const psqlRes = matchSkillToCanonical({ name: 'Postgres' }, SAMPLE_CANONICAL_SKILLS);
    expect(psqlRes.matched).toBe(true);
    expect(psqlRes.canonicalName).toBe('PostgreSQL');

    const jsRes = matchSkillToCanonical({ name: 'JS' }, SAMPLE_CANONICAL_SKILLS);
    expect(jsRes.matched).toBe(true);
    expect(jsRes.canonicalName).toBe('JavaScript');
  });

  it('strictly prevents Java and JavaScript false positive confusion', () => {
    const javaInput = { name: 'Java' };
    const jsSkillOnly = [SAMPLE_CANONICAL_SKILLS[1]!]; // JavaScript

    const res = matchSkillToCanonical(javaInput, jsSkillOnly);
    expect(res.matched).toBe(false);
  });

  it('strictly separates C, C++, and C#', () => {
    const cInput = { name: 'C' };
    const cppSkill = [SAMPLE_CANONICAL_SKILLS[6]!]; // C++
    const csharpSkill = [SAMPLE_CANONICAL_SKILLS[7]!]; // C#

    expect(matchSkillToCanonical(cInput, cppSkill).matched).toBe(false);
    expect(matchSkillToCanonical(cInput, csharpSkill).matched).toBe(false);
  });

  it('returns matched=false for unknown skills without throwing', () => {
    const unknown = matchSkillToCanonical(
      { name: 'Random Nonexistent Skill' },
      SAMPLE_CANONICAL_SKILLS
    );
    expect(unknown.matched).toBe(false);
    expect(unknown.confidence).toBe(0);
  });
});
