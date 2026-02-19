
import axiosClient from '../../../utils/axiosClient';

const leaderboardService = {
  getLeaderboard: async (limit = 20, departmentId = null) => {
    const params = { limit };
    if (departmentId) params.departmentId = departmentId;
    const response = await axiosClient.get('/leaderboard', { params });
    return response.data;
  }
};

export default leaderboardService;
