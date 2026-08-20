import { config } from '../config/env.js';
import {
  ExtractedProfileResponseSchema,
  type ExtractedProfileResponse,
  type AIExtractionRequest,
  normalizeSkill,
} from '@pathforge/shared';

export async function extractProfileWithAI(
  request: AIExtractionRequest
): Promise<ExtractedProfileResponse> {
  const url = `${config.aiServiceUrl}/ai/profile/extract`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI service returned ${response.status}: ${response.statusText}`);
    }

    const rawData = await response.json();

    // Map snake_case to camelCase if needed
    const formattedData = {
      targetRole: rawData.target_role || rawData.targetRole,
      skills: (rawData.skills || []).map((s: any) => ({
        name: normalizeSkill(s.name).normalizedName || s.name,
        level: s.level || 3,
        evidence: s.evidence || undefined,
        yearsExperience: s.years_experience || s.yearsExperience || undefined,
      })),
      interests: rawData.interests || [],
      projects: (rawData.projects || []).map((p: any) => ({
        name: p.name,
        description: p.description || '',
        technologies: p.technologies || [],
      })),
      experienceLevel: rawData.experience_level || rawData.experienceLevel || undefined,
      weeklyAvailability: rawData.weekly_availability || rawData.weeklyAvailability || undefined,
      summary: rawData.summary || undefined,
    };

    // Strict schema validation against Zod schema
    const validated = ExtractedProfileResponseSchema.parse(formattedData);
    return validated;
  } catch (error: any) {
    console.warn(`[AI Extraction Fallback] Could not reach AI service at ${url}: ${error.message}`);
    // Safe graceful heuristic fallback on Node side
    return fallbackExtraction(request.text);
  }
}

/**
 * Fallback lightweight extraction if Python AI service is temporarily offline
 */
function fallbackExtraction(text: string): ExtractedProfileResponse {
  const skillsFound: Array<{ name: string; level: number; evidence?: string }> = [];
  const knownKeywords = [
    { raw: 'javascript', norm: 'JavaScript' },
    { raw: 'typescript', norm: 'TypeScript' },
    { raw: 'react', norm: 'React' },
    { raw: 'node', norm: 'Node.js' },
    { raw: 'python', norm: 'Python' },
    { raw: 'java', norm: 'Java' },
    { raw: 'sql', norm: 'SQL' },
    { raw: 'mongodb', norm: 'MongoDB' },
    { raw: 'docker', norm: 'Docker' },
    { raw: 'spring', norm: 'Spring Boot' },
    { raw: 'cloud', norm: 'Cloud Computing' },
  ];

  const lower = text.toLowerCase();
  for (const item of knownKeywords) {
    if (lower.includes(item.raw)) {
      skillsFound.push({
        name: item.norm,
        level: 3,
        evidence: `Extracted from text: "${text.substring(0, 50)}..."`,
      });
    }
  }

  let role: string | undefined = undefined;
  if (lower.includes('backend')) role = 'Backend Engineer';
  else if (lower.includes('frontend')) role = 'Frontend Engineer';
  else if (lower.includes('full stack') || lower.includes('fullstack'))
    role = 'Full Stack Engineer';

  return {
    targetRole: role,
    skills: skillsFound,
    interests: lower.includes('distributed') ? ['Distributed Systems'] : [],
    projects: [],
    experienceLevel: 'INTERMEDIATE',
    weeklyAvailability: '10-15 hours/week',
    summary: 'Extracted via fallback parser (AI service offline)',
  };
}
