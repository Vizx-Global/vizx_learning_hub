import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, History, ExternalLink, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const RecentActivity = ({ activities = [], isLoading }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'READ': return { icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' };
      case 'UNREAD': return { icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-500/10' };
      case 'ARCHIVED': return { icon: AlertCircle, color: 'text-blue-500', bgColor: 'bg-blue-500/10' };
      default: return { icon: CheckCircle2, color: 'text-muted-foreground', bgColor: 'bg-muted' };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <History size={20} className="text-primary" />
          </div>
          <h2 className="text-xl font-black text-foreground tracking-tight">Recent Activity</h2>
        </div>
      </div>
      
      <div className="space-y-6 flex-1 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {activities.length > 0 ? activities.map((activity, index) => {
          const config = getStatusConfig(activity.status);
          const userName = activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'System';
          
          return (
            <motion.div 
              key={activity.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-6 border-l-2 border-muted hover:border-primary/30 transition-colors"
            >
              <div className={`absolute -left-2 top-0 h-4 w-4 rounded-full ${config.bgColor} border-2 border-background flex items-center justify-center`}>
                <div className={`h-1.5 w-1.5 rounded-full ${config.color.replace('text-', 'bg-')}`}></div>
              </div>
              
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none">
                      {activity.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40 leading-none">•</span>
                    <span className="text-[10px] font-medium text-muted-foreground/60 leading-none italic">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-foreground mb-1 leading-snug truncate">
                    {activity.title}
                  </h4>
                  
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                    <User size={10} />
                    <span>To: <span className="text-foreground/70">{userName}</span></span>
                  </div>
                </div>
                
                <div className={`shrink-0 p-1.5 rounded-lg ${config.bgColor}`}>
                  <config.icon className={config.color} size={14} />
                </div>
              </div>
            </motion.div>
          );
        }) : (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 pt-6 border-t border-border/50">
        <div className="p-4 rounded-2xl bg-muted/30 border border-dashed border-border flex items-center justify-between">
          <div className="text-xs text-muted-foreground font-medium">Auto-refresh active</div>
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;