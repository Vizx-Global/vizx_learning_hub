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
import RegistrationForm from "./pages/Authentication/SignUp";
import LoginForm from "./pages/Authentication/SignIn";
import LandingPage from "./pages/landing-page/index";
import EmployeeLayout from "./layouts/EmployeeLayout";
import EmployeeDashboard from "./pages/employee-learning-dashboard/Dashboard/index";

import { ThemeProvider } from "./components/ThemeProvider";

const Routes = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <ScrollToTop />
          <RouterRoutes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/*Authentication Pages */}
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/login" element={<LoginForm />} />

            {/* Admin Dashboard Routes */}
            <Route path="/admin-learning-dashboard" element={<AdminDashboard />} />
            <Route path="/learning-path-management" element={<LearningPathManagement />} />
            <Route path="/learning-content-synchronization" element={<LearningContentSynchronization />} />
            <Route path="/user-profile-management" element={<UserProfileManagement />} />
            <Route path="/interactive-learning-games-hub" element={<InteractiveLearningGamesHub />} />
            <Route path="/gamification-leaderboards" element={<GamificationLeaderboards />} />
            <Route path="/cohort-performance-analytics" element={<PerformanceAnalytics />} />
            <Route path="/administrative-system-configuration" element={<AdminSystemConfiguration />} />
            <Route path="/notification-management-center" element={<NotificationManagementCenter />} />


            {/* Employee Routes */}
            <Route path="/employee-dashboard" element={
              <ProtectedRoute requiredRole="EMPLOYEE">
                <EmployeeLayout />
              </ProtectedRoute>
            }>
              <Route index element={<EmployeeDashboard />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default Routes;