import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const AchievementsPanel = ({ achievements }) => {
  const [filter, setFilter] = useState('all');

  const getAchievementIcon = (type) => {
    switch (type) {
      case 'completion': return 'Trophy';
      case 'streak': return 'Flame';
      case 'score': return 'Target';
      case 'speed': return 'Zap';
      case 'milestone': return 'Star';
      case 'collaboration': return 'Users';
      default: return 'Award';
    }
  };

  const getAchievementColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-muted-foreground bg-muted';
      case 'rare': return 'text-primary bg-primary/10';
      case 'epic': return 'text-secondary bg-secondary/10';
      case 'legendary': return 'text-warning bg-warning/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const filteredAchievements = achievements?.filter(achievement => {
    if (filter === 'all') return true;
    if (filter === 'earned') return achievement?.earned;
    if (filter === 'locked') return !achievement?.earned;
    return achievement?.type === filter;
  });

  const earnedCount = achievements?.filter(a => a?.earned)?.length;
  const totalPoints = achievements?.filter(a => a?.earned)?.reduce((sum, a) => sum + a?.points, 0);

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Achievements</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {earnedCount} of {achievements?.length} earned • {totalPoints?.toLocaleString()} points
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e?.target?.value)}
          className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Achievements</option>
          <option value="earned">Earned</option>
          <option value="locked">Locked</option>
          <option value="completion">Completion</option>
          <option value="streak">Streak</option>
          <option value="score">Score</option>
          <option value="milestone">Milestone</option>
        </select>
      </div>
      {/* Achievement Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-warning">{achievements?.filter(a => a?.rarity === 'legendary' && a?.earned)?.length}</div>
          <div className="text-xs text-muted-foreground">Legendary</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-secondary">{achievements?.filter(a => a?.rarity === 'epic' && a?.earned)?.length}</div>
          <div className="text-xs text-muted-foreground">Epic</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{achievements?.filter(a => a?.rarity === 'rare' && a?.earned)?.length}</div>
          <div className="text-xs text-muted-foreground">Rare</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-muted-foreground">{achievements?.filter(a => a?.rarity === 'common' && a?.earned)?.length}</div>
          <div className="text-xs text-muted-foreground">Common</div>
        </div>
      </div>
      {/* Achievements Grid */}
      <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredAchievements?.map((achievement) => (
          <div
            key={achievement?.id}
            className={`
              p-4 rounded-lg border transition-all duration-200 hover:shadow-md
              ${achievement?.earned 
                ? 'border-border bg-card' :'border-border/50 bg-muted/30 opacity-60'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center
                ${achievement?.earned ? getAchievementColor(achievement?.rarity) : 'bg-muted text-muted-foreground'}
              `}>
                <Icon 
                  name={getAchievementIcon(achievement?.type)} 
                  size={24}
                  className={achievement?.earned ? '' : 'opacity-50'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-semibold text-sm ${achievement?.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {achievement?.title}
                  </h3>
                  {achievement?.earned && (
                    <Icon name="Check" size={14} className="text-success" />
                  )}
                </div>
                <p className={`text-xs mb-2 ${achievement?.earned ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
                  {achievement?.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-medium capitalize
                      ${getAchievementColor(achievement?.rarity)}
                    `}>
                      {achievement?.rarity}
                    </span>
                    <span className={`text-xs font-mono ${achievement?.earned ? 'text-success' : 'text-muted-foreground'}`}>
                      +{achievement?.points} pts
                    </span>
                  </div>
                  {achievement?.earned && achievement?.earnedDate && (
                    <span className="text-xs text-muted-foreground">
                      {achievement?.earnedDate}
                    </span>
                  )}
                </div>
                {!achievement?.earned && achievement?.progress && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <span className="text-xs text-muted-foreground">
                        {achievement?.progress?.current}/{achievement?.progress?.required}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(achievement?.progress?.current / achievement?.progress?.required) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Recent Achievements */}
      {achievements?.filter(a => a?.earned && a?.isRecent)?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="font-semibold text-foreground mb-3">Recent Achievements</h3>
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {achievements?.filter(a => a?.earned && a?.isRecent)?.slice(0, 5)?.map((achievement) => (
                <div
                  key={`recent-${achievement?.id}`}
                  className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-accent rounded-lg"
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center
                    ${getAchievementColor(achievement?.rarity)}
                  `}>
                    <Icon name={getAchievementIcon(achievement?.type)} size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{achievement?.title}</div>
                    <div className="text-xs text-muted-foreground">+{achievement?.points} pts</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsPanel;