import React from 'react';
import { Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const LiveUpdatesSection = ({ notifications }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-sm flex-1">
      <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-primary" /> Live Updates
        </div>
        {notifications?.length > 0 && <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>}
      </h3>
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
         {notifications?.length > 0 ? (
           notifications.slice(0, 5).map((notif) => (
             <div key={notif.id} className="flex gap-3 items-start group">
                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 transition-colors ${notif.status === 'UNREAD' ? 'bg-primary' : 'bg-muted-foreground/30'}`}></div>
                <div className="min-w-0">
                   <p className="text-sm text-foreground font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/employee-notifications')}>
                     {notif.message}
                   </p>
                   <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                     {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                   </span>
                </div>
             </div>
           ))
         ) : (
           <div className="text-center py-6">
             <p className="text-xs text-muted-foreground">No recent updates</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default LiveUpdatesSection;
