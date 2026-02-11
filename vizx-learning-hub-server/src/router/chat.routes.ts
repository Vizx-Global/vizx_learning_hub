import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const chatController = new ChatController();

router.use(authenticate);

router.get('/conversations', chatController.getConversations);
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/conversations/:conversationId/messages', chatController.sendMessage);
router.delete('/conversations/:conversationId', chatController.deleteConversation);
router.post('/conversations', chatController.startConversation);
router.patch('/conversations/:conversationId/read', chatController.markAsRead);
router.get('/unread-count', chatController.getUnreadCount);

export default router;
