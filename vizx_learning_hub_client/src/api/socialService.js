
import axiosClient from '../utils/axiosClient';

const socialService = {
  getPeersStatus: () => axiosClient.get('/social/peers'),
  nudgePeer: (receiverId) => axiosClient.post('/social/nudge', { receiverId }),
  getPeerActivity: (limit = 10) => axiosClient.get(`/social/activity`, { params: { limit } })
};

export default socialService;
