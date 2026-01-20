import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationSidebar from '../../../components/ui/NavigationSidebar';
import Button from '../../../components/ui/Button';
import LeaderboardTabs from './components/LeaderboardTabs';
import FilterToolbar from './components/FilterToolbar';
import LeaderboardTable from './components/LeaderboardTable';
import AchievementShowcase from './components/AchievementShowcase';
import LiveUpdateIndicators from './components/LiveUpdateIndicators';
import UserRankCard from './components/UserRankCard';

const GamificationLeaderboards = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('global');
  const [timeRange, setTimeRange] = useState('weekly');
  const [department, setDepartment] = useState('all');
  const [skillCategory, setSkillCategory] = useState('all');
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [updateCount, setUpdateCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const mockLeaderboardData = [
    { id: 'user-1', rank: 1, name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', department: 'Engineering', points: 4850, streak: 28, trend: 'up', rankChange: 2, pointsChange: 180, isOnline: true, recentAchievements: [{ icon: 'Trophy', name: 'AI Expert' }, { icon: 'Target', name: 'Milestone Master' }, { icon: 'Flame', name: 'Streak Champion' }], lastActivity: '2 minutes ago' },
    { id: 'user-2', rank: 2, name: 'Mike Johnson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', department: 'Marketing', points: 4720, streak: 21, trend: 'stable', rankChange: 0, pointsChange: 95, isOnline: true, recentAchievements: [{ icon: 'CheckCircle', name: 'Course Complete' }, { icon: 'Star', name: 'Top Performer' }], lastActivity: '5 minutes ago' },
    { id: 'user-3', rank: 3, name: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', department: 'Sales', points: 4580, streak: 15, trend: 'up', rankChange: 1, pointsChange: 120, isOnline: false, recentAchievements: [{ icon: 'Flame', name: 'Learning Streak' }], lastActivity: '1 hour ago' },
    { id: 'user-4', rank: 4, name: 'David Rodriguez', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', department: 'HR', points: 4350, streak: 12, trend: 'down', rankChange: -1, pointsChange: 45, isOnline: true, recentAchievements: [{ icon: 'Award', name: 'Team Player' }], lastActivity: '30 minutes ago' },
    { id: 'user-5', rank: 5, name: 'Lisa Park', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', department: 'Finance', points: 4200, streak: 9, trend: 'up', rankChange: 3, pointsChange: 200, isOnline: true, recentAchievements: [{ icon: 'TrendingUp', name: 'Rising Star' }, { icon: 'Target', name: 'Goal Crusher' }], lastActivity: '15 minutes ago' }
  ];

  const mockRecentAchievements = [
    { id: 'achievement-1', title: 'AI Fundamentals Master', description: 'Completed all AI fundamentals modules with 95%+ scores', type: 'milestone', userName: 'Sarah Chen', userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', timeAgo: '2 hours ago', points: 500, celebrations: 12 },
    { id: 'achievement-2', title: '30-Day Learning Streak', description: 'Maintained consistent daily learning for 30 consecutive days', type: 'streak', userName: 'Mike Johnson', userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', timeAgo: '4 hours ago', points: 300, celebrations: 8 },
    { id: 'achievement-3', title: 'Machine Learning Champion', description: 'Scored in top 10% across all ML assessments', type: 'competition', userName: 'Emma Wilson', userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', timeAgo: '6 hours ago', points: 750, celebrations: 15 },
    { id: 'achievement-4', title: 'Course Completion Expert', description: 'Completed 5 courses with perfect attendance', type: 'completion', userName: 'David Rodriguez', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', timeAgo: '1 day ago', points: 400, celebrations: 6 }
  ];

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => { setUpdateCount(prev => prev + 1); setLastUpdate(new Date()); }, 10000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  const handleRefresh = () => { setUpdateCount(prev => prev + 1); setLastUpdate(new Date()); };
  const handleCelebrate = (achievementId) => console.log('Celebrating achievement:', achievementId);
  const handleReconnect = () => { setIsLive(true); setUpdateCount(0); setLastUpdate(new Date()); };

  return (
    <div className="min-h-screen bg-background">
      <NavigationSidebar isCollapsed={sidebarCollapsed} userRole="employee" />
      <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'} pb-16 md:pb-0`}>
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" iconName="Menu" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden md:flex" />
              <div><h1 className="text-2xl font-bold text-foreground">Gamification Leaderboards</h1><p className="text-sm text-muted-foreground">Compete, learn, and celebrate achievements with your peers</p></div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" iconName="Download" iconPosition="left" onClick={() => console.log('Export leaderboard')}>Export</Button>
              <Button variant="default" size="sm" iconName="Settings" iconPosition="left" onClick={() => navigate('/user-profile-management')}>Settings</Button>
            </div>
          </div>
        </header>
        <main className="p-4 space-y-6">
          <UserRankCard totalParticipants={150} showComparison={true} />
          <LeaderboardTabs activeTab={activeTab} onTabChange={setActiveTab} userRole="employee" />
          <FilterToolbar timeRange={timeRange} onTimeRangeChange={setTimeRange} department={department} onDepartmentChange={setDepartment} skillCategory={skillCategory} onSkillCategoryChange={setSkillCategory} onRefresh={handleRefresh} isLive={isLive} />
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <LeaderboardTable data={mockLeaderboardData} currentUserId="user-1" showTrends={true} showAchievements={true} isLive={isLive} />
            </div>
            <div className="xl:col-span-1 space-y-6">
              <LiveUpdateIndicators isConnected={isLive} lastUpdate={lastUpdate} updateCount={updateCount} onReconnect={handleReconnect} />
              <AchievementShowcase recentAchievements={mockRecentAchievements} onCelebrate={handleCelebrate} />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" fullWidth iconName="BookOpen" iconPosition="left" onClick={() => navigate('/employee-learning-dashboard')}>View Learning Dashboard</Button>
              <Button variant="outline" fullWidth iconName="Gamepad2" iconPosition="left" onClick={() => navigate('/interactive-learning-games-hub')}>Play Learning Games</Button>
              <Button variant="outline" fullWidth iconName="Users" iconPosition="left" onClick={() => navigate('/user-profile-management')}>Manage Profile</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GamificationLeaderboards;