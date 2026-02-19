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
    if (typeof value === 'string' && (value.includes('localhost') || value.includes('127.0.0.1'))) {
      // Robust replacement of localhost:PORT with API_BASE_URL (calculated from VITE_API_BASE_URL)
      // If the URL contains /uploads/, we want to make sure it points to the root production domain + /uploads
      const productionDomain = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
      normalized[key] = value.replace(/http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, productionDomain);
    } else if (typeof value === 'object' && value !== null) {
      normalized[key] = normalizeData(value);
    } else {
      normalized[key] = value;
    }
  }
  return normalized;
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
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
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}${API_VERSION}/auth/refresh-token`,
          {},
          { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
        );
        
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Clear all session data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Clear cookies
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;