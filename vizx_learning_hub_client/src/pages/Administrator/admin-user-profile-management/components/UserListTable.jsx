import React, { useState, useMemo } from 'react';
import Icon from '../../../../components/AppIcon';
import Image from '../../../../components/AppImage';
import UserActionsModal from './UserActionsModal';

const UserListTable = ({ 
  users, 
  onUserSelect, 
  selectedUsers, 
  onSelectAll, 
  onUserClick,
  onDeleteUser,
  onUpdateUser 
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [modalState, setModalState] = useState({
    isOpen: false,
    user: null,
    mode: 'edit'
  });

  // Safe data access helpers
  const safeUserStats = (user) => {
    return {
      totalPoints: user?.stats?.totalPoints || user?.totalPoints || 0,
      currentStreak: user?.stats?.currentStreak || user?.currentStreak || 0,
      completedModules: user?.stats?.completedModules || user?.completedModules || 0,
      achievements: user?.stats?.achievements || user?.achievementsCount || 0
    };
  };

  const safeUserData = (user) => {
    return {
      id: user?.id || user?._id || '',
      name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      employeeId: user?.employeeId || '',
      phone: user?.phone || '',
      department: user?.department || 'Not assigned',
      role: user?.role || 'EMPLOYEE',
      jobTitle: user?.jobTitle || 'Employee',
      status: user?.status || 'PENDING',
      level: user?.level || 'Beginner',
      avatar: user?.avatar || '',
      lastActive: user?.lastActive || user?.lastLoginAt || 'Never',
      overallProgress: user?.overallProgress ?? 0,
      totalModules: user?.totalModules ?? 0,
      currentLevel: user?.currentLevel || 1,
      stats: safeUserStats(user)
    };
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Memoized sorted users for better performance
  const sortedUsers = useMemo(() => {
    return [...users].map(safeUserData).sort((a, b) => {
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortConfig.key === 'progress') {
        return sortConfig.direction === 'asc' 
          ? a.overallProgress - b.overallProgress
          : b.overallProgress - a.overallProgress;
      }
      if (sortConfig.key === 'points') {
        return sortConfig.direction === 'asc' 
          ? a.stats.totalPoints - b.stats.totalPoints
          : b.stats.totalPoints - a.stats.totalPoints;
      }
      if (sortConfig.key === 'lastActive') {
        const dateA = a.lastActive === 'Never' ? new Date(0) : new Date(a.lastActive);
        const dateB = b.lastActive === 'Never' ? new Date(0) : new Date(b.lastActive);
        return sortConfig.direction === 'asc' 
          ? dateA - dateB
          : dateB - dateA;
      }
      return 0;
    });
  }, [users, sortConfig]);

  const getStatusColor = (status) => {
    const statusMap = {
      'ACTIVE': 'text-success bg-success/10',
      'INACTIVE': 'text-muted-foreground bg-muted',
      'SUSPENDED': 'text-destructive bg-destructive/10',
      'PENDING': 'text-warning bg-warning/10',
      'Active': 'text-success bg-success/10',
      'Inactive': 'text-muted-foreground bg-muted',
      'Suspended': 'text-destructive bg-destructive/10',
      'Pending': 'text-warning bg-warning/10'
    };
    return statusMap[status] || 'text-muted-foreground bg-muted';
  };

  const getLevelColor = (level) => {
    const levelMap = {
      'Beginner': 'text-warning bg-warning/10',
      'Intermediate': 'text-primary bg-primary/10',
      'Advanced': 'text-success bg-success/10',
      'Expert': 'text-secondary bg-secondary/10'
    };
    return levelMap[level] || 'text-muted-foreground bg-muted';
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-success';
    if (progress >= 50) return 'bg-primary';
    if (progress >= 20) return 'bg-warning';
    return 'bg-destructive';
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return <Icon name="ArrowUpDown" size={14} className="text-muted-foreground" />;
    }
    return sortConfig.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} className="text-primary" />
      : <Icon name="ArrowDown" size={14} className="text-primary" />;
  };

  const handleEditUser = (user, e) => {
    e.stopPropagation();
    setModalState({
      isOpen: true,
      user: user,
      mode: 'edit'
    });
  };

  const handleDeleteUser = (user, e) => {
    e.stopPropagation();
    setModalState({
      isOpen: true,
      user: user,
      mode: 'delete'
    });
  };

  const handleModalClose = () => {
    setModalState({
      isOpen: false,
      user: null,
      mode: 'edit'
    });
  };

  const handleUserUpdated = (updatedUser) => {
    console.log('User updated in UserListTable:', updatedUser);
    // Ensure the updated user has the complete structure
    const safeUpdatedUser = safeUserData(updatedUser);
    onUpdateUser(safeUpdatedUser);
    handleModalClose();
  };

  const handleUserDeleted = (userId) => {
    console.log('User deleted in UserListTable:', userId);
    onDeleteUser(userId);
    handleModalClose();
  };

  // Check if all users are selected
  const allSelected = users.length > 0 && selectedUsers.length === users.length;
  // Check if some users are selected (but not all)
  const someSelected = selectedUsers.length > 0 && selectedUsers.length < users.length;

  return (
    <>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {/* Selection Info Bar */}
        {selectedUsers.length > 0 && (
          <div className="bg-primary/10 border-b border-primary/20 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <button
                onClick={() => onSelectAll(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear selection
              </button>
            </div>
          </div>
        )}

        {/* Table Header */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={input => {
                      if (input) {
                        input.indeterminate = someSelected;
                      }
                    }}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring focus:ring-2 focus:ring-offset-1"
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-accent/50 transition-colors duration-200"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">User</span>
                    <SortIcon column="name" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-sm font-medium text-foreground">Department</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-sm font-medium text-foreground">Role</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-sm font-medium text-foreground">Level</span>
                </th>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-accent/50 transition-colors duration-200"
                  onClick={() => handleSort('progress')}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">Progress</span>
                    <SortIcon column="progress" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-accent/50 transition-colors duration-200"
                  onClick={() => handleSort('points')}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">Points</span>
                    <SortIcon column="points" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-accent/50 transition-colors duration-200"
                  onClick={() => handleSort('lastActive')}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">Last Active</span>
                    <SortIcon column="lastActive" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-sm font-medium text-foreground">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className="hover:bg-accent/30 transition-colors duration-200 cursor-pointer group"
                  onClick={() => onUserClick(user)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => onUserSelect(user.id, e.target.checked)}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring focus:ring-2 focus:ring-offset-1"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-transparent group-hover:border-primary/20 transition-colors">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-full h-full bg-primary flex items-center justify-center ${user.avatar ? 'hidden' : 'flex'}`}
                        >
                          <span className="text-white font-semibold text-sm">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground truncate">{user.name}</div>
                        <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                        <div className="text-xs text-muted-foreground font-mono">{user.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-foreground">{user.department}</div>
                    <div className="text-xs text-muted-foreground">{user.jobTitle}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(user.level)}`}>
                      {user.level}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full flex-1">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${getProgressColor(user.overallProgress)}`}
                          style={{ width: `${Math.max(5, user.overallProgress)}%` }} // Minimum 5% width for visibility
                        />
                      </div>
                      <span className="text-sm font-mono text-foreground min-w-[3rem] text-right">
                        {user.overallProgress}%
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 flex justify-between px-1">
                       <span className="font-medium uppercase tracking-tighter">Modules</span>
                       <span className="font-bold opacity-80">{user.stats.completedModules}<span className="opacity-50 font-normal">/{user.totalModules}</span></span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Icon name="Star" size={14} className="text-warning flex-shrink-0" />
                      <span className="text-sm font-mono text-foreground">
                        {user.stats.totalPoints.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-foreground">
                      {user.lastActive === 'Never' ? 'Never' : new Date(user.lastActive).toLocaleDateString()}
                    </div>
                    {user.stats.currentStreak > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Icon name="Flame" size={12} className="text-warning flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          {user.stats.currentStreak} day streak
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1.5 hover:bg-accent rounded-lg transition-colors duration-200 group/action"
                        title="View Profile"
                        onClick={() => onUserClick(user)}
                      >
                        <Icon name="Eye" size={16} className="text-muted-foreground group-hover/action:text-primary" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-accent rounded-lg transition-colors duration-200 group/action"
                        title="Edit User"
                        onClick={(e) => handleEditUser(user, e)}
                      >
                        <Icon name="Edit2" size={16} className="text-muted-foreground group-hover/action:text-primary" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-accent rounded-lg transition-colors duration-200 group/action"
                        title="Delete User"
                        onClick={(e) => handleDeleteUser(user, e)}
                      >
                        <Icon name="Trash2" size={16} className="text-muted-foreground group-hover/action:text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Empty State */}
        {users.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No users found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Loading State */}
        {users.length === 0 && (
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Icon name="Loader" size={16} className="animate-spin" />
              <span>Loading users...</span>
            </div>
          </div>
        )}
      </div>

      {/* User Actions Modal */}
      <UserActionsModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        user={modalState.user}
        mode={modalState.mode}
        onUserUpdated={handleUserUpdated}
        onUserDeleted={handleUserDeleted}
      />
    </>
  );
};

export default UserListTable;