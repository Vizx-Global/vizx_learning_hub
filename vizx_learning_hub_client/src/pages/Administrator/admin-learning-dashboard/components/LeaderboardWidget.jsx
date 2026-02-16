import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { MessageSquare } from 'lucide-react';
import leaderboardService from '../../../../api/leaderboardService';
import Icon from '../../../../components/AppIcon';

const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

const UserAvatar = ({ userData, className = "w-10 h-10" }) => {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(userData?.name || `${userData?.firstName} ${userData?.lastName}`);

  if (userData?.avatar && !imgError) {
    return (
      <img
        src={userData.avatar}
        alt={userData.name}
        className={`${className} rounded-full object-cover`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${className} rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 ring-1 ring-primary/5`}>
      <span className="text-primary font-bold text-xs">{initials}</span>
    </div>
  );
};

const LeaderboardWidget = ({ userRole = 'employee' }) => {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [timeframe, setTimeframe] = useState('weekly');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await leaderboardService.getLeaderboard(5, timeframe);
        const data = (response.data || response)
          .filter(item => {
            const role = item.user?.role || item.role;
            return role !== 'ADMIN';
          })
          .map((item, index) => ({
             id: item.id || item.user?.id,
             name: item.name || (item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Unknown User'),
             firstName: item.firstName || item.user?.firstName,
             lastName: item.lastName || item.user?.lastName,
             avatar: item.avatar || item.user?.avatar,
             points: item.points || 0,
             modulesCompleted: item.modulesCompleted || 0,
             streak: item.currentStreak || item.user?.currentStreak || 0,
             rank: index + 1, // Re-rank after filtering admins
             change: item.rankChange || 0,
             department: item.department || item.user?.department?.name || '',
             isCurrentUser: (item.id || item.user?.id) === user?.id
        }));
        
        setLeaderboardData(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard widget data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeframe, user]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return { icon: 'Crown', color: 'text-orange-600' };
      case 2: return { icon: 'Medal', color: 'text-gray-400' };
      case 3: return { icon: 'Award', color: 'text-amber-600' };
      default: return { icon: 'User', color: 'text-muted-foreground' };
    }
  };

  const getChangeIndicator = (change) => {
    if (change > 0) return { icon: 'TrendingUp', color: 'text-success', text: `+${change}` };
    if (change < 0) return { icon: 'TrendingDown', color: 'text-error', text: change?.toString() };
    return { icon: 'Minus', color: 'text-muted-foreground', text: '0' };
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#000000] rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
              <Icon name="Trophy" size={20} className="text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Leaderboard</h3>
              <p className="text-sm text-muted-foreground">Top performers this {timeframe?.replace('ly', '')}</p>
            </div>
          </div>
          
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                timeframe === 'weekly' ? 'bg-primary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                timeframe === 'monthly' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                <div className="w-16 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboardData.map((item) => {
              const rankConfig = getRankIcon(item.rank);
              const changeConfig = getChangeIndicator(item.change);
              
              return (
                <div 
                  key={item.id} 
                  className={`
                    flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                    ${item.isCurrentUser 
                      ? 'bg-primary/5 border border-primary/20 ring-1 ring-primary/10 shadow-sm' 
                      : 'hover:bg-accent/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 w-8">
                    <span className="text-sm font-bold text-foreground">#{item.rank}</span>
                    <Icon name={rankConfig.icon} size={16} className={rankConfig.color} />
                  </div>
                  
                  <UserAvatar userData={item} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold truncate ${
                        item.isCurrentUser ? 'text-primary' : 'text-foreground'
                      }`}>
                        {item.name}
                        {item.isCurrentUser && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1 font-bold">YOU</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
                      {item.department && (
                        <>
                          <span className="truncate max-w-[80px]">{item.department}</span>
                          <span className="opacity-50">•</span>
                        </>
                      )}
                      <div className="flex items-center gap-1">
                        <Icon name="BookOpen" size={10} />
                        <span>{item.modulesCompleted} Modules</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-bold text-foreground">
                      {item.points.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <Icon name={changeConfig.icon} size={10} className={changeConfig.color} />
                      <span className={`text-[10px] font-bold ${changeConfig.color}`}>
                        {changeConfig.text}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border">
          <button className="w-full text-xs text-primary hover:text-primary/80 font-bold transition-colors uppercase tracking-widest">
            View Full Leaderboard →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardWidget;
