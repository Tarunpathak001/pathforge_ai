import type {
  LearnerProfile,
  ProfileCompleteness,
  ProfileCompletenessBreakdown,
} from '../types/profile.js';

/**
 * Calculates a deterministic, explainable completeness score (0 - 100) based on 6 core profile sections.
 *
 * Weightings:
 * - Career Goal: 20%
 * - Experience Context: 15%
 * - Current Skills (at least 1 skill): 25%
 * - Projects / Practical History: 15%
 * - Interests: 15%
 * - Learning Preferences: 10%
 */
export function calculateProfileCompleteness(
  profile: Partial<LearnerProfile> | null | undefined
): ProfileCompleteness {
  if (!profile) {
    return {
      score: 0,
      percentage: 0,
      breakdown: {
        careerGoal: false,
        experience: false,
        skills: false,
        projects: false,
        interests: false,
        learningPreferences: false,
      },
      summary: 'Profile is empty (0%)',
    };
  }

  const breakdown: ProfileCompletenessBreakdown = {
    careerGoal: Boolean(profile.targetRole && profile.targetRole.trim().length > 0),
    experience: Boolean(
      (profile.educationLevel && profile.educationLevel.trim().length > 0) ||
      (profile.experienceYears !== undefined && profile.experienceYears !== null) ||
      (profile.professionalSummary && profile.professionalSummary.trim().length > 0) ||
      profile.technicalLevel
    ),
    skills: Boolean(Array.isArray(profile.skills) && profile.skills.length > 0),
    projects: Boolean(
      (Array.isArray(profile.projects) && profile.projects.length > 0) ||
      (Array.isArray(profile.learningExperiences) && profile.learningExperiences.length > 0) ||
      (Array.isArray(profile.certifications) && profile.certifications.length > 0)
    ),
    interests: Boolean(Array.isArray(profile.interests) && profile.interests.length > 0),
    learningPreferences: Boolean(
      profile.preference &&
      profile.preference.weeklyAvailabilityHours &&
      profile.preference.learningFormat
    ),
  };

  let score = 0;
  if (breakdown.careerGoal) score += 20;
  if (breakdown.experience) score += 15;
  if (breakdown.skills) score += 25;
  if (breakdown.projects) score += 15;
  if (breakdown.interests) score += 15;
  if (breakdown.learningPreferences) score += 10;

  let summary = 'Getting started';
  if (score === 100) summary = 'Profile Complete (100%)';
  else if (score >= 80) summary = 'Excellent (Strong Foundation)';
  else if (score >= 60) summary = 'Good (Core Information Captured)';
  else if (score >= 40) summary = 'In Progress (Needs More Details)';
  else summary = 'Just Started';

  return {
    score,
    percentage: score,
    breakdown,
    summary,
  };
}
