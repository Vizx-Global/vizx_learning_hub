
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Layers, 
  Calendar, 
  ArrowRight, 
  Play, 
  Trophy,
  Users,
  Activity,
  Filter,
  Crown,
  Medal,
  Star
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import moduleProgressService from '../../../api/moduleProgressService';
import leaderboardService from '../../../pages/Employees/services/leaderboardService';
import { useFilter } from '../../../contexts/FilterContext';
import { DateRangePicker } from '../../../components/ui/date-range-picker';
import { isWithinInterval, parseISO } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const StatCard = ({ title, value, icon: Icon, color, bgGradient, subText }) => (
  <motion.div 
    variants={itemVariants}
    className={`relative overflow-hidden rounded-3xl p-6 border border-border bg-card ${bgGradient} group h-full shadow-lg hover:shadow-xl transition-all duration-300`}
  >
    {/* Ambient Glow Effect */}
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 ${color}`}></div>
    
    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-500 ${color.replace('bg-', 'text-')}`}>
      <Icon size={80} />
    </div>
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color} bg-opacity-20 backdrop-blur-md shadow-lg border border-white/10`}>
          <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
        <h3 className="text-muted-foreground dark:text-white/60 font-medium text-sm uppercase tracking-wider mb-1 opacity-80">{title}</h3>
        <div className="text-3xl font-black text-foreground dark:text-white tracking-tight">{value}</div>
      </div>
      {subText && (
        <p className="text-xs text-muted-foreground dark:text-white/40 mt-4 font-medium flex items-center gap-1">
          <Activity size={12} className="opacity-50" /> {subText}
        </p>
      )}
    </div>
  </motion.div>
);

const FilterButton = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
      active 
        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
    }`}
  >
    {label}
  </button>
);

const RankBadge = ({ rank }) => {
  if (rank === 1) return <Crown className="w-8 h-8 text-yellow-500 drop-shadow-glow" />;
  if (rank === 2) return <Medal className="w-8 h-8 text-slate-400 drop-shadow-glow" />;
  if (rank === 3) return <Medal className="w-8 h-8 text-amber-700 drop-shadow-glow" />;
  return <span className="text-xl font-bold text-muted-foreground">#{rank}</span>;
};

