export type FeedbackType =
  | 'TOO_EASY'
  | 'JUST_RIGHT'
  | 'TOO_DIFFICULT'
  | 'NOT_RELEVANT'
  | 'ALREADY_KNOWN'
  | 'VERY_USEFUL';

export interface LearningFeedbackInput {
  resourceId?: string;
  milestoneId?: string;
  feedbackType: FeedbackType;
  rating?: number; // 1 to 5
  comment?: string;
}

export interface LearningFeedbackItem {
  id?: string;
  learnerProfileId: string;
  resourceId?: string | null;
  milestoneId?: string | null;
  feedbackType: FeedbackType;
  rating?: number | null;
  comment?: string | null;
  createdAt: Date;
}
