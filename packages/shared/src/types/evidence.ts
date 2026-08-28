export type EvidenceType =
  | 'SELF_REPORTED'
  | 'RESOURCE_COMPLETION'
  | 'ASSESSMENT'
  | 'PROJECT'
  | 'USER_FEEDBACK';

export type SkillStatus = 'NEEDS_WORK' | 'DEVELOPING' | 'SATISFIED' | 'MASTERED';

export interface SkillEvidenceItem {
  id?: string;
  learnerProfileId: string;
  skillId: string;
  skillName?: string;
  skillSlug?: string;
  evidenceType: EvidenceType;
  sourceId?: string; // e.g. assessmentAttemptId or resourceId
  score: number; // 0 to 100
  confidence: number; // 0.0 to 1.0
  notes?: string;
  createdAt: Date;
}

export interface SkillStateItem {
  id?: string;
  learnerProfileId: string;
  skillId: string;
  skillName: string;
  skillSlug: string;
  inferredLevel: number; // 1 to 5
  confidence: number; // 0.0 to 1.0
  evidenceScore: number; // 0 to 100 aggregated score
  status: SkillStatus;
  selfReportedLevel: number; // Preserved original self-report
  targetLevel: number; // Target benchmark for active career
  gap: number; // max(0, targetLevel - inferredLevel)
  lastAssessedAt?: Date | null;
  evidenceCount: number;
  evidenceHistory?: SkillEvidenceItem[];
  updatedAt?: Date;
}
