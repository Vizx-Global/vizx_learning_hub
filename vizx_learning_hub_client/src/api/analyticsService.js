import axiosClient from '../utils/axiosClient';

const analyticsService = {
  // For Performance Velocity: Fetch monthly completion history
  getCohortTrends: async (cohortId, timeframe = 'monthly') => {
    const response = await axiosClient.get(`/analytics/cohorts/${cohortId}/trends`, { params: { timeframe } });
    return response.data;
  },
    
  // For Completion Skew: Fetch frequency buckets
  getCompletionDistribution: async (cohortId) => {
    const response = await axiosClient.get(`/analytics/cohorts/${cohortId}/distribution`);
    return response.data;
  },
    
  // For Skill Proficiency Vector: Fetch aggregated scores by category
  getSkillProficiency: async (cohortId) => {
    const response = await axiosClient.get(`/analytics/cohorts/${cohortId}/skills-avg`);
    return response.data;
  },
    
  // For Diagnostic Insights: Fetch system anomalies and risks
  getAIInsights: async (cohortId) => {
    const response = await axiosClient.get(`/analytics/cohorts/${cohortId}/insights`);
    return response.data;
  },

  // For Benchmarking Hub: Compare cohorts
  getCohortComparison: async (params = {}) => {
    const response = await axiosClient.get('/analytics/cohorts/comparison', { params });
    return response.data;
  },

  // For Key Metrics: Overall stats
  getKeyMetrics: async (cohortId) => {
    const response = await axiosClient.get(`/analytics/cohorts/${cohortId}/metrics`);
    return response.data;
  }
};

export default analyticsService;
