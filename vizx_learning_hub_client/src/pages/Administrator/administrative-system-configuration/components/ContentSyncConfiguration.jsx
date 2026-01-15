import React, { useState, useCallback } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

// Constants and Types
const SYNC_SETTINGS_INITIAL = {
  autoSync: true,
  syncFrequency: 'daily',
  syncTime: '02:00',
  lastSync: new Date(Date.now() - 3600000),
  nextSync: new Date(Date.now() + 82800000),
  apiEndpoint: 'https://learn.microsoft.com/api/v1',
  apiKey: '••••••••••••••••',
  enableWebhooks: true,
  webhookUrl: 'https://yourapp.com/webhooks/microsoft-learn',
  syncModules: true,
  syncPaths: true,
  syncAssessments: true,
  contentLanguages: ['en', 'es', 'fr']
};

const SYNC_HISTORY_INITIAL = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 3600000),
    status: 'success',
    itemsSynced: 45,
    duration: '2m 34s',
    type: 'scheduled'
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 90000000),
    status: 'success',
    itemsSynced: 42,
    duration: '2m 12s',
    type: 'scheduled'
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 176400000),
    status: 'partial',
    itemsSynced: 38,
    duration: '3m 45s',
    type: 'manual',
    errors: 2
  }
];

const CONTENT_OPTIONS = [
  { 
    key: 'syncModules', 
    label: 'Learning Modules', 
    description: 'Individual learning modules and lessons' 
  },
  { 
    key: 'syncPaths', 
    label: 'Learning Paths', 
    description: 'Complete learning path collections' 
  },
  { 
    key: 'syncAssessments', 
    label: 'Assessments', 
    description: 'Quizzes and knowledge checks' 
  }
];

const SYNC_FREQUENCIES = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' }
];

