import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Info, 
  Image as ImageIcon, 
  Paperclip, 
  Smile,
  Check,
  CheckCheck,
  Clock,
  ArrowLeft,
  MessageCircle,
  X,
  Settings,
  Plus,
  UserPlus,
  Users,
  Trash2
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import chatService from '../../api/chatService';
import userService from '../../api/userService';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { cn } from '../../utils/cn';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const ChatWindow = ({ fullPage = false, externalTriggerNewChat }) => {
  const { user } = useAuth();
  const { socket, isConnected, joinConversation, leaveConversation, sendMessage, sendTyping } = useSocket();
  const queryClient = useQueryClient();
  
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTyping, setActiveTyping] = useState({});
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (externalTriggerNewChat) {
      setShowNewChatModal(true);
      setIsSidebarOpen(true);
    }
  }, [externalTriggerNewChat]);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(userSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearchTerm]);

  // Queries
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatService.getConversations,
    refetchInterval: 60000,
  });

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => chatService.getMessages(selectedConversation.id),
    enabled: !!selectedConversation?.id,
  });

  const { data: allUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', debouncedSearchTerm],
    queryFn: async () => {
      const response = await userService.getAllUsers({ search: debouncedSearchTerm });
      // userService.getAllUsers returns the raw axios response
      return response.data?.data?.users || [];
    },
    enabled: showNewChatModal,
  });

  const startConversationMutation = useMutation({
    mutationFn: (userId) => chatService.startConversation(userId),
    onSuccess: (newConv) => {
      queryClient.invalidateQueries(['conversations']);
      handleSelectConversation(newConv);
      setShowNewChatModal(false);
      setUserSearchTerm('');
    }
  });

  const deleteConversationMutation = useMutation({
    mutationFn: (id) => chatService.deleteConversation(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(['conversations'], (old) => 
        (Array.isArray(old) ? old : []).filter(c => c.id !== id)
      );
      if (selectedConversation?.id === id) {
        setSelectedConversation(null);
      }
      toast.success('Conversation deleted successfully', {
        style: {
          borderRadius: '12px',
          background: 'var(--card)',
          color: 'var(--foreground)',
          border: '1px border-border',
          fontWeight: 'bold',
          fontSize: '13px'
        },
        iconTheme: {
          primary: 'var(--primary)',
          secondary: '#fff',
        },
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete conversation');
    }
  });

  const handleDeleteConversation = (id) => {
    Swal.fire({
      title: 'DELETE CHAT?',
      text: "This action will permanently wipe this conversation history for everyone. You can't undo this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: '#ff4444',
      confirmButtonText: 'YES, DELETE IT',
      cancelButtonText: 'CANCEL',
      background: 'var(--card)',
      color: 'var(--foreground)',
      customClass: {
        popup: 'rounded-3xl border border-border shadow-2xl',
        title: 'font-black tracking-tighter text-2xl',
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        deleteConversationMutation.mutate(id);
      }
    });
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      // Update messages list if it's the current conversation
      if (selectedConversation?.id === message.conversationId) {
        queryClient.setQueryData(['messages', message.conversationId], (old = []) => [...old, message]);
        // Scroll to bottom
        setTimeout(scrollToBottom, 50);
      }
      
      // Update conversations list (move to top and update snippet)
      queryClient.setQueryData(['conversations'], (old = []) => {
        const conversations = Array.isArray(old) ? old : [];
        const exists = conversations.find(c => c.id === message.conversationId);
        
        if (exists) {
          return conversations.map(conv => {
            if (conv.id === message.conversationId) {
              return {
                ...conv,
                lastMessage: message,
                updatedAt: message.createdAt,
                unreadCount: conv.id === selectedConversation?.id ? 0 : (conv.unreadCount || 0) + 1
              };
            }
            return conv;
          }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        } else {
          // If it's a new conversation received via socket, we should probably refetch
          queryClient.invalidateQueries(['conversations']);
          return conversations;
        }
      });
    };

    const handleTyping = ({ conversationId, userId, isTyping }) => {
      if (userId === user.id) return;
      
      // Find the user name from conversations
      const conversations = queryClient.getQueryData(['conversations']);
      const conv = Array.isArray(conversations) ? conversations.find(c => c.id === conversationId) : null;
      const participant = conv?.participants?.find(p => p.user.id === userId)?.user;
      const userName = participant ? `${participant.firstName}` : 'Someone';

      setActiveTyping(prev => ({
        ...prev,
        [conversationId]: isTyping ? userName : null
      }));
    };

    const handleConversationDeleted = ({ conversationId }) => {
      queryClient.setQueryData(['conversations'], (old = []) => 
        (Array.isArray(old) ? old : []).filter(c => c.id !== conversationId)
      );
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        toast('This conversation has been deleted by the other participant', {
          icon: '🗑️',
          style: {
            borderRadius: '12px',
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          }
        });
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('conversation_deleted', handleConversationDeleted);

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('conversation_deleted', handleConversationDeleted);
    };
  }, [socket, selectedConversation, user.id, queryClient]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  const handleSelectConversation = (conv) => {
    if (selectedConversation?.id) {
      leaveConversation(selectedConversation.id);
    }
    setSelectedConversation(conv);
    joinConversation(conv.id);
    chatService.markAsRead(conv.id);
    
    // Reset unread count locally
    queryClient.setQueryData(['conversations'], (old = []) => {
      if (!Array.isArray(old)) return [];
      return old.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c);
    });
    
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    const content = messageInput;
    setMessageInput('');
    sendTyping(selectedConversation.id, false);

    try {
      await chatService.sendMessage(selectedConversation.id, content);
      // Socket will handle the update
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleTypingInput = (e) => {
    setMessageInput(e.target.value);
    
    if (!selectedConversation) return;
    
    sendTyping(selectedConversation.id, true);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(selectedConversation.id, false);
    }, 3000);
  };

  const filteredConversations = useMemo(() => {
    if (!Array.isArray(conversations)) return [];
    return conversations.filter(conv => {
      const otherParticipant = conv.participants.find(p => p.user.id !== user.id)?.user;
      const name = otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Group Chat';
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [conversations, searchQuery, user.id]);

  const formatMessageTime = (date) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, 'HH:mm');
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM d');
  };

  return (
    <div className={cn(
      "flex bg-card border border-border overflow-hidden relative transition-all duration-300",
      fullPage ? "h-screen border-none rounded-none shadow-none" : "rounded-2xl h-[calc(100vh-140px)] shadow-2xl"
    )}>
      {/* Sidebar - Conversations List */}
      <div className={cn(
        "bg-card/50 backdrop-blur-md border-r border-border transition-all duration-300 flex flex-col z-20",
        isSidebarOpen ? "w-full lg:w-80" : "w-0 lg:w-20 overflow-hidden"
      )}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center justify-between w-full">
              <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                Messages
                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {Array.isArray(conversations) ? conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0) : 0} New
                </span>
              </h2>
              <button 
                onClick={() => setShowNewChatModal(true)}
                className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-all group"
                title="New Chat"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          ) : (
            <div className="mx-auto flex flex-col gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <MessageCircle size={20} className="text-primary" />
              </div>
              <button 
                onClick={() => {
                  setIsSidebarOpen(true);
                  setShowNewChatModal(true);
                }}
                className="w-10 h-10 hover:bg-primary/10 text-primary rounded-xl flex items-center justify-center transition-all bg-muted/50"
              >
                <Plus size={18} />
              </button>
            </div>
          )}
        </div>

        {isSidebarOpen && (
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full bg-muted/50 border border-border rounded-lg py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoadingConversations ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-12 h-12 bg-muted rounded-full shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-2 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="p-2 space-y-1">
              {filteredConversations.map((conv) => {
                const otherParticipant = conv.participants.find(p => p.user.id !== user.id)?.user;
                const isSelected = selectedConversation?.id === conv.id;
                const typing = activeTyping[conv.id];
                const initials = otherParticipant ? `${otherParticipant.firstName[0]}${otherParticipant.lastName[0]}` : '??';

                return (
                  <div
                    key={conv.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectConversation(conv)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSelectConversation(conv);
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all group relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isSelected ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-accent/50"
                    )}
                  >
                    <div className="relative shrink-0">
                      {otherParticipant?.avatar ? (
                        <img src={otherParticipant.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-primary/20 transition-all" />
                      ) : (
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 border-transparent transition-all",
                          isSelected ? "bg-white/20" : "bg-primary/10 text-primary"
                        )}>
                          {initials}
                        </div>
                      )}
                      
                      {/* Active indicator placeholder */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-card rounded-full" />
                    </div>

                    {isSidebarOpen && (
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex justify-between items-start mb-0.5">
                          <span className="font-bold text-sm truncate uppercase tracking-tight">
                            {otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Group Chat'}
                          </span>
                          <span className={cn(
                            "text-[10px] whitespace-nowrap opacity-70",
                            isSelected ? "text-primary-foreground" : "text-muted-foreground"
                          )}>
                            {conv.lastMessage ? formatMessageTime(conv.lastMessage.createdAt) : ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className={cn(
                            "text-xs truncate font-medium",
                            isSelected ? "text-primary-foreground/90" : typing ? "text-primary font-bold italic" : "text-muted-foreground"
                          )}>
                            {typing ? 'typing...' : conv.lastMessage?.content || 'No messages yet'}
                          </p>
                          {conv.unreadCount > 0 && !isSelected && (
                            <div className="bg-primary text-primary-foreground text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-sm">
                              {conv.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id);
                      }}
                      className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10",
                        isSelected ? "hover:bg-white/20 text-white" : "hover:bg-error/10 text-error"
                      )}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={32} className="text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">No conversations found</p>
              <button 
                onClick={() => setShowNewChatModal(true)}
                className="mt-4 text-xs font-black text-primary uppercase tracking-widest hover:underline"
              >
                Start New Chat
              </button>
            </div>
          )}
        </div>
        
        {/* Current User Info */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-border bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate uppercase">{user.firstName} {user.lastName}</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-success rounded-full" />
                  <span className="text-[10px] text-muted-foreground font-bold">Online</span>
                </div>
              </div>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                <Settings size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-card relative">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-30">
              <div className="flex items-center gap-4 min-w-0">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2.5 hover:bg-primary/5 hover:text-primary rounded-xl transition-all text-muted-foreground lg:hidden"
                >
                  <ArrowLeft size={20} />
                </button>
                
                <div className="relative group flex-shrink-0">
                  {(() => {
                    const other = selectedConversation.participants.find(p => p.user.id !== user.id)?.user;
                    return other?.avatar ? (
                      <img 
                        src={other.avatar} 
                        alt={other.firstName} 
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-primary/10 shadow-lg group-hover:ring-primary/30 transition-all" 
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-105 transition-all">
                        {other?.firstName?.[0] || 'S'}
                      </div>
                    );
                  })()}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-card rounded-full shadow-sm" />
                </div>
                
                {(() => {
                  const other = selectedConversation.participants.find(p => p.user.id !== user.id)?.user;
                  return (
                    <div className="min-w-0">
                      <h3 className="font-black text-foreground truncate uppercase text-base tracking-tight leading-none mb-1 pt-1">
                        {other ? `${other.firstName} ${other.lastName}` : 'System Chat'}
                      </h3>
                      <div className="flex items-center gap-2">
                        {activeTyping[selectedConversation.id] ? (
                          <span className="text-xs font-bold text-primary animate-pulse">Typing...</span>
                        ) : (
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            other?.status === 'ACTIVE' ? "text-success" : "text-muted-foreground"
                          )}>
                            {other?.status === 'ACTIVE' ? 'Online' : 'Offline'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleDeleteConversation(selectedConversation.id)}
                  className="p-2.5 hover:bg-error/10 hover:text-error rounded-xl transition-all text-muted-foreground"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 custom-scrollbar bg-slate-50/10">
              {isLoadingMessages ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <React.Fragment key={i}>
                      <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[80%]">
                          <div className="w-8 h-8 bg-muted rounded-full shrink-0" />
                          <div className="h-12 bg-muted rounded-2xl w-48" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="h-10 bg-primary/10 rounded-2xl w-36" />
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg, index) => {
                  const isOwn = msg.senderId === user.id;
                  const showAvatar = index === 0 || (messages[index-1] && messages[index-1].senderId !== msg.senderId);
                  
                  return (
                    <div key={msg.id} className={cn(
                      "flex",
                      isOwn ? "justify-end" : "justify-start"
                    )}>
                      <div className={cn(
                        "flex gap-3 max-w-[85%] lg:max-w-[70%]",
                        isOwn ? "flex-row-reverse" : "flex-row"
                      )}>
                        {!isOwn && (
                          <div className="w-8 shrink-0">
                            {showAvatar && (
                              <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center overflow-hidden border border-border">
                                {msg.sender.avatar ? (
                                  <img src={msg.sender.avatar} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[10px] font-bold">{msg.sender.firstName[0]}{msg.sender.lastName[0]}</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="space-y-1">
                          <div className={cn(
                            "px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm transition-all hover:shadow-md",
                            isOwn 
                              ? "bg-primary text-primary-foreground rounded-tr-none" 
                              : "bg-card border border-border rounded-tl-none text-foreground"
                          )}>
                            {msg.content}
                          </div>
                          <div className={cn(
                            "flex items-center gap-1 px-1",
                            isOwn ? "justify-end" : "justify-start"
                          )}>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">
                              {format(new Date(msg.createdAt), 'HH:mm')}
                            </span>
                            {isOwn && (
                              <CheckCheck size={10} className="text-primary opacity-60" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-40">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <MessageCircle size={48} className="text-primary" />
                  </div>
                  <h4 className="font-black text-xl mb-2 grayscale">NO MESSAGES YET</h4>
                  <p className="text-sm font-bold max-w-xs">Start a conversation by sending a message below.</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 lg:p-6 bg-card border-t border-border">
              <form 
                onSubmit={handleSendMessage}
                className="flex items-end gap-3 max-w-6xl mx-auto"
              >
                
                <div className="flex-1 relative group">
                  <textarea
                    rows={1}
                    placeholder="Type a message..."
                    className="w-full bg-muted/50 border-2 border-transparent focus:border-primary/20 focus:bg-card rounded-2xl py-3.5 pl-5 pr-5 text-sm resize-none transition-all outline-none font-medium custom-scrollbar max-h-32"
                    value={messageInput}
                    onChange={handleTypingInput}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className={cn(
                    "p-4 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 shrink-0",
                    messageInput.trim() ? "bg-primary text-primary-foreground shadow-primary/30" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary-focus rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl relative">
                <MessageCircle size={64} className="text-white" />
                <div className="absolute -top-4 -right-4 bg-accent p-3 rounded-2xl shadow-lg border-2 border-card animate-bounce">
                  <CheckCheck className="text-white" size={24} />
                </div>
              </div>
              <h2 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter">SELECT A CONVERSATION</h2>
              <p className="text-muted-foreground font-medium mb-10 leading-relaxed opacity-70">
                Choose a conversation from the sidebar to start chatting with your colleagues or management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 transition-all lg:hidden"
                >
                  Open Sidebar
                </button>
                <button 
                  onClick={() => setShowNewChatModal(true)}
                  className="bg-accent text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-accent/30 hover:scale-105 transition-all"
                >
                  Start New Chat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChatModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewChatModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">New Conversation</h3>
                  <p className="text-xs text-muted-foreground font-bold uppercase mt-1">Select a colleague to start chatting</p>
                </div>
                <button onClick={() => setShowNewChatModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 pb-0">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Search users by name or department..."
                    className="w-full bg-muted/50 border-2 border-transparent focus:border-primary/20 focus:bg-card rounded-2xl py-4 pl-12 pr-4 text-sm transition-all outline-none font-medium"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 custom-scrollbar min-h-[300px]">
                {isLoadingUsers ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-12 h-12 bg-muted rounded-full" />
                        <div className="flex-1 h-4 bg-muted rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : Array.isArray(allUsers) && allUsers.filter(u => u.id !== user.id).length > 0 ? (
                  <div className="space-y-1">
                    {allUsers.filter(u => u.id !== user.id).map((u) => (
                      <button
                        key={u.id}
                        onClick={() => startConversationMutation.mutate(u.id)}
                        disabled={startConversationMutation.isPending}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-accent/50 transition-all text-left group"
                      >
                        <div className="relative">
                          {u.avatar ? (
                            <img src={u.avatar} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                              {u.firstName[0]}{u.lastName[0]}
                            </div>
                          )}
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success border-2 border-card rounded-full" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{u.firstName} {u.lastName}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                              {typeof u.department === 'object' ? u.department?.name : (u.department || 'General')}
                            </span>
                            <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">{u.role}</span>
                          </div>
                        </div>
                        <UserPlus size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-40">
                    <Users size={48} className="mb-4" />
                    <p className="text-sm font-bold uppercase tracking-tight">No users found</p>
                  </div>
                )}
              </div>

              {startConversationMutation.isPending && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-50">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest text-primary">Starting Chat...</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWindow;
