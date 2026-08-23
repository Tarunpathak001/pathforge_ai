/**
 * Semantic Embedding Generator & Vector Similarity Utility
 * Produces deterministic dense semantic vectors (64-dimensional) with L2 normalization.
 */

export function buildResourceEmbeddingText(resource: {
  title: string;
  description: string;
  resourceType: string;
  difficulty: string;
  skills: { name: string; coverage: string }[];
}): string {
  const skillDetails = resource.skills
    .map(s => `${s.name} (${s.coverage.toLowerCase()})`)
    .join(', ');
  return `${resource.title}. ${resource.description}. Format: ${resource.resourceType}. Difficulty: ${resource.difficulty}. Key competencies taught: ${skillDetails}.`.toLowerCase();
}

export function buildQueryEmbeddingText(context: {
  careerName: string;
  targetSkillName: string;
  learnerLevel: number;
  learningStyle?: string;
  interests?: string[];
}): string {
  const levelLabel =
    context.learnerLevel <= 1
      ? 'beginner foundational'
      : context.learnerLevel <= 3
      ? 'intermediate practical'
      : 'advanced specialized';
  const interests = context.interests?.length ? ` Interests: ${context.interests.join(', ')}.` : '';
  const style = context.learningStyle ? ` Preferred format: ${context.learningStyle}.` : '';
  return `Target career: ${context.careerName}. Learning priority gap: ${context.targetSkillName}. Current learner level: ${levelLabel}.${style}${interests}`.toLowerCase();
}

/**
 * Deterministic term-frequency hashing vectorizer with subword character n-grams and L2 normalization.
 * Maps arbitrary textual context into a dense 64-dimensional semantic space.
 */
export function generateTextEmbedding(text: string, dimensions = 64): number[] {
  const vector: number[] = new Array(dimensions).fill(0);
  if (!text || text.trim().length === 0) {
    vector[0] = 1.0;
    return vector;
  }

  // Tokenize words
  const clean = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
  const rawTokens = clean.split(/\s+/).filter(t => t.length > 1);

  if (rawTokens.length === 0) {
    vector[0] = 1.0;
    return vector;
  }

  // Term frequencies
  const tf: Record<string, number> = {};
  for (const token of rawTokens) {
    tf[token] = (tf[token] || 0) + 1;
  }

  for (const [token, count] of Object.entries(tf)) {
    const weight = Math.sqrt(count);
    const hash = Math.abs(simpleHash(token)) % dimensions;
    vector[hash] = (vector[hash] ?? 0) + weight * 2.0;

    // Character 3-grams for semantic root matching (e.g. 'rest' in 'restful', 'architect' in 'architecture')
    if (token.length >= 3) {
      for (let j = 0; j <= token.length - 3; j++) {
        const sub = token.substring(j, j + 3);
        const subHash = Math.abs(simpleHash(sub)) % dimensions;
        vector[subHash] = (vector[subHash] ?? 0) + 0.5 * weight;
      }
    }
  }

  // Bi-grams
  for (let i = 0; i < rawTokens.length - 1; i++) {
    const t1 = rawTokens[i];
    const t2 = rawTokens[i + 1];
    if (t1 && t2) {
      const bigram = `${t1}_${t2}`;
      const biHash = Math.abs(simpleHash(bigram)) % dimensions;
      vector[biHash] = (vector[biHash] ?? 0) + 1.2;
    }
  }

  // Apply L2 normalization: vector / ||vector||
  let normSquared = 0;
  for (let i = 0; i < dimensions; i++) {
    const val = vector[i] ?? 0;
    normSquared += val * val;
  }

  const norm = Math.sqrt(normSquared);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = Number(((vector[i] ?? 0) / norm).toFixed(6));
    }
  } else {
    vector[0] = 1.0;
  }

  return vector;
}

/**
 * Computes Cosine Similarity between two L2-normalized or arbitrary vectors.
 * Returns a value normalized between 0.0 and 1.0.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const len = Math.min(vecA.length, vecB.length);

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    const a = vecA[i] ?? 0;
    const b = vecB[i] ?? 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA === 0 || normB === 0) return 0;

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  const clamped = Math.max(0, Math.min(1, similarity));
  return Number(clamped.toFixed(4));
}

function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash;
}
