import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import axiosClient from '../../../../utils/axiosClient';

const UserSearchAndFilter = ({ onSearch, onFilter, onBulkAction, selectedUsers, totalUsers, users = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: 'all',
    role: 'all',
    status: 'all',
    level: 'all',
    completionStatus: 'all'
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [bulkActionType, setBulkActionType] = useState('');
  const [userStats, setUserStats] = useState({
    activeUsers: 0,
    inactiveUsers: 0,
    highPerformers: 0,
    totalUsers: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  useEffect(() => {
    const calculateStats = () => {
      const safeUsers = Array.isArray(users) ? users : [];
      
      const activeUsers = safeUsers.filter(user => user?.status === 'Active' || user?.status === 'ACTIVE').length;
      const inactiveUsers = safeUsers.filter(user => user?.status === 'Inactive' || user?.status === 'INACTIVE').length;
      const highPerformers = safeUsers.filter(user => user?.overallProgress >= 80).length;

      setUserStats(prev => ({
        ...prev,
        activeUsers,
        inactiveUsers,
        highPerformers,
        totalUsers: safeUsers.length
      }));
    };

    calculateStats();
  }, [users]);

  useEffect(() => {
    const loadUserStats = async () => {
      try {
        setLoadingStats(true);
        const response = await axiosClient.get('/users/stats');
        if (response.data.success) {
          const stats = response.data.data.stats;
     
          setUserStats(prev => ({
            ...prev,
            totalUsers: stats.totalUsers || 0,
            activeUsers: stats.activeUsers || 0,
            highPerformers: stats.highPerformers || 0,
            inactiveUsers: stats.inactiveUsers || (stats.totalUsers - stats.activeUsers)
          }));
        }
      } catch (error) {
        console.error('Failed to load user stats from API:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    loadUserStats();
  }, []);

  useEffect(() => {
    const loadDepartments = () => {
      setLoadingDepartments(true);
      try {
        const safeUsers = Array.isArray(users) ? users : [];
        const uniqueDepartments = [...new Set(safeUsers
          .map(user => user.department)
          .filter(dept => dept && dept !== 'Not assigned' && dept.trim() !== '')
        )].sort();
        
        setDepartments(uniqueDepartments);
      } catch (error) {
        console.error('Error loading departments:', error);
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, [users]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      department: 'all',
      role: 'all',
      status: 'all',
      level: 'all',
      completionStatus: 'all'
    };
    setFilters(clearedFilters);
    setSearchTerm('');
    onSearch('');
    onFilter(clearedFilters);
  };

  const handleBulkAction = () => {
    if (bulkActionType && selectedUsers.length > 0) {
      onBulkAction(bulkActionType, selectedUsers);
      setBulkActionType('');
    }
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all').length;

  const getLevelOptions = () => {
    const safeUsers = Array.isArray(users) ? users : [];
    const levels = [...new Set(safeUsers.map(user => user.level).filter(level => level))];
    return levels.sort();
  };

  const getRoleOptions = () => {
    const safeUsers = Array.isArray(users) ? users : [];
    const roles = [...new Set(safeUsers.map(user => user.role).filter(role => role))];
    return roles.sort();
  };

  const levelOptions = getLevelOptions();
  const roleOptions = getRoleOptions();

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users by name, email, employee ID, department, or phone..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2"
        >
          <Icon name="Filter" size={16} />
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={clearFilters}
          className="flex items-center gap-2"
        >
          <Icon name="X" size={16} />
          Clear
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-border pt-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Department</label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                disabled={loadingDepartments}
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept.toLowerCase()}>
                    {dept}
                  </option>
                ))}
                {departments.length === 0 && !loadingDepartments && (
                  <option value="all" disabled>No departments available</option>
                )}
                {loadingDepartments && (
                  <option value="all" disabled>Loading departments...</option>
                )}
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Role</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                <option value="all">All Roles</option>
                {roleOptions.map(role => (
                  <option key={role} value={role.toLowerCase()}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Level</label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                <option value="all">All Levels</option>
                {levelOptions.map(level => (
                  <option key={level} value={level.toLowerCase()}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Completion Status Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Progress</label>
              <select
                value={filters.completionStatus}
                onChange={(e) => handleFilterChange('completionStatus', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                <option value="all">All Progress</option>
                <option value="high">High (&gt;80%)</option>
                <option value="medium">Medium (50-80%)</option>
                <option value="low">Low (&lt;50%)</option>
                <option value="none">No Progress</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
              <span className="text-sm text-muted-foreground">
                {activeFiltersCount > 0 ? `${activeFiltersCount} active filter${activeFiltersCount !== 1 ? 's' : ''}` : 'No filters active'}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              Showing {totalUsers} of {userStats.totalUsers} users
            </span>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="border-t border-border pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </span>
              <select
                value={bulkActionType}
                onChange={(e) => setBulkActionType(e.target.value)}
                className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring min-w-[200px]"
              >
                <option value="">Select bulk action...</option>
                <option value="assign_role">Update Role</option>
                <option value="assign_department">Update Department</option>
                <option value="send_notification">Send Notification</option>
                <option value="export_data">Export User Data</option>
                <option value="deactivate">Deactivate Users</option>
                <option value="activate">Activate Users</option>
                <option value="delete">Delete Users</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('clear_selection', [])}
              >
                Clear Selection
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleBulkAction}
                disabled={!bulkActionType}
              >
                Apply Action
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-center p-3 bg-muted/10 rounded-lg">
          <div className="text-2xl font-bold text-orange-500">
            {loadingStats ? (
              <Icon name="Loader" size={20} className="animate-spin mx-auto" />
            ) : (
              userStats.totalUsers
            )}
          </div>
          <div className="text-sm text-muted-foreground">Total Users</div>
        </div>
        <div className="text-center p-3 bg-success/10 rounded-lg">
          <div className="text-2xl font-bold text-success">
            {loadingStats ? (
              <Icon name="Loader" size={20} className="animate-spin mx-auto" />
            ) : (
              userStats.activeUsers
            )}
          </div>
          <div className="text-sm text-muted-foreground">Active Users</div>
        </div>
        <div className="text-center p-3 bg-primary/10 rounded-lg">
          <div className="text-2xl font-bold text-primary">
            {loadingStats ? (
              <Icon name="Loader" size={20} className="animate-spin mx-auto" />
            ) : (
              userStats.highPerformers
            )}
          </div>
          <div className="text-sm text-muted-foreground">High Performers</div>
        </div>
        <div className="text-center p-3 bg-muted/10 rounded-lg">
          <div className="text-2xl font-bold text-muted-foreground">
            {loadingStats ? (
              <Icon name="Loader" size={20} className="animate-spin mx-auto" />
            ) : (
              userStats.inactiveUsers
            )}
          </div>
          <div className="text-sm text-muted-foreground">Inactive</div>
        </div>
      </div>
    </div>
  );
};

export default UserSearchAndFilter;