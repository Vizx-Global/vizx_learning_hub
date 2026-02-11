import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Image from '../../../../components/AppImage';

const AchievementShowcase = ({ recentAchievements = [], onCelebrate }) => {
  const [celebratingId, setCelebratingId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (recentAchievements?.length > 1) {
      const interval = setInterval(() => setCurrentIndex((prev) => (prev + 1) % recentAchievements?.length), 5000);
      return () => clearInterval(interval);
    }
  }, [recentAchievements?.length]);

  const handleCelebrate = (achievementId) => {
    setCelebratingId(achievementId);
    if (onCelebrate) onCelebrate(achievementId);
    setTimeout(() => setCelebratingId(null), 2000);
  };

  const getAchievementColor = (type) => {
    switch (type) {
      case 'milestone': return 'from-purple-500 to-pink-500';
      case 'streak': return 'from-orange-500 to-red-500';
      case 'completion': return 'from-green-500 to-emerald-500';
      case 'competition': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getAchievementIcon = (type) => {
    switch (type) {
      case 'milestone': return 'Target';
      case 'streak': return 'Flame';
      case 'completion': return 'CheckCircle';
      case 'competition': return 'Trophy';
      default: return 'Award';
    }
  };

  if (recentAchievements?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center">
          <Icon name="Award" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No Recent Achievements</h3>
          <p className="text-sm text-muted-foreground">Complete learning modules to earn your first achievement!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Icon name="Trophy" size={20} className="text-warning" /><h3 className="font-semibold text-foreground">Recent Achievements</h3></div>
          <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{recentAchievements?.length} new this week</span><div className="w-2 h-2 bg-success rounded-full animate-pulse" /></div>
        </div>
      </div>
      <div className="p-4">
        {recentAchievements?.[currentIndex] && (
          <div className={`relative p-6 rounded-lg mb-4 overflow-hidden bg-gradient-to-r ${getAchievementColor(recentAchievements?.[currentIndex]?.type)} ${celebratingId === recentAchievements?.[currentIndex]?.id ? 'animate-pulse' : ''}`}>
            <div className="relative z-10 text-white">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><Icon name={getAchievementIcon(recentAchievements?.[currentIndex]?.type)} size={24} className="text-white" /></div>
                <div className="flex-1"><h4 className="font-bold text-lg">{recentAchievements?.[currentIndex]?.title}</h4><p className="text-white/80 text-sm">{recentAchievements?.[currentIndex]?.description}</p></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Image src={recentAchievements?.[currentIndex]?.userAvatar} alt={recentAchievements?.[currentIndex]?.userName} className="w-8 h-8 rounded-full border-2 border-white/50" />
                  <div><div className="font-semibold">{recentAchievements?.[currentIndex]?.userName}</div><div className="text-white/80 text-xs">{recentAchievements?.[currentIndex]?.timeAgo}</div></div>
                </div>
                <button onClick={() => handleCelebrate(recentAchievements?.[currentIndex]?.id)} className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full hover:bg-white/30 transition-colors"><Icon name="Heart" size={16} /><span className="text-sm">{recentAchievements?.[currentIndex]?.celebrations || 0}</span></button>
              </div>
            </div>
            {celebratingId === recentAchievements?.[currentIndex]?.id && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 animate-bounce"><Icon name="Sparkles" size={20} className="text-yellow-300" /></div>
                <div className="absolute top-8 right-8 animate-bounce delay-100"><Icon name="Star" size={16} className="text-yellow-300" /></div>
                <div className="absolute bottom-4 left-8 animate-bounce delay-200"><Icon name="Zap" size={18} className="text-yellow-300" /></div>
              </div>
            )}
          </div>
        )}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground text-sm">All Recent Achievements</h4>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {recentAchievements?.map((achievement) => (
              <div key={achievement?.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${getAchievementColor(achievement?.type)}`}><Icon name={getAchievementIcon(achievement?.type)} size={16} className="text-white" /></div>
                <div className="flex-1 min-w-0"><div className="font-medium text-foreground text-sm truncate">{achievement?.title}</div><div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{achievement?.userName}</span><span>•</span><span>{achievement?.timeAgo}</span></div></div>
                <div className="flex items-center gap-2"><span className="text-xs font-mono text-success">+{achievement?.points}pts</span><button onClick={() => handleCelebrate(achievement?.id)} className="p-1 hover:bg-accent rounded-full transition-colors"><Icon name="Heart" size={14} className="text-muted-foreground hover:text-destructive" /></button></div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { type: 'milestone', label: 'Milestones' },
              { type: 'streak', label: 'Streaks' },
              { type: 'completion', label: 'Completions' },
              { type: 'competition', label: 'Competitions' }
            ].map((category) => {
              const count = recentAchievements?.filter(a => a.type === category.type).length || 0;
              return (
                <div key={category?.type} className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center bg-gradient-to-r ${getAchievementColor(category?.type)}`}><Icon name={getAchievementIcon(category?.type)} size={14} className="text-white" /></div>
                  <div className="font-semibold text-foreground text-sm">{count}</div><div className="text-xs text-muted-foreground">{category?.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementShowcase;