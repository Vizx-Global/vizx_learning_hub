import { Request, Response } from 'express';
import { ChatService } from '../services/chat.service';

const chatService = new ChatService();

export class ChatController {
  async getConversations(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const conversations = await chatService.getConversations(userId);
      return res.json({ success: true, data: conversations });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMessages(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { limit, cursor } = req.query;
      const messages = await chatService.getMessages(
        conversationId, 
        limit ? parseInt(limit as string) : 50, 
        cursor as string
      );
      return res.json({ success: true, data: messages });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async startConversation(req: Request, res: Response) {
    try {
      const user1Id = (req as any).user.userId;
      const { userId: user2Id } = req.body;
      
      if (!user2Id) {
        return res.status(400).json({ success: false, message: 'Recipient user ID is required' });
      }

      const conversation = await chatService.createOrGetDirectConversation(user1Id, user2Id);
      
      // Emit to participants so they see the new conversation in their list immediately
      const io = req.app.get('io');
      if (io) {
        conversation.participants.forEach((p: any) => {
          io.to(p.userId).emit('new_conversation', conversation);
        });
      }

      return res.json({ success: true, data: conversation });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = (req as any).user.userId;
      await chatService.markAsRead(conversationId, userId);
      return res.json({ success: true, message: 'Marked as read' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const count = await chatService.getUnreadCount(userId);
      return res.json({ success: true, count });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const senderId = (req as any).user.userId;
      const { content, type } = req.body;

      if (!content) {
        return res.status(400).json({ success: false, message: 'Message content is required' });
      }

      const message = await chatService.sendMessage(conversationId, senderId, content, type);
      
      // Emit to socket room
      const io = req.app.get('io');
      if (io) {
        // 1. Emit to the conversation room (for those currently looking at the chat)
        io.to(conversationId).emit('new_message', message);
        
        // 2. Emit to each participant's personal room (for those who have the chat app open but another conversation selected)
        const participants = await chatService.getConversationParticipants(conversationId);
        participants.forEach(p => {
          // We can also emit to the sender, but usually they handle it via local state or the conversation room
          io.to(p.userId).emit('new_message', message);
        });
      }

      return res.status(201).json({ success: true, data: message });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteConversation(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = (req as any).user.userId;
      await chatService.deleteConversation(conversationId, userId);
      
      const io = req.app.get('io');
      if (io) {
        io.to(conversationId).emit('conversation_deleted', { conversationId });
      }

      return res.json({ success: true, message: 'Conversation deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
