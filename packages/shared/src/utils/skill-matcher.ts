import { normalizeSkill } from './skill-normalizer.js';

export interface CanonicalSkillReference {
  id: string;
  name: string;
  slug: string;
  aliases: string[];
}

export interface SkillMatchResult {
  matched: boolean;
  canonicalSkillId?: string;
  canonicalName?: string;
  canonicalSlug?: string;
  confidence: number; // 0.0 to 1.0
  matchStrategy: 'ID' | 'EXACT_NAME' | 'SLUG' | 'ALIAS' | 'NORMALIZED' | 'NONE';
}

/**
 * Pairs that must NEVER match to avoid dangerous false positives in technical career assessments.
 */
const FORBIDDEN_FALSE_POSITIVE_PAIRS = new Set([
  'java:javascript',
  'javascript:java',
  'java:js',
  'js:java',
  'c:cpp',
  'cpp:c',
  'c:c#',
  'c#:c',
  'c:csharp',
  'csharp:c',
  'go:gcp',
  'gcp:go',
  'r:rust',
  'rust:r',
]);

function isForbiddenPair(a: string, b: string): boolean {
  const cleanA = a.toLowerCase().trim();
  const cleanB = b.toLowerCase().trim();
  return (
    FORBIDDEN_FALSE_POSITIVE_PAIRS.has(`${cleanA}:${cleanB}`) ||
    FORBIDDEN_FALSE_POSITIVE_PAIRS.has(`${cleanB}:${cleanA}`)
  );
}

/**
 * Matches a learner's raw or normalized skill entry against a library of canonical career skills.
 */
export function matchSkillToCanonical(
  learnerInput: { id?: string; name: string; normalizedName?: string },
  canonicalSkills: CanonicalSkillReference[]
): SkillMatchResult {
  const rawName = (learnerInput.name || '').trim();
  if (!rawName && !learnerInput.id) {
    return { matched: false, confidence: 0, matchStrategy: 'NONE' };
  }

  // 1. Direct Canonical ID Match
  if (learnerInput.id) {
    const directMatch = canonicalSkills.find(s => s.id === learnerInput.id);
    if (directMatch) {
      return {
        matched: true,
        canonicalSkillId: directMatch.id,
        canonicalName: directMatch.name,
        canonicalSlug: directMatch.slug,
        confidence: 1.0,
        matchStrategy: 'ID',
      };
    }
  }

  const rawLower = rawName.toLowerCase();
  const rawKey = rawLower.replace(/\s+/g, ' ');
  const normalized = normalizeSkill(rawName);
  const normKey = (learnerInput.normalizedName || normalized.key).toLowerCase();

  // 2. Exact Name / Slug Match
  for (const cs of canonicalSkills) {
    if (isForbiddenPair(rawKey, cs.name) || isForbiddenPair(rawKey, cs.slug)) {
      continue;
    }

    if (cs.name.toLowerCase() === rawLower || cs.slug === rawLower || cs.slug === normKey) {
      return {
        matched: true,
        canonicalSkillId: cs.id,
        canonicalName: cs.name,
        canonicalSlug: cs.slug,
        confidence: 1.0,
        matchStrategy: cs.name.toLowerCase() === rawLower ? 'EXACT_NAME' : 'SLUG',
      };
    }
  }

  // 3. Exact Normalized Name Match
  for (const cs of canonicalSkills) {
    if (isForbiddenPair(normKey, cs.name) || isForbiddenPair(normKey, cs.slug)) {
      continue;
    }

    const csNorm = normalizeSkill(cs.name);
    if (
      csNorm.key === normKey ||
      cs.name.toLowerCase() === normalized.normalizedName.toLowerCase()
    ) {
      return {
        matched: true,
        canonicalSkillId: cs.id,
        canonicalName: cs.name,
        canonicalSlug: cs.slug,
        confidence: 0.95,
        matchStrategy: 'NORMALIZED',
      };
    }
  }

  // 4. Alias Dictionary Match
  for (const cs of canonicalSkills) {
    if (isForbiddenPair(rawKey, cs.name)) {
      continue;
    }

    const aliases = Array.isArray(cs.aliases) ? cs.aliases : [];
    for (const alias of aliases) {
      const aliasLower = alias.toLowerCase().trim();
      if (isForbiddenPair(rawKey, aliasLower)) {
        continue;
      }

      if (aliasLower === rawKey || aliasLower === normKey) {
        return {
          matched: true,
          canonicalSkillId: cs.id,
          canonicalName: cs.name,
          canonicalSlug: cs.slug,
          confidence: 0.9,
          matchStrategy: 'ALIAS',
        };
      }
    }
  }

  return { matched: false, confidence: 0, matchStrategy: 'NONE' };
}
