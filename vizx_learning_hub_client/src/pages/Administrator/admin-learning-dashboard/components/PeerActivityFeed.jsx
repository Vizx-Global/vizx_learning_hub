import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';

const PeerActivityFeed = ({ userRole = 'employee' }) => {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const mockActivities = [
    {
      id: 1,
      type: 'completion',
      user: {
        name: "Sarah Chen",
        avatar: "https://randomuser.me/api/portraits/women/32.jpg",
        department: "Engineering"
      },
      action: "completed",
      target: "AI Ethics and Governance",
      targetType: "module",
      points: 150,
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      achievement: {
        name: "Ethics Expert",
        icon: "Shield"
      }
    },
    {
      id: 2,
      type: 'streak',
      user: {
        name: "Michael Rodriguez",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        department: "Product"
      },
      action: "achieved",
      target: "15-day learning streak",
      targetType: "streak",
      points: 200,
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      achievement: {
        name: "Consistency Champion",
        icon: "Flame"
      }
    },
    {
      id: 3,
      type: 'leaderboard',
      user: {
        name: "Emily Johnson",
        avatar: "https://randomuser.me/api/portraits/women/28.jpg",
        department: "Marketing"
      },
      action: "moved to",
      target: "#3 on weekly leaderboard",
      targetType: "rank",
      points: 0,
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    },
    {
      id: 4,
      type: 'path_completion',
      user: {
        name: "David Kim",
        avatar: "https://randomuser.me/api/portraits/men/28.jpg",
        department: "Sales"
      },
      action: "completed",
      target: "AI Fundamentals for Business",
      targetType: "path",
      points: 500,
      timestamp: new Date(Date.now() - 2700000), // 45 minutes ago
      achievement: {
        name: "Path Pioneer",
        icon: "Trophy"
      }
    },
    {
      id: 5,
      type: 'challenge',
      user: {
        name: "Lisa Wang",
        avatar: "https://randomuser.me/api/portraits/women/35.jpg",
        department: "HR"
      },
      action: "won",
      target: "Weekly AI Quiz Challenge",
      targetType: "challenge",
      points: 300,
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      achievement: {
        name: "Quiz Master",
        icon: "Brain"
      }
    },
    {
      id: 6,
      type: 'milestone',
      user: {
        name: "Alex Thompson",
        avatar: "https://randomuser.me/api/portraits/men/35.jpg",
        department: "Finance"
      },
      action: "reached",
      target: "1000 total points",
      targetType: "milestone",
      points: 100,
      timestamp: new Date(Date.now() - 5400000), // 1.5 hours ago
      achievement: {
        name: "Point Collector",
        icon: "Star"
      }
    },
    {
      id: 7,
      type: 'completion',
      user: {
        name: "Maria Garcia",
        avatar: "https://randomuser.me/api/portraits/women/42.jpg",
        department: "Operations"
      },
      action: "completed",
      target: "Machine Learning for Managers",
      targetType: "module",
      points: 120,
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    },
    {
      id: 8,
      type: 'social',
      user: {
        name: "James Wilson",
        avatar: "https://randomuser.me/api/portraits/men/42.jpg",
        department: "IT"
      },
      action: "helped",
      target: "3 colleagues with AI concepts",
      targetType: "social",
      points: 75,
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      achievement: {
        name: "Team Player",
        icon: "Users"
      }
    }
  ];

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setActivities(mockActivities);
      setIsLoading(false);
    }, 300);
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'completion': return { icon: 'CheckCircle', color: 'text-success' };
      case 'streak': return { icon: 'Flame', color: 'text-warning' };
      case 'leaderboard': return { icon: 'TrendingUp', color: 'text-primary' };
      case 'path_completion': return { icon: 'Trophy', color: 'text-warning' };
      case 'challenge': return { icon: 'Zap', color: 'text-primary' };
      case 'milestone': return { icon: 'Target', color: 'text-success' };
      case 'social': return { icon: 'Users', color: 'text-secondary' };
      default: return { icon: 'Activity', color: 'text-muted-foreground' };
    }
  };

  const formatTimeAgo = (timestamp) => {
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

  const filteredActivities = activities?.filter(activity => {
    if (filter === 'all') return true;
    return activity?.type === filter;
  });

  const getActionText = (activity) => {
    const { action, target, targetType } = activity;
    
    switch (targetType) {
      case 'module':
        return `${action} the module "${target}"`;
      case 'path':
        return `${action} the learning path "${target}"`;
      case 'streak':
        return `${action} a ${target}`;
      case 'rank':
        return `${action} ${target}`;
      case 'challenge':
        return `${action} the "${target}"`;
      case 'milestone':
        return `${action} ${target}`;
      case 'social':
        return `${action} ${target}`;
      default:
        return `${action} ${target}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Activity Feed Widget */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
              <Icon name="Activity" size={20} className="text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Peer Activity</h3>
              <p className="text-sm text-muted-foreground">See what your colleagues are achieving</p>
            </div>
          </div>

          {/* Activity Filter */}
          <select 
            value={filter}
            onChange={(e) => setFilter(e?.target?.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Activity</option>
            <option value="completion">Completions</option>
            <option value="streak">Streaks</option>
            <option value="leaderboard">Rankings</option>
            <option value="challenge">Challenges</option>
            <option value="milestone">Milestones</option>
          </select>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4]?.map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                <div className="w-16 h-3 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredActivities?.map((activity) => {
              const activityConfig = getActivityIcon(activity?.type);
              
              return (
                <div 
                  key={activity?.id} 
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/30 transition-colors duration-200 group"
                >
                  {/* User Avatar */}
                  <div className="relative flex-shrink-0">
                    <img 
                      src={activity?.user?.avatar} 
                      alt={activity?.user?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className={`
                      absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card
                      flex items-center justify-center ${activityConfig?.color?.replace('text-', 'bg-')}
                    `}>
                      <Icon name={activityConfig?.icon} size={12} className="text-white" />
                    </div>
                  </div>
                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">{activity?.user?.name}</span>
                          <span className="text-muted-foreground ml-1">
                            {getActionText(activity)}
                          </span>
                        </p>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {activity?.user?.department}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(activity?.timestamp)}
                          </span>
                          {activity?.points > 0 && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <div className="flex items-center gap-1">
                                <Icon name="Star" size={12} className="text-warning" />
                                <span className="text-xs font-medium text-warning">
                                  +{activity?.points}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Achievement Badge */}
                        {activity?.achievement && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 bg-warning/10 text-warning px-2 py-1 rounded-full">
                              <Icon name={activity?.achievement?.icon} size={12} />
                              <span className="text-xs font-medium">
                                {activity?.achievement?.name}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Action Button */}
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-accent rounded">
                    <Icon name="ExternalLink" size={14} className="text-muted-foreground" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredActivities?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No recent activity to show</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check back later to see what your colleagues are up to!
            </p>
          </div>
        )}

        {/* View More */}
        {filteredActivities?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <button className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-colors">
              View All Activity →
            </button>
          </div>
        )}
      </div>
      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-secondary/5 to-primary/5 rounded-xl border border-secondary/20 p-6">
        <h4 className="font-semibold text-foreground mb-4">Community Stats</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary mb-1">
              {activities?.filter(a => a?.type === 'completion')?.length}
            </div>
            <div className="text-xs text-muted-foreground">Modules Completed Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {activities?.filter(a => a?.type === 'streak')?.length}
            </div>
            <div className="text-xs text-muted-foreground">Active Streaks</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeerActivityFeed;