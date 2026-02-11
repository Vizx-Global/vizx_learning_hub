import axiosClient from '../utils/axiosClient';

const chatService = {
  // Get all conversations for the current user
  getConversations: async () => {
    const response = await axiosClient.get('/chat/conversations');
    return response.data.data;
  },

  // Get messages for a specific conversation
  getMessages: async (conversationId, params = {}) => {
    const response = await axiosClient.get(`/chat/conversations/${conversationId}/messages`, { params });
    return response.data.data;
  },

  // Send a message
  sendMessage: async (conversationId, content, type = 'TEXT') => {
    const response = await axiosClient.post(`/chat/conversations/${conversationId}/messages`, { content, type });
    return response.data.data;
  },

  // Start or get a direct conversation with another user
  startConversation: async (userId) => {
    const response = await axiosClient.post('/chat/conversations', { userId });
    return response.data.data;
  },

  // Mark all messages in a conversation as read
  markAsRead: async (conversationId) => {
    const response = await axiosClient.patch(`/chat/conversations/${conversationId}/read`);
    return response.data;
  },

  // Get total unread count for the current user
  getUnreadCount: async () => {
    const response = await axiosClient.get('/chat/unread-count');
    return response.data.count;
  },

  // Delete a conversation
  deleteConversation: async (conversationId) => {
    const response = await axiosClient.delete(`/chat/conversations/${conversationId}`);
    return response.data;
  }
};

export default chatService;
