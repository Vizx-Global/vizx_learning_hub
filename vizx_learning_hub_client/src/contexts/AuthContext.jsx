import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => { checkAuthStatus(); }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { setLoading(false); return; }
      const response = await axiosClient.get('/auth/profile');
      setUser(response.data.data.user);
      setIsAuthenticated(true);
    } catch {
      logout(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      const { user: userData, accessToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axiosClient.post('/auth/register', userData);
      const { user: newUser, accessToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      setIsAuthenticated(true);
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async (shouldRedirect = true) => {
    try {
      await axiosClient.post('/auth/logout');
    } catch { } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      if (shouldRedirect) window.location.href = '/login';
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axiosClient.put(`/users/${user.id}`, userData);
      const updatedUser = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Profile update failed' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axiosClient.put('/auth/change-password', { currentPassword, newPassword });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Password change failed' };
    }
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (user.role === 'MANAGER') return requiredRole === 'MANAGER' || requiredRole === 'EMPLOYEE';
    return user.role === requiredRole;
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const permissions = {
      ADMIN: ['view_dashboard', 'manage_users', 'manage_content', 'view_reports', 'manage_settings', 'view_all_progress', 'create_users'],
      MANAGER: ['view_dashboard', 'view_team_progress', 'manage_team', 'view_reports', 'assign_content', 'view_team_analytics'],
      EMPLOYEE: ['view_dashboard', 'view_own_progress', 'enroll_courses', 'take_quizzes', 'view_achievements', 'update_profile']
    };
    return permissions[user.role]?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, updateProfile, changePassword, hasRole, hasPermission, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;