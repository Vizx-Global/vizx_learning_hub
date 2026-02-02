import React from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle2, Trash2, Clock, Info, ShieldAlert, Award, GraduationCap } from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'ACHIEVEMENT': return <Award className="text-amber-500" />;
    case 'MODULE_COMPLETION': return <CheckCircle2 className="text-emerald-500" />;
    case 'PATH_COMPLETION': return <GraduationCap className="text-primary" />;
    case 'STREAK': return <Clock className="text-orange-500" />;
    case 'SYSTEM': return <ShieldAlert className="text-blue-500" />;
    default: return <Info className="text-muted-foreground" />;
  }
};

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, isLoading } = useNotifications();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Bell className="text-primary" size={32} />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-primary/10 text-primary border-primary/20">{unreadCount} New</Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Stay updated with your learning progress and achievements.</p>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => markAllAsRead()}
            className="rounded-xl font-bold uppercase tracking-wider text-xs border-primary/20 hover:bg-primary/5 text-primary"
          >
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications?.length > 0 ? (
          notifications.map((notification, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={notification.id}
              className={`group relative p-6 rounded-[2rem] border transition-all duration-300 ${
                notification.status === 'UNREAD' 
                ? 'bg-primary/5 border-primary/30 shadow-lg shadow-primary/5' 
                : 'bg-card border-border hover:bg-muted/30'
              }`}
            >
              <div className="flex gap-5">
                <div className={`mt-1 h-12 w-12 rounded-2xl flex items-center justify-center bg-background border border-border shadow-sm shrink-0`}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={`text-lg transition-colors ${notification.status === 'UNREAD' ? 'font-black text-foreground' : 'font-bold text-muted-foreground'}`}>
                        {notification.title}
                      </h3>
                      <div className="text-xs text-muted-foreground/60 font-medium flex items-center gap-1.5 mt-0.5">
                        <Clock size={12} />
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {notification.status === 'UNREAD' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full text-primary hover:bg-primary/10"
                          onClick={() => markAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <CheckCircle2 size={16} />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => deleteNotification(notification.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <p className={`mt-3 text-sm leading-relaxed ${notification.status === 'UNREAD' ? 'text-foreground/90 font-medium' : 'text-muted-foreground'}`}>
                    {notification.message}
                  </p>

                  {notification.actionUrl && (
                    <div className="mt-4">
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-primary font-bold uppercase tracking-widest text-xs hover:no-underline flex items-center gap-1 group/link"
                        onClick={() => window.location.href = notification.actionUrl}
                      >
                        {notification.actionLabel || 'Details'}
                        <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="inline-block">
                          →
                        </motion.span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/10 rounded-[3rem] border border-dashed border-border">
            <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center">
              <Bell className="text-muted-foreground/30" size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">All caught up!</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">You don't have any notifications at the moment. Keep learning to earn badges and milestones!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
