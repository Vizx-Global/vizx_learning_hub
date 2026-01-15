import React from 'react';
import Icon from '../../../../components/AppIcon';
import Image from '../../../../components/AppImage';

const UserRankCard = ({ 
  user = null, 
  rank = null, 
  totalParticipants = 0,
  showComparison = true 
}) => {
  const defaultUser = {
    id: 'current-user',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    department: 'Engineering',
    points: 2450,
    streak: 7,
    rank: 15,
    trend: 'up',
    rankChange: 3,
    pointsChange: 125,
    completedModules: 12,
    totalModules: 20,
    weeklyGoal: 5,
    weeklyProgress: 4
  };

  const currentUser = user || defaultUser;
  const currentRank = rank || currentUser?.rank;

  const getRankSuffix = (rank) => {
    const lastDigit = rank % 10;
    const lastTwoDigits = rank % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return 'th';
    }
    
    switch (lastDigit) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const getPercentile = () => {
    if (!totalParticipants || !currentRank) return 0;
    return Math.round(((totalParticipants - currentRank) / totalParticipants) * 100);
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'TrendingUp';
      case 'down': return 'TrendingDown';
      default: return 'Minus';
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-lg p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Image
            src={currentUser?.avatar}
            alt={currentUser?.name}
            className="w-16 h-16 rounded-full object-cover border-4 border-primary/20"
          />
          <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
            #{currentRank}
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg text-foreground">{currentUser?.name}</h3>
          <p className="text-muted-foreground">{currentUser?.department}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-foreground">
              {currentRank}{getRankSuffix(currentRank)} place
            </span>
            {totalParticipants > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  Top {getPercentile()}%
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-card/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Icon name="Star" size={16} className="text-warning" />
            <span className="font-bold text-lg text-foreground">
              {currentUser?.points?.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">Total Points</div>
          {currentUser?.pointsChange && (
            <div className={`
              text-xs font-medium mt-1
              ${currentUser?.pointsChange > 0 ? 'text-success' : 'text-destructive'}
            `}>
              {currentUser?.pointsChange > 0 ? '+' : ''}{currentUser?.pointsChange} this week
            </div>
          )}
        </div>

        <div className="text-center p-3 bg-card/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Icon name="Flame" size={16} className="text-orange-500" />
            <span className="font-bold text-lg text-foreground">{currentUser?.streak}</span>
          </div>
          <div className="text-xs text-muted-foreground">Day Streak</div>
        </div>

        <div className="text-center p-3 bg-card/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Icon name="BookOpen" size={16} className="text-primary" />
            <span className="font-bold text-lg text-foreground">
              {currentUser?.completedModules}/{currentUser?.totalModules}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">Modules</div>
        </div>

        <div className="text-center p-3 bg-card/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Icon 
              name={getTrendIcon(currentUser?.trend)} 
              size={16} 
              className={getTrendColor(currentUser?.trend)} 
            />
            <span className={`font-bold text-lg ${getTrendColor(currentUser?.trend)}`}>
              {currentUser?.rankChange ? Math.abs(currentUser?.rankChange) : 0}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">Rank Change</div>
        </div>
      </div>
      {/* Progress Bars */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Course Progress</span>
            <span className="text-sm text-muted-foreground">
              {Math.round((currentUser?.completedModules / currentUser?.totalModules) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(currentUser?.completedModules / currentUser?.totalModules) * 100}%` 
              }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Weekly Goal</span>
            <span className="text-sm text-muted-foreground">
              {currentUser?.weeklyProgress}/{currentUser?.weeklyGoal} modules
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-success to-emerald-400 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min((currentUser?.weeklyProgress / currentUser?.weeklyGoal) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      </div>
      {/* Comparison Section */}
      {showComparison && (
        <div className="mt-6 pt-4 border-t border-border/50">
          <h4 className="font-medium text-foreground mb-3">Performance Comparison</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">vs Department Avg:</span>
              <span className="font-medium text-success">+15% higher</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">vs Company Avg:</span>
              <span className="font-medium text-success">+8% higher</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Learning Velocity:</span>
              <span className="font-medium text-primary">Above Average</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Consistency Score:</span>
              <span className="font-medium text-warning">Excellent</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRankCard;