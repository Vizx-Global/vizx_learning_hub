
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import moduleProgressService from '../../../api/moduleProgressService';
import leaderboardService from '../../../pages/Employees/services/leaderboardService';
import userService from '../../../api/userService';
import { useFilter } from '../../../contexts/FilterContext';
import { parseISO } from 'date-fns';
import { useNotifications } from '../../../contexts/NotificationContext';

// Import Segmented Components
import WelcomeComponent from './components/WelcomeComponent';
import GlobalDateFilter from './components/GlobalDateFilter';
import KPICards from './components/KPICards';
import Leaderboards from './components/Leaderboards';
import PeerActivity from './components/PeerActivity';
import LiveUpdatesSection from './components/LiveUpdatesSection';
import ModuleProgressSection from './components/ModuleProgressSection';
import RecentAchievemnents from './components/RecentAchievemnents';
import UpcomingMilestones from './components/UpcomingMilestones';
import QuickActions from './components/QuickActions';

export default function Dashboard() {
  const { user } = useAuth();
  const { dateRange, setDateRange, activePreset, setFilter } = useFilter();
  const { notifications } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState(null); 
  const [stats, setStats] = useState({
    totalEnrollments: 0,
    completedPaths: 0,
    totalModules: 0,
    completedModules: 0,
    overview: []
  });
  const [lastAccessed, setLastAccessed] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [filteredAchievements, setFilteredAchievements] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, leaderboardRes, achievementsRes] = await Promise.all([
          moduleProgressService.getUserProgressOverview(),
          leaderboardService.getLeaderboard(5),
          userService.getUserAchievements(user.id)
        ]);

        if (progressRes.data?.success) {
          const data = progressRes.data.data;
          setRawData(data);
          processStats(data, activePreset, dateRange);

          const overview = data.overview || [];
          const sorted = [...overview].sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt));
          const mostActive = sorted.find(p => p.status !== 'COMPLETED') || sorted[0];
          
          if (mostActive) {
            try {
              const summaryRes = await moduleProgressService.getProgressSummary(mostActive.enrollmentId);
              if (summaryRes.data?.success) {
                const modules = summaryRes.data.data.modules || [];
                const nextModule = modules.find(m => (m.progress?.status !== 'COMPLETED' && (m.progress?.progress || 0) < 100)) || modules[0];
                const totalMods = modules.length;
                const completedMods = modules.filter(m => m.progress?.status === 'COMPLETED').length;

                setLastAccessed({
                  path: mostActive.learningPath || mostActive,
                  module: nextModule,
                  enrollmentId: mostActive.enrollmentId,
                  progress: (completedMods / (totalMods || 1)) * 100,
                  totalModules: totalMods,
                  completedModules: completedMods,
                  lastActivityAt: mostActive.lastActivityAt
                });
              }
            } catch (err) {
              console.error("Failed to fetch summary for resume", err);
            }
          }
        }

        if (leaderboardRes.success) {
          setLeaderboard(leaderboardRes.data);
        }

        if (achievementsRes.data?.success) {
          setAchievements(achievementsRes.data.data || []);
        } else if (Array.isArray(achievementsRes.data)) {
          setAchievements(achievementsRes.data);
        }

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchData();
  }, [user?.id]);

  useEffect(() => {
    if (rawData) {
      processStats(rawData, activePreset, dateRange);
    }
    filterAchievements(achievements, dateRange, activePreset);
  }, [activePreset, dateRange, rawData, achievements]);

  const isWithinRange = (dateStr, range, preset) => {
    if (!dateStr) return false;
    if (preset === 'All Time') return true;
    if (!range || !range.from) return true;
    const date = parseISO(dateStr);
    const start = range.from;
    const end = range.to || new Date();
    return date >= start && date <= end;
  };

  const filterAchievements = (allAchievements, range, preset) => {
    if (preset === 'All Time') {
      setFilteredAchievements(allAchievements);
      return;
    }
    const filtered = allAchievements.filter(ach => isWithinRange(ach.earnedAt, range, preset));
    setFilteredAchievements(filtered);
  };

  const processStats = (data, activeFilter, range) => {
    const overview = data.overview || [];
    let filteredOverview = overview;

    if (activeFilter !== 'All Time') {
       filteredOverview = overview.filter(item => isWithinRange(item.lastActivityAt, range, activeFilter));
    }

    const completedPaths = filteredOverview.filter(p => p.status === 'COMPLETED').length;
    const totalModules = filteredOverview.reduce((acc, curr) => acc + (curr.totalModules || 0), 0);
    const completedModules = filteredOverview.reduce((acc, curr) => acc + (curr.completedModules || 0), 0);
    
    setStats({
      totalEnrollments: filteredOverview.length,
      completedPaths,
      totalModules,
      completedModules,
      overview: filteredOverview
    });
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-10 space-y-8 md:space-y-10 pb-24 font-sans max-w-[1600px] mx-auto">
      
      {/* 1. Welcome Section */}
      <div className="w-full">
        <WelcomeComponent user={user} activePreset={activePreset} />
      </div>

      {/* 2. Global Filter */}
      <div className="w-full">
        <GlobalDateFilter 
          activePreset={activePreset} 
          setFilter={setFilter} 
          dateRange={dateRange} 
          setDateRange={setDateRange} 
        />
      </div>

      {/* 3. Stat Cards Grid */}
      <KPICards user={user} stats={stats} activePreset={activePreset} />

      {/* 4. Leaderboards & Socials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Leaderboards leaderboard={leaderboard} currentUser={user} />
        </div>
        <div className="flex flex-col gap-6">
            <PeerActivity dateRange={dateRange} activePreset={activePreset} />
            <LiveUpdatesSection 
              notifications={(notifications || []).filter(n => isWithinRange(n.createdAt, dateRange, activePreset))} 
            />
        </div>
      </div>

      {/* 5. Module Progress Section (Full Width) */}
      <div className="w-full">
        <ModuleProgressSection lastAccessed={lastAccessed} />
      </div>

      {/* 6. Achievements & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentAchievemnents achievements={filteredAchievements} loading={loading} />
        <UpcomingMilestones lastAccessed={lastAccessed} />
      </div>

      {/* 7. Quick Actions (Last, Full Width) */}
      <div className="w-full pb-10">
        <QuickActions lastAccessed={lastAccessed} />
      </div>
    </div>
  );
}
