import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import AdminDashboard from './pages/Administrator/admin-learning-dashboard/index';
import LearningPathManagement from './pages/Administrator/admin-learning-path-management';
import LearningContentSynchronization from './pages/Administrator/admin-learning-content-synchronization';
import UserProfileManagement from './pages/Administrator/admin-user-profile-management';
import InteractiveLearningGamesHub from './pages/Administrator/admin-interactive-learning-games-hub';
import GamificationLeaderboards from './pages/Administrator/admin-gamification-leaderboards';
import PerformanceAnalytics from './pages/Administrator/admin-cohort-performance-analytics';
import AdminSystemConfiguration from './pages/Administrator/administrative-system-configuration/index';
import NotificationManagementCenter from "./pages/Administrator/admin-notification-management-center";
import ContentCategoriesManagement from "./pages/Administrator/admin-content-categories-management";
import DepartmentManagement from "./pages/Administrator/admin-department-management";
import AdminChat from "./pages/Administrator/admin-chat/index";
import RegistrationForm from "./pages/Authentication/SignUp";

import LoginForm from "./pages/Authentication/SignIn";
import VerifyEmail from "./pages/Authentication/VerifyEmail";
import LandingPage from "./pages/landing-page/index";
import PublicLearningPathDetail from "./pages/landing-page/LearningPathDetail";
import EmployeeLayout from "./layouts/EmployeeLayout";
import EmployeeDashboard from "./pages/Employees/Dashboard/Dashboard";
import EmployeeCourses from "./pages/Employees/Courses/MyCourses";
import EmployeeLearningPaths from "./pages/Employees/learning-path/LearningPaths";
import EmployeeLearningPathDetail from "./pages/Employees/learning-path/components/LearningPathDetail";
import EmployeeLeaderboards from "./pages/Employees/Community/Leaderboard";
import EmployeeGames from "./pages/Employees/Games/Games";
import EmployeeProfile from "./pages/Employees/User-Profile/Profile";
import Notifications from "./pages/Employees/Notification/Notifications";
import EmployeeChat from "./pages/Employees/Chat/Chat";
import UserProfile from "./pages/UserProfile/Profile";
import { ThemeProvider } from "./components/ThemeProvider";

const Routes = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <ScrollToTop />
          <RouterRoutes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/learning-paths/:id" element={<PublicLearningPathDetail />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/login" element={<LoginForm />} />
            
            {/* Authenticated User Profile (Public Layout) */}
            <Route element={<ProtectedRoute><UserProfile /></ProtectedRoute>} path="/profile" />

            {/* Administrator & Managerial Routes */}
            <Route path="/admin-learning-dashboard" element={<ProtectedRoute requiredRole="MANAGER"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/cohort-performance-analytics" element={<ProtectedRoute requiredRole="MANAGER"><PerformanceAnalytics /></ProtectedRoute>} />
            
            {/* Admin-Only Routes */}
            <Route path="/learning-path-management" element={<ProtectedRoute requiredRole="ADMIN"><LearningPathManagement /></ProtectedRoute>} />
            <Route path="/content-categories-management" element={<ProtectedRoute requiredRole="ADMIN"><ContentCategoriesManagement /></ProtectedRoute>} />
            <Route path="/learning-content-synchronization" element={<ProtectedRoute requiredRole="ADMIN"><LearningContentSynchronization /></ProtectedRoute>} />
            <Route path="/administrative-system-configuration" element={<ProtectedRoute requiredRole="ADMIN"><AdminSystemConfiguration /></ProtectedRoute>} />
            <Route path="/notification-management-center" element={<ProtectedRoute requiredRole="ADMIN"><NotificationManagementCenter /></ProtectedRoute>} />
            
            {/* Shared Management Routes */}
            <Route path="/user-profile-management" element={<ProtectedRoute requiredRole="MANAGER"><UserProfileManagement /></ProtectedRoute>} />
            <Route path="/department-management" element={<ProtectedRoute requiredRole="MANAGER"><DepartmentManagement /></ProtectedRoute>} />
            <Route path="/interactive-learning-games-hub" element={<ProtectedRoute requiredRole="MANAGER"><InteractiveLearningGamesHub /></ProtectedRoute>} />
            <Route path="/gamification-leaderboards" element={<ProtectedRoute requiredRole="MANAGER"><GamificationLeaderboards /></ProtectedRoute>} />
            
            <Route path="/admin-chat" element={<ProtectedRoute requiredRole="MANAGER"><AdminChat /></ProtectedRoute>} />
            <Route element={
              <ProtectedRoute requiredRole="EMPLOYEE">
                <EmployeeLayout />
              </ProtectedRoute>
            }>
              <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
              <Route path="/employee-courses" element={<EmployeeCourses />} />
              <Route path="/employee-learning-paths" element={<EmployeeLearningPaths />} />
              <Route path="/employee-learning-paths/:id" element={<EmployeeLearningPathDetail />} />
              <Route path="/employee-leaderboards" element={<EmployeeLeaderboards />} />
              <Route path="/employee-games" element={<EmployeeGames />} />
              <Route path="/employee-notifications" element={<Notifications />} />
              <Route path="/employee-profile" element={<EmployeeProfile />} />
            </Route>
            <Route path="/employee-chat" element={<ProtectedRoute requiredRole="EMPLOYEE"><EmployeeChat /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default Routes;