import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';

const LiveUpdateIndicators = ({ isConnected = true, lastUpdate = null, updateCount = 0, onReconnect, recentActivities = [] }) => {
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [recentUpdates, setRecentUpdates] = useState([]);

  useEffect(() => { setConnectionStatus(isConnected ? 'connected' : 'disconnected'); }, [isConnected]);
  useEffect(() => {
    if (updateCount > 0) setRecentUpdates(prev => [{ id: Date.now(), timestamp: new Date(), type: 'leaderboard_update' }, ...prev?.slice(0, 4)]);
  }, [updateCount]);

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected': return { icon: 'Wifi', color: 'text-success', bgColor: 'bg-success/10', label: 'Live Updates Active', pulse: false };
      case 'connecting': return { icon: 'RefreshCw', color: 'text-warning', bgColor: 'bg-warning/10', label: 'Reconnecting...', pulse: true, spin: true };
      case 'disconnected': return { icon: 'WifiOff', color: 'text-destructive', bgColor: 'bg-destructive/10', label: 'Connection Lost', pulse: true };
      default: return { icon: 'Circle', color: 'text-muted-foreground', bgColor: 'bg-muted', label: 'Unknown Status', pulse: false };
    }
  };

  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Never';
    const diffMs = new Date() - new Date(timestamp);
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    if (diffSecs < 30) return 'Just now';
    if (diffMins < 1) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    return new Date(timestamp)?.toLocaleTimeString();
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Live Status</h3>
        <div className="flex items-center gap-2">{connectionStatus === 'disconnected' && <button onClick={onReconnect} className="text-xs text-primary hover:text-primary/80 transition-colors">Reconnect</button>}</div>
      </div>
      <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${statusConfig?.bgColor}`}>
        <div className={`${statusConfig?.pulse ? 'animate-pulse' : ''} ${statusConfig?.color}`}><Icon name={statusConfig?.icon} size={20} className={statusConfig?.spin ? 'animate-spin' : ''} /></div>
        <div className="flex-1"><div className={`font-medium ${statusConfig?.color} text-sm`}>{statusConfig?.label}</div><div className="text-xs text-muted-foreground">Last update: {formatLastUpdate(lastUpdate)}</div></div>
        {updateCount > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 bg-success rounded-full animate-pulse" /><span className="text-xs font-mono text-success">{updateCount > 99 ? '99+' : updateCount}</span></div>}
      </div>
      <div className="space-y-2">
        <h4 className="font-medium text-foreground text-sm">Recent Updates</h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {recentUpdates?.length > 0 ? recentUpdates?.map((update) => (
            <div key={update?.id} className="flex items-center gap-2 p-2 bg-muted/20 rounded text-xs">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" /><span className="text-muted-foreground">Leaderboard updated</span><span className="ml-auto text-muted-foreground">{formatLastUpdate(update?.timestamp)}</span>
            </div>
          )) : <div className="text-xs text-muted-foreground text-center py-2">No recent updates</div>}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div><div className="text-lg font-semibold text-foreground">{isConnected ? '< 1s' : 'N/A'}</div><div className="text-xs text-muted-foreground">Update Latency</div></div>
          <div><div className="text-lg font-semibold text-foreground">{isConnected ? '99.9%' : '0%'}</div><div className="text-xs text-muted-foreground">Uptime</div></div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <h4 className="font-medium text-foreground text-sm mb-2">Live Activity</h4>
        <div className="space-y-2">
          {recentActivities?.length > 0 ? (
            recentActivities.slice(0, 3).map((activity, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <Icon 
                  name={activity.type === 'streak' ? 'Flame' : activity.type === 'competition' ? 'Trophy' : 'Award'} 
                  size={12} 
                  className={activity.type === 'streak' ? 'text-orange-500' : 'text-primary'} 
                />
                <span className="text-muted-foreground truncate">
                  {activity.userName} earned {activity.title}
                </span>
              </div>
            ))
          ) : (
            <div className="text-xs text-muted-foreground text-center py-2">No recent activity</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveUpdateIndicators;