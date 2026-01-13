import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

// Constants
const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
};

const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

const FILTER_OPTIONS = {
  ALL: 'all'
};

const ROLE_BADGE_COLORS = {
  admin: 'bg-error/10 text-error',
  manager: 'bg-warning/10 text-warning',
  employee: 'bg-success/10 text-success',
  default: 'bg-muted text-muted-foreground'
};

const STATUS_BADGE_COLORS = {
  active: 'bg-success/10 text-success',
  inactive: 'bg-muted text-muted-foreground'
};

// Mock data
const MOCK_USERS = [
  {
    id: 1,
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'admin',
    department: 'Engineering',
    status: 'active',
    lastLogin: new Date(Date.now() - 3600000),
    joinedDate: '2024-01-15',
    modulesCompleted: 12,
    totalPoints: 2850
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    email: 'michael.r@company.com',
    role: 'manager',
    department: 'Product',
    status: 'active',
    lastLogin: new Date(Date.now() - 7200000),
    joinedDate: '2024-02-20',
    modulesCompleted: 11,
    totalPoints: 2720
  },
  {
    id: 3,
    name: 'Emily Johnson',
    email: 'emily.j@company.com',
    role: 'employee',
    department: 'Marketing',
    status: 'active',
    lastLogin: new Date(Date.now() - 86400000),
    joinedDate: '2024-03-10',
    modulesCompleted: 10,
    totalPoints: 2650
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david.kim@company.com',
    role: 'employee',
    department: 'Sales',
    status: 'inactive',
    lastLogin: new Date(Date.now() - 2592000000),
    joinedDate: '2023-11-05',
    modulesCompleted: 5,
    totalPoints: 1200
  }
];

// Utility functions
const formatLastLogin = (date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const getRoleBadgeColor = (role) => {
  return ROLE_BADGE_COLORS[role] || ROLE_BADGE_COLORS.default;
};

const getStatusBadgeColor = (status) => {
  return STATUS_BADGE_COLORS[status] || STATUS_BADGE_COLORS.inactive;
};

// Custom Hook for User Management Logic
const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState(FILTER_OPTIONS.ALL);
  const [filterStatus, setFilterStatus] = useState(FILTER_OPTIONS.ALL);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(MOCK_USERS);
      setIsLoading(false);
    };

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === FILTER_OPTIONS.ALL || user.role === filterRole;
      const matchesStatus = filterStatus === FILTER_OPTIONS.ALL || user.status === filterStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  const handleSelectUser = useCallback((userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedUsers(prev => 
      prev.length === filteredUsers.length 
        ? [] 
        : filteredUsers.map(user => user.id)
    );
  }, [filteredUsers]);

  const handleBulkAction = useCallback((action) => {
    console.log(`Performing ${action} on users:`, selectedUsers);
    setSelectedUsers([]);
  }, [selectedUsers]);

  const allSelected = selectedUsers.length === filteredUsers.length && filteredUsers.length > 0;
  const someSelected = selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length;

  return {
    users: filteredUsers,
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    selectedUsers,
    handleSelectUser,
    handleSelectAll,
    handleBulkAction,
    showAddUserModal,
    setShowAddUserModal,
    isLoading,
    allSelected,
    someSelected
  };
};

// Sub-components
const UserManagementHeader = () => (
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-lg font-semibold text-foreground">User Management</h3>
      <p className="text-sm text-muted-foreground">
        Manage users, roles, and permissions
      </p>
    </div>
    <Button variant="default" size="sm" iconName="Plus">
      Add User
    </Button>
  </div>
);

