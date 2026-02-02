
import axiosClient from '../../../utils/axiosClient';

const leaderboardService = {
  getLeaderboard: async (limit = 20) => {
    const response = await axiosClient.get(`/leaderboard?limit=${limit}`);
    return response.data;
  }
};

export default leaderboardService;
