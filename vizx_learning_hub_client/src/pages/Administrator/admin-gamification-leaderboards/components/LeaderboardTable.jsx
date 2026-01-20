import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Image from '../../../../components/AppImage';

const LeaderboardTable = ({ data = [], currentUserId = 'user-1', showTrends = true, showAchievements = true, isLive = true }) => {
  const [sortField, setSortField] = useState('rank');
  const [sortDirection, setSortDirection] = useState('asc');
  const [highlightedUsers, setHighlightedUsers] = useState(new Set());

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        const randomUser = data?.[Math.floor(Math.random() * data?.length)];
        if (randomUser) {
          setHighlightedUsers(prev => new Set([...prev, randomUser.id]));
          setTimeout(() => setHighlightedUsers(prev => { const newSet = new Set(prev); newSet?.delete(randomUser?.id); return newSet; }), 2000);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [data, isLive]);

  const handleSort = (field) => {
    if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Icon name="Crown" size={20} className="text-yellow-500" />;
      case 2: return <Icon name="Medal" size={20} className="text-gray-400" />;
      case 3: return <Icon name="Award" size={20} className="text-amber-600" />;
      default: return <span className="text-muted-foreground font-mono">#{rank}</span>;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <Icon name="TrendingUp" size={16} className="text-success" />;
      case 'down': return <Icon name="TrendingDown" size={16} className="text-destructive" />;
      default: return <Icon name="Minus" size={16} className="text-muted-foreground" />;
    }
  };

  const getStreakColor = (streak) => {
    if (streak >= 30) return 'text-purple-500';
    if (streak >= 14) return 'text-success';
    if (streak >= 7) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left p-4 font-semibold text-foreground"><button onClick={() => handleSort('rank')} className="flex items-center gap-2 hover:text-primary transition-colors">Rank<Icon name="ArrowUpDown" size={14} /></button></th>
              <th className="text-left p-4 font-semibold text-foreground">User</th>
              <th className="text-left p-4 font-semibold text-foreground"><button onClick={() => handleSort('points')} className="flex items-center gap-2 hover:text-primary transition-colors">Points<Icon name="ArrowUpDown" size={14} /></button></th>
              <th className="text-left p-4 font-semibold text-foreground">Streak</th>
              {showTrends && <th className="text-left p-4 font-semibold text-foreground">Trend</th>}
              {showAchievements && <th className="text-left p-4 font-semibold text-foreground">Recent Achievements</th>}
              <th className="text-left p-4 font-semibold text-foreground">Activity</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((user) => (
              <tr key={user?.id} className={`border-b border-border transition-all duration-300 ${user?.id === currentUserId ? 'bg-primary/5 border-primary/20' :'hover:bg-muted/20'} ${highlightedUsers?.has(user?.id) ? 'bg-success/10 animate-pulse' :''}`}>
                <td className="p-4"><div className="flex items-center gap-2">{getRankIcon(user?.rank)}{user?.id === currentUserId && <Icon name="User" size={16} className="text-primary" />}</div></td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative"><Image src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-full object-cover" /><div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${user?.isOnline ? 'bg-success' : 'bg-muted-foreground'}`} /></div>
                    <div><div className="font-semibold text-foreground">{user?.name}</div><div className="text-sm text-muted-foreground">{user?.department}</div></div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Icon name="Star" size={16} className="text-warning" /><span className="font-mono font-semibold text-foreground">{user?.points?.toLocaleString()}</span>
                    {user?.pointsChange && <span className={`text-xs font-medium px-2 py-1 rounded-full ${user?.pointsChange > 0 ? 'bg-success/10 text-success' :'bg-destructive/10 text-destructive'}`}>{user?.pointsChange > 0 ? '+' : ''}{user?.pointsChange}</span>}
                  </div>
                </td>
                <td className="p-4"><div className="flex items-center gap-2"><Icon name="Flame" size={16} className={getStreakColor(user?.streak)} /><span className={`font-mono font-semibold ${getStreakColor(user?.streak)}`}>{user?.streak} days</span></div></td>
                {showTrends && <td className="p-4"><div className="flex items-center gap-2">{getTrendIcon(user?.trend)}<span className="text-sm text-muted-foreground">{user?.rankChange && <>{user?.rankChange > 0 ? '+' : ''}{user?.rankChange}</>}</span></div></td>}
                {showAchievements && (
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {user?.recentAchievements?.slice(0, 3)?.map((achievement, idx) => (<div key={idx} className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center" title={achievement?.name}><Icon name={achievement?.icon} size={12} className="text-primary" /></div>))}
                      {user?.recentAchievements?.length > 3 && <span className="text-xs text-muted-foreground ml-1">+{user?.recentAchievements?.length - 3}</span>}
                    </div>
                  </td>
                )}
                <td className="p-4"><div className="text-sm text-muted-foreground">{user?.lastActivity}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;