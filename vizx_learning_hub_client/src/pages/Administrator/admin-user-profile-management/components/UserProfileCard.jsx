import React from 'react';
import Icon from '../../../../components/AppIcon';
import Image from '../../../../components/AppImage';

const UserProfileCard = ({ user, onEdit, isEditing, onSave, onCancel }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-success bg-success/10';
      case 'Inactive': return 'text-muted-foreground bg-muted';
      case 'Suspended': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'text-warning bg-warning/10';
      case 'Intermediate': return 'text-primary bg-primary/10';
      case 'Advanced': return 'text-success bg-success/10';
      case 'Expert': return 'text-secondary bg-secondary/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Profile Information</h2>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors duration-200"
            >
              <Icon name="Edit2" size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onSave}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors duration-200"
              >
                <Icon name="Check" size={16} />
                Save
              </button>
              <button
                onClick={onCancel}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition-colors duration-200"
              >
                <Icon name="X" size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      {/* User Avatar and Basic Info */}
      <div className="flex items-start gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
            <Image
              src={user?.avatar}
              alt={user?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-card flex items-center justify-center">
            <Icon name="Check" size={12} color="white" />
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="text-lg font-semibold text-foreground mt-1">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
              <p className="text-lg font-mono text-foreground mt-1">{user?.employeeId}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-foreground mt-1">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="text-foreground mt-1">{user?.phone}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Department</label>
              <p className="text-foreground mt-1">{user?.department}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <p className="text-foreground mt-1">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Status and Level Badges */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user?.status)}`}>
            {user?.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Level:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(user?.level)}`}>
            {user?.level}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Joined:</span>
          <span className="text-sm text-foreground">{user?.joinDate}</span>
        </div>
      </div>
      {/* Learning Statistics */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Learning Progress</h4>
          <span className="text-sm font-bold text-primary">{user?.overallProgress || 0}%</span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
            style={{ width: `${user?.overallProgress || 0}%` }}
          />
        </div>

        <div className="grid grid-cols-4 gap-4 pt-2">
          <div className="text-center group/stat transition-transform hover:scale-110 duration-200">
            <div className="text-xl font-bold text-primary">
              {user?.stats?.completedModules ?? 0}<span className="text-xs text-muted-foreground font-normal">/{user?.totalModules ?? 0}</span>
            </div>
            <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Completed</div>
          </div>
          <div className="text-center group/stat transition-transform hover:scale-110 duration-200">
            <div className="text-xl font-bold text-success">
              {Math.max(0, (user?.totalModules || 30) - (user?.stats?.completedModules || 0))}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Remaining</div>
          </div>
          <div className="text-center group/stat transition-transform hover:scale-110 duration-200">
            <div className="text-xl font-bold text-warning">{user?.stats?.currentStreak}d</div>
            <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Streak</div>
          </div>
          <div className="text-center group/stat transition-transform hover:scale-110 duration-200">
            <div className="text-xl font-bold text-secondary">{user?.stats?.achievements}</div>
            <div className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Badges</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;