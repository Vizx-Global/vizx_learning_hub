import axiosClient from '../utils/axiosClient';

const leaderboardService = {
  getLeaderboard: async (limit = 20, period = 'weekly', department = null) => {
    const params = { limit, period };
    if (department && department !== 'all') {
      params.department = department;
    }
    const response = await axiosClient.get('/leaderboard', { params });
    return response.data;
  },
  
  getRecentAchievements: async (limit = 10) => {
    const response = await axiosClient.get('/achievements/recent', { params: { limit } });
    return response.data;
  }
};

export default leaderboardService;
