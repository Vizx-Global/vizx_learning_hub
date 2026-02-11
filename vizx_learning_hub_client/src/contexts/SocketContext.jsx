import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('accessToken');
      const newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', {
        auth: { token },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to socket server');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from socket server');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  const joinConversation = useCallback((conversationId) => {
    if (socket) socket.emit('join_conversation', conversationId);
  }, [socket]);

  const leaveConversation = useCallback((conversationId) => {
    if (socket) socket.emit('leave_conversation', conversationId);
  }, [socket]);

  const sendMessage = useCallback((conversationId, content, type = 'TEXT') => {
    if (socket) {
      socket.emit('send_message', { conversationId, content, type });
    }
  }, [socket]);

  const sendTyping = useCallback((conversationId, isTyping) => {
    if (socket) {
      socket.emit('typing', { conversationId, isTyping });
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      isConnected, 
      joinConversation, 
      leaveConversation, 
      sendMessage, 
      sendTyping 
    }}>
      {children}
    </SocketContext.Provider>
  );
};
