import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const SystemHealthPanel = () => {
  const [healthMetrics, setHealthMetrics] = useState({
    apiHealth: 'healthy',
    authStatus: 'authenticated',
    syncStatus: 'active',
    lastSync: new Date('2025-01-06T19:15:30'),
    nextSync: new Date('2025-01-06T19:45:30'),
    rateLimitUsage: 4850,
    rateLimitMax: 5000,
    responseTime: 120,
    uptime: 99.97,
    activeConnections: 12,
    queuedJobs: 3,
    completedToday: 127,
    errorsToday: 2
  });

  const [scheduleConfig, setScheduleConfig] = useState({
    autoSync: true,
    syncInterval: 30,
    batchSize: 10,
    retryAttempts: 3,
    retryDelay: 15
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setHealthMetrics(prev => ({
        ...prev,
        responseTime: Math.floor(Math.random() * 100) + 80,
        activeConnections: Math.floor(Math.random() * 10) + 8,
        rateLimitUsage: Math.min(prev?.rateLimitUsage + Math.floor(Math.random() * 5), prev?.rateLimitMax)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = (status) => {
    switch (status) {
      case 'healthy':
        return { icon: 'CheckCircle', color: 'text-success', label: 'Healthy' };
      case 'warning':
        return { icon: 'AlertTriangle', color: 'text-warning', label: 'Warning' };
      case 'error':
        return { icon: 'XCircle', color: 'text-error', label: 'Error' };
      default:
        return { icon: 'Circle', color: 'text-muted-foreground', label: 'Unknown' };
    }
  };

  const formatUptime = (uptime) => {
    return `${uptime?.toFixed(2)}%`;
  };

  const formatDuration = (date) => {
    const now = new Date();
    const diffMs = Math.abs(now - date);
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
  };

  const getRateLimitStatus = () => {
    const percentage = (healthMetrics?.rateLimitUsage / healthMetrics?.rateLimitMax) * 100;
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'healthy';
  };

  const handleConfigChange = (key, value) => {
    setScheduleConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const triggerManualSync = () => {
    // Simulate manual sync trigger
    setHealthMetrics(prev => ({
      ...prev,
      syncStatus: 'syncing',
      queuedJobs: prev?.queuedJobs + 1
    }));

    setTimeout(() => {
      setHealthMetrics(prev => ({
        ...prev,
        syncStatus: 'active',
        lastSync: new Date(),
        queuedJobs: Math.max(prev?.queuedJobs - 1, 0),
        completedToday: prev?.completedToday + 1
      }));
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">System Health</h2>
        
        {/* Health Overview */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">API Health</span>
              <div className="flex items-center gap-1">
                <Icon
                  name={getHealthStatus(healthMetrics?.apiHealth)?.icon}
                  size={16}
                  className={getHealthStatus(healthMetrics?.apiHealth)?.color}
                />
                <span className={`text-sm font-medium ${getHealthStatus(healthMetrics?.apiHealth)?.color}`}>
                  {getHealthStatus(healthMetrics?.apiHealth)?.label}
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Response time: {healthMetrics?.responseTime}ms
            </div>
          </div>
          
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Authentication</span>
              <div className="flex items-center gap-1">
                <Icon
                  name="Shield"
                  size={16}
                  className="text-success"
                />
                <span className="text-sm font-medium text-success">
                  Active
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Token expires in 23h 45m
            </div>
          </div>
        </div>

        {/* Rate Limiting */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">API Rate Limit</span>
            <span className="text-sm font-mono text-muted-foreground">
              {healthMetrics?.rateLimitUsage?.toLocaleString()}/{healthMetrics?.rateLimitMax?.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`
                h-2 rounded-full transition-all duration-300
                ${getRateLimitStatus() === 'error' ? 'bg-error' :
                  getRateLimitStatus() === 'warning' ? 'bg-warning' : 'bg-success'
                }
              `}
              style={{ width: `${(healthMetrics?.rateLimitUsage / healthMetrics?.rateLimitMax) * 100}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Resets in 45 minutes
          </div>
        </div>

        {/* Sync Statistics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-semibold text-foreground">
              {healthMetrics?.completedToday}
            </div>
            <div className="text-xs text-muted-foreground">Completed Today</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-semibold text-foreground">
              {healthMetrics?.queuedJobs}
            </div>
            <div className="text-xs text-muted-foreground">Queued Jobs</div>
          </div>
        </div>
      </div>
      {/* Sync Schedule Configuration */}
      <div className="p-4 border-b border-border">
        <h3 className="text-md font-semibold text-foreground mb-4">Sync Configuration</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Auto Sync</span>
            <button
              onClick={() => handleConfigChange('autoSync', !scheduleConfig?.autoSync)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${scheduleConfig?.autoSync ? 'bg-primary' : 'bg-muted'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${scheduleConfig?.autoSync ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
          
          <div>
            <label className="text-sm text-foreground mb-2 block">
              Sync Interval (minutes)
            </label>
            <select
              value={scheduleConfig?.syncInterval}
              onChange={(e) => handleConfigChange('syncInterval', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={240}>4 hours</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm text-foreground mb-2 block">
              Batch Size
            </label>
            <select
              value={scheduleConfig?.batchSize}
              onChange={(e) => handleConfigChange('batchSize', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={5}>5 items</option>
              <option value={10}>10 items</option>
              <option value={20}>20 items</option>
              <option value={50}>50 items</option>
            </select>
          </div>
        </div>
      </div>
      {/* Manual Actions */}
      <div className="p-4 border-b border-border">
        <h3 className="text-md font-semibold text-foreground mb-4">Manual Actions</h3>
        
        <div className="space-y-3">
          <button
            onClick={triggerManualSync}
            disabled={healthMetrics?.syncStatus === 'syncing'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Icon
              name="RefreshCw"
              size={16}
              className={healthMetrics?.syncStatus === 'syncing' ? 'animate-spin' : ''}
            />
            {healthMetrics?.syncStatus === 'syncing' ? 'Syncing...' : 'Trigger Sync'}
          </button>
          
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors duration-200">
            <Icon name="RotateCcw" size={16} />
            Reset Cache
          </button>
          
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors duration-200">
            <Icon name="Download" size={16} />
            Export Config
          </button>
        </div>
      </div>
      {/* System Status */}
      <div className="flex-1 p-4">
        <h3 className="text-md font-semibold text-foreground mb-4">System Status</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Uptime</span>
            <span className="text-sm font-mono text-foreground">
              {formatUptime(healthMetrics?.uptime)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active Connections</span>
            <span className="text-sm font-mono text-foreground">
              {healthMetrics?.activeConnections}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last Sync</span>
            <span className="text-sm font-mono text-foreground">
              {formatDuration(healthMetrics?.lastSync)} ago
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Next Sync</span>
            <span className="text-sm font-mono text-foreground">
              in {formatDuration(healthMetrics?.nextSync)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Errors Today</span>
            <span className={`text-sm font-mono ${healthMetrics?.errorsToday > 0 ? 'text-error' : 'text-success'}`}>
              {healthMetrics?.errorsToday}
            </span>
          </div>
        </div>
      </div>
      {/* Live Indicator */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">System Monitoring Active</span>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthPanel;