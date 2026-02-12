import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_VERSION = '/api/v1';

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const normalizeData = (data) => {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(normalizeData);
  }

  const normalized = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && (value.includes('localhost:3000') || value.includes('127.0.0.1:3000'))) {
      normalized[key] = value.replace(/http:\/\/(localhost|127\.0\.0\.1):3000/, API_BASE_URL);
    } else if (typeof value === 'object' && value !== null) {
      normalized[key] = normalizeData(value);
    } else {
      normalized[key] = value;
    }
  }
  return normalized;
};

axiosClient.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = normalizeData(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(
          `${API_BASE_URL}${API_VERSION}/auth/refresh-token`,
          {},
          { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
        );
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;