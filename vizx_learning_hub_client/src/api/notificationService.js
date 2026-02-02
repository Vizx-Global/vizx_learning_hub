import axios from '../utils/axiosClient';

const notificationService = {
  getNotifications: async (params) => {
    return await axios.get('/notifications', { params });
  },

  getUnreadCount: async () => {
    return await axios.get('/notifications/unread-count');
  },

  markAsRead: async (id) => {
    return await axios.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return await axios.patch('/notifications/mark-all-read');
  },

  deleteNotification: async (id) => {
    return await axios.delete(`/notifications/${id}`);
  },

  broadcastNotification: async (data) => {
    return await axios.post('/notifications/broadcast', data);
  },
  
  getAdminStats: async () => {
    return await axios.get('/notifications/admin/stats');
  }
};

export default notificationService;
