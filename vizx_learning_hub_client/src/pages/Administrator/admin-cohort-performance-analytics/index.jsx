import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationSidebar from '../../../components/ui/NavigationSidebar';
import Button from '../../../components/ui/Button';
import AnalyticsFilters from './components/AnalyticsFilters';
import KeyMetricsGrid from './components/KeyMetricsGrid';
import PerformanceTrendsChart from './components/PerformanceTrendsChart';
import CompletionDistributionChart from './components/CompletionDistributionChart';
import SkillsRadarChart from './components/SkillsRadarChart';
import CohortComparisonChart from './components/CohortComparisonChart';
import TopPerformersTable from './components/TopPerformersTable';
import AIInsightsPanel from './components/AIInsightsPanel';

const CohortPerformanceAnalytics = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState('all');
  const [timeRange, setTimeRange] = useState('monthly');
  const [selectedMetric, setSelectedMetric] = useState('completion');

  const cohorts = [
    { id: 'all', name: 'All Cohorts', members: 150, avgCompletion: 68, avgScore: 82, trend: 'up' },
    { id: 'q1-2024', name: 'Q1 2024 Cohort', members: 45, avgCompletion: 75, avgScore: 85, trend: 'up' },
    { id: 'q2-2024', name: 'Q2 2024 Cohort', members: 38, avgCompletion: 62, avgScore: 78, trend: 'stable' },
    { id: 'engineering', name: 'Engineering Team', members: 32, avgCompletion: 71, avgScore: 88, trend: 'up' },
    { id: 'sales', name: 'Sales Department', members: 25, avgCompletion: 58, avgScore: 75, trend: 'down' },
    { id: 'leadership', name: 'Leadership Program', members: 10, avgCompletion: 90, avgScore: 92, trend: 'up' }
  ];

  const performanceData = [
    { month: 'Jan', completion: 45, engagement: 72, assessment: 78 },
    { month: 'Feb', completion: 52, engagement: 75, assessment: 80 },
    { month: 'Mar', completion: 58, engagement: 78, assessment: 82 },
    { month: 'Apr', completion: 65, engagement: 81, assessment: 85 },
    { month: 'May', completion: 68, engagement: 83, assessment: 87 },
    { month: 'Jun', completion: 72, engagement: 86, assessment: 89 }
  ];
  const completionDistribution = [
    { range: '0-20%', count: 12, color: '#ef4444' },
    { range: '21-40%', count: 18, color: '#f59e0b' },
    { range: '41-60%', count: 35, color: '#eab308' },
    { range: '61-80%', count: 48, color: '#84cc16' },
    { range: '81-100%', count: 37, color: '#22c55e' }
  ];

  const skillsData = [
    { skill: 'AI Fundamentals', score: 85 },
    { skill: 'Machine Learning', score: 78 },
    { skill: 'Data Science', score: 82 },
    { skill: 'Cloud Computing', score: 75 },
    { skill: 'Programming', score: 88 }
  ];

  const topPerformers = [
    { id: 1, name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', cohort: 'Q1 2024', completion: 95, score: 94, streak: 28 },
    { id: 2, name: 'Mike Johnson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', cohort: 'Engineering', completion: 92, score: 91, streak: 21 },
    { id: 3, name: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', cohort: 'Leadership', completion: 90, score: 93, streak: 25 },
    { id: 4, name: 'David Rodriguez', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', cohort: 'Q2 2024', completion: 88, score: 89, streak: 19 },
    { id: 5, name: 'Lisa Park', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', cohort: 'Sales', completion: 85, score: 87, streak: 15 }
  ];

  const aiInsights = [
    { id: 1, type: 'growth', icon: 'TrendingUp', title: 'Growth Opportunity', description: 'Engineering cohort shows 23% higher engagement with hands-on labs. Consider increasing practical exercises for Sales cohort to boost completion rates.', color: 'success' },
    { id: 2, type: 'alert', icon: 'AlertCircle', title: 'At-Risk Alert', description: '12 learners in Q2 2024 cohort have been inactive for 7+ days. Automated reminder emails have been sent to re-engage these users.', color: 'warning' },
    { id: 3, type: 'optimization', icon: 'Target', title: 'Optimization Tip', description: 'Learners who complete modules in the morning have 18% higher retention. Consider scheduling push notifications for 9-11 AM.', color: 'primary' },
    { id: 4, type: 'success', icon: 'Award', title: 'Success Pattern', description: 'Leadership cohort maintains 90%+ completion through peer learning sessions. Recommend implementing similar group activities for other cohorts.', color: 'success' }
  ];

  const currentCohort = cohorts.find(c => c.id === selectedCohort) || cohorts[0];
  const cohortComparison = cohorts.slice(1).map(cohort => ({ name: cohort.name, completion: cohort.avgCompletion, engagement: cohort.avgCompletion + Math.random() * 10, assessment: cohort.avgScore }));
  const handleExport = () => console.log('Exporting analytics report...');

  return (
    <div className="min-h-screen bg-background">
      <NavigationSidebar isCollapsed={sidebarCollapsed} userRole="admin" />
      <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-72'} pb-16 md:pb-0`}>
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" iconName="Menu" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden md:flex" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Cohort Performance Analytics</h1>
                <p className="text-sm text-muted-foreground">Track and analyze learning cohort progress and engagement</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" iconName="Download" iconPosition="left" onClick={handleExport}>Export Report</Button>
              <Button variant="default" size="sm" iconName="Settings" iconPosition="left" onClick={() => navigate('/administrative-system-configuration')}>Settings</Button>
            </div>
          </div>
        </header>
        <main className="p-4 space-y-6">
          <AnalyticsFilters cohorts={cohorts} selectedCohort={selectedCohort} onCohortChange={setSelectedCohort} timeRange={timeRange} onTimeRangeChange={setTimeRange} selectedMetric={selectedMetric} onMetricChange={setSelectedMetric} />
          <KeyMetricsGrid cohort={currentCohort} />
          <PerformanceTrendsChart data={performanceData} selectedMetric={selectedMetric} onMetricChange={setSelectedMetric} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <CompletionDistributionChart data={completionDistribution} />
            <SkillsRadarChart data={skillsData} />
          </div>
          <CohortComparisonChart data={cohortComparison} />
          <TopPerformersTable performers={topPerformers} onViewAll={() => navigate('/gamification-leaderboards')} />
          <AIInsightsPanel insights={aiInsights} />
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" fullWidth iconName="Users" iconPosition="left" onClick={() => navigate('/learning-path-management')}>Manage Learning Paths</Button>
              <Button variant="outline" fullWidth iconName="BarChart3" iconPosition="left" onClick={() => navigate('/learning-analytics-export-center')}>Advanced Analytics</Button>
              <Button variant="outline" fullWidth iconName="Bell" iconPosition="left" onClick={() => navigate('/notification-management-center')}>Send Notifications</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CohortPerformanceAnalytics;