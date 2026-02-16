import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import NavigationSidebar from '../../../components/ui/NavigationSidebar';

// Modular Components
import AdminHeader from './components/AdminHeader';
import WelcomeSection from './components/WelcomeSection';
import GlobalControlBar from './components/GlobalControlBar';
import KPICardsGrid from './components/KPICardsGrid';
import DepartmentPerformanceChart from './components/DepartmentPerformanceChart';
import QuickActions from './components/QuickActions';
import LearningPathProgress from './components/LearningPathProgress';
import LeaderboardWidget from './components/LeaderboardWidget';
import PeerActivityFeed from './components/PeerActivityFeed';
import Icon from '../../../components/AppIcon';

// API Services
import { 
  userService, 
  departmentService, 
  learningPathService, 
  moduleService,
  achievementService
} from '../../../api';

import { useQuery } from '@tanstack/react-query';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');

  // Date Filtering State
  const [activePreset, setActivePreset] = useState('Last 7 Days');
  const [dateRange, setDateRange] = useState({ 
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
    to: new Date() 
  });

  // Individual Queries for high-fidelity data management
  const statsQuery = useQuery({
    queryKey: ['admin-global-stats'],
    queryFn: () => userService.getUserStats(),
    refetchInterval: 60000,
  });
  
  const userStatsRes = statsQuery.data;
  const statsLoading = statsQuery.isLoading;
  const lastSyncTime = statsQuery.dataUpdatedAt;

  const { data: deptsRes, isLoading: deptsLoading } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => departmentService.getAllDepartments(),
  });

  const { data: pathsRes, isLoading: pathsLoading } = useQuery({
    queryKey: ['admin-learning-paths'],
    queryFn: () => learningPathService.getAllLearningPaths(),
  });

  const { data: modulesRes, isLoading: modulesLoading } = useQuery({
    queryKey: ['admin-modules'],
    queryFn: () => moduleService.getAllModules(),
  });

  const { data: achievementsRes, isLoading: achievementsLoading } = useQuery({
    queryKey: ['admin-achievements'],
    queryFn: () => achievementService.getAllAchievements(),
  });

  const { data: rankingsRes, isLoading: rankingsLoading } = useQuery({
    queryKey: ['admin-dept-rankings'],
    queryFn: () => departmentService.getDepartmentRankings(),
  });

  const isLoading = statsLoading || deptsLoading || pathsLoading || modulesLoading || achievementsLoading || rankingsLoading;

  // Memoized transformations to prevent unnecessary re-renders
  const stats = useMemo(() => {
    if (!userStatsRes?.data?.data?.stats) return {
      totalDepartments: 0, totalUsers: 0, activeLearners: 0, 
      totalPaths: 0, totalModules: 0, totalEnrollments: 0, 
      totalCertifications: 0, avgProgress: 0
    };

    const s = userStatsRes.data.data.stats;
    return {
      totalDepartments: deptsRes?.data?.data?.departments?.length || 0,
      totalUsers: s.totalUsers || 0,
      activeLearners: s.activeLearners || 0,
      totalPaths: pathsRes?.data?.data?.learningPaths?.length || 0,
      totalModules: modulesRes?.data?.data?.modules?.length || 0,
      totalEnrollments: s.totalEnrollments || 0,
      totalCertifications: achievementsRes?.data?.data?.length || 0,
      avgProgress: Math.round(s.avgProgress || 0)
    };
  }, [userStatsRes, deptsRes, pathsRes, modulesRes, achievementsRes]);

  const deptChartData = useMemo(() => {
    const rankings = rankingsRes?.data?.data || [];
    return rankings.map(dept => ({
      name: dept.name,
      completion: Math.round(dept.completionRate || 0)
    }));
  }, [rankingsRes]);

  const userInfo = {
    name: user ? `${user.firstName} ${user.lastName}` : 'Administrator',
    department: user?.department?.name || user?.department || 'Corporate',
    role: user?.role || 'ADMIN'
  };

  if (!user || (isLoading && stats.totalUsers === 0)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Initializing Neural Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isAdmin ? 'Admin' : 'Manager'} Intelligence Hub - Vizx Learning</title>
      </Helmet>
      
      <div className="min-h-screen bg-background text-foreground">
        <NavigationSidebar isCollapsed={sidebarCollapsed} />

        <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'} pb-24`}>
          <AdminHeader 
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            isLoading={isLoading}
            lastSyncTime={lastSyncTime}
            userInfo={userInfo}
            user={user}
            title="Command Center"
            icon="Activity"
          />

          <main className="p-8 max-w-[1700px] mx-auto space-y-10">
            <WelcomeSection userName={user.firstName} />

            <GlobalControlBar 
              activePreset={activePreset}
              setActivePreset={setActivePreset}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />

            <KPICardsGrid stats={stats} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Left Column - Analytics */}
              <div className="xl:col-span-8 space-y-8">
                <DepartmentPerformanceChart data={deptChartData} />
                
                <QuickActions />

                <div className="grid grid-cols-1 gap-8">
                   <div className="bg-[#000000] rounded-3xl border border-border p-6 shadow-sm overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                         <div>
                            <h3 className="font-bold text-lg text-foreground uppercase tracking-tight">Recent Courses</h3>
                            <p className="text-sm text-muted-foreground">Latest curriculums published</p>
                         </div>
                         <button className="text-primary text-[10px] font-black uppercase tracking-widest">Library View</button>
                      </div>
                      <LearningPathProgress />
                   </div>
                </div>
              </div>

              {/* Right Column - Interactions & Feeds */}
              <div className="xl:col-span-4 space-y-8">
                <div className="bg-[#000000] rounded-[2.5rem] border border-border/50 p-6 shadow-sm">
                   <div className="flex items-center justify-between mb-8 px-2 pt-2">
                      <h3 className="text-lg font-black uppercase tracking-[0.2em] flex items-center gap-3">
                         <Icon name="Trophy" size={24} className="text-warning stroke-[2.5]" />
                         Rankings
                      </h3>
                      <button className="text-xs font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Full Rank List</button>
                   </div>
                   <LeaderboardWidget />
                </div>

                <div className="bg-[#000000] rounded-[2.5rem] border border-border/50 p-8 shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                        <Icon name="Bell" size={22} className="text-primary stroke-[2.5]" />
                        System Notifications
                      </h3>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase">Live</span>
                   </div>
                   
                   <div className="space-y-6">
                      <PeerActivityFeed limit={3} />
                      
                      <div className="pt-4 border-t border-border/50">
                        <button 
                          onClick={() => navigate('/notification-management-center')}
                          className="w-full text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2 group"
                        >
                          View All Notifications
                          <Icon name="ArrowRight" size={14} className="transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                   </div>
                </div>

              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
