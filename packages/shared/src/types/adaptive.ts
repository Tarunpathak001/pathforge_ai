export type NextActionType = 'RESOURCE' | 'ASSESSMENT' | 'PROJECT';

export interface NextAction {
  type: NextActionType;
  id: string; // resourceId or assessmentId
  title: string;
  subtitle?: string;
  reason: string;
  estimatedMinutes: number;
  skillName: string;
  skillId: string;
  actionUrl: string;
  priority: number;
}

export interface SkillUpdateSummary {
  skillId: string;
  skillName: string;
  fromLevel: number;
  toLevel: number;
  confidence: number;
  gapStatus: string;
}

export interface AdaptiveChangeSummary {
  skillsUpdated: SkillUpdateSummary[];
  gapsResolved: string[];
  gapsReduced: string[];
  milestonesCompleted: string[];
  milestonesUnlocked: string[];
  recommendationsChanged: string[];
  careerAlignment: {
    before: number;
    after: number;
  };
  nextAction: NextAction | null;
  explanationNarrative: string[];
  adaptedAt: Date;
}
