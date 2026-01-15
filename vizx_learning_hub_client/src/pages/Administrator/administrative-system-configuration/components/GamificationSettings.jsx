import React, { useState, useCallback } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

// Constants
const INITIAL_SETTINGS = {
  enableGamification: true,
  moduleCompletionPoints: 100,
  pathCompletionPoints: 500,
  dailyStreakPoints: 50,
  quizPassPoints: 75,
  challengeWinPoints: 200,
  enableLeaderboards: true,
  leaderboardResetFrequency: 'weekly',
  enableLevels: true,
  pointsPerLevel: 1000,
  maxLevel: 50
};

const INITIAL_BADGES = [
  {
    id: 1,
    name: 'Quick Learner',
    description: 'Complete 5 modules in one week',
    icon: 'Zap',
    points: 250,
    isActive: true
  },
  {
    id: 2,
    name: 'Master Explorer',
    description: 'Complete 3 different learning paths',
    icon: 'Compass',
    points: 500,
    isActive: true
  },
  {
    id: 3,
    name: 'Perfect Streak',
    description: 'Maintain a 30-day learning streak',
    icon: 'Flame',
    points: 750,
    isActive: false
  }
];

const POINT_SETTINGS = [
  { key: 'moduleCompletionPoints', label: 'Module Completion', icon: 'BookOpen' },
  { key: 'pathCompletionPoints', label: 'Path Completion', icon: 'Target' },
  { key: 'dailyStreakPoints', label: 'Daily Streak', icon: 'Flame' },
  { key: 'quizPassPoints', label: 'Quiz Pass', icon: 'CheckCircle' },
  { key: 'challengeWinPoints', label: 'Challenge Win', icon: 'Trophy' }
];

// Custom Hook
const useGamification = () => {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [badges, setBadges] = useState(INITIAL_BADGES);

  const handleSettingChange = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleAddBadge = useCallback(() => {
    const newBadge = {
      id: badges.length + 1,
      name: `New Badge ${badges.length + 1}`,
      description: 'Description for the new badge',
      icon: 'Award',
      points: 100,
      isActive: true
    };
    setBadges(prev => [...prev, newBadge]);
  }, [badges.length]);

  const handleToggleBadge = useCallback((badgeId) => {
    setBadges(prev => prev.map(badge =>
      badge.id === badgeId ? { ...badge, isActive: !badge.isActive } : badge
    ));
  }, []);

  return {
    settings,
    badges,
    handleSettingChange,
    handleAddBadge,
    handleToggleBadge
  };
};

// Sub-components
const GamificationHeader = () => (
  <div>
    <h3 className="text-lg font-semibold text-foreground">Gamification Settings</h3>
    <p className="text-sm text-muted-foreground">
      Configure points, badges, and leaderboards
    </p>
  </div>
);

