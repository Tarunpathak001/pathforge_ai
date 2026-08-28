import { describe, it, expect } from 'vitest';
import {
  inferSkillState,
  scoreToProficiencyLevel,
  levelToBaselineScore,
} from './skill-inference-engine.js';
import { calculateMilestoneProgress, calculatePathProgress } from './progress-calculator.js';
import { determineNextAction } from './next-action-engine.js';
import type { SkillEvidenceItem } from '../types/evidence.js';
import type { LearningMilestoneItem } from '../types/learning-path.js';
import type { ResourceProgressItem } from '../types/progress.js';

describe('Skill Inference & Progress Engine Tests (Phase 6)', () => {
  describe('Skill Inference Engine', () => {
    it('maps continuous percentage score to 1-5 discrete proficiency levels', () => {
      expect(scoreToProficiencyLevel(95)).toBe(5);
      expect(scoreToProficiencyLevel(87)).toBe(4);
      expect(scoreToProficiencyLevel(75)).toBe(4);
      expect(scoreToProficiencyLevel(68)).toBe(3);
      expect(scoreToProficiencyLevel(50)).toBe(2);
      expect(scoreToProficiencyLevel(30)).toBe(1);
    });

    it('infers baseline level with low confidence when no observed evidence exists', () => {
      const state = inferSkillState({
        skillId: 'rest-apis',
        skillName: 'REST APIs',
        skillSlug: 'rest-apis',
        learnerProfileId: 'test-profile',
        selfReportedLevel: 1,
        targetLevel: 4,
        evidenceList: [],
      });

      expect(state.inferredLevel).toBe(1);
      expect(state.confidence).toBe(0.35);
      expect(state.status).toBe('NEEDS_WORK');
      expect(state.gap).toBe(3);
    });

    it('Golden Rule: high assessment score (90%) updates inferred level from 1/5 to 4/5 or 5/5 with high confidence', () => {
      const evidence: SkillEvidenceItem[] = [
        {
          learnerProfileId: 'test-profile',
          skillId: 'rest-apis',
          evidenceType: 'ASSESSMENT',
          score: 90,
          confidence: 0.9,
          notes: 'REST API Assessment 90%',
          createdAt: new Date(),
        },
        {
          learnerProfileId: 'test-profile',
          skillId: 'rest-apis',
          evidenceType: 'PROJECT',
          score: 85,
          confidence: 0.8,
          notes: 'REST API CRUD Project Completed',
          createdAt: new Date(),
        },
      ];

      const state = inferSkillState({
        skillId: 'rest-apis',
        skillName: 'REST APIs',
        skillSlug: 'rest-apis',
        learnerProfileId: 'test-profile',
        selfReportedLevel: 1, // Started at 1
        targetLevel: 4,
        evidenceList: evidence,
      });

      expect(state.inferredLevel).toBeGreaterThanOrEqual(4);
      expect(state.confidence).toBeGreaterThanOrEqual(0.85);
      expect(state.status).toBe('SATISFIED');
      expect(state.gap).toBe(0);
      expect(state.selfReportedLevel).toBe(1); // Original preserved!
    });

    it('Low Score Rule: low assessment score (35%) keeps skill at 1/5 with remaining gap', () => {
      const evidence: SkillEvidenceItem[] = [
        {
          learnerProfileId: 'test-profile',
          skillId: 'rest-apis',
          evidenceType: 'ASSESSMENT',
          score: 35,
          confidence: 0.9,
          notes: 'Failed REST API Assessment',
          createdAt: new Date(),
        },
      ];

      const state = inferSkillState({
        skillId: 'rest-apis',
        skillName: 'REST APIs',
        skillSlug: 'rest-apis',
        learnerProfileId: 'test-profile',
        selfReportedLevel: 1,
        targetLevel: 4,
        evidenceList: evidence,
      });

      expect(state.inferredLevel).toBe(1);
      expect(state.status).toBe('NEEDS_WORK');
      expect(state.gap).toBe(3);
    });
  });

  describe('Progress Calculator Engine', () => {
    it('calculates weighted milestone and path progress accurately', () => {
      const dummyMilestones: LearningMilestoneItem[] = [
        {
          id: 'm1',
          title: 'Milestone 1: Foundations',
          description: 'REST API basics',
          order: 1,
          estimatedHours: 10,
          estimatedWeeks: 1,
          learningObjectives: ['Learn HTTP'],
          completionCriteria: ['Deploy API'],
          whyThisOrder: 'First step',
          status: 'IN_PROGRESS',
          skills: [{ skillId: 's1', skillName: 'REST APIs', skillSlug: 'rest-apis', currentLevel: 1, targetLevel: 4, gap: 3, order: 1 }],
          resources: [
            {
              resourceId: 'r1',
              role: 'PRIMARY',
              order: 1,
              estimatedHours: 6,
              resource: { id: 'r1', title: 'REST Guide', slug: 'rest-guide', description: '', resourceType: 'DOCUMENTATION', provider: 'MDN', url: '', difficulty: 'BEGINNER', estimatedHours: 6, isFree: true, qualityScore: 0.9, isActive: true, skills: [] },
            },
            {
              resourceId: 'r2',
              role: 'PRACTICE',
              order: 2,
              estimatedHours: 4,
              resource: { id: 'r2', title: 'REST Practice', slug: 'rest-practice', description: '', resourceType: 'PROJECT', provider: 'Spring', url: '', difficulty: 'INTERMEDIATE', estimatedHours: 4, isFree: true, qualityScore: 0.9, isActive: true, skills: [] },
            },
          ],
        },
      ];

      const resourceProgressList: ResourceProgressItem[] = [
        {
          learnerProfileId: 'p1',
          resourceId: 'r1',
          status: 'COMPLETED',
          progressPercent: 100,
        },
        {
          learnerProfileId: 'p1',
          resourceId: 'r2',
          status: 'IN_PROGRESS',
          progressPercent: 50,
        },
      ];

      const report = calculatePathProgress({
        pathId: 'path-1',
        careerId: 'c1',
        careerName: 'Backend Engineer',
        milestones: dummyMilestones,
        resourceProgressList,
      });

      // r1 = 6h * 100% = 6h. r2 = 4h * 50% = 2h. Total completed = 8h / 10h = 80%.
      expect(report.overallProgressPercent).toBe(80);
      expect(report.completedHours).toBe(8);
      expect(report.totalHours).toBe(10);
      expect(report.milestones[0].status).toBe('IN_PROGRESS');
    });
  });

  describe('Next Best Action Engine', () => {
    it('recommends in-progress resource if learner has started a milestone resource', () => {
      const dummyMilestone: LearningMilestoneItem = {
        id: 'm1',
        title: 'REST API Foundations',
        description: '',
        order: 1,
        estimatedHours: 10,
        estimatedWeeks: 1,
        learningObjectives: [],
        completionCriteria: [],
        whyThisOrder: '',
        status: 'IN_PROGRESS',
        skills: [{ skillId: 's1', skillName: 'REST APIs', skillSlug: 'rest-apis', currentLevel: 1, targetLevel: 4, gap: 3, order: 1 }],
        resources: [
          {
            resourceId: 'r1',
            role: 'PRIMARY',
            order: 1,
            estimatedHours: 6,
            resource: { id: 'r1', title: 'REST API Guide', slug: 'rest-api-guide', description: '', resourceType: 'COURSE', provider: 'Coursera', url: 'https://coursera.org', difficulty: 'BEGINNER', estimatedHours: 6, isFree: true, qualityScore: 0.9, isActive: true, skills: [] },
          },
        ],
      };

      const resProgMap = new Map<string, ResourceProgressItem>();
      resProgMap.set('r1', {
        learnerProfileId: 'p1',
        resourceId: 'r1',
        status: 'IN_PROGRESS',
        progressPercent: 50,
      });

      const nextAction = determineNextAction({
        careerName: 'Backend Engineer',
        milestones: [dummyMilestone],
        milestoneProgressList: [{ milestoneId: 'm1', title: 'REST API Foundations', order: 1, status: 'IN_PROGRESS', progressPercent: 50, completedResourceCount: 0, totalResourceCount: 1, completedHours: 3, totalHours: 6, isUnlocked: true }],
        resourceProgressMap: resProgMap,
        availableAssessments: [],
        skillStates: new Map(),
      });

      expect(nextAction).not.toBeNull();
      expect(nextAction?.type).toBe('RESOURCE');
      expect(nextAction?.title).toContain('Continue: REST API Guide');
    });
  });
});
