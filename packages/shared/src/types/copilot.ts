export type CopilotIntent =
  | 'CAREER_REQUIREMENTS'
  | 'SKILL_GAP'
  | 'RECOMMENDATION'
  | 'ROADMAP'
  | 'PROGRESS'
  | 'NEXT_ACTION'
  | 'PLANNING'
  | 'RESOURCE_EXPLANATION'
  | 'CONCEPT_EXPLANATION'
  | 'ASSESSMENT'
  | 'GENERAL_LEARNING'
  | 'UNKNOWN';

export type CopilotActionType =
  | 'OPEN_RESOURCE'
  | 'OPEN_MILESTONE'
  | 'OPEN_ASSESSMENT'
  | 'OPEN_SKILL'
  | 'OPEN_PATH'
  | 'OPEN_DASHBOARD'
  | 'OPEN_RECOMMENDATIONS'
  | 'OPEN_GAP_ANALYSIS';

export interface CopilotAction {
  type: CopilotActionType;
  title: string;
  target: string; // url, slug, or route
  payload?: Record<string, any>;
}

export interface CopilotMessage {
  id: string;
  conversationId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  intent?: CopilotIntent;
  groundingSources?: string[];
  suggestedActions?: CopilotAction[];
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  lastMessageAt: Date;
  createdAt: Date;
}

export interface SendMessageInput {
  content: string;
  contextPayload?: {
    resourceId?: string;
    milestoneId?: string;
    skillId?: string;
    careerSlug?: string;
    assessmentId?: string;
  };
}

export interface CopilotStructuredResponse {
  answer: string;
  intent: CopilotIntent;
  groundingSources: string[];
  citations: string[];
  suggestedActions: CopilotAction[];
}
