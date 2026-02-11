import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationSidebar from '../../../components/ui/NavigationSidebar';
import UserContextHeader from '../../../components/ui/UserContextHeader';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import axiosClient from '../../../utils/axiosClient';

// Import all components
import UserProfileCard from './components/UserProfileCard';
import LearningHistoryPanel from './components/LearningHistoryPanel';
import AchievementsPanel from './components/AchievementsPanel';
import PreferencesPanel from './components/PreferencesPanel';
import AdminSettingsPanel from './components/AdminSettingsPanel';
import UserSearchAndFilter from './components/UserSearchAndFilter';
import UserListTable from './components/UserListTable';
import CreateUserModal from './components/CreateUserModal';
import { userService } from '../../../api';


const UserProfileManagement = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Show success message and auto-hide
  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  // Show error message and auto-hide
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 8000);
  };

  const [learningHistory, setLearningHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Clear messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const [totalModules, setTotalModules] = useState(0);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      clearMessages();
      
      const [usersRes, modulesRes] = await Promise.all([
        axiosClient.get('/users/all'),
        axiosClient.get('/modules')
      ]);
      
      let actualTotalModules = 0;
      if (modulesRes.data?.data?.total !== undefined) {
        actualTotalModules = modulesRes.data.data.total;
      } else if (Array.isArray(modulesRes.data?.data?.modules)) {
        actualTotalModules = modulesRes.data.data.modules.length;
      } else if (Array.isArray(modulesRes.data?.data)) {
        actualTotalModules = modulesRes.data.data.length;
      }
      
      setTotalModules(actualTotalModules);

      const response = usersRes;
      console.log('API Response:', response.data); 
      
      let usersData = [];
      
      if (response.data && response.data.data) {
        if (Array.isArray(response.data.data)) {
          usersData = response.data.data;
        } 
        else if (response.data.data.users && Array.isArray(response.data.data.users)) {
          usersData = response.data.data.users;
        }
        else if (typeof response.data.data === 'object') {
          usersData = Object.values(response.data.data);
        }
      } 
      else if (Array.isArray(response.data)) {
        usersData = response.data;
      }
      
      console.log('Processed users data:', usersData);
      
      if (usersData.length > 0) {
        const formattedUsers = usersData.map(user => ({
          id: user._id || user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          employeeId: user.employeeId || `EMP${String(usersData.indexOf(user) + 1).padStart(3, '0')}`,
          phone: user.phone || '',
          department: (typeof user.department === 'object' ? user.department?.name : user.department) || 'Not assigned',
          role: user.role || 'EMPLOYEE',
          jobTitle: user.jobTitle || 'Employee',
          status: user.status || 'ACTIVE',
          level: getLevelFromPoints(user.totalPoints || 0),
          joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) : 'Unknown',
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.firstName || 'User'}+${user.lastName || 'Name'}&size=150&background=random`,
          lastActive: user.lastActive || new Date().toISOString().split('T')[0],
          overallProgress: calculateOverallProgress(user, actualTotalModules),
          totalModules: actualTotalModules,
          stats: {
            completedModules: user._count?.moduleProgress || user.completedModules || 0,
            totalPoints: user.totalPoints || 0,
            currentStreak: user.currentStreak || 0,
            achievements: user.achievementsCount || 0
          }
        }));
        
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
        if (formattedUsers.length > 0 && !selectedUser) {
          setSelectedUser(formattedUsers[0]);
        }
      } else {
        console.log('No users from API, using mock data');
        const mockUsers = getMockUsers();
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
        if (mockUsers.length > 0 && !selectedUser) {
          setSelectedUser(mockUsers[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load users. Please try again.';
      showError(errorMessage);
      
      // Fallback to mock data
      const mockUsers = getMockUsers();
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      if (mockUsers.length > 0 && !selectedUser) {
        setSelectedUser(mockUsers[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getLevelFromPoints = (points) => {
    if (points >= 1500) return 'Expert';
    if (points >= 1000) return 'Advanced';
    if (points >= 500) return 'Intermediate';
    return 'Beginner';
  };

  const calculateOverallProgress = (user, total) => {
    const completed = user._count?.moduleProgress || user.completedModules || 0;
    if (!total || total <= 0) return 0;
    const baseProgress = Math.min(100, (completed / total) * 100);
    return Math.round(baseProgress);
  };

  const getMockUsers = () => {
    return [
      {
        id: 1,
        name: "Sarah Johnson",
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@company.com",
        employeeId: "EMP001",
        phone: "+1 (555) 123-4567",
        department: "Engineering",
        role: "EMPLOYEE",
        jobTitle: "Senior Developer",
        status: "ACTIVE",
        level: "Advanced",
        joinDate: "March 15, 2023",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        lastActive: "2025-10-06",
        overallProgress: 87,
        stats: {
          completedModules: 24,
          totalPoints: 3450,
          currentStreak: 12,
          achievements: 18
        }
      },
      {
        id: 2,
        name: "Michael Rodriguez",
        firstName: "Michael",
        lastName: "Rodriguez",
        email: "michael.rodriguez@company.com",
        employeeId: "EMP002",
        phone: "+1 (555) 234-5678",
        department: "Marketing",
        role: "MANAGER",
        jobTitle: "Marketing Manager",
        status: "ACTIVE",
        level: "Intermediate",
        joinDate: "January 8, 2024",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        lastActive: "2025-10-05",
        overallProgress: 64,
        stats: {
          completedModules: 16,
          totalPoints: 2280,
          currentStreak: 5,
          achievements: 12
        }
      },
      {
        id: 3,
        name: "Emily Chen",
        firstName: "Emily",
        lastName: "Chen",
        email: "emily.chen@company.com",
        employeeId: "EMP003",
        phone: "+1 (555) 345-6789",
        department: "Sales",
        role: "EMPLOYEE",
        jobTitle: "Sales Representative",
        status: "ACTIVE",
        level: "Beginner",
        joinDate: "September 22, 2024",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        lastActive: "2025-10-04",
        overallProgress: 32,
        stats: {
          completedModules: 8,
          totalPoints: 1120,
          currentStreak: 3,
          achievements: 6
        }
      }
    ];
  };

  const mockLearningHistory = [
    {
      id: 1,
      title: "Introduction to Machine Learning",
      status: "Completed",
      progress: 100,
      timeSpent: 8.5,
      lastAccessed: "2025-10-05",
      startDate: "2025-09-28",
      estimatedTime: 8,
      difficulty: "Intermediate",
      category: "Machine Learning",
      score: 92,
      attempts: 1,
      pointsEarned: 450,
      certificate: true,
      quizScores: { average: 89 }
    },
    {
      id: 2,
      title: "Azure AI Fundamentals",
      status: "In Progress",
      progress: 65,
      timeSpent: 12.2,
      lastAccessed: "2025-10-06",
      startDate: "2025-10-01",
      estimatedTime: 16,
      difficulty: "Beginner",
      category: "Cloud Computing",
      score: null,
      attempts: 1,
      pointsEarned: 280,
      certificate: false,
      quizScores: { average: 76 }
    }
  ];

  const mockAchievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first learning module",
      type: "completion",
      rarity: "common",
      points: 100,
      earned: true,
      earnedDate: "2025-09-28",
      isRecent: false
    },
    {
      id: 2,
      title: "Speed Learner",
      description: "Complete a module in under 4 hours",
      type: "speed",
      rarity: "rare",
      points: 250,
      earned: true,
      earnedDate: "2025-10-02",
      isRecent: true
    }
  ];

  const mockPreferences = {
    learning: {
      style: "visual",
      difficulty: "intermediate",
      sessionDuration: 60,
      dailyGoal: 120,
      autoAdvance: true
    },
    notifications: {
      email: true,
      push: true,
      achievements: true,
      weeklyReport: true
    },
    privacy: {
      shareProgress: true,
      leaderboards: true,
      analytics: true
    },
    interface: {
      theme: "light",
      language: "en"
    }
  };



  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUserDetails = async (userId) => {
    try {
      setLoadingDetails(true);
      const [historyRes, achievementsRes, preferencesRes] = await Promise.all([
        userService.getUserLearningHistory(userId),
        userService.getUserAchievements(userId),
        userService.getUserPreferences(userId)
      ]);

      // Map History
      const mappedHistory = (historyRes.data.data || []).map(item => ({
        id: item.id,
        title: item.learningPath?.title || 'Unknown Path',
        status: item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase().replace('_', ' '),
        progress: Math.round(item.progress || 0),
        timeSpent: Math.round((item.totalTimeSpent || 0) / 60),
        lastAccessed: item.lastAccessedAt ? new Date(item.lastAccessedAt).toLocaleDateString() : 'N/A',
        startDate: item.startedAt ? new Date(item.startedAt).toLocaleDateString() : 'N/A',
        estimatedTime: item.learningPath?.estimatedHours || 0,
        difficulty: item.learningPath?.difficulty || 'N/A',
        category: item.learningPath?.categoryRef?.name || 'N/A',
        score: item.finalScore || 0,
        attempts: 1,
        pointsEarned: item.moduleProgress?.reduce((sum, mp) => sum + (mp.pointsEarned || 0), 0) || 0,
        certificate: !!item.certificateId,
        quizScores: { average: item.moduleProgress?.filter(mp => mp.quizScore).reduce((sum, mp, _, arr) => sum + (mp.quizScore / arr.length), 0) || 0 }
      }));

      // Map Achievements
      const mappedAchievements = (achievementsRes.data.data || []).map(ua => ({
        id: ua.achievementId,
        title: ua.achievement.title,
        description: ua.achievement.description,
        type: ua.achievement.type.toLowerCase(),
        rarity: ua.achievement.rarity.toLowerCase(),
        points: ua.achievement.points,
        earned: ua.isUnlocked,
        earnedDate: ua.earnedAt ? new Date(ua.earnedAt).toLocaleDateString() : null,
        isRecent: ua.earnedAt ? (new Date() - new Date(ua.earnedAt)) < 7 * 24 * 60 * 60 * 1000 : false,
        progress: ua.progress ? { current: ua.progress, required: 100 } : null
      }));

      // Map Preferences
      const p = preferencesRes.data.data;
      const mappedPreferences = {
        learning: {
          style: p.learningStyle || 'visual',
          difficulty: p.preferredDifficulty || 'intermediate',
          sessionDuration: p.sessionDuration || 60,
          dailyGoal: p.dailyGoalMinutes || 120,
          autoAdvance: p.autoAdvance ?? true
        },
        notifications: {
          email: p.emailNotifications ?? true,
          push: p.pushNotifications ?? true,
          achievements: p.achievementAlerts ?? true,
          weeklyReport: p.weeklyReport ?? true
        },
        privacy: {
          shareProgress: p.shareProgress ?? true,
          leaderboards: p.showOnLeaderboard ?? true,
          analytics: p.allowAnalytics ?? true
        },
        interface: {
          theme: p.theme || 'light',
          language: p.language || 'en'
        }
      };

      setLearningHistory(mappedHistory);
      setAchievements(mappedAchievements);
      setPreferences(mappedPreferences);
    } catch (err) {
      console.error('Error fetching user details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        user.employeeId?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase()?.includes(searchTerm.toLowerCase())
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all') {
        switch (key) {
          case 'department':
            filtered = filtered.filter(user => user.department?.toLowerCase() === value);
            break;
          case 'role':
            filtered = filtered.filter(user => user.role?.toLowerCase()?.includes(value));
            break;
          case 'status':
            filtered = filtered.filter(user => user.status?.toLowerCase() === value);
            break;
          case 'level':
            filtered = filtered.filter(user => user.level?.toLowerCase() === value);
            break;
          case 'completionStatus':
            filtered = filtered.filter(user => {
              if (value === 'high') return user.overallProgress > 80;
              if (value === 'medium') return user.overallProgress >= 50 && user.overallProgress <= 80;
              if (value === 'low') return user.overallProgress < 50 && user.overallProgress > 0;
              if (value === 'none') return user.overallProgress === 0;
              return true;
            });
            break;
        }
      }
    });

    setFilteredUsers(filtered);
  }, [searchTerm, filters, users]);

  const handleUserSelect = (userId, selected) => {
    if (selected) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkAction = async (actionType, userIds) => {
    console.log('Bulk action:', actionType, 'for users:', userIds);
    
    try {
      if (actionType === 'delete') {
        const deletePromises = userIds.map(userId => 
          axiosClient.delete(`/users/${userId}`)
        );
        await Promise.all(deletePromises);
        
        // Update local state immediately
        setUsers(users.filter(user => !userIds.includes(user.id)));
        setFilteredUsers(filteredUsers.filter(user => !userIds.includes(user.id)));
        
        // Clear selection and update selected user if needed
        setSelectedUsers([]);
        if (selectedUser && userIds.includes(selectedUser.id)) {
          setSelectedUser(null);
        }
        
        showSuccess(`${userIds.length} user(s) deleted successfully`);
      }
    } catch (err) {
      console.error('Error performing bulk action:', err);
      const errorMessage = err.response?.data?.message || 'Failed to perform bulk action';
      showError(errorMessage);
      
      // Refresh data to ensure consistency
      await fetchUsers();
    }
    
    if (actionType === 'clear_selection') {
      setSelectedUsers([]);
    }
  };


  const handleUserClick = (user) => {
    setSelectedUser(user);
    setActiveTab('profile');
    fetchUserDetails(user.id);
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    showSuccess('Profile updated successfully');
  };


  const handleSavePreferences = async (newPreferences) => {
    try {
      setLoadingDetails(true);
      // Flatten back for server
      const flattened = {
        learningStyle: newPreferences.learning.style,
        preferredDifficulty: newPreferences.learning.difficulty,
        sessionDuration: newPreferences.learning.sessionDuration,
        dailyGoalMinutes: newPreferences.learning.dailyGoal,
        autoAdvance: newPreferences.learning.autoAdvance,
        emailNotifications: newPreferences.notifications.email,
        pushNotifications: newPreferences.notifications.push,
        achievementAlerts: newPreferences.notifications.achievements,
        weeklyReport: newPreferences.notifications.weeklyReport,
        shareProgress: newPreferences.privacy.shareProgress,
        showOnLeaderboard: newPreferences.privacy.leaderboards,
        allowAnalytics: newPreferences.privacy.analytics,
        theme: newPreferences.interface.theme,
        language: newPreferences.interface.language
      };

      await userService.updateUserPreferences(selectedUser.id, flattened);
      setPreferences(newPreferences);
      showSuccess('Preferences saved successfully');
    } catch (err) {
      console.error('Error saving preferences:', err);
      showError('Failed to save preferences');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      console.log('Updating user:', updatedUser);
      const response = await axiosClient.put(`/users/${updatedUser.id}`, {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        department: updatedUser.department,
        jobTitle: updatedUser.jobTitle,
        role: updatedUser.role
      });

      if (response.data.success) {
        // Update local state immediately
        const updatedUsers = users.map(user => 
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user
        );
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        
        // Update selected user
        setSelectedUser(prev => prev?.id === updatedUser.id ? { ...prev, ...updatedUser } : prev);
        
        showSuccess('User updated successfully');
      } else {
        throw new Error(response.data.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update user';
      showError(errorMessage);
      
      // Refresh data to ensure consistency
      await fetchUsers();
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      console.log('Deleting user:', userId);
      const response = await axiosClient.delete(`/users/${userId}`);
      
      // Check if deletion was successful
      const isSuccess = response.data?.success || 
                       response.status === 200 || 
                       response.status === 204 ||
                       (response.data?.message && response.data.message.toLowerCase().includes('success'));
      
      if (isSuccess) {
        // Update local state immediately
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        
        // Update selected user if it was deleted
        if (selectedUser?.id === userId) {
          setSelectedUser(updatedUsers[0] || null);
        }
        
        // Clear selection if deleted user was selected
        setSelectedUsers(selectedUsers.filter(id => id !== userId));
        
        showSuccess('User deleted successfully');
        console.log('User deleted successfully from state');
      } else {
        throw new Error(response.data?.message || 'Delete operation failed');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      console.error('Error response:', err.response);
      
      // More specific error handling
      let errorMessage = 'Failed to delete user';
      if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Cannot delete user. User may have dependencies.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to delete users.';
      } else if (err.response?.status === 404) {
        errorMessage = 'User not found. It may have already been deleted.';
      } else if (err.response?.status === 409) {
        errorMessage = err.response?.data?.message || 'Cannot delete user due to existing dependencies.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showError(errorMessage);
      
      // Refresh data to ensure consistency
      await fetchUsers();
    }
  };

  const handleUserCreated = async (newUser) => {
    try {
      await fetchUsers();
      showSuccess('User created successfully');
      console.log('User created successfully');
    } catch (err) {
      console.error('Error handling user creation:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create user';
      showError(errorMessage);
    }
  };

  const tabs = [
    { id: 'overview', label: 'User Overview', icon: 'Users' },
    { id: 'profile', label: 'Profile Details', icon: 'User' },
    { id: 'history', label: 'Learning History', icon: 'BookOpen' },
    { id: 'achievements', label: 'Achievements', icon: 'Trophy' },
    { id: 'preferences', label: 'Preferences', icon: 'Settings' },
    // { id: 'admin', label: 'Admin Settings', icon: 'Shield' }
  ];

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader" className="animate-spin h-8 w-8 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationSidebar isCollapsed={sidebarCollapsed} />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-72'}`}>
        <UserContextHeader isCollapsed={sidebarCollapsed} />
        
        <main className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">User Profile Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage employee learning profiles, track progress, and configure settings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden"
              >
                <Icon name="Menu" size={20} />
              </Button>
              <Button variant="outline" iconName="Download">
                Export Data
              </Button>
              <Button 
                variant="default" 
                iconName="UserPlus"
                onClick={() => setShowCreateUserModal(true)}
              >
                Add User
              </Button>
            </div>
          </div>

          {/* Success Display */}
          {success && (
            <div className="bg-success/10 border border-success text-success px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" size={20} />
                <span>{success}</span>
                <button 
                  onClick={() => setSuccess(null)}
                  className="ml-auto hover:bg-success/20 rounded p-1"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <Icon name="AlertCircle" size={20} />
                <span>{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto hover:bg-destructive/20 rounded p-1"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }
                `}
              >
                <Icon name={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <UserSearchAndFilter
                  onSearch={setSearchTerm}
                  onFilter={setFilters}
                  onBulkAction={handleBulkAction}
                  selectedUsers={selectedUsers}
                  totalUsers={filteredUsers.length}
                  users={users}
                />
                <UserListTable
                  users={filteredUsers}
                  onUserSelect={handleUserSelect}
                  selectedUsers={selectedUsers}
                  onSelectAll={handleSelectAll}
                  onUserClick={handleUserClick}
                  onDeleteUser={handleDeleteUser}
                  onUpdateUser={handleUpdateUser}
                />
              </div>
            )}

            {activeTab === 'profile' && selectedUser && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                  <UserProfileCard
                    user={selectedUser}
                    onEdit={() => setIsEditingProfile(true)}
                    isEditing={isEditingProfile}
                    onSave={handleSaveProfile}
                    onCancel={() => setIsEditingProfile(false)}
                    onUpdateUser={handleUpdateUser}
                  />
                </div>
                <div className="lg:col-span-3">
                  {loadingDetails ? (
                    <div className="flex items-center justify-center p-12 bg-card rounded-lg border border-border">
                      <Icon name="Loader" className="animate-spin h-6 w-6 text-primary mr-2" />
                      <span>Loading learning history...</span>
                    </div>
                  ) : (
                    <LearningHistoryPanel learningHistory={learningHistory} />
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && selectedUser && (
              loadingDetails ? (
                <div className="flex items-center justify-center p-12">
                   <Icon name="Loader" className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : (
                <LearningHistoryPanel learningHistory={learningHistory} />
              )
            )}

            {activeTab === 'achievements' && selectedUser && (
              loadingDetails ? (
                <div className="flex items-center justify-center p-12">
                   <Icon name="Loader" className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : (
                <AchievementsPanel achievements={achievements} />
              )
            )}

            {activeTab === 'preferences' && selectedUser && (
              loadingDetails ? (
                <div className="flex items-center justify-center p-12">
                   <Icon name="Loader" className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : (
                <PreferencesPanel
                  preferences={preferences || mockPreferences}
                  onSave={handleSavePreferences}
                />
              )
            )}




            {activeTab === 'admin' && selectedUser && (
              <AdminSettingsPanel
                user={selectedUser}
                onUpdate={handleUpdateUser}
                userRole={currentUser?.role}
              />
            )}
          </div>

          {/* No User Selected State */}
          {!selectedUser && activeTab !== 'overview' && (
            <div className="text-center py-12">
              <Icon name="UserX" size={64} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No User Selected</h3>
              <p className="text-muted-foreground mb-4">
                Please select a user from the overview tab to view their profile details.
              </p>
              <Button variant="outline" onClick={() => setActiveTab('overview')}>
                Go to User Overview
              </Button>
            </div>
          )}

          {/* No Users State */}
          {users.length === 0 && !loading && (
            <div className="text-center py-12">
              <Icon name="Users" size={64} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Users Found</h3>
              <p className="text-muted-foreground mb-4">
                There are no users in the system. Create your first user to get started.
              </p>
              <Button 
                variant="default" 
                onClick={() => setShowCreateUserModal(true)}
                iconName="UserPlus"
              >
                Create First User
              </Button>
            </div>
          )}
        </main>
      </div>

      <CreateUserModal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onSuccess={handleUserCreated}
      />
    </div>
  );
};

export default UserProfileManagement;