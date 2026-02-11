import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationService from '../api/notificationService';
import chatService from '../api/chatService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationService.getNotifications({ limit: 50 });
      return res.data.data.notifications;
    },
    enabled: !!user,
    refetchInterval: 60000, // Refetch every minute
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: async () => {
      const res = await notificationService.getUnreadCount();
      return res.data.data.count;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch unread count every 30 seconds
  });

  const { data: chatUnreadCount = 0 } = useQuery({
    queryKey: ['chat', 'unreadCount'],
    queryFn: async () => {
      const count = await chatService.getUnreadCount();
      return count;
    },
    enabled: !!user,
    refetchInterval: 10000, // Refetch chat count more frequently (10s)
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const value = {
    notifications,
    unreadCount,
    chatUnreadCount,
    isLoading,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteMutation.mutate,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
