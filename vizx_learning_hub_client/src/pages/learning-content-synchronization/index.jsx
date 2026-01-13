import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationSidebar from '../../components/ui/NavigationSidebar';
import Icon from '../../components/AppIcon';
import ContentHierarchy from './components/ContentHierachy';
import SyncLogsPanel from './components/SyncLogsPanel';
import SystemHealthPanel from './components/SystemHealthPanel';
import BulkOperationsToolbar from './components/BulkOperationToolbar';

const LearningContentSynchronization = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUser] = useState({
    name: 'Admin User',
    role: 'admin',
    permissions: ['sync_management', 'bulk_operations', 'system_config']
  });

  // Real-time sync status
  const [syncStats, setSyncStats] = useState({
    totalItems: 35,
    syncedItems: 30,
    syncingItems: 3,
    errorItems: 1,
    conflictItems: 1,
    lastSyncTime: new Date('2025-01-06T19:15:30'),
    nextSyncTime: new Date('2025-01-06T19:45:30')
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSyncStats(prev => ({
        ...prev,
        syncingItems: Math.max(0, prev?.syncingItems + (Math.random() > 0.7 ? -1 : 0)),
        syncedItems: Math.min(prev?.totalItems, prev?.syncedItems + (Math.random() > 0.8 ? 1 : 0))
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleItemSelect = (item) => {
    setSelectedItem(item);
  };

  const handleBulkAction = (actionId, items) => {
    console.log(`Executing bulk action: ${actionId} on ${items?.length} items`);
    
    // Simulate bulk operation effects
    switch (actionId) {
      case 'sync_all':
        setSyncStats(prev => ({
          ...prev,
          syncingItems: prev?.syncingItems + items?.length,
          syncedItems: Math.max(0, prev?.syncedItems - items?.length)
        }));
        break;
      case 'resolve_conflicts':
        setSyncStats(prev => ({
          ...prev,
          conflictItems: Math.max(0, prev?.conflictItems - 1),
          syncedItems: prev?.syncedItems + 1
        }));
        break;
      default:
        break;
    }
    
    // Clear selection after action
    setSelectedItems([]);
  };

  const formatLastSync = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m ago`;
  };

  const getSyncHealthStatus = () => {
    const errorRate = (syncStats?.errorItems / syncStats?.totalItems) * 100;
    if (errorRate > 10) return { status: 'error', color: 'text-error', label: 'Critical' };
    if (errorRate > 5) return { status: 'warning', color: 'text-warning', label: 'Warning' };
    return { status: 'healthy', color: 'text-success', label: 'Healthy' };
  };

  const healthStatus = getSyncHealthStatus();

  return (
    <div className="min-h-screen bg-background">
      <NavigationSidebar 
        isCollapsed={sidebarCollapsed}
        userRole={currentUser?.role}
      />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-72'}`}>
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-accent rounded-lg transition-colors duration-200"
              >
                <Icon name="Menu" size={20} className="text-muted-foreground" />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Learning Content Synchronization
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage Microsoft Learn integration and content synchronization
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Sync Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
                <Icon
                  name="RefreshCw"
                  size={16}
                  className={`${syncStats?.syncingItems > 0 ? 'animate-spin text-primary' : 'text-success'}`}
                />
                <span className="text-sm font-medium text-foreground">
                  {syncStats?.syncingItems > 0 ? 'Syncing...' : 'Up to date'}
                </span>
              </div>
              
              {/* Health Status */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                healthStatus?.status === 'error' ? 'bg-error/10' :
                healthStatus?.status === 'warning' ? 'bg-warning/10' : 'bg-success/10'
              }`}>
                <Icon
                  name={healthStatus?.status === 'error' ? 'AlertCircle' : 
                        healthStatus?.status === 'warning' ? 'AlertTriangle' : 'CheckCircle'}
                  size={16}
                  className={healthStatus?.color}
                />
                <span className={`text-sm font-medium ${healthStatus?.color}`}>
                  {healthStatus?.label}
                </span>
              </div>
              
              {/* Last Sync Time */}
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  Last sync: {formatLastSync(syncStats?.lastSyncTime)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Next sync in {Math.floor((syncStats?.nextSyncTime - new Date()) / 60000)}m
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Bulk Operations Toolbar */}
        <BulkOperationsToolbar
          selectedItems={selectedItems}
          onBulkAction={handleBulkAction}
          totalItems={syncStats?.totalItems}
        />

        {/* Main Content */}
        <div className="flex h-[calc(100vh-200px)]">
          {/* Left Panel - Content Hierarchy */}
          <div className="w-1/4 min-w-[300px]">
            <ContentHierarchy
              onItemSelect={handleItemSelect}
              selectedItem={selectedItem}
            />
          </div>
          
          {/* Center Panel - Sync Logs */}
          <div className="flex-1 min-w-0">
            <SyncLogsPanel selectedItem={selectedItem} />
          </div>
          
          {/* Right Panel - System Health */}
          <div className="w-1/4 min-w-[300px]">
            <SystemHealthPanel />
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-card border-t border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full" />
                <span className="text-sm text-muted-foreground">
                  {syncStats?.syncedItems} Synced
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  {syncStats?.syncingItems} Syncing
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning rounded-full" />
                <span className="text-sm text-muted-foreground">
                  {syncStats?.conflictItems} Conflicts
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-error rounded-full" />
                <span className="text-sm text-muted-foreground">
                  {syncStats?.errorItems} Errors
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Microsoft Graph API: Connected</span>
              <span>•</span>
              <span>Rate Limit: 4,850/5,000</span>
              <span>•</span>
              <span>Response Time: 120ms</span>
            </div>
          </div>
        </div>
      </div>
      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4">
        <button
          className="p-3 bg-card border border-border rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
          title="Keyboard Shortcuts (Ctrl+?)"
        >
          <Icon name="Keyboard" size={20} className="text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default LearningContentSynchronization;