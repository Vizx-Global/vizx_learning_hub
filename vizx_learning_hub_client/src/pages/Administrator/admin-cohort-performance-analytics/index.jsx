import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import NavigationSidebar from '../../../components/ui/NavigationSidebar';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import AnalyticsFilters from './components/AnalyticsFilters';
import KeyMetricsGrid from './components/KeyMetricsGrid';
import PerformanceTrendsChart from './components/PerformanceTrendsChart';
import CompletionDistributionChart from './components/CompletionDistributionChart';
import SkillsRadarChart from './components/SkillsRadarChart';
import CohortComparisonChart from './components/CohortComparisonChart';
import TopPerformersTable from './components/TopPerformersTable';
import AIInsightsPanel from './components/AIInsightsPanel';
import analyticsService from '../../../api/analyticsService';
import toast from 'react-hot-toast';

const CohortPerformanceAnalytics = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');
  const isManager = hasRole('MANAGER');
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState('all');
  const [timeRange, setTimeRange] = useState('monthly');
  const [selectedMetric, setSelectedMetric] = useState('completion');
  const [isLoading, setIsLoading] = useState(true);

  // Stats State
  const [performanceData, setPerformanceData] = useState([]);
  const [completionDistribution, setCompletionDistribution] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
  const [cohortComparison, setCohortComparison] = useState([]);
  const [keyMetrics, setKeyMetrics] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);

  const allCohorts = [
    { id: 'all', name: 'All Cohorts', members: 150, avgCompletion: 68, avgScore: 82, trend: 'up', department: 'Global' },
    { id: 'q1-2024', name: 'Q1 2024 Cohort', members: 45, avgCompletion: 75, avgScore: 85, trend: 'up', department: 'Engineering' },
    { id: 'q2-2024', name: 'Q2 2024 Cohort', members: 38, avgCompletion: 62, avgScore: 78, trend: 'stable', department: 'Sales' },
    { id: 'engineering', name: 'Engineering Team', members: 32, avgCompletion: 71, avgScore: 88, trend: 'up', department: 'Engineering' },
    { id: 'sales', name: 'Sales Department', members: 25, avgCompletion: 58, avgScore: 75, trend: 'down', department: 'Sales' }
  ];

  const visibleCohorts = useMemo(() => {
    if (isAdmin) return allCohorts;
    if (isManager && user?.department) {
      return allCohorts.filter(c => c.department === user.department || c.id === 'all');
    }
    return [];
  }, [isAdmin, isManager, user?.department]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const [trends, dist, skills, comparison, metrics, insights] = await Promise.all([
          analyticsService.getCohortTrends(selectedCohort, timeRange),
          analyticsService.getCompletionDistribution(selectedCohort),
          analyticsService.getSkillProficiency(selectedCohort),
          analyticsService.getCohortComparison(),
          analyticsService.getKeyMetrics(selectedCohort),
          analyticsService.getAIInsights(selectedCohort)
        ]);

        setPerformanceData(trends?.data || []);
        setCompletionDistribution(dist?.data || []);
        setSkillsData(skills?.data || []);
        setCohortComparison(comparison?.data || []);
        setKeyMetrics(metrics?.data || null);
        setAiInsights(insights?.data || []);
      } catch (error) {
        console.error('Failed to fetch cohort analytics:', error);
        // Fallback to mock data for demonstration if API fails
        setPerformanceData([
            { month: 'Jan', completion: 45, engagement: 72, assessment: 78 },
            { month: 'Feb', completion: 52, engagement: 75, assessment: 80 },
            { month: 'Mar', completion: 58, engagement: 78, assessment: 82 },
            { month: 'Apr', completion: 65, engagement: 81, assessment: 85 },
            { month: 'May', completion: 68, engagement: 83, assessment: 87 },
            { month: 'Jun', completion: 72, engagement: 86, assessment: 89 }
        ]);
        setCompletionDistribution([
            { range: '0-20%', count: 12, color: '#ef4444' },
            { range: '21-40%', count: 18, color: '#f59e0b' },
            { range: '41-60%', count: 35, color: '#eab308' },
            { range: '61-80%', count: 48, color: '#84cc16' },
            { range: '81-100%', count: 37, color: '#22c55e' }
        ]);
        setSkillsData([
            { skill: 'AI Fundamentals', score: 85 },
            { skill: 'Machine Learning', score: 78 },
            { skill: 'Data Science', score: 82 },
            { skill: 'Cloud Computing', score: 75 },
            { skill: 'Programming', score: 88 }
        ]);
        setAiInsights([
            { id: 1, type: 'growth', icon: 'TrendingUp', title: 'Growth Opportunity', description: `${user?.department || 'The team'} shows 23% higher engagement with hands-on labs.`, color: 'primary' },
            { id: 2, type: 'alert', icon: 'AlertCircle', title: 'At-Risk Alert', description: '5 learners have been inactive for 7+ days.', color: 'warning' }
        ]);
        setCohortComparison(visibleCohorts.slice(1).map(c => ({ 
            name: c.name, 
            completion: c.avgCompletion, 
            engagement: c.avgCompletion + 5, 
            assessment: c.avgScore 
        })));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedCohort, timeRange]);

  const topPerformers = [
    { id: 1, name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', cohort: 'Q1 2024', completion: 95, score: 94, streak: 28 },
    { id: 2, name: 'Mike Johnson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', cohort: 'Engineering', completion: 92, score: 91, streak: 21 },
    { id: 3, name: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', cohort: 'Leadership', completion: 90, score: 93, streak: 25 }
  ];

  const handleExport = () => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
        loading: 'Generating PDF report...',
        success: 'Report downloaded successfully',
        error: 'Failed to generate report'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationSidebar isCollapsed={sidebarCollapsed} />
      
      <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'} pb-16`}>
        {/* Premium Header */}
        <header className="bg-black border-b border-border/50 sticky top-0 z-30 px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-[1700px] mx-auto">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden md:flex items-center justify-center w-12 h-12 rounded-2xl bg-muted/30 hover:bg-muted transition-all border border-border/50"
              >
                <Icon name={sidebarCollapsed ? "ChevronRight" : "ChevronLeft"} size={20} className="text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                  Cohort Performance Hub
                  <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                    Neural Analytics
                  </span>
                </h1>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mt-1">
                  {isAdmin ? 'Global Curriculum Intelligence' : `${user?.department} Tactical Overview`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-muted/30 text-muted-foreground text-xs font-black uppercase tracking-widest border border-border/50 hover:bg-muted/50 transition-all"
              >
                <Icon name="Download" size={16} />
                Export Intelligence
              </button>
              {isAdmin && (
                <button 
                  onClick={() => navigate('/administrative-system-configuration')}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                >
                  <Icon name="Settings" size={16} />
                  System Core
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="p-8 max-w-[1700px] mx-auto space-y-10">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10"
          >
            {/* Filters Row */}
            <motion.div variants={itemVariants} className="bg-black p-2 rounded-[2.5rem] border border-border/50 shadow-2xl">
              <AnalyticsFilters 
                cohorts={visibleCohorts} 
                selectedCohort={selectedCohort} 
                onCohortChange={setSelectedCohort} 
                timeRange={timeRange} 
                onTimeRangeChange={setTimeRange} 
                selectedMetric={selectedMetric} 
                onMetricChange={setSelectedMetric} 
              />
            </motion.div>

            {/* Key Metrics Grid */}
            <motion.div variants={itemVariants}>
              <KeyMetricsGrid cohort={keyMetrics || visibleCohorts.find(c => c.id === selectedCohort) || visibleCohorts[0]} />
            </motion.div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <motion.div variants={itemVariants} className="xl:col-span-8">
                <PerformanceTrendsChart data={performanceData} selectedMetric={selectedMetric} onMetricChange={setSelectedMetric} />
              </motion.div>
              
              <motion.div variants={itemVariants} className="xl:col-span-4">
                <SkillsRadarChart data={skillsData} />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div variants={itemVariants}>
                <CompletionDistributionChart data={completionDistribution} />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <CohortComparisonChart data={cohortComparison} />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <motion.div variants={itemVariants} className="xl:col-span-8 bg-black rounded-[2.5rem] border border-border/50 p-8 shadow-sm overflow-hidden">
                <TopPerformersTable performers={topPerformers} onViewAll={() => navigate('/gamification-leaderboards')} />
              </motion.div>
              
              <motion.div variants={itemVariants} className="xl:col-span-4 space-y-8">
                <AIInsightsPanel insights={aiInsights} />
                
                <div className="bg-gradient-to-br from-[#F05123] to-[#F05123cc] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-primary/30 group cursor-pointer overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700" />
                   <div className="relative z-10">
                      <h3 className="text-2xl font-black uppercase tracking-tight mb-3">Custom Intelligence Matrix</h3>
                      <p className="text-xs opacity-90 mb-8 font-black uppercase tracking-widest leading-loose">Deep-dive vector analysis for stakeholder alignment.</p>
                      <button className="w-full bg-white text-primary font-black uppercase tracking-[0.2em] text-[10px] py-5 rounded-2xl shadow-xl group-hover:translate-y-[-4px] transition-all">
                        Initialize Matrix
                      </button>
                   </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default CohortPerformanceAnalytics;
