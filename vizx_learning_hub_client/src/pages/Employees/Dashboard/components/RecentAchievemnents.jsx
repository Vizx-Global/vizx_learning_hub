import React, { useState, useEffect } from 'react';
import { Award, Star, Trophy, Medal } from 'lucide-react';
import userService from '../../../../api/userService';
import { format } from 'date-fns';

const RecentAchievemnents = ({ achievements = [], loading = false }) => {
  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'medal': return <Medal size={20} />;
      case 'trophy': return <Trophy size={20} />;
      case 'star': return <Star size={20} />;
      default: return <Award size={20} />;
    }
  };

  if (loading) return (
    <div className="bg-card rounded-3xl border border-border p-6 h-full animate-pulse">
      <div className="h-6 w-48 bg-muted rounded mb-6"></div>
      <div className="grid grid-cols-2 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-20 bg-muted rounded-2xl"></div>)}
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-3xl border border-border p-6 h-full shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
          <Award size={18} className="text-amber-500" />
          Recent Achievements
        </h3>
        {achievements.length > 0 && (
          <span className="text-[10px] font-black bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full uppercase tracking-tighter">
            {achievements.length} Unlocked
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {achievements.length > 0 ? (
          achievements.slice(0, 4).map((achievement) => (
            <div key={achievement.id} className="flex items-center gap-4 p-4 bg-accent/30 rounded-2xl border border-border/50 hover:bg-accent/50 transition-all group overflow-hidden relative">
              <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                 {getIcon(achievement.iconType || achievement.type)}
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                {getIcon(achievement.iconType || achievement.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {achievement.title || achievement.achievement?.name}
                </div>
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                  {achievement.earnedAt ? format(new Date(achievement.earnedAt), 'MMM dd, yyyy') : 'Recently earned'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-10 opacity-50 grayscale">
             <Trophy size={40} className="mb-3 text-muted-foreground" />
             <p className="text-xs font-bold uppercase tracking-widest">No achievements yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentAchievemnents;
