import prisma from '../db/client.js';
import {
  classifyCopilotIntent,
  type CopilotMessage,
  type ConversationSummary,
  type CreateConversationInput,
  type SendMessageSchemaInput,
} from '@pathforge/shared';
import { copilotContextBuilder } from './copilot-context-builder.js';
import { llmProvider } from './llm-provider.js';

export class CopilotService {
  /**
   * Creates a new conversation for the authenticated learner.
   */
  async createConversation(
    userId: string,
    input?: CreateConversationInput
  ): Promise<{ conversationId: string; title: string; initialResponse?: CopilotMessage }> {
    let profile = await prisma.learnerProfile.findUnique({ where: { userId } });
    if (!profile) {
      // Ensure user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@pathforge.ai`,
            name: 'Learner',
          },
        });
      }
      profile = await prisma.learnerProfile.create({
        data: {
          userId,
          targetRole: 'Backend Engineer',
          technicalLevel: 'INTERMEDIATE',
        },
      });
    }

    const title = input?.title || (input?.initialMessage ? input.initialMessage.slice(0, 40) + '...' : 'Career Copilot Session');

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        learnerProfileId: profile.id,
        title,
      },
    });

    let initialResponse: CopilotMessage | undefined = undefined;

    if (input?.initialMessage) {
      initialResponse = await this.sendMessage(userId, conversation.id, {
        content: input.initialMessage,
        contextPayload: input.contextPayload,
      });
    }

    return {
      conversationId: conversation.id,
      title: conversation.title,
      initialResponse,
    };
  }

  /**
   * Lists all conversations belonging to the authenticated learner.
   */
  async getConversations(userId: string): Promise<ConversationSummary[]> {
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      include: {
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 30,
    });

    return conversations.map(c => ({
      id: c.id,
      title: c.title,
      messageCount: c._count.messages,
      lastMessageAt: c.updatedAt,
      createdAt: c.createdAt,
    }));
  }

  /**
   * Retrieves a specific conversation thread ensuring multi-tenant isolation.
   */
  async getConversationById(
    userId: string,
    conversationId: string
  ): Promise<{
    id: string;
    title: string;
    messages: CopilotMessage[];
    createdAt: Date;
    updatedAt: Date;
  }> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 30,
        },
      },
    });

    if (!conversation || conversation.userId !== userId) {
      const err = new Error('Conversation not found or access denied.');
      (err as any).statusCode = 404;
      throw err;
    }

    return {
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: conversation.messages.map(m => this.formatMessage(m)),
    };
  }

  /**
   * Sends a user query to the Copilot, retrieves grounded context, and stores the response.
   */
  async sendMessage(
    userId: string,
    conversationId: string,
    input: SendMessageSchemaInput
  ): Promise<CopilotMessage> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || conversation.userId !== userId) {
      const err = new Error('Conversation not found or access denied.');
      (err as any).statusCode = 404;
      throw err;
    }

    // 1. Store User Message
    await prisma.conversationMessage.create({
      data: {
        conversationId,
        role: 'USER',
        content: input.content,
      },
    });

    // 2. Classify Intent
    const { intent } = classifyCopilotIntent(input.content);

    // 3. Build Grounded Context
    const groundedContext = await copilotContextBuilder.buildContext(
      userId,
      intent,
      input.contextPayload
    );

    // 4. Generate Grounded LLM Response
    const response = await llmProvider.generateGroundedResponse(input.content, groundedContext);

    // 5. Store Assistant Message
    const assistantMsg = await prisma.conversationMessage.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content: response.answer,
        intent: response.intent,
        groundingSources: JSON.stringify(response.groundingSources || []),
        suggestedActions: JSON.stringify(response.suggestedActions || []),
      },
    });

    // 6. Update Conversation Timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return this.formatMessage(assistantMsg);
  }

  /**
   * Deletes a conversation.
   */
  async deleteConversation(userId: string, conversationId: string): Promise<boolean> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || conversation.userId !== userId) {
      const err = new Error('Conversation not found or access denied.');
      (err as any).statusCode = 404;
      throw err;
    }

    await prisma.conversation.delete({ where: { id: conversationId } });
    return true;
  }

  private formatMessage(msg: any): CopilotMessage {
    let groundingSources = [];
    if (msg.groundingSources) {
      try {
        groundingSources = JSON.parse(msg.groundingSources);
      } catch {
        groundingSources = [];
      }
    }

    let suggestedActions = [];
    if (msg.suggestedActions) {
      try {
        suggestedActions = JSON.parse(msg.suggestedActions);
      } catch {
        suggestedActions = [];
      }
    }

    return {
      id: msg.id,
      conversationId: msg.conversationId,
      role: msg.role as any,
      content: msg.content,
      intent: msg.intent as any,
      groundingSources,
      suggestedActions,
      createdAt: msg.createdAt,
    };
  }
}

export const copilotService = new CopilotService();
export default copilotService;