const SearchAndFilters = ({ 
  searchTerm, 
  onSearchChange, 
  filterRole, 
  onRoleFilterChange, 
  filterStatus, 
  onStatusFilterChange 
}) => (
  <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border border-border">
    <div className="flex-1">
      <div className="relative">
        <Icon 
          name="Search" 
          size={18} 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
        />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        />
      </div>
    </div>
    
    <div className="flex gap-3">
      <select
        value={filterRole}
        onChange={(e) => onRoleFilterChange(e.target.value)}
        className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
      >
        <option value="all">All Roles</option>
        <option value="admin">Admin</option>
        <option value="manager">Manager</option>
        <option value="employee">Employee</option>
      </select>
      
      <select
        value={filterStatus}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  </div>
);

const BulkActions = ({ selectedCount, onBulkAction, onSelectAll, allSelected, someSelected }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            ref={input => {
              if (input) {
                input.indeterminate = someSelected;
              }
            }}
            onChange={onSelectAll}
            className="w-4 h-4 text-primary rounded focus:ring-primary border-border"
          />
          <span className="text-sm text-foreground">
            {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onBulkAction('activate')}
          disabled={selectedCount === 0}
        >
          <Icon name="CheckCircle" size={16} className="mr-2" />
          Activate
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onBulkAction('deactivate')}
          disabled={selectedCount === 0}
        >
          <Icon name="XCircle" size={16} className="mr-2" />
          Deactivate
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onBulkAction('delete')}
          disabled={selectedCount === 0}
        >
          <Icon name="Trash2" size={16} className="mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};

const UserTable = ({ 
  users, 
  selectedUsers, 
  onSelectUser, 
  onSelectAll, 
  allSelected,
  someSelected,
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
        <p>No users found</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) {
                      input.indeterminate = someSelected;
                    }
                  }}
                  onChange={onSelectAll}
                  className="w-4 h-4 text-primary rounded focus:ring-primary border-border"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Last Login</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Progress</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                isSelected={selectedUsers.includes(user.id)}
                onSelect={() => onSelectUser(user.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UserTableRow = ({ user, isSelected, onSelect }) => (
  <tr className="hover:bg-muted/30 transition-colors">
    <td className="px-4 py-3">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="w-4 h-4 text-primary rounded focus:ring-primary border-border"
      />
    </td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon name="User" size={16} className="text-primary" />
        </div>
        <div>
          <div className="font-medium text-foreground">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      </div>
    </td>
    <td className="px-4 py-3">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
        {user.role}
      </span>
    </td>
    <td className="px-4 py-3">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
        {user.status}
      </span>
    </td>
    <td className="px-4 py-3 text-sm text-muted-foreground">
      {formatLastLogin(user.lastLogin)}
    </td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="w-16 bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full" 
            style={{ 
              width: `${Math.min(100, (user.modulesCompleted / 12) * 100)}%` 
            }}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {user.modulesCompleted}/12
        </span>
      </div>
    </td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Icon name="Edit" size={16} />
        </Button>
        <Button variant="ghost" size="sm">
          <Icon name="Mail" size={16} />
        </Button>
        <Button variant="ghost" size="sm">
          <Icon name="MoreHorizontal" size={16} />
        </Button>
      </div>
    </td>
  </tr>
);

// Main Component
const UserManagement = () => {
  const {
    users,
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    selectedUsers,
    handleSelectUser,
    handleSelectAll,
    handleBulkAction,
    isLoading,
    allSelected,
    someSelected
  } = useUserManagement();

  return (
    <div className="space-y-6">
      <UserManagementHeader />
      
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterRole={filterRole}
        onRoleFilterChange={setFilterRole}
        filterStatus={filterStatus}
        onStatusFilterChange={setFilterStatus}
      />

      <BulkActions
        selectedCount={selectedUsers.length}
        onBulkAction={handleBulkAction}
        onSelectAll={handleSelectAll}
        allSelected={allSelected}
        someSelected={someSelected}
      />

      <UserTable
        users={users}
        selectedUsers={selectedUsers}
        onSelectUser={handleSelectUser}
        onSelectAll={handleSelectAll}
        allSelected={allSelected}
        someSelected={someSelected}
        isLoading={isLoading}
      />
    </div>
  );
};

export default UserManagement;