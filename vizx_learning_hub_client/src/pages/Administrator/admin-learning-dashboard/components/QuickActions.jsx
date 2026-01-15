import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

const QuickActions = ({ userRole = 'employee' }) => {
  const [notifications, setNotifications] = useState(3);
  const [syncStatus, setSyncStatus] = useState('connected');

  const quickActions = [
    {
      id: 'continue-learning',
      title: 'Continue Learning',
      description: 'Resume your current module',
      icon: 'Play',
      color: 'bg-primary text-primary-foreground',
      action: () => console.log('Continue learning'),
      shortcut: 'Space'
    },
    {
      id: 'daily-challenge',
      title: 'Daily Challenge',
      description: 'Complete today\'s AI quiz',
      icon: 'Zap',
      color: 'bg-warning text-warning-foreground',
      action: () => console.log('Start daily challenge'),
      badge: 'New',
      shortcut: 'D'
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      description: 'Check your ranking',
      icon: 'Trophy',
      color: 'bg-success text-success-foreground',
      action: () => console.log('View leaderboard'),
      shortcut: 'L'
    },
    {
      id: 'learning-games',
      title: 'Learning Games',
      description: 'Play interactive AI games',
      icon: 'Gamepad2',
      color: 'bg-secondary text-secondary-foreground',
      action: () => console.log('Open learning games'),
      shortcut: 'G'
    }
  ];

  const adminActions = [
    {
      id: 'user-impersonation',
      title: 'User View',
      description: 'Switch to user perspective',
      icon: 'UserCheck',
      color: 'bg-muted text-muted-foreground',
      action: () => console.log('Switch to user view'),
      roles: ['admin']
    },
    {
      id: 'content-sync',
      title: 'Sync Content',
      description: 'Update Microsoft Learn content',
      icon: 'RefreshCw',
      color: 'bg-primary text-primary-foreground',
      action: () => console.log('Sync content'),
      roles: ['admin']
    }
  ];

  const managerActions = [
    {
      id: 'team-insights',
      title: 'Team Progress',
      description: 'View team learning analytics',
      icon: 'Users',
      color: 'bg-secondary text-secondary-foreground',
      action: () => console.log('View team insights'),
      roles: ['manager', 'admin']
    }
  ];

  const getAvailableActions = () => {
    let actions = [...quickActions];

    if (userRole === 'admin') {
      actions = [...actions, ...adminActions, ...managerActions];
    } else if (userRole === 'manager') {
      actions = [...actions, ...managerActions];
    }

    return actions?.filter(action => !action?.roles || action?.roles?.includes(userRole));
  };

  const handleKeyboardShortcut = (shortcut, action) => {
    const handleKeyPress = (e) => {
      if (e?.key?.toLowerCase() === shortcut?.toLowerCase() && !e?.ctrlKey && !e?.altKey && !e?.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA')) {
          return;
        }
        e?.preventDefault();
        action();
      }
    };

    React.useEffect(() => {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }, []);
  };

  const availableActions = getAvailableActions();

  return (
    <div className="space-y-6">
      {/* Quick Actions Grid */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg text-foreground">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">Jump into your learning journey</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`
              w-2 h-2 rounded-full animate-pulse
              ${syncStatus === 'connected' ? 'bg-success' : 'bg-error'}
            `} />
            <span className="text-xs text-muted-foreground">
              {syncStatus === 'connected' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {availableActions?.slice(0, 4)?.map((action) => (
            <button
              key={action?.id}
              onClick={action?.action}
              className={`
                relative p-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg
                ${action?.color} group text-left
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <Icon name={action?.icon} size={24} className="opacity-90" />
                {action?.badge && (
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                    {action?.badge}
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-1">{action?.title}</h4>
                <p className="text-xs opacity-80 line-clamp-2">{action?.description}</p>
              </div>

              {action?.shortcut && (
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-white/20 text-xs px-2 py-1 rounded font-mono">
                    {action?.shortcut}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="Keyboard" size={14} />
            <span>Keyboard shortcuts available</span>
            <div className="flex items-center gap-1 ml-2">
              {availableActions?.filter(a => a?.shortcut)?.slice(0, 3)?.map((action, index) => (
                <React.Fragment key={action?.id}>
                  {index > 0 && <span>•</span>}
                  <span className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">
                    {action?.shortcut}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Microsoft Learn Sync Status */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="Cloud" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Microsoft Learn</span>
            </div>
            <div className={`
              w-2 h-2 rounded-full
              ${syncStatus === 'connected' ? 'bg-success animate-pulse' : 'bg-error'}
            `} />
          </div>
          <div className="text-xs text-muted-foreground">
            Last sync: {new Date()?.toLocaleTimeString()}
          </div>
          <div className="text-xs text-success mt-1">
            ✓ Content up to date
          </div>
        </div>

        {/* Offline Content */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="Download" size={16} className="text-secondary" />
              <span className="text-sm font-medium text-foreground">Offline Content</span>
            </div>
            <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
              Ready
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            5 modules cached locally
          </div>
          <div className="text-xs text-success mt-1">
            ✓ Available offline
          </div>
        </div>
      </div>
      {/* Notifications Panel */}
      {notifications > 0 && (
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="Bell" size={16} className="text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-foreground">
                  You have {notifications} new notifications
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Achievement unlocked, new content available, and more
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNotifications(0)}
            >
              View All
            </Button>
          </div>
        </div>
      )}
      {/* Learning Streak Reminder */}
      <div className="bg-gradient-to-r from-warning/5 to-warning/10 rounded-xl border border-warning/20 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
            <Icon name="Flame" size={20} className="text-warning" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm text-foreground">
              Keep your streak alive! 🔥
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              You're on a 7-day learning streak. Complete one module today to continue.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            iconName="Play"
            iconPosition="left"
          >
            Start Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;