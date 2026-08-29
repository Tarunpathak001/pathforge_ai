import { Router, Request, Response, NextFunction } from 'express';
import { copilotService } from '../services/copilot-service.js';
import {
  CreateConversationSchema,
  SendMessageSchema,
} from '@pathforge/shared';

const router = Router();

function getAuthUserId(req: Request): string {
  const userId = req.headers['x-user-id'] as string;
  return userId || 'default-learner-id';
}

/**
 * POST /api/copilot/conversations
 * Creates a new conversation thread.
 */
router.post('/conversations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUserId(req);
    const parsed = CreateConversationSchema.parse(req.body);
    const result = await copilotService.createConversation(userId, parsed);
    res.status(201).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/copilot/conversations
 * Lists all conversations for the authenticated learner.
 */
router.get('/conversations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUserId(req);
    const conversations = await copilotService.getConversations(userId);
    res.status(200).json({ status: 'success', data: conversations });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/copilot/conversations/:id
 * Retrieves a specific conversation with message history.
 */
router.get(
  '/conversations/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const conversation = await copilotService.getConversationById(userId, req.params.id);
      res.status(200).json({ status: 'success', data: conversation });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/copilot/conversations/:id/messages
 * Sends a message and returns the grounded assistant response.
 */
router.post(
  '/conversations/:id/messages',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      const parsed = SendMessageSchema.parse(req.body);
      const message = await copilotService.sendMessage(userId, req.params.id, parsed);
      res.status(200).json({ status: 'success', data: message });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/copilot/conversations/:id
 * Deletes a conversation thread.
 */
router.delete(
  '/conversations/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUserId(req);
      await copilotService.deleteConversation(userId, req.params.id);
      res.status(200).json({ status: 'success', message: 'Conversation deleted.' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
