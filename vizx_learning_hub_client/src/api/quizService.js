import axiosClient from '../utils/axiosClient';

const quizService = {
  getQuizByModuleId: (moduleId) => axiosClient.get(`/quizzes/module/${moduleId}`),
  submitQuizAttempt: (quizId, data) => axiosClient.post(`/quizzes/${quizId}/submit`, data),
  createQuiz: (data) => axiosClient.post('/quizzes', data)
};

export default quizService;
