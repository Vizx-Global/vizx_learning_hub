import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import LiveUpdateIndicator from '../../../components/ui/LiveUpdateIndicator';

const IntegrationStatusPanel = ({ onSync, onResolveConflict }) => {
  const [syncStatus, setSyncStatus] = useState('connected');
  const [lastSync, setLastSync] = useState(new Date(Date.now() - 300000)); // 5 minutes ago
  const [updateCount, setUpdateCount] = useState(0);

  const integrationData = {
    microsoftLearn: {
      status: 'connected',
      lastSync: new Date(Date.now() - 180000), // 3 minutes ago
      totalModules: 1247,
      syncedModules: 1245,
      pendingUpdates: 2,
      errors: 0,
      apiHealth: 'healthy'
    },
    scorm: {
      status: 'connected',
      lastSync: new Date(Date.now() - 600000), // 10 minutes ago
      totalPackages: 45,
      validPackages: 43,
      invalidPackages: 2,
      errors: 2
    },
    lms: {
      status: 'syncing',
      lastSync: new Date(Date.now() - 120000), // 2 minutes ago
      totalUsers: 1250,
      syncedUsers: 1248,
      pendingSync: 2,
      errors: 0
    }
  };

  const conflicts = [
    {
      id: 'conflict-1',
      type: 'version',
      module: 'Introduction to Machine Learning',
      description: 'Local version (v2.1) conflicts with Microsoft Learn version (v2.3)',
      severity: 'medium',
      timestamp: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      id: 'conflict-2',
      type: 'content',
      module: 'AI Ethics Fundamentals',
      description: 'Custom quiz questions conflict with updated Microsoft Learn content',
      severity: 'low',
      timestamp: new Date(Date.now() - 7200000) // 2 hours ago
    }
  ];

  const notifications = [
    {
      id: 'notif-1',
      type: 'update',
      title: 'New Microsoft Learn modules available',
      message: '12 new AI modules have been published and are ready for integration',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      action: 'Review Updates'
    },
    {
      id: 'notif-2',
      type: 'warning',
      title: 'SCORM package validation failed',
      message: '2 SCORM packages failed validation and need attention',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      action: 'View Details'
    },
    {
      id: 'notif-3',
      type: 'success',
      title: 'Bulk sync completed',
      message: 'Successfully synchronized 45 learning paths with Microsoft Learn',
      timestamp: new Date(Date.now() - 5400000), // 1.5 hours ago
      action: 'View Report'
    }
  ];

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setUpdateCount(prev => prev + 1);
        setLastSync(new Date());
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleManualSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('connected');
      setLastSync(new Date());
      setUpdateCount(prev => prev + 1);
      onSync();
    }, 3000);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-error bg-error/10 border-error/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'low': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'update': return 'Download';
      case 'warning': return 'AlertTriangle';
      case 'success': return 'CheckCircle';
      case 'error': return 'XCircle';
      default: return 'Bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'update': return 'text-primary';
      case 'warning': return 'text-warning';
      case 'success': return 'text-success';
      case 'error': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Integration Status Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-foreground">Integration Status</h3>
            <p className="text-sm text-muted-foreground">Real-time sync with external systems</p>
          </div>
          <div className="flex items-center gap-2">
            <LiveUpdateIndicator
              type="sync"
              status={syncStatus}
              lastUpdate={lastSync}
              updateCount={updateCount}
            />
            <Button
              variant="outline"
              size="sm"
              iconName="RefreshCw"
              iconPosition="left"
              onClick={handleManualSync}
              loading={syncStatus === 'syncing'}
            >
              Manual Sync
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Microsoft Learn */}
          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="BookOpen" size={16} className="text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Microsoft Learn</h4>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-xs text-success">Connected</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modules:</span>
                <span className="font-medium text-foreground">
                  {integrationData?.microsoftLearn?.syncedModules}/{integrationData?.microsoftLearn?.totalModules}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending:</span>
                <span className="font-medium text-warning">
                  {integrationData?.microsoftLearn?.pendingUpdates}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Sync:</span>
                <span className="font-medium text-foreground">
                  {Math.floor((Date.now() - integrationData?.microsoftLearn?.lastSync) / 60000)}m ago
                </span>
              </div>
            </div>
          </div>

          {/* SCORM */}
          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Icon name="Package" size={16} className="text-secondary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">SCORM</h4>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-warning rounded-full" />
                  <span className="text-xs text-warning">Issues</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valid:</span>
                <span className="font-medium text-foreground">
                  {integrationData?.scorm?.validPackages}/{integrationData?.scorm?.totalPackages}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Errors:</span>
                <span className="font-medium text-error">
                  {integrationData?.scorm?.errors}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Sync:</span>
                <span className="font-medium text-foreground">
                  {Math.floor((Date.now() - integrationData?.scorm?.lastSync) / 60000)}m ago
                </span>
              </div>
            </div>
          </div>

          {/* LMS */}
          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="Users" size={16} className="text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">LMS Integration</h4>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-xs text-primary">Syncing</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Users:</span>
                <span className="font-medium text-foreground">
                  {integrationData?.lms?.syncedUsers}/{integrationData?.lms?.totalUsers}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending:</span>
                <span className="font-medium text-primary">
                  {integrationData?.lms?.pendingSync}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Sync:</span>
                <span className="font-medium text-foreground">
                  {Math.floor((Date.now() - integrationData?.lms?.lastSync) / 60000)}m ago
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Version Conflicts */}
      {conflicts?.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Version Conflicts</h3>
              <p className="text-sm text-muted-foreground">{conflicts?.length} conflicts require attention</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconName="Settings"
              iconPosition="left"
            >
              Resolve All
            </Button>
          </div>

          <div className="space-y-3">
            {conflicts?.map((conflict) => (
              <div key={conflict?.id} className={`p-4 border rounded-lg ${getSeverityColor(conflict?.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="AlertTriangle" size={16} />
                      <span className="font-medium">{conflict?.module}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSeverityColor(conflict?.severity)}`}>
                        {conflict?.severity}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{conflict?.description}</p>
                    <p className="text-xs opacity-75">
                      {Math.floor((Date.now() - conflict?.timestamp) / 3600000)} hours ago
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResolveConflict(conflict?.id)}
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Recent Notifications */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Recent Notifications</h3>
            <p className="text-sm text-muted-foreground">Latest system updates and alerts</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="MoreHorizontal"
          >
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {notifications?.map((notification) => (
            <div key={notification?.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getNotificationColor(notification?.type)} bg-current/10`}>
                <Icon name={getNotificationIcon(notification?.type)} size={16} className={getNotificationColor(notification?.type)} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm">{notification?.title}</h4>
                <p className="text-sm text-muted-foreground mb-1">{notification?.message}</p>
                <p className="text-xs text-muted-foreground">
                  {Math.floor((Date.now() - notification?.timestamp) / 60000)} minutes ago
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                {notification?.action}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationStatusPanel;