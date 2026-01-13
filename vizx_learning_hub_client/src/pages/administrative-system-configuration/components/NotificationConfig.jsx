import React, { useState, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

// Constants
const NOTIFICATION_TYPES = {
  MODULE_COMPLETION: 'module_completion',
  STREAK_REMINDER: 'streak_reminder',
  ACHIEVEMENT_UNLOCK: 'achievement_unlock',
  LEADERBOARD_RANK: 'leaderboard_rank'
};

const CHANNEL_TYPES = {
  EMAIL: 'email',
  PUSH: 'push',
  IN_APP: 'inApp'
};

const CHANNEL_CONFIG = {
  [CHANNEL_TYPES.EMAIL]: {
    label: 'Email',
    icon: 'Mail',
    description: 'SMTP Configured',
    color: 'text-primary'
  },
  [CHANNEL_TYPES.PUSH]: {
    label: 'Push',
    icon: 'Smartphone',
    description: 'FCM Configured',
    color: 'text-secondary'
  },
  [CHANNEL_TYPES.IN_APP]: {
    label: 'In-App',
    icon: 'MessageSquare',
    description: 'Always Available',
    color: 'text-warning'
  }
};

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: NOTIFICATION_TYPES.MODULE_COMPLETION,
    name: 'Module Completion',
    description: 'Notify when a user completes a module',
    channels: { 
      [CHANNEL_TYPES.EMAIL]: true, 
      [CHANNEL_TYPES.PUSH]: true, 
      [CHANNEL_TYPES.IN_APP]: true 
    },
    timing: 'immediate',
    enabled: true
  },
  {
    id: 2,
    type: NOTIFICATION_TYPES.STREAK_REMINDER,
    name: 'Streak Reminder',
    description: 'Remind users to maintain their learning streak',
    channels: { 
      [CHANNEL_TYPES.EMAIL]: true, 
      [CHANNEL_TYPES.PUSH]: true, 
      [CHANNEL_TYPES.IN_APP]: true 
    },
    timing: 'daily',
    enabled: true
  },
  {
    id: 3,
    type: NOTIFICATION_TYPES.ACHIEVEMENT_UNLOCK,
    name: 'Achievement Unlocked',
    description: 'Notify when a badge or achievement is earned',
    channels: { 
      [CHANNEL_TYPES.EMAIL]: false, 
      [CHANNEL_TYPES.PUSH]: true, 
      [CHANNEL_TYPES.IN_APP]: true 
    },
    timing: 'immediate',
    enabled: true
  },
  {
    id: 4,
    type: NOTIFICATION_TYPES.LEADERBOARD_RANK,
    name: 'Leaderboard Position',
    description: 'Weekly leaderboard position update',
    channels: { 
      [CHANNEL_TYPES.EMAIL]: true, 
      [CHANNEL_TYPES.PUSH]: false, 
      [CHANNEL_TYPES.IN_APP]: true 
    },
    timing: 'weekly',
    enabled: true
  }
];

const EMAIL_TEMPLATES = [
  'Welcome Email',
  'Module Completion',
  'Weekly Digest',
  'Achievement Unlocked'
];

// Custom Hook
const useNotifications = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const handleToggleChannel = useCallback((notificationId, channel) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { 
            ...notification, 
            channels: { 
              ...notification.channels, 
              [channel]: !notification.channels[channel] 
            } 
          }
        : notification
    ));
  }, []);

  const handleToggleEnabled = useCallback((notificationId) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, enabled: !notification.enabled } 
        : notification
    ));
  }, []);

  return {
    notifications,
    handleToggleChannel,
    handleToggleEnabled
  };
};

// Sub-components
const NotificationHeader = () => (
  <div>
    <h3 className="text-lg font-semibold text-foreground">Notification Configuration</h3>
    <p className="text-sm text-muted-foreground">
      Manage notification settings and delivery channels
    </p>
  </div>
);

const GlobalSettings = () => (
  <div className="bg-card rounded-xl border border-border p-6">
    <SectionHeader
      icon="Bell"
      title="Global Settings"
      subtitle="Configure system-wide notification preferences"
    />
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(CHANNEL_CONFIG).map(([channel, config]) => (
        <ChannelStatusCard
          key={channel}
          channel={channel}
          config={config}
        />
      ))}
    </div>
  </div>
);

const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
      <Icon name={icon} size={20} className="text-primary" />
    </div>
    <div>
      <h4 className="font-semibold text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

const ChannelStatusCard = ({ channel, config }) => (
  <div className="p-4 bg-accent/30 rounded-lg text-center">
    <Icon name={config.icon} size={24} className={`${config.color} mx-auto mb-2`} />
    <div className="text-sm font-medium text-foreground">{config.label}</div>
    <div className="text-xs text-muted-foreground mt-1">{config.description}</div>
    <div className="mt-2">
      <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
        Active
      </span>
    </div>
  </div>
);

const NotificationTypes = ({ notifications, onToggleChannel, onToggleEnabled }) => (
  <div className="bg-card rounded-xl border border-border p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h4 className="font-semibold text-foreground">Notification Types</h4>
        <p className="text-sm text-muted-foreground">Configure individual notification settings</p>
      </div>
    </div>

    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onToggleChannel={onToggleChannel}
          onToggleEnabled={onToggleEnabled}
        />
      ))}
    </div>
  </div>
);

const NotificationItem = ({ notification, onToggleChannel, onToggleEnabled }) => (
  <div className="p-4 bg-accent/30 rounded-lg">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h5 className="font-medium text-foreground">{notification.name}</h5>
          <ToggleSwitch
            enabled={notification.enabled}
            onChange={() => onToggleEnabled(notification.id)}
          />
        </div>
        <p className="text-sm text-muted-foreground">{notification.description}</p>
      </div>
    </div>

    {notification.enabled && (
      <ChannelSelector
        notification={notification}
        onToggleChannel={onToggleChannel}
      />
    )}
  </div>
);

const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    onClick={onChange}
    className={`relative w-12 h-6 rounded-full transition-colors ${
      enabled ? 'bg-success' : 'bg-muted'
    }`}
    role="switch"
    aria-checked={enabled}
  >
    <div 
      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
        enabled ? 'left-6' : 'left-0.5'
      }`} 
    />
  </button>
);

const ChannelSelector = ({ notification, onToggleChannel }) => (
  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
    {Object.entries(notification.channels).map(([channel, isEnabled]) => {
      const config = CHANNEL_CONFIG[channel];
      return (
        <ChannelButton
          key={channel}
          channel={channel}
          config={config}
          isEnabled={isEnabled}
          onToggle={() => onToggleChannel(notification.id, channel)}
        />
      );
    })}
  </div>
);

const ChannelButton = ({ channel, config, isEnabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`p-3 rounded-lg border-2 transition-all ${
      isEnabled 
        ? 'border-primary bg-primary/5' 
        : 'border-border bg-background hover:border-primary/50'
    }`}
  >
    <Icon 
      name={config.icon} 
      size={20} 
      className={isEnabled ? 'text-primary' : 'text-muted-foreground'}
    />
    <div className={`text-xs mt-2 font-medium ${
      isEnabled ? 'text-primary' : 'text-muted-foreground'
    }`}>
      {config.label}
    </div>
  </button>
);

const EmailTemplates = () => (
  <div className="bg-card rounded-xl border border-border p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
          <Icon name="FileText" size={20} className="text-secondary" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Email Templates</h4>
          <p className="text-sm text-muted-foreground">Customize notification email templates</p>
        </div>
      </div>
      <Button variant="outline" size="sm" iconName="Edit">
        Edit Templates
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {EMAIL_TEMPLATES.map((template, index) => (
        <TemplateItem key={index} template={template} />
      ))}
    </div>
  </div>
);

const TemplateItem = ({ template }) => (
  <div className="p-4 bg-accent/30 rounded-lg flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Icon name="Mail" size={18} className="text-muted-foreground" />
      <span className="text-sm font-medium text-foreground">{template}</span>
    </div>
    <button className="text-primary hover:text-primary/80 text-sm">
      Preview
    </button>
  </div>
);

// Main Component
const NotificationConfig = () => {
  const {
    notifications,
    handleToggleChannel,
    handleToggleEnabled
  } = useNotifications();

  return (
    <div className="space-y-6">
      <NotificationHeader />
      <GlobalSettings />
      <NotificationTypes
        notifications={notifications}
        onToggleChannel={handleToggleChannel}
        onToggleEnabled={handleToggleEnabled}
      />
      <EmailTemplates />
    </div>
  );
};

export default NotificationConfig;