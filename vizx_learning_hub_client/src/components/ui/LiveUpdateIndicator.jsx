import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const LiveUpdateIndicator = ({ 
  type = 'sync', // 'sync', 'leaderboard', 'notification', 'system'
  status = 'connected', // 'connected', 'syncing', 'error', 'offline'
  lastUpdate = null,
  updateCount = 0,
  showDetails = true,
  size = 'default', // 'sm', 'default', 'lg'
  position = 'inline' // 'inline', 'floating'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (updateCount > 0) {
      setAnimationKey(prev => prev + 1);
      // Show update animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [updateCount]);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: type === 'sync' ? 'Wifi' : type === 'leaderboard' ? 'Trophy' : 'CheckCircle',
          color: 'text-success',
          bgColor: 'bg-success/10',
          label: 'Connected',
          pulse: false
        };
      case 'syncing':
        return {
          icon: 'RefreshCw',
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          label: 'Syncing...',
          pulse: true,
          spin: true
        };
      case 'error':
        return {
          icon: 'AlertCircle',
          color: 'text-error',
          bgColor: 'bg-error/10',
          label: 'Error',
          pulse: true
        };
      case 'offline':
        return {
          icon: 'WifiOff',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          label: 'Offline',
          pulse: false
        };
      default:
        return {
          icon: 'Circle',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          label: 'Unknown',
          pulse: false
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1',
          icon: 14,
          text: 'text-xs',
          dot: 'w-1.5 h-1.5'
        };
      case 'lg':
        return {
          container: 'px-4 py-3',
          icon: 20,
          text: 'text-sm',
          dot: 'w-3 h-3'
        };
      default:
        return {
          container: 'px-3 py-2',
          icon: 16,
          text: 'text-xs',
          dot: 'w-2 h-2'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const sizeConfig = getSizeConfig();

  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return null;
    
    const now = new Date();
    const update = new Date(timestamp);
    const diffMs = now - update;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return update?.toLocaleDateString();
  };

  const containerClasses = `
    flex items-center gap-2 rounded-lg transition-all duration-200
    ${statusConfig?.bgColor} ${sizeConfig?.container}
    ${position === 'floating' ? 'shadow-md border border-border' : ''}
    ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
  `;

  return (
    <div className={containerClasses} key={animationKey}>
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div className={`
          ${statusConfig?.pulse ? 'animate-pulse' : ''}
          ${statusConfig?.color}
        `}>
          <Icon 
            name={statusConfig?.icon} 
            size={sizeConfig?.icon}
            className={statusConfig?.spin ? 'animate-spin' : ''}
          />
        </div>
        
        {showDetails && (
          <div className="flex flex-col">
            <span className={`font-medium ${statusConfig?.color} ${sizeConfig?.text}`}>
              {statusConfig?.label}
            </span>
            
            {lastUpdate && (
              <span className={`text-muted-foreground ${sizeConfig?.text}`}>
                {formatLastUpdate(lastUpdate)}
              </span>
            )}
          </div>
        )}
      </div>
      {/* Update Count Badge */}
      {updateCount > 0 && (
        <div className="flex items-center gap-1">
          <div className={`
            ${sizeConfig?.dot} ${statusConfig?.color?.replace('text-', 'bg-')} 
            rounded-full animate-pulse
          `} />
          <span className={`font-mono ${statusConfig?.color} ${sizeConfig?.text}`}>
            {updateCount > 99 ? '99+' : updateCount}
          </span>
        </div>
      )}
      {/* Real-time Pulse Indicator */}
      {status === 'connected' && type === 'leaderboard' && (
        <div className="relative">
          <div className={`${sizeConfig?.dot} bg-success rounded-full`} />
          <div className={`
            absolute inset-0 ${sizeConfig?.dot} bg-success rounded-full 
            animate-ping opacity-75
          `} />
        </div>
      )}
    </div>
  );
};

// Specialized components for different use cases
export const SyncIndicator = (props) => (
  <LiveUpdateIndicator type="sync" {...props} />
);

export const LeaderboardIndicator = (props) => (
  <LiveUpdateIndicator type="leaderboard" {...props} />
);

export const SystemIndicator = (props) => (
  <LiveUpdateIndicator type="system" {...props} />
);

export const NotificationIndicator = (props) => (
  <LiveUpdateIndicator type="notification" {...props} />
);

export default LiveUpdateIndicator;