const LeaderboardRow = ({ user, rank, isCurrentUser }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`flex items-center p-4 rounded-xl mb-3 backdrop-blur-md border ${
        isCurrentUser 
          ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(229,116,55,0.1)]' 
          : 'bg-card border-border hover:bg-muted/50'
      } transition-all duration-300`}
    >
      <div className="w-16 flex justify-center">
        <RankBadge rank={rank} />
      </div>
      
      <div className="flex items-center flex-1 gap-4">
        <div className="relative">
          <img 
            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
            alt={user.name}
            className="w-12 h-12 rounded-full border-2 border-border"
          />
          {rank === 1 && <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1"><Star size={10} className="text-black" /></div>}
        </div>
        <div>
          <h3 className={`font-bold text-lg ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
            {user.name} {isCurrentUser && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full ml-2">You</span>}
          </h3>
          <p className="text-xs text-muted-foreground">{user.department?.name || user.department} • {user.jobTitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-8 mr-0 sm:mr-4">
        <div className="flex flex-col items-end hidden lg:flex">
          <div className="flex items-center gap-2 text-primary">
            <Flame size={18} className={user.currentStreak > 0 ? "fill-primary animate-pulse" : ""} />
            <span className="font-bold">{user.currentStreak} Day Streak</span>
          </div>
          <span className="text-xs text-muted-foreground">Longest: {user.longestStreak}</span>
        </div>

        <div className="w-20 sm:w-24 text-right">
          <div className="font-black text-xl sm:text-2xl text-primary">
            {user.points.toLocaleString()}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Points</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const { dateRange, globalSearch, setDateRange, activePreset, setFilter } = useFilter();
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState(null); // Store raw data for filtering
  const [stats, setStats] = useState({
    totalEnrollments: 0,
    completedPaths: 0,
    totalModules: 0,
    completedModules: 0,
    overview: []
  });
  const [lastAccessed, setLastAccessed] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, leaderboardRes] = await Promise.all([
          moduleProgressService.getUserProgressOverview(),
          leaderboardService.getLeaderboard(5)
        ]);

        if (progressRes.data?.success) {
          const data = progressRes.data.data;
          setRawData(data); // Save raw data
          
          // Initial Calculation
          processStats(data, activePreset, dateRange);

          // Find Resume Candidate (Always based on latest activity regardless of filter usually, but let's keep it consistent)
          const overview = data.overview || [];
          const sorted = [...overview].sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt));
          const mostActive = sorted.find(p => p.status !== 'COMPLETED');
          
          if (mostActive) {
            try {
              const summaryRes = await moduleProgressService.getProgressSummary(mostActive.enrollmentId);
                if (summaryRes.data?.success) {
                  const modules = summaryRes.data.data.modules || [];
                  
                  // Find next actionable module (not completed)
                  const nextModule = modules.find(m => (m.progress?.status !== 'COMPLETED' && (m.progress?.progress || 0) < 100)) || modules[0];
                  
                  // User Request: Pathway progress should be the number of completed paths over the total paths enrolled * 100
                  const totalEnrolledPaths = overview.length;
                  const totalCompletedPaths = overview.filter(p => p.status === 'COMPLETED').length;
                  const globalPathProgress = totalEnrolledPaths > 0 ? (totalCompletedPaths / totalEnrolledPaths) * 100 : 0;

                  // Restore module stats for object completeness
                  const totalMods = modules.length;
                  const completedMods = modules.filter(m => m.progress?.status === 'COMPLETED').length;

                  setLastAccessed({
                    path: mostActive.learningPath,
                    module: nextModule,
                    enrollmentId: mostActive.enrollmentId,
                    progress: globalPathProgress, // Use global path completion rate
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
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle Filter Change
  useEffect(() => {
    if (rawData) {
      processStats(rawData, activePreset, dateRange);
    }
  }, [activePreset, dateRange, rawData]);

  const processStats = (data, activeFilter, range) => {
    const overview = data.overview || [];
    let filteredOverview = overview;

    // Helper to check if a date is within range
    const isWithin = (dateStr) => {
      if (!dateStr) return false;
      if (activeFilter === 'All Time') return true;
      if (!range || !range.from) return true;
      
      const date = parseISO(dateStr);
      const start = range.from;
      const end = range.to || new Date(); // Default to now if only 'from' is picked
      
      return date >= start && date <= end;
    };

    // Filter Logic
    // Note: totalEnrollments and totalModules are usually "current state" stats, 
    // but we can filter "Active/Modified" items within the timeframe.
    // However, "Total Points" is usually cumulative. 
    // For specific timeframe stats, we'd ideally need a transaction log.
    // Here we will approximate by filtering Enrollments that had activity in the timeframe.
    
    if (activeFilter !== 'All Time') {
       filteredOverview = overview.filter(item => isWithin(item.lastActivityAt));
    }

    const completedPaths = filteredOverview.filter(p => p.status === 'COMPLETED').length;
    const totalModules = filteredOverview.reduce((acc, curr) => acc + (curr.totalModules || 0), 0);
    const completedModules = filteredOverview.reduce((acc, curr) => acc + (curr.completedModules || 0), 0);
    
    // For points, we don't have time-series in this endpoint, so we'll show All Time points 
    // but maybe dim it or indicate it's global if filter is active. 
    // Or we just show global points always (common in dashboards). 
    // Let's keep points global, but stats reflect activity.
    
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
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-10 space-y-8 md:space-y-10 pb-24 font-sans">
      
      {/* 1. Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[2rem] border border-primary  p-6 sm:p-8 md:p-12 shadow-2xl text-white"
      >
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-black/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3 flex-wrap text-white">
              Hello, {user.firstName}
              <motion.span 
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ delay: 1, duration: 1.5, repeat: Infinity, repeatDelay: 5 }}
                className="inline-block origin-bottom-right"
              >👋</motion.span>
            </h1>
            <p className="text-white/80 text-lg font-medium max-w-2xl leading-relaxed opacity-90">
              Here's your personal learning progress for <span className="text-white font-bold underline decoration-white/30 decoration-2 underline-offset-4">{activePreset === 'All Time' ? 'all time' : activePreset.toLowerCase()}</span>.
            </p>
          </div>
          
          <div className="glass-panel px-6 py-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">Current Level</p>
              <p className="text-xl font-black text-white">Level {user.currentLevel || 1}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white text-primary flex items-center justify-center font-black border-4 border-white/20">
              {user.currentLevel || 1}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Global Filter */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-card/50 p-2 rounded-2xl border border-border/50 backdrop-blur-sm shadow-md">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2 px-4">
          <Activity className="text-primary" size={20} /> 
          <span className="hidden sm:inline">Performance Overview</span>
          <span className="sm:hidden">Overview</span>
        </h2>
        <div className="flex gap-1 overflow-x-auto w-full sm:w-auto p-1 no-scrollbar items-center">
          {['Today', 'Last Week', 'Month', 'All Time'].map(f => (
            <FilterButton 
              key={f} 
              label={f} 
              active={activePreset === f} 
              onClick={() => setFilter(f)} 
            />
          ))}
          <div className="h-6 w-px bg-border mx-2 hidden sm:block" />
          <DateRangePicker 
            date={dateRange} 
            setDate={setDateRange}
          />
        </div>
      </div>

      {/* 3. Stat Cards Grid (2 Rows of 3) */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Row 1 */}
        <StatCard 
          title="Total Points" 
          value={user.totalPoints?.toLocaleString()} 
          icon={Award} 
          color="bg-amber-500"
          bgGradient="bg-gradient-to-br from-amber-500/10 via-card to-card dark:from-amber-600/20 dark:via-[#1e1b4b] dark:to-[#1e1b4b]"
          subText="Global Rank: Top 5%"
        />
        
        {/* Streak Card - Custom Design */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl p-6 border border-border bg-card group h-full shadow-lg hover:shadow-primary/10 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Flame size={100} className={user.currentStreak > 0 ? "text-primary animate-pulse" : "text-muted-foreground"} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/20 backdrop-blur-md text-primary shadow-lg shadow-primary/20">
                  <Flame size={24} className={user.currentStreak > 0 ? "fill-primary" : ""} />
               </div>
                <div>
                  <h3 className="text-muted-foreground font-medium text-sm uppercase tracking-wider">Current Streak</h3>
                  <div className="text-3xl font-black text-foreground">{user.currentStreak || 0} <span className="text-sm font-bold text-muted-foreground">Days</span></div>
                </div>
            </div>
            
             <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
               <div className="flex justify-between items-end gap-1 h-8">
                  {['M','T','W','T','F'].map((day, i) => {
                    // Simple viz: Fill based on simulated progress, real implementation would map actual history
                    const active = user.currentStreak > 0 && i < Math.min(user.currentStreak, 5);
                    return (
                      <div key={i} className="flex-1 flex flex-col justify-end gap-1 items-center group/day">
                        <div className={`w-full rounded-t-sm transition-all duration-500 ${active ? 'bg-primary h-full shadow-[0_0_8px_rgba(229,116,55,0.5)]' : 'bg-muted h-2 group-hover/day:bg-muted/80'}`}></div>
                        <span className="text-[8px] font-bold text-muted-foreground">{day}</span>
                      </div>
                    );
                  })}
               </div>
             </div>
          </div>
        </motion.div>

        <StatCard 
          title="Total Enrollments" 
          value={stats.totalEnrollments}
          icon={Activity} 
          color="bg-blue-500"
          bgGradient="bg-gradient-to-br from-blue-500/10 via-card to-card dark:from-blue-600/20 dark:via-[#0f172a] dark:to-[#0f172a]"
          subText="Active Learning Paths"
        />

        {/* Row 2 */}
        <StatCard 
          title="Completed Paths" 
          value={stats.completedPaths} 
          icon={Trophy} 
          color="bg-emerald-500"
          bgGradient="bg-gradient-to-br from-emerald-500/10 via-card to-card dark:from-emerald-600/20 dark:via-[#022c22] dark:to-[#022c22]"
          subText={`${activePreset} Completion`}
        />
        
        <StatCard 
          title="Total Modules" 
          value={stats.totalModules} 
          icon={Layers} 
          color="bg-violet-500"
          bgGradient="bg-gradient-to-br from-violet-500/10 via-card to-card dark:from-violet-600/20 dark:via-[#2e1065] dark:to-[#2e1065]"
          subText="Across all paths"
        />

        <StatCard 
          title="Modules Finished" 
          value={stats.completedModules} 
          icon={CheckCircle2} 
          color="bg-cyan-500"
          bgGradient="bg-gradient-to-br from-cyan-500/10 via-card to-card dark:from-cyan-600/20 dark:via-[#083344] dark:to-[#083344]"
          subText={`${Math.round((stats.completedModules / (stats.totalModules || 1)) * 100)}% Completion Rate`}
        />
      </motion.div>

      {/* 4. Resume Learning CTA */}
      {lastAccessed && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-[2.5rem] bg-card border border-border p-1 relative overflow-hidden group shadow-2xl"
        >
          <div className="absolute inset-0 bg-primary/10 dark:bg-black rounded-[2.5rem]"></div>
          <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-primary/20 via-primary/5 to-transparent opacity-50"></div>
          
          <div className="relative z-10 rounded-[2.3rem] p-6 sm:p-8 md:p-10 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 lg:gap-10 border border-border bg-card dark:bg-transparent">
            <div className="flex-1 space-y-5">
              <div className="flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-primary font-black uppercase tracking-widest text-xs">Pick up where you left off</span>
              </div>
              
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-2">{lastAccessed.path.title}</h2>
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <ArrowRight size={16} />
                  <span>Next: <span className="text-foreground font-bold">{lastAccessed.module.title}</span></span>
                </div>
              </div>
              
              <div className="max-w-xl space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                   <span>Pathway Progress</span>
                   <span>{Math.round(lastAccessed.progress)}%</span>
                </div>
                <div className="h-4 w-full bg-muted rounded-full overflow-hidden border border-border">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${lastAccessed.progress}%` }}
                     transition={{ duration: 1.5, ease: "circOut" }}
                     className="h-full bg-primary rounded-full relative overflow-hidden"
                   >
                      {/* Subtile texture */}
                      <div className="absolute inset-0 bg-white/10 opacity-30"></div>
                   </motion.div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/employee-courses', { state: { moduleId: lastAccessed.module.id, learningPathId: lastAccessed.path.id } })}
              className="flex items-center gap-4 pl-8 pr-6 py-4 sm:py-5 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 group shrink-0 w-full lg:w-auto justify-center lg:justify-start"
            >
               <span>Resume</span>
               <div className="w-10 h-10 rounded-xl bg-primary-foreground/10 text-primary-foreground flex items-center justify-center group-hover:bg-primary-foreground group-hover:text-primary transition-colors">
                 <Play size={18} className="fill-current ml-0.5" />
               </div>
            </button>
          </div>
        </motion.div>
      )}

      {/* 5. Bottom Grid: Leaderboard & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Leaderboard */}
        <div className="lg:col-span-2 bg-card rounded-3xl border border-border p-8 flex flex-col shadow-lg">
          <div className="flex justify-between items-center mb-8 border-b border-border/50 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Top Learners</h3>
                <p className="text-sm text-muted-foreground">This Week's Leaderboard</p>
              </div>
            </div>
            <Link to="/employee-leaderboards" className="px-4 py-2 rounded-xl bg-secondary/10 text-secondary text-xs font-black uppercase tracking-widest hover:bg-secondary/20 transition-colors">
               View Full Ranking
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {leaderboard.length > 0 ? leaderboard.map((u, i) => (
              <LeaderboardRow 
                key={u.id || i}
                user={u}
                rank={i + 1}
                isCurrentUser={user?.id === u.id}
              />
            )) : (
              <div className="text-center py-10 text-muted-foreground">No leaderboard data available yet.</div>
            )}
          </div>
        </div>

        {/* Recent Activity / Social */}
        <div className="flex flex-col gap-6">
            <div className="bg-primary rounded-3xl p-8 relative overflow-hidden flex-1 shadow-xl text-primary-foreground">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Users size={120} className="text-white transform translate-x-10 -translate-y-10" />
               </div>
               <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                       <Users size={28} />
                    </div>
                    <h3 className="text-2xl font-black mb-2 tracking-tight">Challenge Friends</h3>
                    <p className="text-white/80 font-medium leading-relaxed mb-8">
                      Learning is 50% faster when you compete. Invite your team and keep the streak alive together.
                    </p>
                  </div>
                  <button className="w-full py-4 bg-white text-primary rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white/90 hover:scale-[1.02] transition-all shadow-xl">
                     Invite Teammates
                  </button>
               </div>
            </div>

           <div className="bg-card rounded-3xl border border-border p-6 shadow-sm flex-1">
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-primary" /> Live Updates
                </div>
                {notifications?.length > 0 && <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>}
              </h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {notifications?.length > 0 ? (
                   notifications.slice(0, 5).map((notif) => (
                     <div key={notif.id} className="flex gap-3 items-start group">
                        <div className={`w-2 h-2 mt-2 rounded-full shrink-0 transition-colors ${notif.status === 'UNREAD' ? 'bg-primary' : 'bg-muted-foreground/30'}`}></div>
                        <div className="min-w-0">
                           <p className="text-sm text-foreground font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/employee-notifications')}>
                             {notif.message}
                           </p>
                           <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                             {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                           </span>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="text-center py-6">
                     <p className="text-xs text-muted-foreground">No recent updates</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}