import type { CopilotIntent } from '../types/copilot.js';

export interface CopilotEvalCase {
  id: string;
  category: CopilotIntent;
  question: string;
  expectedKeywords: string[];
  forbiddenKeywords?: string[];
  expectedActions?: string[];
}

export const COPILOT_EVALUATION_DATASET: CopilotEvalCase[] = [
  // 1. Next Action Evaluation
  {
    id: 'next-action-01',
    category: 'NEXT_ACTION',
    question: 'What should I learn today?',
    expectedKeywords: ['action', 'why now', 'time'],
    expectedActions: ['OPEN_RESOURCE', 'OPEN_PATH'],
  },
  {
    id: 'next-action-02',
    category: 'NEXT_ACTION',
    question: 'What is my next best step?',
    expectedKeywords: ['action', 'hours'],
  },

  // 2. Skill Gap Evaluation
  {
    id: 'skill-gap-01',
    category: 'SKILL_GAP',
    question: 'Why is System Design still a gap for me?',
    expectedKeywords: ['System Design', 'Backend Architecture', 'prerequisite'],
  },
  {
    id: 'skill-gap-02',
    category: 'SKILL_GAP',
    question: 'What are my biggest career gaps?',
    expectedKeywords: ['PostgreSQL', 'Authentication', 'System Design'],
  },
  {
    id: 'skill-gap-03',
    category: 'SKILL_GAP',
    question: 'What skills am I strongest at?',
    expectedKeywords: ['Java', 'SQL', 'Git'],
  },

  // 3. Roadmap & Adaptation Evaluation
  {
    id: 'roadmap-01',
    category: 'ROADMAP',
    question: 'Why did my roadmap change?',
    expectedKeywords: ['assessment', 'REST', 'unlocked'],
  },
  {
    id: 'roadmap-02',
    category: 'ROADMAP',
    question: 'Why is Backend Architecture before System Design?',
    expectedKeywords: ['prerequisite', 'Backend Architecture', 'System Design'],
  },
  {
    id: 'roadmap-03',
    category: 'ROADMAP',
    question: 'Can I skip REST APIs?',
    expectedKeywords: ['REST', 'fundamentals', 'assessed'],
  },

  // 4. Recommendation Evaluation
  {
    id: 'recommendation-01',
    category: 'RECOMMENDATION',
    question: 'Why did you recommend Spring Boot Fundamentals?',
    expectedKeywords: ['Spring Boot', 'match', 'gap'],
  },
  {
    id: 'recommendation-02',
    category: 'RECOMMENDATION',
    question: 'Is there a hands-on project instead of video?',
    expectedKeywords: ['project', 'practical', 'hands-on'],
  },

  // 5. Planning & Budget Evaluation
  {
    id: 'planning-01',
    category: 'PLANNING',
    question: 'I only have 5 hours this week. What should I focus on?',
    expectedKeywords: ['hours', 'Spring Boot'],
    forbiddenKeywords: ['15 hours', '20 hours', '10 hours'],
  },
  {
    id: 'planning-02',
    category: 'PLANNING',
    question: 'Can I finish Milestone 2 this weekend?',
    expectedKeywords: ['Milestone', 'hours'],
  },

  // 6. Progress Evaluation
  {
    id: 'progress-01',
    category: 'PROGRESS',
    question: 'How much progress have I made toward Backend Engineer?',
    expectedKeywords: ['72%', 'alignment', 'Milestone'],
  },
  {
    id: 'progress-02',
    category: 'PROGRESS',
    question: 'What skills have I improved recently?',
    expectedKeywords: ['REST APIs', '4/5'],
  },

  // 7. Assessment & Hallucination Prevention Evaluation
  {
    id: 'assessment-01',
    category: 'ASSESSMENT',
    question: "Didn't I already complete the System Design assessment?",
    expectedKeywords: ['not', 'no record', 'System Design'],
    forbiddenKeywords: ['Yes, you completed it', 'You passed with 90%'],
  },
  {
    id: 'assessment-02',
    category: 'ASSESSMENT',
    question: 'What was my score on the REST API assessment?',
    expectedKeywords: ['90%', 'REST API'],
  },

  // 8. Career Requirements Evaluation
  {
    id: 'career-01',
    category: 'CAREER_REQUIREMENTS',
    question: 'What does a Backend Engineer need to know?',
    expectedKeywords: ['Java', 'SQL', 'REST', 'PostgreSQL', 'Docker'],
  },

  // 9. Concept Explanation Evaluation
  {
    id: 'concept-01',
    category: 'CONCEPT_EXPLANATION',
    question: 'What is Redis and why is it used?',
    expectedKeywords: ['caching', 'in-memory', 'database'],
  },
  {
    id: 'concept-02',
    category: 'CONCEPT_EXPLANATION',
    question: 'Explain REST APIs simply.',
    expectedKeywords: ['HTTP', 'client', 'server', 'endpoints'],
  },
];
