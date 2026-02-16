import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Icon from '../../../../components/AppIcon';
import { socialService, notificationService } from '../../../../api';

const PeerActivityFeed = ({ limit }) => {
  const [filter, setFilter] = useState('all');

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['system-pulse-feed'],
    queryFn: async () => {
      const [socialRes, notifyRes] = await Promise.all([
        socialService.getPeerActivity(15),
        notificationService.getNotifications({ limit: 10 })
      ]);

      const socialData = (socialRes.data.data || []).map(a => ({ ...a, feedType: 'social' }));
      const notifyData = (notifyRes.data.data.notifications || []).map(n => ({ 
        ...n, 
        feedType: 'system',
        type: n.type || 'SYSTEM_ALERT',
        createdAt: n.createdAt
      }));

      return [...socialData, ...notifyData].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    },
    refetchInterval: 30000, // 30 seconds as requested
    staleTime: 10000, // Keep data fresh for 10s
  });

  const getActivityConfig = (item) => {
    if (item.feedType === 'system') {
      switch (item.type) {
        case 'INQUIRY': return { icon: 'HelpCircle', color: 'text-blue-500', label: 'system inquiry' };
        case 'ALERT': return { icon: 'AlertTriangle', color: 'text-rose-500', label: 'critical alert' };
        default: return { icon: 'Bell', color: 'text-indigo-500', label: 'notification' };
      }
    }

    switch (item.type?.toLowerCase()) {
      case 'enrollment':
      case 'enrolled':
        return { icon: 'BookOpen', color: 'text-primary', label: 'enrolled in' };
      case 'completion':
      case 'completed':
        return { icon: 'CheckCircle', color: 'text-emerald-500', label: 'completed' };
      case 'achievement':
      case 'earned':
        return { icon: 'Award', color: 'text-amber-500', label: 'earned the' };
      case 'social':
      case 'streak':
        return { icon: 'Flame', color: 'text-orange-500', label: 'achieved a' };
      default:
        return { icon: 'Activity', color: 'text-muted-foreground', label: 'performed' };
    }
  };

  const formatTimeAgo = (dateContent) => {
    const timestamp = new Date(dateContent);
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const filteredActivities = (activities?.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'system') return activity.feedType === 'system';
    if (filter === 'social') return activity.feedType === 'social';
    const type = activity.type?.toLowerCase();
    if (filter === 'completion') return type === 'completion' || type === 'completed';
    return true;
  }) || []).slice(0, limit || activities.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
           <div className={`w-1.5 h-1.5 rounded-full bg-primary ${isLoading ? 'animate-ping' : 'animate-pulse'}`} />
           Live Feed
        </h3>
        <div className="flex gap-2">
          {['all', 'social', 'system'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-accent/30 text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading && activities.length === 0 ? (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-12 h-12 bg-muted rounded-2xl" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-muted rounded-lg w-3/4" />
                <div className="h-3 bg-muted rounded-lg w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredActivities?.map((item) => {
            const config = getActivityConfig(item);
            const userAvatar = item.user?.avatar || `https://ui-avatars.com/api/?name=${item.user?.firstName || 'S'}+${item.user?.lastName || 'A'}&background=random`;
            const isSystem = item.feedType === 'system';
            
            return (
              <div key={item.id} className="relative flex items-start gap-4 p-4 hover:bg-accent/50 rounded-3xl transition-all group cursor-pointer border border-transparent hover:border-border/50">
                <div className="relative flex-shrink-0">
                  {isSystem ? (
                    <div className={`w-12 h-12 rounded-2xl ${config.color.replace('text-', 'bg-')}/10 flex items-center justify-center ${config.color}`}>
                       <Icon name={config.icon} size={24} />
                    </div>
                  ) : (
                    <img src={userAvatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm grayscale group-hover:grayscale-0 transition-all" alt="User" />
                  )}
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border-2 border-card flex items-center justify-center bg-card shadow-sm ${config.color}`}>
                    <Icon name={config.icon} size={10} />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm leading-tight">
                    {isSystem ? (
                      <span className="font-black text-foreground uppercase tracking-tight">{item.title || 'System Notification'}</span>
                    ) : (
                      <span className="font-black text-foreground uppercase tracking-tight">
                        {item.user?.firstName} {item.user?.lastName}
                      </span>
                    )}
                    <span className="text-muted-foreground block text-xs mt-1 font-medium italic">
                      {isSystem ? (item.message || 'Processing system event...') : `${config.label} ${item.entityName || item.description}`}
                    </span>
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-accent px-2 py-0.5 rounded-md">{formatTimeAgo(item.createdAt)}</span>
                    {!isSystem && item.pointsEarned > 0 && (
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-md">+{item.pointsEarned} XP</span>
                    )}
                  </div>
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                   <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                </div>
              </div>
            );
          })}
          
          {filteredActivities.length === 0 && (
            <div className="text-center py-20 opacity-30">
              <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-4">
                 <Icon name="ZapOff" size={32} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">No alerts in current vector</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PeerActivityFeed;
