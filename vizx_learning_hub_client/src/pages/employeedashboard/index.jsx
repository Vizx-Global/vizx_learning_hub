import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import NavigationSidebar from '../../components/ui/NavigationSidebar';
import LiveUpdateIndicator from '../../components/ui/LiveUpdateIndicator';
import Icon from '../../components/AppIcon';

import LearningPathProgress from './components/LearningPathProgress';
import RecommendedModules from './components/RecommededModules';
import LeaderboardWidget from './components/LeaderboardWidget';
import PeerActivityFeed from './components/PeerActivityFeed';
import QuickActions from './components/QuickActions';

const EmployeeLearningDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [updateCount, setUpdateCount] = useState(0);
  
  const { user, hasRole, hasPermission } = useAuth();

  const getUserDisplayInfo = () => {
    if (!user) return { name: 'Loading...', points: 0, streak: 0, department: 'Loading...' };
    
    return {
      name: `${user.firstName} ${user.lastName}`,
      points: user.totalPoints || 0,
      streak: user.currentStreak || 0,
      department: user.department || 'Not assigned',
      level: user.currentLevel === 1 ? 'Beginner' : 
             user.currentLevel === 2 ? 'Intermediate' : 'Advanced'
    };
  };

  const userInfo = getUserDisplayInfo();

  useEffect(() => {
 
    const interval = setInterval(() => {
      setUpdateCount(prev => prev + 1);
      setLastSyncTime(new Date());
    }, 30000);

    const handleKeyPress = (e) => {
      if (e?.key === 'n' && !e?.ctrlKey && !e?.altKey && !e?.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA')) {
          return;
        }
        e?.preventDefault();
        console.log('Navigate to next module');
      }
      if (e?.key === 'p' && !e?.ctrlKey && !e?.altKey && !e?.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA')) {
          return;
        }
        e?.preventDefault();
        console.log('Navigate to previous module');
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      clearInterval(interval);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Learning Dashboard - AI Learning Hub</title>
        <meta name="description" content="Track your AI learning progress, discover new modules, and compete with colleagues in your personalized learning dashboard." />
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Navigation Sidebar */}
        <NavigationSidebar 
          isCollapsed={sidebarCollapsed}
        />

        {/* Main Content */}
        <div className={`
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'}
          pb-20 md:pb-0
        `}>
          {/* Header */}
          <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                {/* Sidebar Toggle */}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent transition-colors"
                >
                  <Icon name={sidebarCollapsed ? "ChevronRight" : "ChevronLeft"} size={20} />
                </button>

                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    {hasRole('ADMIN') ? 'Administrator Dashboard' : 
                     hasRole('MANAGER') ? 'Manager Dashboard' : 'Learning Dashboard'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Welcome back, {userInfo.name}! Ready to continue your AI journey?
                  </p>
                </div>
              </div>

              {/* Header Stats */}
              <div className="flex items-center gap-6">
                {/* Current Streak */}
                <div className="hidden sm:flex items-center gap-2 bg-warning/10 px-3 py-2 rounded-lg">
                  <Icon name="Flame" size={18} className="text-warning" />
                  <div className="text-right">
                    <div className="text-sm font-bold text-warning">{userInfo.streak}</div>
                    <div className="text-xs text-muted-foreground">day streak</div>
                  </div>
                </div>

                {/* Total Points */}
                <div className="hidden sm:flex items-center gap-2 bg-success/10 px-3 py-2 rounded-lg">
                  <Icon name="Star" size={18} className="text-success" />
                  <div className="text-right">
                    <div className="text-sm font-bold text-success">{userInfo.points?.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">total points</div>
                  </div>
                </div>

                {/* Sync Status */}
                <LiveUpdateIndicator
                  type="sync"
                  status="connected"
                  lastUpdate={lastSyncTime}
                  updateCount={updateCount}
                  size="sm"
                />

                {/* User Avatar */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm
                  ${user.role === 'ADMIN' ? 'bg-destructive' : 
                    user.role === 'MANAGER' ? 'bg-warning' : 'bg-primary'
                  }
                `}>
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6">
            {/* Three Column Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Sidebar - Learning Path Progress (25%) */}
              <div className="xl:col-span-3 space-y-6">
                <LearningPathProgress />
              </div>

              {/* Center Panel - Recommended Modules (50%) */}
              <div className="xl:col-span-6 space-y-6">
                {/* Quick Actions */}
                <QuickActions />
                
                {/* Recommended Modules */}
                <RecommendedModules />
              </div>

              {/* Right Sidebar - Leaderboard & Activity (25%) */}
              <div className="xl:col-span-3 space-y-6">
                <LeaderboardWidget />
                <PeerActivityFeed />
              </div>
            </div>

            {/* Manager/Admin Additional Widgets */}
            {(hasRole('MANAGER') || hasRole('ADMIN')) && (
              <div className="mt-8 pt-8 border-t border-border">
                <h2 className="text-lg font-semibold text-foreground mb-6">
                  {hasRole('ADMIN') ? 'Administrative Tools' : 'Team Management'}
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Team Insights Widget */}
                  {(hasRole('MANAGER') || hasRole('ADMIN')) && (
                    <div className="bg-card rounded-xl border border-border p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                          <Icon name="Users" size={20} className="text-secondary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">Team Insights</h3>
                          <p className="text-sm text-muted-foreground">Monitor team progress</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Team Average</span>
                          <span className="text-sm font-medium text-foreground">78%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="h-full bg-secondary rounded-full" style={{ width: '78%' }} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-secondary">12</div>
                            <div className="text-xs text-muted-foreground">Active Learners</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-success">8</div>
                            <div className="text-xs text-muted-foreground">On Track</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* User Impersonation Tool (Admin Only) */}
                  {hasRole('ADMIN') && (
                    <div className="bg-card rounded-xl border border-border p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon name="UserCheck" size={20} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">User Impersonation</h3>
                          <p className="text-sm text-muted-foreground">Switch to user view</p>
                        </div>
                      </div>
                      
                      <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm">
                        <option>Select user to impersonate</option>
                        <option>Sarah Chen (Engineering)</option>
                        <option>Michael Rodriguez (Product)</option>
                        <option>Emily Johnson (Marketing)</option>
                      </select>
                      
                      <button className="w-full mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                        Switch View
                      </button>
                    </div>
                  )}

                  {/* Content Sync Status (Admin Only) */}
                  {hasRole('ADMIN') && (
                    <div className="bg-card rounded-xl border border-border p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                          <Icon name="RefreshCw" size={20} className="text-success" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">Content Sync</h3>
                          <p className="text-sm text-muted-foreground">Microsoft Learn integration</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Last Sync</span>
                          <span className="text-sm font-medium text-foreground">
                            {lastSyncTime?.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <span className="text-sm font-medium text-success">✓ Up to date</span>
                        </div>
                        <button className="w-full mt-3 px-4 py-2 bg-success text-success-foreground rounded-lg text-sm font-medium hover:bg-success/90 transition-colors">
                          Force Sync Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>

          {/* Keyboard Shortcuts Help */}
          <div className="fixed bottom-4 right-4 z-20">
            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
              <div className="text-xs text-muted-foreground mb-2">Keyboard Shortcuts:</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <kbd className="bg-muted px-1.5 py-0.5 rounded font-mono">N</kbd>
                  <span className="text-muted-foreground">Next module</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="bg-muted px-1.5 py-0.5 rounded font-mono">P</kbd>
                  <span className="text-muted-foreground">Previous module</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="bg-muted px-1.5 py-0.5 rounded font-mono">Space</kbd>
                  <span className="text-muted-foreground">Start learning</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeLearningDashboard;