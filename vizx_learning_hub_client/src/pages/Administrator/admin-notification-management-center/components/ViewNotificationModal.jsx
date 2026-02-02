import React from 'react';
import { X, Bell, User, Clock, Link as LinkIcon, Info, ShieldAlert, Award, UserPlus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../../components/ui/Button';
import { format } from 'date-fns';

const ViewNotificationModal = ({ isOpen, onClose, notification, onDelete }) => {
  if (!isOpen || !notification) return null;

  const getTypeIcon = (type) => {
    const icons = {
      SYSTEM: { icon: ShieldAlert, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      ACHIEVEMENT: { icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      WELCOME: { icon: UserPlus, color: 'text-amber-500', bg: 'bg-amber-500/10' },
      STREAK: { icon: Bell, color: 'text-orange-500', bg: 'bg-orange-500/10' },
      MODULE_COMPLETION: { icon: Bell, color: 'text-violet-500', bg: 'bg-violet-500/10' },
      PATH_COMPLETION: { icon: Award, color: 'text-primary', bg: 'bg-primary/10' },
    };
    return icons[type] || { icon: Bell, color: 'text-muted-foreground', bg: 'bg-muted' };
  };

  const config = getTypeIcon(notification.type);
  const userName = notification.user ? `${notification.user.firstName} ${notification.user.lastName}` : 'System Wide';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-card border border-border rounded-[2.5rem] max-w-2xl w-full shadow-2xl shadow-primary/10 overflow-hidden"
        >
          {/* Header */}
          <div className={`p-8 border-b border-border ${config.bg} bg-opacity-50`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`h-14 w-14 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center shadow-lg border border-white/10`}>
                  <config.icon size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-background/50 border border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {notification.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      notification.status === 'UNREAD' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {notification.status}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight line-clamp-1">{notification.title}</h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Message Content</label>
              <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 text-foreground leading-relaxed whitespace-pre-wrap">
                {notification.message}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Recipient Info</label>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-border/30">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {notification.user?.avatar ? (
                      <img src={notification.user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-foreground truncate">{userName}</div>
                    <div className="text-xs text-muted-foreground truncate">{notification.user?.email || 'Global Broadcast'}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Delivery Details</label>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-border/30">
                  <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Clock size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-foreground">
                      {format(new Date(notification.createdAt), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-muted-foreground italic">
                      at {format(new Date(notification.createdAt), 'hh:mm a')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {(notification.actionUrl || notification.actionLabel) && (
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Call to Action</label>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <LinkIcon size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-foreground">{notification.actionLabel || 'No Label'}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">{notification.actionUrl || 'No URL'}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl border-primary/20 text-primary hover:bg-primary/10">
                    Test Link
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 pt-0 flex gap-4">
             <Button 
                variant="outline" 
                className="flex-1 rounded-[1.5rem] h-12 font-bold uppercase tracking-widest border-border hover:bg-muted"
                onClick={onClose}
             >
                Close
             </Button>
             <Button 
                variant="outline" 
                className="flex-[0.5] rounded-[1.5rem] h-12 font-bold uppercase tracking-widest border-rose-500/20 text-rose-500 hover:bg-rose-500/5"
                onClick={() => {
                  onDelete(notification.id);
                  onClose();
                }}
             >
                <div className="flex items-center justify-center gap-2">
                  <Trash2 size={18} />
                  <span>Delete</span>
                </div>
             </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ViewNotificationModal;