const SectionHeader = ({ icon, title, subtitle, iconColor = 'text-primary' }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className={`w-10 h-10 ${iconColor}/10 rounded-full flex items-center justify-center`}>
      <Icon name={icon} size={20} className={iconColor} />
    </div>
    <div>
      <h4 className="font-semibold text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

const ToggleSetting = ({ label, description, enabled, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
    <div>
      <div className="font-medium text-foreground">{label}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
    </div>
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-success' : 'bg-muted'
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
        enabled ? 'left-6' : 'left-0.5'
      }`} />
    </button>
  </div>
);

const PointsSystem = ({ settings, onSettingChange }) => (
  <div className="bg-card rounded-xl border border-border p-6">
    <SectionHeader
      icon="Award"
      title="Points System"
      subtitle="Configure points for different achievements"
      iconColor="text-primary"
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {POINT_SETTINGS.map((point) => (
        <div key={point.key} className="p-4 bg-accent/30 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Icon name={point.icon} size={18} className="text-primary" />
            <label className="font-medium text-foreground">{point.label}</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={settings[point.key]}
              onChange={(e) => onSettingChange(point.key, parseInt(e.target.value))}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
            <span className="text-sm text-muted-foreground">points</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const LeaderboardSettings = ({ settings, onSettingChange }) => (
  <div className="bg-card rounded-xl border border-border p-6">
    <SectionHeader
      icon="Trophy"
      title="Leaderboards"
      subtitle="Configure competitive rankings"
      iconColor="text-secondary"
    />

    <div className="space-y-4">
      <ToggleSetting
        label="Enable Leaderboards"
        description="Show competitive rankings"
        enabled={settings.enableLeaderboards}
        onChange={() => onSettingChange('enableLeaderboards', !settings.enableLeaderboards)}
      />

      {settings.enableLeaderboards && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Reset Frequency
          </label>
          <select
            value={settings.leaderboardResetFrequency}
            onChange={(e) => onSettingChange('leaderboardResetFrequency', e.target.value)}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            <option value="never">Never</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
      )}
    </div>
  </div>
);

const BadgesManagement = ({ badges, onAddBadge, onToggleBadge }) => (
  <div className="bg-card rounded-xl border border-border p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
          <Icon name="Award" size={20} className="text-warning" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Badges & Achievements</h4>
          <p className="text-sm text-muted-foreground">Manage achievement badges</p>
        </div>
      </div>
      <Button variant="default" size="sm" iconName="Plus" iconPosition="left" onClick={onAddBadge}>
        Add Badge
      </Button>
    </div>

    <div className="space-y-3">
      {badges.map((badge) => (
        <BadgeItem key={badge.id} badge={badge} onToggle={onToggleBadge} />
      ))}
    </div>
  </div>
);

const BadgeItem = ({ badge, onToggle }) => (
  <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
        <Icon name={badge.icon} size={20} className="text-warning" />
      </div>
      <div>
        <div className="font-medium text-foreground">{badge.name}</div>
        <div className="text-sm text-muted-foreground">{badge.description}</div>
        <div className="text-xs text-muted-foreground mt-1">
          Reward: {badge.points} points
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={() => onToggle(badge.id)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          badge.isActive ? 'bg-success' : 'bg-muted'
        }`}
        role="switch"
        aria-checked={badge.isActive}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
          badge.isActive ? 'left-6' : 'left-0.5'
        }`} />
      </button>
      <button className="p-2 hover:bg-accent rounded transition-colors">
        <Icon name="Edit" size={16} className="text-muted-foreground" />
      </button>
      <button className="p-2 hover:bg-accent rounded transition-colors">
        <Icon name="Trash2" size={16} className="text-error" />
      </button>
    </div>
  </div>
);

const LevelSystem = ({ settings, onSettingChange }) => (
  <div className="bg-card rounded-xl border border-border p-6">
    <SectionHeader
      icon="TrendingUp"
      title="Level System"
      subtitle="Configure user progression levels"
      iconColor="text-success"
    />

    <div className="space-y-4">
      <ToggleSetting
        label="Enable Levels"
        description="User progression through levels"
        enabled={settings.enableLevels}
        onChange={() => onSettingChange('enableLevels', !settings.enableLevels)}
      />

      {settings.enableLevels && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Points Per Level
            </label>
            <input
              type="number"
              min="100"
              value={settings.pointsPerLevel}
              onChange={(e) => onSettingChange('pointsPerLevel', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Maximum Level
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={settings.maxLevel}
              onChange={(e) => onSettingChange('maxLevel', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
        </div>
      )}
    </div>
  </div>
);

// Main Component
const GamificationSettings = () => {
  const {
    settings,
    badges,
    handleSettingChange,
    handleAddBadge,
    handleToggleBadge
  } = useGamification();

  return (
    <div className="space-y-6">
      <GamificationHeader />
      
      <PointsSystem 
        settings={settings} 
        onSettingChange={handleSettingChange} 
      />
      
      <LeaderboardSettings 
        settings={settings} 
        onSettingChange={handleSettingChange} 
      />
      
      <BadgesManagement 
        badges={badges}
        onAddBadge={handleAddBadge}
        onToggleBadge={handleToggleBadge}
      />
      
      <LevelSystem 
        settings={settings} 
        onSettingChange={handleSettingChange} 
      />
    </div>
  );
};

export default GamificationSettings;