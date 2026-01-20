import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import { useAuth } from '../../contexts/AuthContext';

const UserContextHeader = ({ isCollapsed = false }) => {
  const { user: currentUser } = useAuth();
  const [notifications, setNotifications] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(!currentUser);

  const getLevelFromPoints = (points) => {
    if (points >= 1500) return 'Expert';
    if (points >= 1000) return 'Advanced';
    if (points >= 500) return 'Intermediate';
    return 'Beginner';
  };

  const getUserDisplayInfo = () => {
    if (!currentUser) return { name: 'Loading...', points: 0, streak: 0, level: 'Beginner', completedModules: 0, currentLevel: 1 };
    return {
      name: `${currentUser.firstName} ${currentUser.lastName}`,
      points: currentUser.totalPoints || 0,
      streak: currentUser.currentStreak || 0,
      level: getLevelFromPoints(currentUser.totalPoints || 0),
      completedModules: currentUser.completedModules || 0,
      currentLevel: currentUser.currentLevel || 1
    };
  };

  const userInfo = getUserDisplayInfo();
  const weeklyProgress = Math.min(100, (userInfo.completedModules / 5) * 100);

  const handleNotificationClick = async () => { try { setNotifications(0); } catch (error) { console.error('Error marking notifications as read:', error); } };

  useEffect(() => { if (currentUser) setLoading(false); }, [currentUser]);

  if (loading) return (
    <div className="p-4 border-b border-border bg-muted/30">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          <div className="flex gap-4">
            <div className="h-3 bg-muted rounded animate-pulse w-20" />
            <div className="h-3 bg-muted rounded animate-pulse w-16" />
          </div>
        </div>
      </div>
    </div>
  );

  if (isCollapsed) return (
    <div className="p-3 border-b border-border bg-muted/30">
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            {currentUser?.avatar ? <img src={currentUser.avatar} alt={currentUser.firstName} className="w-full h-full rounded-full object-cover" /> : <span className="text-white font-semibold text-sm">{currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}</span>}
          </div>
          {notifications > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center"><span className="text-xs text-destructive-foreground font-medium">{notifications > 9 ? '9+' : notifications}</span></div>}
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1"><Icon name="Star" size={12} color="var(--color-success)" /><span className="text-xs font-mono text-success">{userInfo.points?.toLocaleString()}</span></div>
          <div className="flex items-center gap-1"><Icon name="Flame" size={12} color="var(--color-warning)" /><span className="text-xs font-mono text-warning">{userInfo.streak}</span></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 border-b border-border bg-muted/30">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            {currentUser?.avatar ? <img src={currentUser.avatar} alt={`${currentUser.firstName} ${currentUser.lastName}`} className="w-full h-full rounded-full object-cover" /> : <span className="text-white font-semibold text-sm">{currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}</span>}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${isOnline ? 'bg-success' : 'bg-muted-foreground'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2"><h4 className="font-semibold text-sm text-foreground truncate capitalize">{userInfo.name}</h4><span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full capitalize">{userInfo.level}</span></div>
          <p className="text-xs text-muted-foreground capitalize">{currentUser?.role?.toLowerCase() || 'Employee'}</p>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1"><Icon name="Flame" size={14} color="var(--color-warning)" /><span className="text-xs font-mono text-warning">{userInfo.streak} day streak</span></div>
            <div className="flex items-center gap-1"><Icon name="Star" size={14} color="var(--color-success)" /><span className="text-xs font-mono text-success">{userInfo.points} pts</span></div>
          </div>
        </div>
        <button onClick={handleNotificationClick} className="relative p-2 hover:bg-accent rounded-lg transition-colors duration-200" disabled={notifications === 0}>
          <Icon name="Bell" size={18} className={notifications > 0 ? "text-primary" : "text-muted-foreground"} />
          {notifications > 0 && <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"><span className="text-xs text-destructive-foreground font-medium">{notifications > 9 ? '9+' : notifications}</span></div>}
        </button>
      </div>
      <div className="mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground">Weekly Goal</span><span className="text-xs font-mono text-foreground">{userInfo.completedModules}/5 modules</span></div>
        <div className="w-full bg-muted rounded-full h-2"><div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${weeklyProgress}%` }} /></div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success' : 'bg-muted-foreground'}`} /><span className="text-xs text-muted-foreground">{isOnline ? 'Online' : 'Offline'}</span></div>
        <div className="text-xs text-muted-foreground">Level {userInfo.currentLevel}</div>
      </div>
      {currentUser?.department && currentUser.department !== 'Not assigned' && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30"><Icon name="Building" size={12} className="text-muted-foreground" /><span className="text-xs text-muted-foreground capitalize">{currentUser.department}</span></div>
      )}
    </div>
  );
};

export default UserContextHeader;