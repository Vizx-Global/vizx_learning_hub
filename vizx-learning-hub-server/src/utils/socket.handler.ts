import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chat.service';
import { JWTUtil } from './jwt.util';

const chatService = new ChatService();

export const setupSocket = (io: Server) => {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = JWTUtil.verifyAccessToken(token);
      (socket as any).userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`User connected: ${userId}`);

    // Join personal room for notifications
    socket.join(userId);

    // Join conversation rooms
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(conversationId);
      console.log(`User ${userId} joined conversation: ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`User ${userId} left conversation: ${conversationId}`);
    });

    // Send message
    socket.on('send_message', async (data: { conversationId: string; content: string; type?: any }) => {
      try {
        const message = await chatService.sendMessage(
          data.conversationId,
          userId,
          data.content,
          data.type || 'TEXT'
        );

        // Broadcast to conversation room
        io.to(data.conversationId).emit('new_message', message);

        // Notify participants who are not in the room (live notification)
        // You might want to filter this based on who is actually "active" in the room
        socket.to(data.conversationId).emit('notification', {
          type: 'NEW_MESSAGE',
          conversationId: data.conversationId,
          message: message.content,
          senderName: `${message.sender.firstName} ${message.sender.lastName}`,
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
      socket.to(data.conversationId).emit('user_typing', {
        conversationId: data.conversationId,
        userId,
        isTyping: data.isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });
};