// Custom Hook
const useContentSync = () => {
  const [syncSettings, setSyncSettings] = useState(SYNC_SETTINGS_INITIAL);
  const [syncHistory, setSyncHistory] = useState(SYNC_HISTORY_INITIAL);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSettingChange = useCallback((field, value) => {
    setSyncSettings(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleManualSync = useCallback(() => {
    setIsSyncing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSyncing(false);
      const newSync = {
        id: syncHistory.length + 1,
        timestamp: new Date(),
        status: 'success',
        itemsSynced: Math.floor(Math.random() * 50) + 40,
        duration: `${Math.floor(Math.random() * 2) + 2}m ${Math.floor(Math.random() * 60)}s`,
        type: 'manual'
      };
      
      setSyncHistory(prev => [newSync, ...prev]);
      setSyncSettings(prev => ({
        ...prev,
        lastSync: new Date(),
        nextSync: new Date(Date.now() + 82800000) // 23 hours from now
      }));
    }, 3000);
  }, [syncHistory.length]);

  const handleExportLogs = useCallback(() => {
    console.log('Exporting sync logs:', syncHistory);
    // Implement export functionality
  }, [syncHistory]);

  return {
    syncSettings,
    syncHistory,
    isSyncing,
    handleSettingChange,
    handleManualSync,
    handleExportLogs
  };
};

// Sub-components
const ContentSyncHeader = () => (
  <div>
    <h3 className="text-lg font-semibold text-foreground">Content Synchronization</h3>
    <p className="text-sm text-muted-foreground">
      Configure Microsoft Learn content sync settings
    </p>
  </div>
);

const SyncStatusCard = ({ syncSettings, isSyncing, onManualSync }) => (
  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20 p-6">
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon name="Cloud" size={24} className="text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-1">Sync Status</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Last synced {syncSettings.lastSync.toLocaleString()}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-success font-medium">Connected</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Next sync: {syncSettings.nextSync.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <Button
        variant="default"
        iconName="RefreshCw"
        iconPosition="left"
        onClick={onManualSync}
        disabled={isSyncing}
      >
        {isSyncing ? 'Syncing...' : 'Sync Now'}
      </Button>
    </div>

    {isSyncing && <SyncProgress />}
  </div>
);

const SyncProgress = () => (
  <div className="bg-white/50 rounded-lg p-4">
    <div className="flex items-center gap-3">
      <Icon name="Loader" size={20} className="text-primary animate-spin" />
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground mb-2">Syncing content...</div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="h-full bg-primary rounded-full animate-pulse" 
            style={{ width: '60%' }} 
          />
        </div>
      </div>
    </div>
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

const ApiConfiguration = ({ syncSettings, onSettingChange }) => (
  <div className="bg-card rounded-xl border border-border p-6">
    <SectionHeader
      icon="Key"
      title="API Configuration"
      subtitle="Microsoft Learn API credentials"
      iconColor="text-secondary"
    />

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          API Endpoint
        </label>
        <input
          type="url"
          value={syncSettings.apiEndpoint}
          onChange={(e) => onSettingChange('apiEndpoint', e.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          API Key
        </label>
        <div className="flex gap-2">
          <input
            type="password"
            value={syncSettings.apiKey}
            onChange={(e) => onSettingChange('apiKey', e.target.value)}
            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
          <Button variant="outline" iconName="Eye">
            Show
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const SyncSchedule = ({ syncSettings, onSettingChange }) => (
  <div className="bg-card rounded-xl border border-border p-6">
    <SectionHeader
      icon="Clock"
      title="Sync Schedule"
      subtitle="Configure automatic sync timing"
      iconColor="text-warning"
    />

    <div className="space-y-4">
      <ToggleSetting
        label="Automatic Sync"
        description="Enable scheduled content synchronization"
        enabled={syncSettings.autoSync}
        onChange={() => onSettingChange('autoSync', !syncSettings.autoSync)}
      />

      {syncSettings.autoSync && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Frequency
            </label>
            <select
              value={syncSettings.syncFrequency}
              onChange={(e) => onSettingChange('syncFrequency', e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              {SYNC_FREQUENCIES.map(freq => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Sync Time (24h format)
            </label>
            <input
              type="time"
              value={syncSettings.syncTime}
              onChange={(e) => onSettingChange('syncTime', e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
        </div>
      )}
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

const ContentOptions = ({ syncSettings, onSettingChange }) => (
  <div className="bg-card rounded-xl border border-border p-6">
    <SectionHeader
      icon="BookOpen"
      title="Content Types"
      subtitle="Select content to synchronize"
      iconColor="text-success"
    />

    <div className="space-y-3">
      {CONTENT_OPTIONS.map((option) => (
        <ToggleSetting
          key={option.key}
          label={option.label}
          description={option.description}
          enabled={syncSettings[option.key]}
          onChange={() => onSettingChange(option.key, !syncSettings[option.key])}
        />
      ))}
    </div>
  </div>
);

const SyncHistory = ({ syncHistory, onExportLogs }) => (
  <div className="bg-card rounded-xl border border-border p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h4 className="font-semibold text-foreground">Sync History</h4>
        <p className="text-sm text-muted-foreground">Recent synchronization logs</p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        iconName="Download"
        onClick={onExportLogs}
      >
        Export Logs
      </Button>
    </div>

    <div className="space-y-3">
      {syncHistory.map((sync) => (
        <SyncHistoryItem key={sync.id} sync={sync} />
      ))}
    </div>
  </div>
);

const SyncHistoryItem = ({ sync }) => {
  const statusConfig = {
    success: { color: 'success', icon: 'CheckCircle' },
    partial: { color: 'warning', icon: 'AlertCircle' },
    error: { color: 'error', icon: 'XCircle' }
  };

  const config = statusConfig[sync.status] || statusConfig.success;

  return (
    <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 bg-${config.color}/10 rounded-full flex items-center justify-center`}>
          <Icon 
            name={config.icon}
            size={20}
            className={`text-${config.color}`}
          />
        </div>
        <div>
          <div className="font-medium text-foreground">
            {sync.type === 'manual' ? 'Manual Sync' : 'Scheduled Sync'}
          </div>
          <div className="text-sm text-muted-foreground">
            {sync.timestamp.toLocaleString()} • {sync.itemsSynced} items • {sync.duration}
          </div>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${config.color}/10 text-${config.color}`}>
        {sync.status}
      </span>
    </div>
  );
};

// Main Component
const ContentSyncConfig = () => {
  const {
    syncSettings,
    syncHistory,
    isSyncing,
    handleSettingChange,
    handleManualSync,
    handleExportLogs
  } = useContentSync();

  return (
    <div className="space-y-6">
      <ContentSyncHeader />
      
      <SyncStatusCard 
        syncSettings={syncSettings}
        isSyncing={isSyncing}
        onManualSync={handleManualSync}
      />
      
      <ApiConfiguration 
        syncSettings={syncSettings}
        onSettingChange={handleSettingChange}
      />
      
      <SyncSchedule 
        syncSettings={syncSettings}
        onSettingChange={handleSettingChange}
      />
      
      <ContentOptions 
        syncSettings={syncSettings}
        onSettingChange={handleSettingChange}
      />
      
      <SyncHistory 
        syncHistory={syncHistory}
        onExportLogs={handleExportLogs}
      />
    </div>
  );
};

export default ContentSyncConfig;