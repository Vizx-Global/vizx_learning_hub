import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';

const SyncLogsPanel = ({ selectedItem }) => {
  const [logs, setLogs] = useState([]);
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const syncLogs = [
    {
      id: 1,
      timestamp: new Date('2025-01-06T19:15:30'),
      level: 'success',
      type: 'content_update',
      message: 'Successfully synchronized "Introduction to AI" module',
      details: 'Updated 3 lessons, 2 assessments, and 1 lab exercise',
      itemId: 'intro-ai',
      itemName: 'Introduction to AI',
      duration: '2.3s',
      apiCalls: 5
    },
    {
      id: 2,
      timestamp: new Date('2025-01-06T19:14:45'),
      level: 'info',
      type: 'sync_start',
      message: 'Starting bulk synchronization for AI Fundamentals learning path',
      details: 'Processing 12 modules with 45 total lessons',
      itemId: 'ai-fundamentals',
      itemName: 'AI Fundamentals',
      duration: null,
      apiCalls: 0
    },
    {
      id: 3,
      timestamp: new Date('2025-01-06T19:13:20'),
      level: 'warning',
      type: 'rate_limit',
      message: 'API rate limit approaching for Microsoft Graph endpoint',
      details: 'Current usage: 4,850/5,000 requests per hour. Implementing throttling.',
      itemId: null,
      itemName: null,
      duration: null,
      apiCalls: 4850
    },
    {
      id: 4,
      timestamp: new Date('2025-01-06T19:12:10'),
      level: 'error',
      type: 'sync_failed',
      message: 'Failed to synchronize "Neural Networks Overview" module',
      details: 'HTTP 429: Too Many Requests. Retry scheduled in 15 minutes.',
      itemId: 'neural-networks',
      itemName: 'Neural Networks Overview',
      duration: '0.8s',
      apiCalls: 1,
      error: 'Rate limit exceeded'
    },
    {
      id: 5,
      timestamp: new Date('2025-01-06T19:11:30'),
      level: 'info',
      type: 'conflict_resolved',
      message: 'Content conflict resolved for "Computer Vision" module',
      details: 'Local version updated to match Microsoft Learn source (v2.1.3)',
      itemId: 'computer-vision',
      itemName: 'Computer Vision',
      duration: '1.2s',
      apiCalls: 3
    },
    {
      id: 6,
      timestamp: new Date('2025-01-06T19:10:45'),
      level: 'success',
      type: 'batch_complete',
      message: 'Batch synchronization completed successfully',
      details: 'Processed 8 modules, 0 errors, 1 warning. Next sync in 30 minutes.',
      itemId: null,
      itemName: null,
      duration: '45.2s',
      apiCalls: 127
    },
    {
      id: 7,
      timestamp: new Date('2025-01-06T19:09:15'),
      level: 'info',
      type: 'auth_refresh',
      message: 'Microsoft Graph authentication token refreshed',
      details: 'New token valid until 2025-01-07T19:09:15Z',
      itemId: null,
      itemName: null,
      duration: '0.3s',
      apiCalls: 1
    },
    {
      id: 8,
      timestamp: new Date('2025-01-06T19:08:00'),
      level: 'warning',
      type: 'version_mismatch',
      message: 'Version mismatch detected for "Python for Data Science"',
      details: 'Local: v1.2.1, Remote: v1.2.3. Manual review required.',
      itemId: 'python-basics',
      itemName: 'Python for Data Science',
      duration: null,
      apiCalls: 2
    }
  ];

  useEffect(() => {
    setLogs(syncLogs);
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate new log entry
        const newLog = {
          id: Date.now(),
          timestamp: new Date(),
          level: 'info',
          type: 'heartbeat',
          message: 'System health check completed',
          details: 'All services operational. API response time: 120ms',
          itemId: null,
          itemName: null,
          duration: '0.1s',
          apiCalls: 1
        };
        setLogs(prev => [newLog, ...prev?.slice(0, 49)]);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getLevelConfig = (level) => {
    switch (level) {
      case 'success':
        return {
          icon: 'CheckCircle',
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20'
        };
      case 'error':
        return {
          icon: 'XCircle',
          color: 'text-error',
          bgColor: 'bg-error/10',
          borderColor: 'border-error/20'
        };
      case 'warning':
        return {
          icon: 'AlertTriangle',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20'
        };
      case 'info':
      default:
        return {
          icon: 'Info',
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/20'
        };
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      content_update: 'Content Update',
      sync_start: 'Sync Started',
      sync_failed: 'Sync Failed',
      rate_limit: 'Rate Limit',
      conflict_resolved: 'Conflict Resolved',
      batch_complete: 'Batch Complete',
      auth_refresh: 'Auth Refresh',
      version_mismatch: 'Version Mismatch',
      heartbeat: 'Health Check'
    };
    return types?.[type] || type;
  };

  const filteredLogs = logs?.filter(log => {
    const matchesLevel = filterLevel === 'all' || log?.level === filterLevel;
    const matchesType = filterType === 'all' || log?.type === filterType;
    const matchesSearch = searchTerm === '' || 
      log?.message?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      log?.details?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      (log?.itemName && log?.itemName?.toLowerCase()?.includes(searchTerm?.toLowerCase()));
    
    return matchesLevel && matchesType && matchesSearch;
  });

  const formatTimestamp = (date) => {
    return date?.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Type', 'Message', 'Details', 'Item', 'Duration', 'API Calls']?.join(','),
      ...filteredLogs?.map(log => [
        log?.timestamp?.toISOString(),
        log?.level,
        log?.type,
        `"${log?.message}"`,
        `"${log?.details}"`,
        log?.itemName || '',
        log?.duration || '',
        log?.apiCalls || ''
      ]?.join(','))
    ]?.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sync-logs-${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
    a?.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Synchronization Logs</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                transition-colors duration-200
                ${autoRefresh 
                  ? 'bg-success/10 text-success border border-success/20' :'bg-muted text-muted-foreground border border-border'
                }
              `}
            >
              <Icon name="RefreshCw" size={14} className={autoRefresh ? 'animate-spin' : ''} />
              Auto Refresh
            </button>
            <button
              onClick={exportLogs}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors duration-200"
            >
              <Icon name="Download" size={14} />
              Export
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Icon
              name="Search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e?.target?.value)}
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Levels</option>
            <option value="success">Success</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e?.target?.value)}
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Types</option>
            <option value="content_update">Content Update</option>
            <option value="sync_start">Sync Started</option>
            <option value="sync_failed">Sync Failed</option>
            <option value="rate_limit">Rate Limit</option>
            <option value="conflict_resolved">Conflict Resolved</option>
            <option value="batch_complete">Batch Complete</option>
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredLogs?.map((log) => {
            const levelConfig = getLevelConfig(log?.level);
            
            return (
              <div
                key={log?.id}
                className={`
                  p-4 rounded-lg border transition-all duration-200 hover:shadow-sm
                  ${levelConfig?.bgColor} ${levelConfig?.borderColor}
                `}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    name={levelConfig?.icon}
                    size={18}
                    className={`${levelConfig?.color} flex-shrink-0 mt-0.5`}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {log?.message}
                      </span>
                      <span className={`
                        text-xs px-2 py-0.5 rounded-full font-medium
                        ${levelConfig?.bgColor} ${levelConfig?.color}
                      `}>
                        {getTypeLabel(log?.type)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {log?.details}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="font-mono">
                        {formatTimestamp(log?.timestamp)}
                      </span>
                      {log?.itemName && (
                        <span className="flex items-center gap-1">
                          <Icon name="FileText" size={12} />
                          {log?.itemName}
                        </span>
                      )}
                      {log?.duration && (
                        <span className="flex items-center gap-1">
                          <Icon name="Clock" size={12} />
                          {log?.duration}
                        </span>
                      )}
                      {log?.apiCalls > 0 && (
                        <span className="flex items-center gap-1">
                          <Icon name="Zap" size={12} />
                          {log?.apiCalls} API calls
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredLogs?.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No logs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {filteredLogs?.length} of {logs?.length} logs</span>
          <div className="flex items-center gap-4">
            <span>Last updated: {formatTimestamp(new Date())}</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
              <span>{autoRefresh ? 'Live' : 'Paused'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncLogsPanel;