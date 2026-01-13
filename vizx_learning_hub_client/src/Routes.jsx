import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import EmployeeLearningDashboard from './pages/employee-learning-dashboard/index';
import LearningPathManagement from './pages/learning-path-management/index';
import LearningContentSynchronization from './pages/learning-content-synchronization/index';
import UserProfileManagement from './pages/user-profile-management/index';
import InteractiveLearningGamesHub from './pages/interactive-learning-games-hub/index';
import GamificationLeaderboards from './pages/gamification-leaderboards/index';
import PerformanceAnalytics from './pages/cohort-performance-analytics/index';
import AdminSystemConfiguration from './pages/administrative-system-configuration/index';
import NotificationManagementCenter from "./pages/notification-management-center";
import RegistrationForm from "./pages/Authentication/SignUp";
import LoginForm from "./pages/Authentication/SignIn";
import LandingPage from "./pages/landing-page/index";

// Import your ThemeProvider
import { ThemeProvider } from "./components/ThemeProvider";

const Routes = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <ScrollToTop />
          <RouterRoutes>
            {/* Define your route here */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/employee-learning-dashboard" element={<EmployeeLearningDashboard />} />
            <Route path="/learning-path-management" element={<LearningPathManagement />} />
            <Route path="/learning-content-synchronization" element={<LearningContentSynchronization />} />
            <Route path="/user-profile-management" element={<UserProfileManagement />} />
            <Route path="/interactive-learning-games-hub" element={<InteractiveLearningGamesHub />} />
            <Route path="/gamification-leaderboards" element={<GamificationLeaderboards />} />
            <Route path="/cohort-performance-analytics" element={<PerformanceAnalytics />} />
            <Route path="/administrative-system-configuration" element={<AdminSystemConfiguration />} />
            <Route path="/notification-management-center" element={<NotificationManagementCenter />} />
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default Routes;