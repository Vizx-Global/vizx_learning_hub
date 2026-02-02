import axiosClient from '../utils/axiosClient';

const achievementService = {
  getAllAchievements: () => axiosClient.get('/achievements'),
  getAchievementById: (id) => axiosClient.get(`/achievements/${id}`),
  createAchievement: (data) => axiosClient.post('/achievements', data),
  updateAchievement: (id, data) => axiosClient.put(`/achievements/${id}`, data),
  deleteAchievement: (id) => axiosClient.delete(`/achievements/${id}`)
};

export default achievementService;
