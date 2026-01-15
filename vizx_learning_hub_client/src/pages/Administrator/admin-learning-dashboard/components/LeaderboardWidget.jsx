import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';

const LeaderboardWidget = ({ userRole = 'employee' }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [timeframe, setTimeframe] = useState('weekly');
  const [isLoading, setIsLoading] = useState(false);

  const mockLeaderboardData = {
    weekly: [
      {
        id: 1,
        name: "Sarah Chen",
        avatar: "https://randomuser.me/api/portraits/women/32.jpg",
        points: 2850,
        modulesCompleted: 12,
        streak: 14,
        rank: 1,
        change: 2,
        department: "Engineering"
      },
      {
        id: 2,
        name: "Michael Rodriguez",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        points: 2720,
        modulesCompleted: 11,
        streak: 9,
        rank: 2,
        change: -1,
        department: "Product"
      },
      {
        id: 3,
        name: "Emily Johnson",
        avatar: "https://randomuser.me/api/portraits/women/28.jpg",
        points: 2650,
        modulesCompleted: 10,
        streak: 12,
        rank: 3,
        change: 1,
        department: "Marketing"
      },
      {
        id: 4,
        name: "John Doe",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        points: 2450,
        modulesCompleted: 9,
        streak: 7,
        rank: 4,
        change: 0,
        department: "Sales",
        isCurrentUser: true
      },
      {
        id: 5,
        name: "Lisa Wang",
        avatar: "https://randomuser.me/api/portraits/women/35.jpg",
        points: 2380,
        modulesCompleted: 8,
        streak: 5,
        rank: 5,
        change: -2,
        department: "HR"
      }
    ],
    monthly: [
      {
        id: 1,
        name: "Sarah Chen",
        avatar: "https://randomuser.me/api/portraits/women/32.jpg",
        points: 8950,
        modulesCompleted: 35,
        streak: 28,
        rank: 1,
        change: 0,
        department: "Engineering"
      },
      {
        id: 4,
        name: "John Doe",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        points: 7450,
        modulesCompleted: 28,
        streak: 21,
        rank: 2,
        change: 2,
        department: "Sales",
        isCurrentUser: true
      },
      {
        id: 2,
        name: "Michael Rodriguez",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        points: 7320,
        modulesCompleted: 27,
        streak: 19,
        rank: 3,
        change: -1,
        department: "Product"
      }
    ]
  };

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const data = mockLeaderboardData?.[timeframe];
      setLeaderboardData(data);
      setCurrentUser(data?.find(user => user?.isCurrentUser));
      setIsLoading(false);
    }, 500);
  }, [timeframe]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return { icon: 'Crown', color: 'text-yellow-500' };
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
      {/* Leaderboard Widget */}
      <div className="bg-card rounded-xl border border-border p-6">
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
          
          {/* Timeframe Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                timeframe === 'weekly' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                timeframe === 'monthly' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5]?.map((i) => (
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
            {leaderboardData?.map((user) => {
              const rankConfig = getRankIcon(user?.rank);
              const changeConfig = getChangeIndicator(user?.change);
              
              return (
                <div 
                  key={user?.id} 
                  className={`
                    flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                    ${user?.isCurrentUser 
                      ? 'bg-primary/5 border border-primary/20 ring-1 ring-primary/10' :'hover:bg-accent/50'
                    }
                  `}
                >
                  {/* Rank */}
                  <div className="flex items-center gap-2 w-8">
                    <span className="text-sm font-bold text-foreground">#{user?.rank}</span>
                    <Icon name={rankConfig?.icon} size={16} className={rankConfig?.color} />
                  </div>
                  {/* Avatar */}
                  <div className="relative">
                    <img 
                      src={user?.avatar} 
                      alt={user?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {user?.streak > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-warning rounded-full flex items-center justify-center">
                        <Icon name="Flame" size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium truncate ${
                        user?.isCurrentUser ? 'text-primary' : 'text-foreground'
                      }`}>
                        {user?.name}
                        {user?.isCurrentUser && (
                          <span className="text-xs text-primary ml-1">(You)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{user?.department}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Icon name="BookOpen" size={12} />
                        <span>{user?.modulesCompleted} modules</span>
                      </div>
                    </div>
                  </div>
                  {/* Points and Change */}
                  <div className="text-right">
                    <div className="text-sm font-bold text-foreground">
                      {user?.points?.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <Icon name={changeConfig?.icon} size={12} className={changeConfig?.color} />
                      <span className={`text-xs font-medium ${changeConfig?.color}`}>
                        {changeConfig?.text}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View Full Leaderboard */}
        <div className="mt-4 pt-4 border-t border-border">
          <button className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            View Full Leaderboard →
          </button>
        </div>
      </div>
      {/* Current User Stats */}
      {currentUser && (
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20 p-6">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src={currentUser?.avatar} 
              alt={currentUser?.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div>
              <h4 className="font-semibold text-foreground">Your Performance</h4>
              <p className="text-sm text-muted-foreground">
                Rank #{currentUser?.rank} • {currentUser?.department}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {currentUser?.points?.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-1">
                {currentUser?.modulesCompleted}
              </div>
              <div className="text-xs text-muted-foreground">Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning mb-1">
                {currentUser?.streak}
              </div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardWidget;