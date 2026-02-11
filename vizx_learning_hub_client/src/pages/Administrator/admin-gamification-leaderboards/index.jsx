import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import NavigationSidebar from '../../../components/ui/NavigationSidebar';
import Button from '../../../components/ui/Button';
import LeaderboardTabs from './components/LeaderboardTabs';
import FilterToolbar from './components/FilterToolbar';
import LeaderboardTable from './components/LeaderboardTable';
import AchievementShowcase from './components/AchievementShowcase';
import LiveUpdateIndicators from './components/LiveUpdateIndicators';
import achievementService from '../../../api/achievementService';
import leaderboardService from '../../../api/leaderboardService';
import UserRankCard from './components/UserRankCard';

const GamificationLeaderboards = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('global');
  const [timeRange, setTimeRange] = useState('weekly');
  const [department, setDepartment] = useState('all');
  const [skillCategory, setSkillCategory] = useState('all');
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [updateCount, setUpdateCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab, timeRange, department, skillCategory, updateCount]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leaderboardRes, achievementsRes] = await Promise.all([
        leaderboardService.getLeaderboard(50, timeRange, department === 'all' ? null : department),
        achievementService.getAllAchievements() // Or specialized 'recent' if available
      ]);
      
      // Transform leaderboard data if needed to match component expectations
      // Assuming API returns array of user objects with points/rank
      const formattedLeaderboard = (leaderboardRes.data || leaderboardRes).map((item, index) => ({
        id: item.user?.id || item.id,
        rank: index + 1,
        name: item.user ? `${item.user.firstName} ${item.user.lastName}` : item.name,
        avatar: item.user?.avatar || item.avatar,
        department: item.user?.department?.name || item.user?.department || item.department || 'N/A',
        points: item.points || item.totalPoints || 0,
        streak: item.user?.currentStreak || item.streak || 0,
        trend: item.trend || 'stable', // Backend might need to provide this or compute
        rankChange: item.rankChange || 0,
        pointsChange: item.pointsChange || 0,
        isOnline: item.isOnline || false, // Online status might come from socket
        recentAchievements: item.recentAchievements || [],
        lastActiveAt: item.lastActiveAt,
        lastActivity: item.lastActivity || (item.lastActiveAt ? new Date(item.lastActiveAt).toLocaleTimeString() : 'Just now')
      }));
      
      setLeaderboardData(formattedLeaderboard);

      // Simple transformation for achievements if backend returns raw list
      // Ideally backend endpoint /recent-activity provides mixed feed
      // Using mock-like structure for now if specialized endpoint missing
      if (achievementsRes.data) {
          // If API returns achievement definitions, we can't show "user earned X" without user-achievement link.
          // For now, let's try to use what we have or keep mock fallback if empty
          // But user wants REAL data. 
          // If achievementService.getAllAchievements returns definitions, checking 'recent' endpoint from Step 922
          try {
             const recentRes = await leaderboardService.getRecentAchievements();
             if (recentRes.success) {
                 setRecentAchievements(recentRes.data.map(a => ({
                     id: a.id,
                     title: a.achievement.title,
                     description: a.achievement.description,
                     type: a.achievement.type?.toLowerCase() || 'milestone',
                     userName: `${a.user.firstName} ${a.user.lastName}`,
                     userAvatar: a.user.avatar,
                     timeAgo: new Date(a.earnedAt).toLocaleTimeString(), // simplified
                     points: a.achievement.points,
                     celebrations: 0
                 })));
             }
          } catch (e) {
             console.log('Recent achievements fetch failed', e);
          }
      }
      
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => { setUpdateCount(prev => prev + 1); setLastUpdate(new Date()); }, 10000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  useEffect(() => {
    if (activeTab === 'department' && user?.department) {
      setDepartment(user.department.name || (typeof user.department === 'string' ? user.department : 'all'));
    } else if (activeTab === 'global') {
      setDepartment('all');
    }
  }, [activeTab, user]);

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
          <UserRankCard 
            user={leaderboardData.find(u => u.id === user?.id) || (user ? {
              name: `${user.firstName} ${user.lastName}`,
              department: user.department?.name || (typeof user.department === 'string' ? user.department : 'N/A'),
              points: user.totalPoints || 0,
              avatar: user.avatar,
              streak: user.currentStreak || 0,
              completedModules: user.completedModules || 0,
              totalModules: user.totalModules || 0
            } : null)} 
            totalParticipants={leaderboardData.length} 
            showComparison={true} 
            rank={leaderboardData.findIndex(u => u.id === user?.id) !== -1 ? leaderboardData.findIndex(u => u.id === user?.id) + 1 : '-'}
          />
          <LeaderboardTabs activeTab={activeTab} onTabChange={setActiveTab} userRole="employee" />
          <FilterToolbar timeRange={timeRange} onTimeRangeChange={setTimeRange} department={department} onDepartmentChange={setDepartment} skillCategory={skillCategory} onSkillCategoryChange={setSkillCategory} onRefresh={handleRefresh} isLive={isLive} />
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <LeaderboardTable data={leaderboardData} currentUserId={user?.id} showTrends={true} showAchievements={true} isLive={isLive} />
            </div>
            <div className="xl:col-span-1 space-y-6">
              <LiveUpdateIndicators isConnected={isLive} lastUpdate={lastUpdate} updateCount={updateCount} onReconnect={handleReconnect} recentActivities={recentAchievements} />
              <AchievementShowcase recentAchievements={recentAchievements} onCelebrate={handleCelebrate} />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" fullWidth iconName="LayoutDashboard" iconPosition="left" onClick={() => navigate('/admin-learning-dashboard')}>Learning Dashboard</Button>
              <Button variant="outline" fullWidth iconName="Route" iconPosition="left" onClick={() => navigate('/learning-path-management')}>Learning Paths</Button>
              <Button variant="outline" fullWidth iconName="BarChart3" iconPosition="left" onClick={() => navigate('/cohort-performance-analytics')}>Performance Analytics</Button>
              <Button variant="outline" fullWidth iconName="Gamepad2" iconPosition="left" onClick={() => navigate('/interactive-learning-games-hub')}>Learning Games Hub</Button>
              <Button variant="outline" fullWidth iconName="Users" iconPosition="left" onClick={() => navigate('/user-profile-management')}>User Management</Button>
              <Button variant="outline" fullWidth iconName="Settings" iconPosition="left" onClick={() => navigate('/administrative-system-configuration')}>System Configuration</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GamificationLeaderboards;