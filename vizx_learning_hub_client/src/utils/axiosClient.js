import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_VERSION = '/api/v1';

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the access token using the httpOnly cookie
        const response = await axios.post(
          `${API_BASE_URL}${API_VERSION}/auth/refresh-token`,
          {},
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const { accessToken } = response.data.data;
        
        // Update the access token in localStorage
        localStorage.setItem('accessToken', accessToken);
        
        // Update the authorization header for the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Retry the original request with the new token
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh token is invalid or expired
        console.error('Token refresh failed:', refreshError);
        
        // Clear all auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        
        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;