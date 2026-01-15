import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

// Constants and Types
const SEVERITY_TYPES = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info'
};

const FILTER_TYPES = {
  ALL: 'all',
  USER: 'user',
  SETTINGS: 'settings',
  SYNC: 'sync',
  SECURITY: 'security'
};

const SEVERITY_CONFIG = {
  [SEVERITY_TYPES.SUCCESS]: {
    color: 'text-success bg-success/10',
    icon: 'CheckCircle',
    label: 'Success'
  },
  [SEVERITY_TYPES.WARNING]: {
    color: 'text-warning bg-warning/10',
    icon: 'AlertTriangle',
    label: 'Warning'
  },
  [SEVERITY_TYPES.ERROR]: {
    color: 'text-error bg-error/10',
    icon: 'XCircle',
    label: 'Error'
  },
  [SEVERITY_TYPES.INFO]: {
    color: 'text-primary bg-primary/10',
    icon: 'Info',
    label: 'Info'
  }
};

const MOCK_LOGS = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 300000),
    user: 'admin@company.com',
    action: 'user.created',
    details: 'Created new user: sarah.chen@company.com',
    ipAddress: '192.168.1.100',
    severity: SEVERITY_TYPES.INFO
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 600000),
    user: 'admin@company.com',
    action: 'settings.updated',
    details: 'Updated gamification settings',
    ipAddress: '192.168.1.100',
    severity: SEVERITY_TYPES.INFO
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 900000),
    user: 'system',
    action: 'sync.completed',
    details: 'Microsoft Learn content sync completed (45 items)',
    ipAddress: 'internal',
    severity: SEVERITY_TYPES.SUCCESS
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 1200000),
    user: 'manager@company.com',
    action: 'user.role_changed',
    details: 'Changed role for michael.r@company.com from employee to manager',
    ipAddress: '192.168.1.105',
    severity: SEVERITY_TYPES.WARNING
  },
  {
    id: 5,
    timestamp: new Date(Date.now() - 1500000),
    user: 'system',
    action: 'security.failed_login',
    details: 'Failed login attempt for user@example.com (5 attempts)',
    ipAddress: '203.0.113.45',
    severity: SEVERITY_TYPES.ERROR
  }
];

// Custom Hook
const useAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filterType, setFilterType] = useState(FILTER_TYPES.ALL);
  const [filterUser, setFilterUser] = useState('');

  useEffect(() => {
    setLogs(MOCK_LOGS);
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesType = filterType === FILTER_TYPES.ALL || 
                         log.action.includes(filterType);
      const matchesUser = !filterUser || 
                         log.user.toLowerCase().includes(filterUser.toLowerCase());
      
      return matchesType && matchesUser;
    });
  }, [logs, filterType, filterUser]);

  const severityCounts = useMemo(() => {
    const counts = {
      [SEVERITY_TYPES.SUCCESS]: 0,
      [SEVERITY_TYPES.WARNING]: 0,
      [SEVERITY_TYPES.ERROR]: 0,
      [SEVERITY_TYPES.INFO]: 0
    };

    logs.forEach(log => {
      counts[log.severity]++;
    });

    return counts;
  }, [logs]);

  const handleExportLogs = useCallback(() => {
    console.log('Exporting logs:', filteredLogs);
    // Implement export functionality
  }, [filteredLogs]);

  const handleRefresh = useCallback(() => {
    console.log('Refreshing logs...');
    // Implement refresh functionality
  }, []);

  return {
    logs: filteredLogs,
    filterType,
    setFilterType,
    filterUser,
    setFilterUser,
    severityCounts,
    totalEvents: logs.length,
    handleExportLogs,
    handleRefresh
  };
};

// Sub-components
const AuditLogHeader = () => (
  <div>
    <h3 className="text-lg font-semibold text-foreground">Audit Log Viewer</h3>
    <p className="text-sm text-muted-foreground">
      View system activity and security logs
    </p>
  </div>
);

const StatsOverview = ({ totalEvents, severityCounts }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <StatCard
      title="Total Events"
      value={totalEvents}
      icon="Activity"
      color="text-primary"
    />
    <StatCard
      title="Success"
      value={severityCounts[SEVERITY_TYPES.SUCCESS]}
      icon="CheckCircle"
      color="text-success"
    />
    <StatCard
      title="Warnings"
      value={severityCounts[SEVERITY_TYPES.WARNING]}
      icon="AlertTriangle"
      color="text-warning"
    />
    <StatCard
      title="Errors"
      value={severityCounts[SEVERITY_TYPES.ERROR]}
      icon="XCircle"
      color="text-error"
    />
  </div>
);

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-card rounded-lg border border-border p-4">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{title}</div>
      </div>
      <Icon name={icon} size={24} className={color} />
    </div>
  </div>
);

const LogFilters = ({ 
  filterType, 
  onFilterTypeChange, 
  filterUser, 
  onFilterUserChange, 
  onExport, 
  onRefresh 
}) => (
  <div className="bg-card rounded-xl border border-border p-4">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1">
        <select
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        >
          <option value={FILTER_TYPES.ALL}>All Events</option>
          <option value={FILTER_TYPES.USER}>User Actions</option>
          <option value={FILTER_TYPES.SETTINGS}>Settings</option>
          <option value={FILTER_TYPES.SYNC}>Sync Events</option>
          <option value={FILTER_TYPES.SECURITY}>Security</option>
        </select>
      </div>
      <div className="md:col-span-1">
        <input
          type="text"
          placeholder="Filter by user..."
          value={filterUser}
          onChange={(e) => onFilterUserChange(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        />
      </div>
      <div className="md:col-span-2 flex gap-2">
        <Button 
          variant="outline" 
          iconName="Download" 
          iconPosition="left"
          onClick={onExport}
        >
          Export Logs
        </Button>
        <Button 
          variant="outline" 
          iconName="RefreshCw" 
          iconPosition="left"
          onClick={onRefresh}
        >
          Refresh
        </Button>
      </div>
    </div>
  </div>
);

const LogsTable = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <Icon name="FileText" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No audit logs found</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Timestamp</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">User</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Action</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Details</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">IP Address</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => (
              <LogTableRow key={log.id} log={log} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LogTableRow = ({ log }) => {
  const severityConfig = SEVERITY_CONFIG[log.severity] || SEVERITY_CONFIG[SEVERITY_TYPES.INFO];

  return (
    <tr className="hover:bg-accent/30 transition-colors">
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {log.timestamp.toLocaleString()}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-foreground">
        {log.user}
      </td>
      <td className="px-4 py-3">
        <span className="text-sm font-mono text-foreground bg-accent px-2 py-1 rounded">
          {log.action}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground max-w-md">
        <div className="truncate" title={log.details}>
          {log.details}
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
        {log.ipAddress}
      </td>
      <td className="px-4 py-3">
        <SeverityBadge severity={log.severity} />
      </td>
    </tr>
  );
};

const SeverityBadge = ({ severity }) => {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG[SEVERITY_TYPES.INFO];

  return (
    <div className="flex items-center gap-2">
      <Icon 
        name={config.icon} 
        size={16} 
        className={config.color.split(' ')[0]}
      />
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
};

// Main Component
const AuditLogViewer = () => {
  const {
    logs,
    filterType,
    setFilterType,
    filterUser,
    setFilterUser,
    severityCounts,
    totalEvents,
    handleExportLogs,
    handleRefresh
  } = useAuditLogs();

  return (
    <div className="space-y-6">
      <AuditLogHeader />
      
      <StatsOverview 
        totalEvents={totalEvents}
        severityCounts={severityCounts}
      />

      <LogFilters
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterUser={filterUser}
        onFilterUserChange={setFilterUser}
        onExport={handleExportLogs}
        onRefresh={handleRefresh}
      />

      <LogsTable logs={logs} />
    </div>
  );
};

export default AuditLogViewer;