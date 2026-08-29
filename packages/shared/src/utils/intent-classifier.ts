import type { CopilotIntent } from '../types/copilot.js';

export interface IntentClassificationResult {
  intent: CopilotIntent;
  confidence: number;
  extractedEntity?: string;
}

export function classifyCopilotIntent(query: string): IntentClassificationResult {
  const text = query.toLowerCase().trim();

  // 1. Planning & Time Budget Intent (takes priority if time/hours/weekend specified)
  if (
    text.includes('hours this week') ||
    text.includes('hour this week') ||
    text.includes('hours available') ||
    text.includes('only have') ||
    text.includes('time budget') ||
    text.includes('this weekend') ||
    text.includes('finish this milestone') ||
    text.includes('finish milestone') ||
    text.includes('plan my week') ||
    text.includes('schedule my study') ||
    text.includes('focus this week') ||
    text.includes('focus on this week')
  ) {
    return { intent: 'PLANNING', confidence: 0.96 };
  }

  // 2. Next Action Intent
  if (
    text.includes('what should i learn today') ||
    text.includes('what should i do next') ||
    text.includes('what to learn next') ||
    text.includes('what should i learn next') ||
    text.includes('what is next') ||
    text.includes('what next') ||
    text.includes('next action') ||
    text.includes('next step') ||
    text.includes('next best') ||
    text.includes('start next') ||
    text.includes('where do i start') ||
    text.includes('continue learning')
  ) {
    return { intent: 'NEXT_ACTION', confidence: 0.95 };
  }

  // 3. Roadmap, Skip & Adaptation Intent
  if (
    text.includes('why did my roadmap change') ||
    text.includes('path change') ||
    text.includes('why is this milestone') ||
    text.includes('before system design') ||
    text.includes('can i skip') ||
    text.includes('should i skip') ||
    text.includes('why is') && (text.includes('blocked') || text.includes('before')) ||
    text.includes('milestone order') ||
    text.includes('learning path order')
  ) {
    return { intent: 'ROADMAP', confidence: 0.94 };
  }

  // 4. Recommendation Explanation Intent
  if (
    text.includes('why did you recommend') ||
    text.includes('why was this recommended') ||
    text.includes('why this course') ||
    text.includes('why this resource') ||
    text.includes('shorter resource') ||
    text.includes('project instead') ||
    text.includes('alternative resource') ||
    text.includes('hands-on project')
  ) {
    return { intent: 'RECOMMENDATION', confidence: 0.94 };
  }

  // 5. Skill Gap & Competency Intent
  if (
    text.includes('gap') ||
    text.includes('gaps') ||
    text.includes('weak') ||
    text.includes('weakest') ||
    text.includes('strongest') ||
    text.includes('strengths') ||
    text.includes('strength') ||
    text.includes('missing skills') ||
    text.includes('where am i lacking')
  ) {
    return { intent: 'SKILL_GAP', confidence: 0.94 };
  }

  // 6. Progress & Completion Intent
  if (
    text.includes('how much have i completed') ||
    text.includes('my progress') ||
    text.includes('completion rate') ||
    text.includes('skills have i improved') ||
    text.includes('skill improved') ||
    text.includes('how close am i') ||
    text.includes('career alignment')
  ) {
    return { intent: 'PROGRESS', confidence: 0.90 };
  }

  // 7. Assessment & Quiz Verification Intent
  if (
    text.includes('assessment') ||
    text.includes('quiz') ||
    text.includes('test score') ||
    text.includes('did i complete the') ||
    text.includes('already complete')
  ) {
    return { intent: 'ASSESSMENT', confidence: 0.88 };
  }

  // 8. Career Requirements Intent
  if (
    text.includes('what does a') ||
    text.includes('what does an') ||
    text.includes('need to become') ||
    text.includes('requirements for') ||
    text.includes('skills needed for') ||
    text.includes('career require')
  ) {
    return { intent: 'CAREER_REQUIREMENTS', confidence: 0.90 };
  }

  // 9. Concept / Educational Explanation
  if (
    text.startsWith('what is ') ||
    text.startsWith('explain ') ||
    text.includes('how does ') ||
    text.includes('difference between') ||
    text.includes('like i\'m 5') ||
    text.includes('simply explain')
  ) {
    return { intent: 'CONCEPT_EXPLANATION', confidence: 0.85 };
  }

  return { intent: 'GENERAL_LEARNING', confidence: 0.70 };
}
